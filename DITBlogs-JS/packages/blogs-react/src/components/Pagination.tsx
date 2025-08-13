// /packages/blogs-react/src/components/Pagination.tsx
// NEW COMPONENT

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className="flex items-center justify-between mt-12" aria-label="Pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2"
      >
        <ChevronLeft size={16} />
        Previous
      </button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}