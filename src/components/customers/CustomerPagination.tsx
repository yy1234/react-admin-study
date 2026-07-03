import type { MouseEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/shadcn-ui/pagination'

type CustomerPaginationProps = {
  currentPage: number
  totalPageCount: number
  onPageChange: (page: number) => void
}

export function CustomerPagination({
  currentPage,
  totalPageCount,
  onPageChange,
}: CustomerPaginationProps) {
  const pageNumbers = Array.from(
    { length: totalPageCount },
    (_, index) => index + 1,
  )

  function handlePageChange(event: MouseEvent, nextPage: number) {
    event.preventDefault()
    onPageChange(nextPage)
  }

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPageCount}
      </p>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={currentPage === 1}
              className={
                currentPage === 1 ? 'pointer-events-none opacity-50' : ''
              }
              href="#"
              onClick={(event) => handlePageChange(event, currentPage - 1)}
            />
          </PaginationItem>

          {/* key 帮 React 稳定识别每个页码按钮。 */}
          {pageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={currentPage === pageNumber}
                onClick={(event) => handlePageChange(event, pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              aria-disabled={currentPage === totalPageCount}
              className={
                currentPage === totalPageCount
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
              href="#"
              onClick={(event) => handlePageChange(event, currentPage + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
