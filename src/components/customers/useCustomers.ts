import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCustomer,
  deleteCustomer as deleteCustomerRequest,
  listCustomers,
  toggleCustomerStatus as toggleCustomerStatusRequest,
  updateCustomer as updateCustomerRequest,
} from './customerApi'
import type {
  Customer,
  CustomerSortDirection,
  CustomerSortField,
  CustomerStatusFilter,
  NewCustomerInput,
} from './types'

const customersQueryKey = ['customers'] as const
const emptyCustomers: Customer[] = []

export function useCustomers() {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>('all')
  const [sortField, setSortField] = useState<CustomerSortField | null>(null)
  const [sortDirection, setSortDirection] =
    useState<CustomerSortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const customersQuery = useQuery({
    queryKey: customersQueryKey,
    queryFn: listCustomers,
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

  const customerList = customersQuery.data ?? emptyCustomers
  const hasActiveFilters = searchText !== '' || statusFilter !== 'all'
  const totalCustomerCount = customerList.length
  const pageSize = 2
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

  const filteredCustomers = useMemo(() => {
    const keyword = searchText.toLowerCase()

    return customerList.filter((customer) => {
      const matchesKeyword =
        customer.name.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword)
      const matchesStatus =
        statusFilter === 'all' || customer.status === statusFilter

      return matchesKeyword && matchesStatus
    })
  }, [customerList, searchText, statusFilter])

  const sortedCustomers = useMemo(() => {
    if (sortField === null) {
      return filteredCustomers
    }

    // sort() 会改原数组，所以先复制，再排序。
    return [...filteredCustomers].sort((firstCustomer, secondCustomer) => {
      const result = firstCustomer[sortField].localeCompare(
        secondCustomer[sortField],
      )

      return sortDirection === 'asc' ? result : -result
    })
  }, [filteredCustomers, sortDirection, sortField])

  const totalPageCount = Math.max(1, Math.ceil(sortedCustomers.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPageCount)

  const pagedCustomers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return sortedCustomers.slice(startIndex, endIndex)
  }, [pageSize, safeCurrentPage, sortedCustomers])

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
    filteredCustomers: pagedCustomers,
    filteredCustomerCount: sortedCustomers.length,
    sortField,
    sortDirection,
    currentPage: safeCurrentPage,
    pageSize,
    totalPageCount,
    isLoading: customersQuery.isPending || customersQuery.isFetching,
    isCustomerActionPending,
    updatingCustomerId,
    deletingCustomerId,
    togglingCustomerId,
    errorMessage,
    setSearchText,
    setStatusFilter,
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
