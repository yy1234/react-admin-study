import type {
  Customer,
  CustomerSortDirection,
  CustomerSortField,
  NewCustomerInput,
} from './types'
import { CustomerDeleteDialog } from './CustomerDeleteDialog'
import { CustomerForm } from './CustomerForm'
import { CustomerPagination } from './CustomerPagination'
import { Badge } from '../ui/Badge'
import { Button } from '@/components/shadcn-ui/button'
import { Link, useLocation } from 'react-router'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn-ui/table'

type CustomerTableProps = {
  customers: Customer[]
  isLoading: boolean
  sortField: CustomerSortField | null
  sortDirection: CustomerSortDirection
  currentPage: number
  totalPageCount: number
  isCustomerActionPending: boolean
  updatingCustomerId: string | null
  deletingCustomerId: string | null
  togglingCustomerId: string | null
  onPageChange: (page: number) => void
  onSortChange: (sortField: CustomerSortField) => void
  onUpdateCustomer: (
    customerId: string,
    customerInput: NewCustomerInput,
  ) => Promise<void> | void
  onDeleteCustomer: (customerId: string) => void
  onToggleCustomerStatus: (customerId: string) => void
}

type CustomerColumn = {
  id: string
  label: string
  className?: string
  sortField?: CustomerSortField
}

const customerColumns: CustomerColumn[] = [
  { id: 'id', label: 'ID', className: 'w-[120px]' },
  { id: 'name', label: 'Name', sortField: 'name' },
  { id: 'email', label: 'Email', sortField: 'email' },
  {
    id: 'status',
    label: 'Status',
    className: 'w-[120px]',
    sortField: 'status',
  },
  { id: 'actions', label: 'Actions', className: 'w-[180px]' },
]

export function CustomerTable({
  customers,
  isLoading,
  sortField,
  sortDirection,
  currentPage,
  totalPageCount,
  isCustomerActionPending,
  updatingCustomerId,
  deletingCustomerId,
  togglingCustomerId,
  onPageChange,
  onSortChange,
  onUpdateCustomer,
  onDeleteCustomer,
  onToggleCustomerStatus,
}: CustomerTableProps) {
  const { search } = useLocation()

  function renderSortIndicator(field: CustomerSortField) {
    if (sortField !== field) {
      return null
    }

    return (
      <span className="text-muted-foreground">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  function renderSortableHead(label: string, field: CustomerSortField) {
    return (
      <Button
        className="-ml-2"
        size="sm"
        variant="ghost"
        onClick={() => onSortChange(field)}
      >
        {label}
        {renderSortIndicator(field)}
      </Button>
    )
  }

  function renderColumnHead(column: CustomerColumn) {
    if (column.sortField === undefined) {
      return column.label
    }

    return renderSortableHead(column.label, column.sortField)
  }

  async function handleToggleCustomerStatus(customer: Customer) {
    try {
      await onToggleCustomerStatus(customer.id)
    } catch (error) {
      toast.error('Status update failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Please try updating this customer again.',
      })
    }
  }

  return (
    <div className="mt-5 overflow-hidden rounded-md border border-border bg-background">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            {customerColumns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {renderColumnHead(column)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => {
            const isUpdating = updatingCustomerId === customer.id
            const isDeleting = deletingCustomerId === customer.id
            const isToggling = togglingCustomerId === customer.id

            return (
              <TableRow key={customer.id}>
                <TableCell className="font-medium text-foreground">
                  {customer.id}
                </TableCell>
                <TableCell>
                  <Link
                    className="font-medium text-foreground hover:underline"
                    to={`/customers/${encodeURIComponent(customer.id)}${search}`}
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.status === 'active' ? 'success' : 'muted'}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={isCustomerActionPending}
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleToggleCustomerStatus(customer)}
                    >
                      {isToggling
                        ? 'Updating...'
                        : customer.status === 'active'
                          ? 'Deactivate'
                          : 'Activate'}
                    </Button>
                    <CustomerForm
                      customer={customer}
                      triggerDisabled={isCustomerActionPending}
                      triggerLabel={isUpdating ? 'Saving...' : 'Edit'}
                      triggerSize="sm"
                      triggerVariant="outline"
                      onSaveCustomer={(customerInput) =>
                        onUpdateCustomer(customer.id, customerInput)
                      }
                    />
                    <CustomerDeleteDialog
                      customer={customer}
                      isDeleting={isDeleting}
                      triggerDisabled={isCustomerActionPending}
                      onDeleteCustomer={onDeleteCustomer}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}

          {!isLoading && customers.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={5}
              >
                No customers found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>

      <CustomerPagination
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        onPageChange={onPageChange}
      />
    </div>
  )
}
