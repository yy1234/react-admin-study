import { CustomerForm } from './CustomerForm'
import { CustomerTable } from './CustomerTable'
import { CustomerToolbar } from './CustomerToolbar'
import { useCustomers } from './useCustomers'
import { Card } from '../ui/Card'

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
    setSearchText,
    setStatusFilter,
    clearFilters,
    changeSort,
    changePage,
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

      <CustomerTable
        customers={filteredCustomers}
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
