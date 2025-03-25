import React, { useState, useEffect } from "react";
import "../styles/QueryEditor.css";

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const sqlKeywords = [
  "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "TABLE", "DROP", "ALTER", "JOIN",
  "GROUP BY", "ORDER BY", "HAVING", "DISTINCT", "LIMIT", "OFFSET", "AS", "IN", "AND", "OR", "NOT", "NULL"
];

const highlightSQL = (query: string) => {
  return query
    .replace(/(--.*?$)/gm, '<span class="comment">$1</span>') 
    .replace(/(["'].*?["'])/g, '<span class="string">$1</span>') 
    .replace(/\b(\d+)\b/g, '<span class="number">$1</span>') 
    .replace(new RegExp(`\\b(${sqlKeywords.join("|")})\\b`, "gi"), '<span class="keyword">$1</span>'); 
};

export const QueryEditor: React.FC<QueryEditorProps> = ({ value, onChange }) => {
  const [editorHeight, setEditorHeight] = useState(200);

  useEffect(() => {

    const lineCount = value.split("\n").length;
    setEditorHeight(Math.min(Math.max(lineCount * 20, 200), 600)); 
  }, [value]);

  return (
    <div className="query-editor-container">

      <div className="line-numbers">
        {value.split("\n").map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      <div className="query-editor-wrapper">
        <pre
          className="query-highlighter"
          dangerouslySetInnerHTML={{ __html: highlightSQL(value) }}
        ></pre>
        <textarea
          className="query-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ height: `${editorHeight}px` }}
        />
      </div>
    </div>
  );
};



