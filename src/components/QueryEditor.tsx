import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import "../styles/QueryEditor.css"

interface QueryEditorProps {
  value: string
  onChange: (value: string) => void
}

export const QueryEditor: React.FC<QueryEditorProps> = ({ value, onChange }) => {
  const [editorHeight, setEditorHeight] = useState(200)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlighterRef = useRef<HTMLPreElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Simple highlighting that only handles comments and strings
  const highlightSQL = (query: string) => {
    return query
      .replace(/(--.*?$)/gm, '<span class="comment">$1</span>')
      .replace(/(["'](?:\\.|[^"'\\])*["'])/g, '<span class="string">$1</span>')
  }

  const updateHeight = useCallback(() => {
    if (textareaRef.current) {
      const lineCount = value.split("\n").length
      const newHeight = Math.min(Math.max(lineCount * 20, 200), isFullscreen ? window.innerHeight - 100 : 600)
      setEditorHeight(newHeight)
    }
  }, [value, isFullscreen])

  // Sync scroll positions between textarea and highlighter
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textareaRef.current.scrollTop
      highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  useEffect(() => {
    updateHeight()
    window.addEventListener("resize", updateHeight)
    return () => window.removeEventListener("resize", updateHeight)
  }, [updateHeight])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newValue = value.substring(0, start) + "  " + value.substring(end)
      onChange(newValue)
      // Set cursor position after tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(updateHeight, 0)
  }

  return (
    <div ref={editorRef} className={`query-editor-container ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="editor-header">
        <span>SQL Editor</span>
        <button className="fullscreen-toggle" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
      <div className="editor-content" style={{ height: `${editorHeight}px` }}>
        <div className="line-numbers">
          {Array.from({ length: value.split("\n").length }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <div className="query-editor-wrapper">
          <pre
            ref={highlighterRef}
            className="query-highlighter"
            dangerouslySetInnerHTML={{
              __html: highlightSQL(value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")),
            }}
          ></pre>
          <textarea
            ref={textareaRef}
            className="query-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}

