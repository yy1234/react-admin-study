import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
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

const columnClassNames: Record<string, string> = {
  id: 'w-[120px]',
  status: 'w-[120px]',
  actions: 'w-[180px]',
}

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

  // ColumnDef 描述每一列如何读取数据，以及表头和单元格如何渲染。
  // useMemo 避免组件重绘时重复创建整套列定义。
  const columns = useMemo<ColumnDef<Customer>[]>(() => {
    function renderSortableHead(
      label: string,
      field: CustomerSortField,
    ) {
      const isCurrentSortField = sortField === field

      return (
        <Button
          className="-ml-2"
          size="sm"
          variant="ghost"
          onClick={() => onSortChange(field)}
        >
          {label}
          {isCurrentSortField ? (
            <span className="text-muted-foreground">
              {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
          ) : null}
        </Button>
      )
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

    return [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: () => renderSortableHead('Name', 'name'),
        cell: ({ row }) => (
          <Link
            className="font-medium text-foreground hover:underline"
            to={`/customers/${encodeURIComponent(row.original.id)}${search}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'email',
        header: () => renderSortableHead('Email', 'email'),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: () => renderSortableHead('Status', 'status'),
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === 'active' ? 'success' : 'muted'}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const customer = row.original
          const isUpdating = updatingCustomerId === customer.id
          const isDeleting = deletingCustomerId === customer.id
          const isToggling = togglingCustomerId === customer.id

          return (
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
          )
        },
      },
    ]
  }, [
    deletingCustomerId,
    isCustomerActionPending,
    onDeleteCustomer,
    onSortChange,
    onToggleCustomerStatus,
    onUpdateCustomer,
    search,
    sortDirection,
    sortField,
    togglingCustomerId,
    updatingCustomerId,
  ])

  // TanStack Table 只负责数据和行列模型，实际样式仍由下面的 shadcn/ui Table 提供。
  // getRowId 使用业务 id 标识每一行，避免分页或排序后行身份不稳定。
  // TanStack Table exposes mutable function references that React Compiler skips.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (customer) => customer.id,
  })

  return (
    <div className="mt-5 overflow-hidden rounded-md border border-border bg-background">
      <Table>
        <TableHeader className="bg-muted/60">
          {/* headerGroups 支持普通表头和多级分组表头。 */}
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={columnClassNames[header.column.id]}
                >
                  {header.isPlaceholder
                    ? null
                    // flexRender 同时支持字符串和返回 JSX 的渲染函数。
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {/* 行和单元格由 TanStack Table 根据 customers 和 columns 计算得到。 */}
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {!isLoading && table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={table.getVisibleLeafColumns().length}
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
