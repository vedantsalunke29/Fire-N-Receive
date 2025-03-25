import type { ReactNode } from "react"
import "../styles/QueryHistory.css" 

interface HistoryItem {
  query: string
  timestamp: Date
  name?: string
}

interface QueryHistoryProps {
  items: HistoryItem[]
  onSelect: (query: string) => void
  icon: ReactNode
}

export const QueryHistory = ({ items, onSelect, icon }: QueryHistoryProps) =>{
    if (items.length === 0) {
      return <div className="empty-message">No items yet</div>
    }
  
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  
    const truncateQuery = (query: string, maxLength = 40) => {
      return query.length > maxLength ? query.substring(0, maxLength) + "..." : query
    }
  
    return (
      <ul className="history-list">
        {items.map((item, index) => (
          <li key={index} className="history-item">
            <button className="history-button" onClick={() => onSelect(item.query)}>
              <div className="history-content">
                <span className="history-icon">{icon}</span>
                <div>
                  <div className="history-title">{item.name || truncateQuery(item.query)}</div>
                  <div className="history-timestamp">{formatTime(item.timestamp)}</div>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    )
  }
  