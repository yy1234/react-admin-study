import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import {
  createCustomer,
  deleteCustomer as deleteCustomerRequest,
  listCustomers,
  toggleCustomerStatus as toggleCustomerStatusRequest,
  updateCustomer as updateCustomerRequest,
} from './customerApi'
import type {
  Customer,
  CustomerListParams,
  CustomerListResult,
  CustomerSortDirection,
  CustomerSortField,
  CustomerStatusFilter,
  NewCustomerInput,
} from './types'

const customersQueryKey = ['customers'] as const
const emptyCustomers: Customer[] = []
const pageSize = 2

// 安全解析 URL 查询参数，值不合法时退回默认值，防止手动改 URL 搞崩页面
function parseStatusFilter(value: string | null): CustomerStatusFilter {
  return value === 'active' || value === 'inactive' ? value : 'all'
}

function parseSortField(value: string | null): CustomerSortField | null {
  return value === 'name' || value === 'email' || value === 'status'
    ? value
    : null
}

function parseSortDirection(value: string | null): CustomerSortDirection {
  return value === 'desc' ? 'desc' : 'asc'
}

function parsePage(value: string | null) {
  const page = Number(value)

  return Number.isInteger(page) && page > 0 ? page : 1
}

function toggleCustomerStatusInResult(
  customerListResult: CustomerListResult | undefined,
  customerId: string,
): CustomerListResult | undefined {
  if (customerListResult === undefined) {
    return undefined
  }

  return {
    ...customerListResult,
    customers: customerListResult.customers.map((customer) => {
      if (customer.id !== customerId) {
        return customer
      }

      const nextStatus: Customer['status'] =
        customer.status === 'active' ? 'inactive' : 'active'

      return {
        ...customer,
        status: nextStatus,
      }
    }),
  }
}

