"use client"

import { Button, HStack, Text, Box } from "@chakra-ui/react"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
  disabled?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  disabled = false
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  if (totalPages <= 1) {
    return null
  }

  return (
    <Box>
      <HStack justify="space-between" align="center" gap={4} flexWrap="wrap">
        {/* Items info */}
        <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
          Showing {startItem} to {endItem} of {totalItems} results
        </Text>

        {/* Pagination controls */}
        <HStack gap={2}>
          {/* Previous button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
          >
            <FaChevronLeft />
            Previous
          </Button>

          {/* Page numbers */}
          <HStack gap={1}>
            {visiblePages.map((page, index) => (
              <Box key={index}>
                {page === '...' ? (
                  <Text px={2} color="gray.500">
                    ...
                  </Text>
                ) : (
                  <Button
                    size="sm"
                    variant={page === currentPage ? "solid" : "outline"}
                    colorPalette={page === currentPage ? "blue" : "gray"}
                    onClick={() => onPageChange(page as number)}
                    disabled={disabled}
                    minW="40px"
                  >
                    {page}
                  </Button>
                )}
              </Box>
            ))}
          </HStack>

          {/* Next button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
          >
            Next
            <FaChevronRight />
          </Button>
        </HStack>

        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <HStack gap={2} align="center">
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
              Show
            </Text>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
              disabled={disabled}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }}>
              per page
            </Text>
          </HStack>
        )}
      </HStack>
    </Box>
  )
}

// Simple pagination for smaller spaces
interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}: SimplePaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <HStack gap={2} justify="center">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
      >
        <FaChevronLeft />
        Previous
      </Button>

      <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.300" }} px={4}>
        Page {currentPage} of {totalPages}
      </Text>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
      >
        Next
        <FaChevronRight />
      </Button>
    </HStack>
  )
}

export default {
  Full: Pagination,
  Simple: SimplePagination,
}
