import type React from "react"
import { useState } from "react"
import { ChevronRight, ChevronDown, Database, Table, Columns2Icon as Column } from "lucide-react"
import "../styles/DatabaseExplorer.css"

type DatabaseStructure = {
  name: string
  tables: {
    name: string
    columns: { name: string; type: string }[]
  }[]
}

interface DatabaseExplorerProps {
  structure?: DatabaseStructure
  onTableClick: (tableName: string) => void
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ structure, onTableClick }) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  if (!structure) {
    return <div className="database-explorer-empty">No database selected</div>
  }

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  return (
    <div className="database-explorer">
      <div className="database-item">
        <div className="database-name">
          <Database size={16} />
          <span>{structure.name}</span>
        </div>

        <div className="tables-list">
          {structure.tables.map((table) => (
            <div key={table.name} className="table-item">
              <div className="table-header" onClick={() => toggleTable(table.name)}>
                {expandedTables[table.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Table size={14} />
                <span
                  className="table-name"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTableClick(table.name)
                  }}
                >
                  {table.name}
                </span>
              </div>

              {expandedTables[table.name] && (
                <div className="columns-list">
                  {table.columns.map((column) => (
                    <div key={column.name} className="column-item">
                      <Column size={12} />
                      <span className="column-name">{column.name}</span>
                      <span className="column-type">{column.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

