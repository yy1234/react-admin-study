import { useState } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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
  CustomerSortDirection,
  CustomerSortField,
  CustomerStatusFilter,
  NewCustomerInput,
} from './types'

const customersQueryKey = ['customers'] as const
const emptyCustomers: Customer[] = []
const pageSize = 2

export function useCustomers() {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>('all')
  const [sortField, setSortField] = useState<CustomerSortField | null>(null)
  const [sortDirection, setSortDirection] =
    useState<CustomerSortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const customerListParams: CustomerListParams = {
    searchText,
    statusFilter,
    sortField,
    sortDirection,
    page: currentPage,
    pageSize,
  }

  const customersQuery = useQuery({
    queryKey: [...customersQueryKey, customerListParams],
    queryFn: () => listCustomers(customerListParams),
    placeholderData: keepPreviousData,
  })

  const addCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      setCurrentPage(1)
      await queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

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

  const toggleCustomerStatusMutation = useMutation({
    mutationFn: toggleCustomerStatusRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: customersQueryKey })
    },
  })

  const customerListResult = customersQuery.data
  const customerList = customerListResult?.customers ?? emptyCustomers
  const hasActiveFilters = searchText !== '' || statusFilter !== 'all'
  const totalCustomerCount = customerListResult?.totalCustomerCount ?? 0
  const filteredCustomerCount = customerListResult?.filteredCustomerCount ?? 0
  const totalPageCount = customerListResult?.totalPageCount ?? 1
  const safeCurrentPage = customerListResult?.page ?? currentPage
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

  function changeSearchText(nextSearchText: string) {
    setSearchText(nextSearchText)
    setCurrentPage(1)
  }

  function changeStatusFilter(nextStatusFilter: CustomerStatusFilter) {
    setStatusFilter(nextStatusFilter)
    setCurrentPage(1)
  }

  function clearFilters() {
    setSearchText('')
    setStatusFilter('all')
    setCurrentPage(1)
  }

  function changeSort(nextSortField: CustomerSortField) {
    if (sortField !== nextSortField) {
      setSortField(nextSortField)
      setSortDirection('asc')
      setCurrentPage(1)
      return
    }

    setSortDirection((currentDirection) =>
      currentDirection === 'asc' ? 'desc' : 'asc',
    )
    setCurrentPage(1)
  }

  function changePage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPageCount)

    setCurrentPage(safePage)
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
