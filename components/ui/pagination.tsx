"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const generatePagination = () => {
    // Always show first and last page
    // Show 2 pages before and after current page
    // Use ellipsis for gaps

    const pages = []

    // Always add page 1
    pages.push(1)

    // Add ellipsis if needed
    if (currentPage > 3) {
      pages.push("ellipsis-1")
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-2")
    }

    // Always add last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pages = generatePagination()

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pages.map((page, index) => {
        if (page === "ellipsis-1" || page === "ellipsis-2") {
          return (
            <Button key={`${page}-${index}`} variant="outline" size="icon" disabled>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </Button>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  )
}