export function useCustomers() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchText = searchParams.get('q') ?? ''
  const statusFilter = parseStatusFilter(searchParams.get('status'))
  const sortField = parseSortField(searchParams.get('sort'))
  const sortDirection = parseSortDirection(searchParams.get('direction'))
  const currentPage = parsePage(searchParams.get('page'))
  // 所有筛选/排序/分页参数统一放在一个对象里，同时作为 queryKey 的一部分和 API 函数参数
  const customerListParams: CustomerListParams = {
    searchText,
    statusFilter,
    sortField,
    sortDirection,
    page: currentPage,
    pageSize,
  }

  // queryKey 里包含 customerListParams → 参数变了 key 就变 → React Query 自动重新请求
  // keepPreviousData：新数据回来前保持旧数据显示，翻页/筛选不生硬闪烁
  const customersQuery = useQuery({
    queryKey: [...customersQueryKey, customerListParams],
    queryFn: () => listCustomers(customerListParams),
    placeholderData: keepPreviousData,
  })

  // 新增后回到第一页（新客户排最前面），然后刷新缓存
  const addCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      updateCustomerSearchParams({ page: null })
      await queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  // 编辑和删除：等服务器确认后直接刷新缓存即可
  const updateCustomerMutation = useMutation({
    mutationFn: ({
      customerId,
      customerInput,
    }: {
      customerId: string
      customerInput: NewCustomerInput
    }) => updateCustomerRequest(customerId, customerInput),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  const deleteCustomerMutation = useMutation({
    mutationFn: deleteCustomerRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  // 切换状态使用乐观更新：先在缓存里翻转状态（UI 立刻变化），
  // 请求失败则回滚，最后不管成败都刷新一次确保数据一致
  const toggleCustomerStatusMutation = useMutation({
    mutationFn: toggleCustomerStatusRequest,
    onMutate: async (customerId) => {
      /*
       onMutate   // 请求前，先改缓存
  onError    // 请求失败，回滚缓存
  onSettled  // 不管成功失败，最后重新拉一次
  // */
      await queryClient.cancelQueries({ queryKey: customersQueryKey })

      const queryKey = [...customersQueryKey, customerListParams]
      const previousCustomerListResult =
        queryClient.getQueryData<CustomerListResult>(queryKey)

      queryClient.setQueryData<CustomerListResult>(queryKey, (currentData) =>
        toggleCustomerStatusInResult(currentData, customerId),
      )

      return {
        previousCustomerListResult,
        queryKey,
      }
    },
    onError: (_error, _customerId, context) => {
      if (context?.previousCustomerListResult === undefined) {
        return
      }

      queryClient.setQueryData(
        context.queryKey,
        context.previousCustomerListResult,
      )
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  const customerListResult = customersQuery.data
  const customerList = customerListResult?.customers ?? emptyCustomers
  const hasActiveFilters = searchText !== '' || statusFilter !== 'all'
  // 服务端返回的总数、筛选计数、总页数，作为分页和计数显示的唯一数据源（single source of truth）
  const totalCustomerCount = customerListResult?.totalCustomerCount ?? 0
  const filteredCustomerCount = customerListResult?.filteredCustomerCount ?? 0
  const totalPageCount = customerListResult?.totalPageCount ?? 1
  const safeCurrentPage = customerListResult?.page ?? currentPage
  // 提取每个正在进行的变更操作对应的客户 ID，UI 层据此在对应行显示 loading / 禁用按钮
  const updatingCustomerId = updateCustomerMutation.isPending
    ? updateCustomerMutation.variables?.customerId ?? null
    : null
  const deletingCustomerId = deleteCustomerMutation.isPending
    ? deleteCustomerMutation.variables
    : null
  const togglingCustomerId = toggleCustomerStatusMutation.isPending
    ? toggleCustomerStatusMutation.variables
    : null
  const isCustomerActionPending =
    updateCustomerMutation.isPending ||
    deleteCustomerMutation.isPending ||
    toggleCustomerStatusMutation.isPending
  const errorMessage =
    customersQuery.error instanceof Error ? customersQuery.error.message : null

  // 搜索是连续输入，用 replace 避免每个字符都在浏览器历史中留一条记录
  function changeSearchText(nextSearchText: string) {
    updateCustomerSearchParams(
      {
        q: nextSearchText === '' ? null : nextSearchText,
        page: null,
      },
      true,
    )
  }

  function changeStatusFilter(nextStatusFilter: CustomerStatusFilter) {
    updateCustomerSearchParams({
      status: nextStatusFilter === 'all' ? null : nextStatusFilter,
      page: null,
    })
  }

  function clearFilters() {
    updateCustomerSearchParams({
      q: null,
      status: null,
      page: null,
    })
  }

  function changeSort(nextSortField: CustomerSortField) {
    if (sortField !== nextSortField) {
      updateCustomerSearchParams({
        sort: nextSortField,
        direction: null,
        page: null,
      })
      return
    }

    const nextSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'

    updateCustomerSearchParams({
      direction: nextSortDirection === 'asc' ? null : nextSortDirection,
      page: null,
    })
  }

  function changePage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPageCount)

    updateCustomerSearchParams({
      page: safePage === 1 ? null : String(safePage),
    })
  }

  // 验证过 URL 参数用 value=null 删除键，value=string 设置键，未列出的键原样保留
  // 调用 this function 来更新 URL 查询参数，从而间接改变上面的 customerListParams
  function updateCustomerSearchParams(
    updates: Record<string, string | null>,
    replace = false,
  ) {
    setSearchParams(
      (currentSearchParams) => {
        // 基于旧 URLSearchParams 创建副本，在副本上增删，返回新对象（不可变更新）
        const nextSearchParams = new URLSearchParams(currentSearchParams)
        // 例如当前 URL 是 /customers?q=zhang&status=active&page=2
        // currentSearchParams.toString() → "q=zhang&status=active&page=2"
        // nextSearchParams 是它的副本，下面在副本上增删改

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null) {
            nextSearchParams.delete(key)
            return
          }

          nextSearchParams.set(key, value)
        })

        return nextSearchParams
      },
      // replace=true：替换当前历史记录，不新增，适合连续输入（搜索）
      // replace=false（默认）：新增一条历史记录，用户可按后退键回到上一步
      { replace },
    )
  }

  async function loadCustomers() {
    await customersQuery.refetch()
  }

  async function addCustomer(customerInput: NewCustomerInput) {
    await addCustomerMutation.mutateAsync(customerInput)
  }

  async function updateCustomer(
    customerId: string,
    customerInput: NewCustomerInput,
  ) {
    await updateCustomerMutation.mutateAsync({ customerId, customerInput })
  }

  async function deleteCustomer(customerId: string) {
    await deleteCustomerMutation.mutateAsync(customerId)
  }

  async function toggleCustomerStatus(customerId: string) {
    await toggleCustomerStatusMutation.mutateAsync(customerId)
  }

  return {
    searchText,
    statusFilter,
    hasActiveFilters,
    totalCustomerCount,
    filteredCustomers: customerList,
    filteredCustomerCount,
    sortField,
    sortDirection,
    currentPage: safeCurrentPage,
    pageSize,
    totalPageCount,
    isLoading: customersQuery.isPending,
    isRefreshing: customersQuery.isFetching && !customersQuery.isPending,
    isCustomerActionPending,
    updatingCustomerId,
    deletingCustomerId,
    togglingCustomerId,
    errorMessage,
    setSearchText: changeSearchText,
    setStatusFilter: changeStatusFilter,
    clearFilters,
    changeSort,
    changePage,
    loadCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  }
}
