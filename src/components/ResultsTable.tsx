/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react"
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from "lucide-react"
import "../styles/ResultsTable.css"

interface ResultsTableProps {
  data: any[]
  columns: string[]
  isLoading: boolean
}

export const ResultsTable = ({ data, columns, isLoading }: ResultsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])


  const toggleFullscreen = () => {
    if (!containerRef) return

    if (!document.fullscreenElement) {
      containerRef.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }


  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize
    if (startIndex > data.length) {
      return data
    }
    return data.slice(startIndex, startIndex + pageSize)
  }, [data, currentPage, pageSize])


  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }


  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) 
  }


  const totalPages = Math.ceil(data.length / pageSize)


  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPageButtons = 7

    if (totalPages <= maxPageButtons) {

      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {

      pageNumbers.push(1)


      let startPage = Math.max(2, currentPage - 2)
      let endPage = Math.min(totalPages - 1, currentPage + 2)


      if (currentPage < 4) {
        endPage = Math.min(totalPages - 1, 5)
      }


      if (currentPage > totalPages - 3) {
        startPage = Math.max(2, totalPages - 4)
      }


      if (startPage > 2) {
        pageNumbers.push("ellipsis1")
      }


      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }


      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis2")
      }


      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }


  const renderLoadingState = () => {
    const numbers = Array.from({ length: 10 }, (_, i) => i + 1)
    return (
      <div className="table-container">
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                {numbers.map((i) => (
                  <th key={i}>
                    <div className="loading-header"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numbers.map((row) => (
                <tr key={row}>
                  {numbers.map((cell) => (
                    <td key={cell}>
                      <div className="loading-cell"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }


  const renderEmptyState = () => {
    return (
      <div className="table-container" style={{ maxHeight: "100%" }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3>No results to display</h3>
          <p>Run a query to see data here</p>
        </div>
      </div>
    )
  }


  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  if (isLoading) {
    return renderLoadingState()
  }

  if (data.length === 0) {
    return renderEmptyState()
  }

  const currentData = getCurrentPageData()
  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(startIndex + pageSize - 1, data.length)
  const pageNumbers = getPageNumbers()

  return (
    <div className={`results-section ${isFullscreen ? "fullscreen" : ""}`} ref={setContainerRef}>
      <div className="results-header">
        <h2>Results</h2>
        <div className="results-meta">
          {data.length > 0 && <span className="results-count">{formatNumber(data.length)} rows returned</span>}
          <button
            className="fullscreen-button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header-container">
          <table className="results-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>
                    <div className="header-content">
                      <span>{column}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        <div className="table-body-container">
          <table className="results-table">
            <colgroup>
              {columns.map((_, index) => (
                <col key={index} />
              ))}
            </colgroup>
            <tbody>
              {currentData.map((row, rowIndex) => (
                <tr key={`row-${startIndex + rowIndex - 1}`}>
                  {columns.map((column) => (
                    <td key={`${startIndex + rowIndex - 1}-${column}`} title={String(row[column] || "")}>
                      {row[column] !== null && row[column] !== undefined ? String(row[column]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="pagination-info">
            Showing {formatNumber(startIndex)} to {formatNumber(endIndex)} of {formatNumber(data.length)} entries
          </div>

          <div className="page-size-selector">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="page-size-dropdown"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First Page"
            >
              <ChevronLeft size={14} />
              <ChevronLeft size={14} className="second-chevron" />
            </button>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="page-numbers">
              {pageNumbers.map((page, index) => {
                if (page === "ellipsis1" || page === "ellipsis2") {
                  return (
                    <span key={`ellipsis-${index}`} className="ellipsis">
                      ...
                    </span>
                  )
                }

                return (
                  <button
                    key={`page-${page}`}
                    className={`page-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(Number(page))}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last Page"
            >
              <ChevronRight size={14} />
              <ChevronRight size={14} className="second-chevron" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

