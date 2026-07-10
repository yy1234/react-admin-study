export type Customer = {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
}

export type NewCustomerInput = Pick<Customer, 'name' | 'email' | 'status'>

export type CustomerStatusFilter = 'all' | Customer['status']

export type CustomerSortField = 'name' | 'email' | 'status'

export type CustomerSortDirection = 'asc' | 'desc'

export type CustomerListParams = {
  searchText: string
  statusFilter: CustomerStatusFilter
  sortField: CustomerSortField | null
  sortDirection: CustomerSortDirection
  page: number
  pageSize: number
}

export type CustomerListResult = {
  customers: Customer[]
  totalCustomerCount: number
  filteredCustomerCount: number
  page: number
  pageSize: number
  totalPageCount: number
}
