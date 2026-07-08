import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

export function useCustomers() {
  const isMountedRef = useRef(true)
  const [customerList, setCustomerList] = useState<Customer[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>('all')
  const [sortField, setSortField] = useState<CustomerSortField | null>(null)
  const [sortDirection, setSortDirection] =
    useState<CustomerSortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasActiveFilters = searchText !== '' || statusFilter !== 'all'
  const totalCustomerCount = customerList.length
  const pageSize = 2

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  const loadCustomers = useCallback(async () => {
    if (!isMountedRef.current) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const customers = await listCustomers()

      if (!isMountedRef.current) {
        return
      }

      setCustomerList(customers)
      setCurrentPage(1)
    } catch (error) {
      if (!isMountedRef.current) {
        return
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load customers.',
      )
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadCustomers()
    })
  }, [loadCustomers])

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

  async function addCustomer(customerInput: NewCustomerInput) {
    const nextCustomer = await createCustomer(customerInput)

    if (!isMountedRef.current) {
      return
    }

    setCustomerList((currentCustomers) => {
      // 返回一个新数组，而不是修改 currentCustomers 原数组。
      return [nextCustomer, ...currentCustomers]
    })
    setCurrentPage(1)
  }

  async function updateCustomer(customerId: string, customerInput: NewCustomerInput) {
    const updatedCustomer = await updateCustomerRequest(customerId, customerInput)

    if (!isMountedRef.current) {
      return
    }

    setCustomerList((currentCustomers) =>
      currentCustomers.map((customer) => {
        if (customer.id !== customerId) {
          return customer
        }

        return {
          ...updatedCustomer,
        }
      }),
    )
  }

  async function deleteCustomer(customerId: string) {
    await deleteCustomerRequest(customerId)

    if (!isMountedRef.current) {
      return
    }

    setCustomerList((currentCustomers) =>
      currentCustomers.filter((customer) => customer.id !== customerId),
    )
  }

  async function toggleCustomerStatus(customerId: string) {
    const updatedCustomer = await toggleCustomerStatusRequest(customerId)

    if (!isMountedRef.current) {
      return
    }

    setCustomerList((currentCustomers) =>
      currentCustomers.map((customer) => {
        if (customer.id !== customerId) {
          return customer
        }

        return {
          ...updatedCustomer,
        }
      }),
    )
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
    isLoading,
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
