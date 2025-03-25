import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  Play,
  Download,
  Save,
  Clock,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import {QueryEditor} from "../components/QueryEditor";
import {ResultsTable} from "../components/ResultsTable";
import {QueryHistory} from "../components/QueryHistory";
import { predefinedQueries } from "../utils/predefinedQueries";
import { queryExecutor } from "../api/queryExecutor";
import "../styles/HomePage.css"; 

export const HomePage = () => {
  const [query, setQuery] = useState(predefinedQueries[0].query);
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [history, setHistory] = useState<{ query: string; timestamp: Date }[]>([]);
  const [savedQueries, setSavedQueries] = useState<{ query: string; name: string }[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const runQuery = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { data, columns } = await queryExecutor(query);
      setResults(data);
      setColumns(columns);
      setHistory((prev) => [{ query, timestamp: new Date() }, ...prev]);
      setExecutionTime(performance.now() - startTime);
    } catch (error) {
      console.error("Error executing query:", error);
      setResults([]);
      setColumns([]);
      setExecutionTime(null);
    } finally {
      setIsLoading(false);
    }
  };



const handleQuerySelect = (selectedQuery: string): void => {
    setQuery(selectedQuery);
};

  const saveCurrentQuery = () => {
    const name = prompt("Enter a name for this query:");
    if (name) {
      setSavedQueries((prev) => [...prev, { query, name }]);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    const csvContent = [
      columns.join(","),
      ...results.map((row) => columns.map((col) => `"${row[col]}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "query_results.csv";
    link.click();
  };
  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
    <header className="header">
      <h1>SQL Query Runner</h1>
      <button className="icon-button" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <Sun /> : <Moon />}
      </button>
    </header>

    <div className="main-grid">
      <div className="query-section">
        <div className="query-header">
          <h2>Query Editor</h2>
          <div className="query-actions">
            <select
              className="dropdown"
              onChange={(e) => handleQuerySelect(e.target.value)}
            >
              {predefinedQueries.map((item: { query: string; name: string }, index: number) => (
                <option key={index} value={item.query}>
                  {item.name}
                </option>
              ))}
            </select>
            {savedQueries.length > 0 && (
              <select
                className="dropdown"
                onChange={(e) => handleQuerySelect(e.target.value)}
              >
                {savedQueries.map((item, index) => (
                  <option key={index} value={item.query}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <QueryEditor value={query} onChange={setQuery} />

        <div className="button-group">
          <button onClick={runQuery} disabled={isLoading}>
            <Play /> {isLoading ? "Running..." : "Run Query"}
          </button>
          <button onClick={saveCurrentQuery}>
            <Save /> Save
          </button>
          <button onClick={exportToCSV} disabled={results.length === 0}>
            <Download /> Export CSV
          </button>
        </div>
        {executionTime && (
          <p className="execution-time">
            Execution time: {executionTime.toFixed(2)} ms
          </p>
        )}
      </div>

      <div className="results-section">
        <h2>Results</h2>
        {results.length > 0 && <p>{results.length} rows returned</p>}
        <ResultsTable data={results} columns={columns} isLoading={isLoading} />
      </div>

      <div className="sidebar">
        <div className="tabs">
          <button className="tab-button active">History</button>
          <button className="tab-button">Saved</button>
        </div>
        <div className="tab-content">
          <QueryHistory items={history} onSelect={handleQuerySelect} icon={<Clock />} />
        </div>
        <div className="tab-content">
          <QueryHistory
            items={savedQueries.map((sq) => ({
              query: sq.query,
              timestamp: new Date(),
              name: sq.name,
            }))}
            onSelect={handleQuerySelect}
            icon={<Check />}
          />
        </div>
      </div>
    </div>
  </div>
  )
}
