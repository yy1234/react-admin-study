import type { Customer } from './types'

export const customers: Customer[] = [
  { id: 'CUS-001', name: 'Acme Corp', email: 'ops@acme.test', status: 'active' },
  {
    id: 'CUS-002',
    name: 'Northwind Studio',
    email: 'hello@northwind.test',
    status: 'active',
  },
  {
    id: 'CUS-003',
    name: 'Blue Ocean Ltd',
    email: 'team@blueocean.test',
    status: 'inactive',
  },
]
