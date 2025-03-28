import type { ReactNode } from "react"
import { Clock, Check, Database, FileText } from "lucide-react"
import "../styles/QueryHistory.css"

interface HistoryItem {
  query: string
  timestamp: Date
  name?: string
  source?: "database" | "file"
}

interface QueryHistoryProps {
  items: HistoryItem[]
  onSelect: (query: string) => void
  icon: ReactNode
}

export const QueryHistory = ({ items, onSelect, icon }: QueryHistoryProps) => {
  if (items.length === 0) {
    return <div className="empty-message">No items yet</div>
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const truncateQuery = (query: string, maxLength = 40) => {
    return query.length > maxLength ? query.substring(0, maxLength) + "..." : query
  }

  const groupedItems: Record<string, HistoryItem[]> = {}
  items.forEach((item) => {
    const dateKey = formatDate(item.timestamp)
    if (!groupedItems[dateKey]) {
      groupedItems[dateKey] = []
    }
    groupedItems[dateKey].push(item)
  })

  return (
    <div className="history-container">
      {Object.entries(groupedItems).map(([date, dateItems]) => (
        <div key={date} className="history-group">
          <div className="history-date">{date}</div>
          <ul className="history-list">
            {dateItems.map((item, index) => (
              <li key={index} className="history-item">
                <button className="history-button" onClick={() => onSelect(item.query)}>
                  <div className="history-content">
                    <span className="history-icon">{icon}</span>
                    <div className="history-text">
                      <div className="history-title">{item.name || truncateQuery(item.query)}</div>
                      <div className="history-meta">
                        <span className="history-timestamp">{formatTime(item.timestamp)}</span>
                        {item.source && (
                          <span className="history-source">
                            {item.source === "database" ? (
                              <>
                                <Database size={12} /> DB
                              </>
                            ) : (
                              <>
                                <FileText size={12} /> File
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export const HistorySidebar = ({
  sidebarOpen,
  activeTab,
  setActiveTab,
  history,
  savedQueries,
  handleQuerySelect,
}: {
  sidebarOpen: boolean
  activeTab: "history" | "saved"
  setActiveTab: (tab: "history" | "saved") => void
  history: HistoryItem[]
  savedQueries: { query: string; name: string; source: "database" | "file" }[]
  handleQuerySelect: (query: string) => void
}) => {
  if (!sidebarOpen) return null

  return (
    <aside className="sidebar">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <Clock size={16} /> History
        </button>
        <button className={`tab-button ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
          <Check size={16} /> Saved
        </button>
      </div>

      {activeTab === "history" && (
        <div className="tab-content">
          <QueryHistory items={history} onSelect={handleQuerySelect} icon={<Clock size={16} />} />
        </div>
      )}

      {activeTab === "saved" && (
        <div className="tab-content">
          <QueryHistory
            items={savedQueries.map((sq) => ({
              query: sq.query,
              timestamp: new Date(),
              name: sq.name,
              source: sq.source,
            }))}
            onSelect={handleQuerySelect}
            icon={<Check size={16} />}
          />
        </div>
      )}
    </aside>
  )
}

