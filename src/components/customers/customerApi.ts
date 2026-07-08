import { customers as initialCustomers } from './customerData'
import type { Customer, NewCustomerInput } from './types'

const requestDelay = 600

let customerRecords: Customer[] = initialCustomers.map((customer) => ({
  ...customer,
}))

function waitForRequest() {
  return new Promise((resolve) => globalThis.setTimeout(resolve, requestDelay))
}

function cloneCustomer(customer: Customer): Customer {
  return { ...customer }
}

function findDuplicateEmail(customerInput: NewCustomerInput, ignoreCustomerId?: string) {
  const normalizedEmail = customerInput.email.toLowerCase()

  return customerRecords.find(
    (customer) =>
      customer.id !== ignoreCustomerId &&
      customer.email.toLowerCase() === normalizedEmail,
  )
}

function createNextCustomerId() {
  const maxCustomerNumber = customerRecords.reduce((maxNumber, customer) => {
    const customerNumber = Number(customer.id.replace('CUS-', ''))

    return Number.isNaN(customerNumber)
      ? maxNumber
      : Math.max(maxNumber, customerNumber)
  }, 0)

  return `CUS-${String(maxCustomerNumber + 1).padStart(3, '0')}`
}

function findCustomerById(customerId: string) {
  const customer = customerRecords.find(
    (currentCustomer) => currentCustomer.id === customerId,
  )

  if (customer === undefined) {
    throw new Error('Customer not found.')
  }

  return customer
}

export async function listCustomers() {
  await waitForRequest()

  return customerRecords.map(cloneCustomer)
}

export async function createCustomer(customerInput: NewCustomerInput) {
  await waitForRequest()

  if (findDuplicateEmail(customerInput) !== undefined) {
    throw new Error('This email already exists.')
  }

  const nextCustomer: Customer = {
    id: createNextCustomerId(),
    ...customerInput,
  }

  customerRecords = [nextCustomer, ...customerRecords]

  return cloneCustomer(nextCustomer)
}

export async function updateCustomer(
  customerId: string,
  customerInput: NewCustomerInput,
) {
  await waitForRequest()
  findCustomerById(customerId)

  if (findDuplicateEmail(customerInput, customerId) !== undefined) {
    throw new Error('This email already exists.')
  }

  const updatedCustomer: Customer = {
    id: customerId,
    ...customerInput,
  }

  customerRecords = customerRecords.map((customer) =>
    customer.id === customerId ? updatedCustomer : customer,
  )

  return cloneCustomer(updatedCustomer)
}

export async function deleteCustomer(customerId: string) {
  await waitForRequest()
  findCustomerById(customerId)

  customerRecords = customerRecords.filter(
    (customer) => customer.id !== customerId,
  )
}

export async function toggleCustomerStatus(customerId: string) {
  await waitForRequest()
  const currentCustomer = findCustomerById(customerId)
  const updatedCustomer: Customer = {
    ...currentCustomer,
    status: currentCustomer.status === 'active' ? 'inactive' : 'active',
  }

  customerRecords = customerRecords.map((customer) =>
    customer.id === customerId ? updatedCustomer : customer,
  )

  return cloneCustomer(updatedCustomer)
}
