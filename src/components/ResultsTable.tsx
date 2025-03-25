import { useState } from "react"
import "../styles/ResultsTable.css"

interface ResultsTableProps {
  data: any[]
  columns: string[]
  isLoading: boolean
}

export const ResultsTable = ({ data, columns, isLoading }: ResultsTableProps) =>{
    const [page, setPage] = useState(0)
    const [sortColumn, setSortColumn] = useState("")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const rowsPerPage = 10
  
    if (isLoading) {
      return (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {[1, 2, 3, 4].map((i) => (
                  <th key={i}>
                    <div className="loading-cell"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {[1, 2, 3, 4].map((cell) => (
                    <td key={cell}>
                      <div className="loading-cell"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  
    if (data.length === 0) {
      return <div className="no-results">No results to display. Run a query to see data.</div>
    }
  
    const sortedData = [...data]
    if (sortColumn) {
      sortedData.sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]
  
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }
  
    const pageCount = Math.ceil(sortedData.length / rowsPerPage)
    const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="sortable-header" onClick={() => setSortColumn(column)}>
                  {column} {sortColumn === column ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
  
        {pageCount > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Prev
            </button>
            <span>
              Page {page + 1} of {pageCount}
            </span>
            <button disabled={page === pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>
              Next
            </button>
          </div>
        )}
      </div>
    )
  }