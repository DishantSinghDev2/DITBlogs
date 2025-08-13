import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
export function Pagination({ currentPage, totalPages, onPageChange }) {
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
    return (_jsxs("nav", { className: "flex items-center justify-between mt-12", "aria-label": "Pagination", children: [_jsxs("button", { onClick: handlePrevious, disabled: currentPage === 1, className: "px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2", children: [_jsx(ChevronLeft, { size: 16 }), "Previous"] }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Page ", currentPage, " of ", totalPages] }), _jsxs("button", { onClick: handleNext, disabled: currentPage === totalPages, className: "px-4 py-2 text-sm font-medium border rounded-md bg-card text-card-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted flex items-center gap-2", children: ["Next", _jsx(ChevronRight, { size: 16 })] })] }));
}
