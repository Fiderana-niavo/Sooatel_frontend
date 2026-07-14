import { Button } from "@/components/ui/Button/button";
import { cn } from "@/utils/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type FC } from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const generatePaginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5; // current + siblings on each side + first + last + 2 dots

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }

    return [];
  };

  const paginationRange = generatePaginationRange();

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

  if (totalPages === 0 || totalPages === 1) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Page précédente"
        className="rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        <ChevronLeft className="size-4" color="#fff" />
      </Button>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="inline-flex items-center justify-center size-9 text-sm text-muted-foreground"
            >
              ...
            </span>
          );
        }

        const page = pageNumber as number;
        const isActive = page === currentPage;

        return (
          <Button
            key={page}
            variant={isActive ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md transition-colors",
              isActive ? "pointer-events-none bg-accent text-accent-foreground border-accent" : "bg-background hover:bg-muted",
            )}
          >
            {page}
          </Button>
        );
      })}

      <Button
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Page suivante"
        className="rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        <ChevronRight className="size-4" color="#fff" />
      </Button>
    </nav>
  );
};

export default Pagination;
