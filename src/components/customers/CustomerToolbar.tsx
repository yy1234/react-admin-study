import type { CustomerStatusFilter } from './types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type CustomerToolbarProps = {
  searchText: string
  statusFilter: CustomerStatusFilter
  hasActiveFilters: boolean
  onSearchTextChange: (searchText: string) => void
  onStatusFilterChange: (statusFilter: CustomerStatusFilter) => void
  onClearFilters: () => void
}

const statusFilters: Array<{ label: string; value: CustomerStatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function CustomerToolbar({
  searchText,
  statusFilter,
  hasActiveFilters,
  onSearchTextChange,
  onStatusFilterChange,
  onClearFilters,
}: CustomerToolbarProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Customer search</h3>
          <p className="mt-1 text-sm text-slate-500">
            Type a name or email to filter the customer list.
          </p>
        </div>

        <Input
          className="max-w-xs"
          placeholder="Search customers..."
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
      </div>

      <div className="mt-5 flex items-center gap-2">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={statusFilter === filter.value ? 'primary' : 'ghost'}
            onClick={() => onStatusFilterChange(filter.value)}
          >
            {filter.label}
          </Button>
        ))}

        {hasActiveFilters ? (
          <Button
            className="ml-auto"
            size="sm"
            variant="ghost"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        ) : null}
      </div>
    </>
  )
}
