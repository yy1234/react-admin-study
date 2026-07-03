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
