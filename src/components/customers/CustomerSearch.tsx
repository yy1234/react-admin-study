import { CustomerForm } from './CustomerForm'
import { CustomerTable } from './CustomerTable'
import { CustomerToolbar } from './CustomerToolbar'
import { useCustomers } from './useCustomers'
import { Card } from '../ui/Card'
import { Button } from '@/components/shadcn-ui/button'

export function CustomerSearch() {
  const {
    searchText,
    statusFilter,
    hasActiveFilters,
    totalCustomerCount,
    filteredCustomerCount,
    filteredCustomers,
    sortField,
    sortDirection,
    currentPage,
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
  } = useCustomers()

  const pageStart = filteredCustomerCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const pageEnd = Math.min(currentPage * pageSize, filteredCustomerCount)
  const resultCountText = `Showing ${pageStart}-${pageEnd} of ${filteredCustomerCount} filtered customers (${totalCustomerCount} total)`

  return (
    <Card className="mt-6">
      <CustomerForm
        triggerClassName="mb-6"
        onSaveCustomer={addCustomer}
      />

      <CustomerToolbar
        searchText={searchText}
        statusFilter={statusFilter}
        hasActiveFilters={hasActiveFilters}
        onSearchTextChange={setSearchText}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={clearFilters}
      />

      <p className="mt-4 text-sm text-slate-500">{resultCountText}</p>

      {isLoading ? (
        <div className="mt-5 rounded-md border border-border bg-background p-6 text-sm text-muted-foreground">
          Loading customers...
        </div>
      ) : null}

      {errorMessage !== null ? (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadCustomers()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <CustomerTable
        customers={filteredCustomers}
        isLoading={isLoading}
        sortField={sortField}
        sortDirection={sortDirection}
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        onPageChange={changePage}
        onSortChange={changeSort}
        onUpdateCustomer={updateCustomer}
        onDeleteCustomer={deleteCustomer}
        onToggleCustomerStatus={toggleCustomerStatus}
      />
    </Card>
  )
}
