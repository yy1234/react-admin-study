import { useMemo, useState } from 'react'
import { customers as initialCustomers } from './customerData'
import type {
  Customer,
  CustomerSortDirection,
  CustomerSortField,
  CustomerStatusFilter,
  NewCustomerInput,
} from './types'

const submitDelay = 600

export function useCustomers() {
  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>('all')
  const [sortField, setSortField] = useState<CustomerSortField | null>(null)
  const [sortDirection, setSortDirection] =
    useState<CustomerSortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)

  const hasActiveFilters = searchText !== '' || statusFilter !== 'all'
  const totalCustomerCount = customerList.length
  const pageSize = 2

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

  const pagedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return sortedCustomers.slice(startIndex, endIndex)
  }, [currentPage, pageSize, sortedCustomers])

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
    // 模拟真实接口耗时，这样表单里的 isSubmitting 状态能被看见。
    await new Promise((resolve) => window.setTimeout(resolve, submitDelay))

    const normalizedEmail = customerInput.email.toLowerCase()
    const hasDuplicateEmail = customerList.some(
      (customer) => customer.email.toLowerCase() === normalizedEmail,
    )

    if (hasDuplicateEmail) {
      throw new Error('This email already exists.')
    }

    setCustomerList((currentCustomers) => {
      const maxCustomerNumber = currentCustomers.reduce((maxNumber, customer) => {
        const customerNumber = Number(customer.id.replace('CUS-', ''))

        return Number.isNaN(customerNumber)
          ? maxNumber
          : Math.max(maxNumber, customerNumber)
      }, 0)
      const nextCustomer: Customer = {
        id: `CUS-${String(maxCustomerNumber + 1).padStart(3, '0')}`,
        ...customerInput,
      }

      // 返回一个新数组，而不是修改 currentCustomers 原数组。
      return [nextCustomer, ...currentCustomers]
    })
    setCurrentPage(1)
  }

  async function updateCustomer(customerId: string, customerInput: NewCustomerInput) {
    // 编辑和新增共用同一套表单，所以这里也模拟一次接口耗时。
    await new Promise((resolve) => window.setTimeout(resolve, submitDelay))

    const normalizedEmail = customerInput.email.toLowerCase()
    const hasDuplicateEmail = customerList.some(
      (customer) =>
        customer.id !== customerId &&
        customer.email.toLowerCase() === normalizedEmail,
    )

    if (hasDuplicateEmail) {
      throw new Error('This email already exists.')
    }

    setCustomerList((currentCustomers) =>
      currentCustomers.map((customer) => {
        if (customer.id !== customerId) {
          return customer
        }

        return {
          ...customer,
          ...customerInput,
        }
      }),
    )
  }

  function deleteCustomer(customerId: string) {
    setCustomerList((currentCustomers) =>
      currentCustomers.filter((customer) => customer.id !== customerId),
    )
  }

  function toggleCustomerStatus(customerId: string) {
    setCustomerList((currentCustomers) =>
      currentCustomers.map((customer) => {
        if (customer.id !== customerId) {
          return customer
        }

        return {
          ...customer,
          status: customer.status === 'active' ? 'inactive' : 'active',
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
    currentPage,
    pageSize,
    totalPageCount,
    setSearchText,
    setStatusFilter,
    clearFilters,
    changeSort,
    changePage,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
  }
}
