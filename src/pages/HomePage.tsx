import { useEffect, useState } from "react";
import {
	Play,
	Download,
	Save,
	Clock,
	Upload,
} from "lucide-react";
import { QueryEditor } from "../components/QueryEditor";
import { ResultsTable } from "../components/ResultsTable";
import { HistorySidebar } from "../components/QueryHistory";
import { DatabaseExplorer } from "../components/DatabaseExplorer";
import { predefinedQueries } from "../utils/predefinedQueries";
import { queryExecutor } from "../api/queryExecutor";
import { FileUploader } from "../components/FileUploader";
import "../styles/HomePage.css";
import { Header } from "../components/Header";

// Types
type QuerySource = "database" | "file";
type QueryHistoryItem = {
	query: string;
	timestamp: Date;
	source?: QuerySource;
};
type SavedQueryItem = { query: string; name: string; source: QuerySource };
type DatabaseStructure = {
	name: string;
	tables: {
		name: string;
		columns: { name: string; type: string }[];
	}[];
};

export const HomePage = () => {
	// State
	const [query, setQuery] = useState(predefinedQueries[0].query);
	const [results, setResults] = useState<any[]>([]);
	const [columns, setColumns] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [history, setHistory] = useState<QueryHistoryItem[]>([]);
	const [savedQueries, setSavedQueries] = useState<SavedQueryItem[]>([]);
	const [darkMode, setDarkMode] = useState(false);
	const [activeTab, setActiveTab] = useState<"history" | "saved">("history");
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [querySource, setQuerySource] = useState<QuerySource>("database");
	const [fileData, setFileData] = useState<any[] | null>(null);
	const [selectedDatabase, setSelectedDatabase] = useState<string>("main_db");
	const [databaseStructure, setDatabaseStructure] = useState<
		DatabaseStructure[]
	>([
		{
			name: "main_db",
			tables: [
				{
					name: "users",
					columns: [
						{ name: "id", type: "INTEGER" },
						{ name: "name", type: "TEXT" },
						{ name: "email", type: "TEXT" },
					],
				},
				{
					name: "orders",
					columns: [
						{ name: "id", type: "INTEGER" },
						{ name: "user_id", type: "INTEGER" },
						{ name: "amount", type: "REAL" },
						{ name: "date", type: "TEXT" },
					],
				},
			],
		},
		{
			name: "analytics_db",
			tables: [
				{
					name: "events",
					columns: [
						{ name: "id", type: "INTEGER" },
						{ name: "event_type", type: "TEXT" },
						{ name: "timestamp", type: "TEXT" },
					],
				},
			],
		},
	]);

	// Effects
	useEffect(() => {
		// Check for user preference
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		setDarkMode(prefersDark);
	}, []);

	useEffect(() => {
		document.documentElement.classList.toggle("dark-mode", darkMode);
	}, [darkMode]);

	// Handlers
	const runQuery = async () => {
		if (!query.trim()) return;
		setIsLoading(true);
		const startTime = performance.now();

		try {
			let data, cols;

			if (querySource === "database") {
				const result = await queryExecutor(query, selectedDatabase);
				data = result.data;
				cols = result.columns;
			} else if (querySource === "file" && fileData) {
				// Simple query parser for file data (very basic implementation)
				// In a real app, you'd want a more robust SQL parser for file data
				const lowerQuery = query.toLowerCase();
				if (lowerQuery.includes("select") && lowerQuery.includes("from")) {
					// Extract columns to select
					const selectPart = lowerQuery
						.split("select")[1]
						.split("from")[0]
						.trim();
					const selectedCols =
						selectPart === "*"
							? Object.keys(fileData[0])
							: selectPart.split(",").map((col) => col.trim());

					// Very basic filtering (just a demonstration)
					let filteredData = fileData;
					if (lowerQuery.includes("where")) {
						const wherePart = lowerQuery.split("where")[1].trim();
						// This is a very simplified parser - would need a proper SQL parser in real app
						const [field, operator, value] = wherePart.split(/\s+/);

						filteredData = fileData.filter((row) => {
							if (operator === "=")
								return row[field] == value.replace(/'/g, "");
							if (operator === ">") return row[field] > value;
							if (operator === "<") return row[field] < value;
							return true;
						});
					}

					// Project only selected columns
					data = filteredData.map((row) => {
						const newRow: Record<string, any> = {};
						selectedCols.forEach((col) => {
							newRow[col] = row[col];
						});
						return newRow;
					});

					cols = selectedCols;
				} else {
					// If query doesn't match expected format, return all data
					data = fileData;
					cols = Object.keys(fileData[0]);
				}
			} else {
				throw new Error("No data source available");
			}

			setResults(data);
			setColumns(cols);
			setHistory((prev) => [
				{
					query,
					timestamp: new Date(),
					source: querySource,
				},
				...prev,
			]);
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
			setSavedQueries((prev) => [
				...prev,
				{
					query,
					name,
					source: querySource,
				},
			]);
			// Switch to saved tab after saving
			setActiveTab("saved");
		}
	};

	const exportToCSV = () => {
		if (results.length === 0) return;

		const csvContent = [
			columns.join(","),
			...results.map((row) =>
				columns.map((col) => `"${row[col] || ""}"`).join(","),
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `query_results_${new Date()
			.toISOString()
			.slice(0, 10)}.csv`;
		link.click();
	};

	const exportToJSON = () => {
		if (results.length === 0) return;

		const jsonContent = JSON.stringify(results, null, 2);
		const blob = new Blob([jsonContent], {
			type: "application/json;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `query_results_${new Date()
			.toISOString()
			.slice(0, 10)}.json`;
		link.click();
	};

	const handleFileUpload = (data: any[]) => {
		setFileData(data);
		setQuerySource("file");
		// Set a default query for the uploaded file
		if (data.length > 0) {
			const columns = Object.keys(data[0]).join(", ");
			setQuery(`SELECT ${columns}`);
		}
	};

	const handleDatabaseSelect = (dbName: string) => {
		setSelectedDatabase(dbName);
	};

	const handleTableClick = (tableName: string) => {
		// Find the selected database
		const db = databaseStructure.find((db) => db.name === selectedDatabase);
		if (!db) return;

		// Find the selected table
		const table = db.tables.find((t) => t.name === tableName);
		if (!table) return;

		// Generate a SELECT query for this table
		const columns = table.columns.map((c) => c.name).join(", ");
		setQuery(`SELECT ${columns} FROM ${tableName}`);
	};

	return (
		<div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
			<Header
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
				setDarkMode={setDarkMode}
				darkMode={darkMode}
				querySource={querySource}
				setQuerySource={setQuerySource}
			/>

			<div
				className={`app-layout ${
					sidebarOpen ? "sidebar-open" : "sidebar-closed"
				}`}
			>
        <main className="main-content">
        {sidebarOpen && (
          <HistorySidebar
            sidebarOpen={sidebarOpen}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            history={history}
            savedQueries={savedQueries}
            handleQuerySelect={handleQuerySelect}
          />
        )}

					<div className="query-section">
						<div className="query-header">
							<h2>Query Editor</h2>
							<div className="query-actions">
								{querySource === "database" && (
									<div className="dropdown-container">
										<label
											htmlFor="database-select"
											className="dropdown-label"
										>
											Database:
										</label>
										<select
											id="database-select"
											className="query-dropdown"
											value={selectedDatabase}
											onChange={(e) => handleDatabaseSelect(e.target.value)}
										>
											{databaseStructure.map((db) => (
												<option
													key={db.name}
													value={db.name}
												>
													{db.name}
												</option>
											))}
										</select>
									</div>
								)}

								{querySource === "database" && (
									<div className="dropdown-container">
										<label
											htmlFor="predefined-queries"
											className="dropdown-label"
										>
											Predefined:
										</label>
										<select
											id="predefined-queries"
											className="query-dropdown"
											onChange={(e) => handleQuerySelect(e.target.value)}
										>
											<option value="">-- Select query --</option>
											{predefinedQueries.map(
												(
													item: { query: string; name: string },
													index: number,
												) => (
													<option
														key={index}
														value={item.query}
													>
														{item.name}
													</option>
												),
											)}
										</select>
									</div>
								)}

								{querySource === "file" && !fileData && (
									<FileUploader onFileUpload={handleFileUpload} />
								)}

								{querySource === "file" && fileData && (
									<button
										className="action-button secondary-button"
										onClick={() => setFileData(null)}
									>
										<Upload size={16} /> Change File
									</button>
								)}

								{savedQueries.length > 0 && (
									<div className="dropdown-container">
										<label
											htmlFor="saved-queries"
											className="dropdown-label"
										>
											Saved:
										</label>
										<select
											id="saved-queries"
											className="query-dropdown"
											onChange={(e) => handleQuerySelect(e.target.value)}
										>
											<option value="">-- Select saved query --</option>
											{savedQueries
												.filter((q) => q.source === querySource)
												.map((item, index) => (
													<option
														key={index}
														value={item.query}
													>
														{item.name}
													</option>
												))}
										</select>
									</div>
								)}
							</div>
						</div>

						<QueryEditor
							value={query}
							onChange={setQuery}
						/>

						<div className="button-group">
							<button
								className="action-button run-button"
								onClick={runQuery}
								disabled={isLoading || (querySource === "file" && !fileData)}
							>
								<Play size={16} /> {isLoading ? "Running..." : "Run Query"}
							</button>
							<button
								className="action-button save-button"
								onClick={saveCurrentQuery}
								disabled={!query.trim()}
							>
								<Save size={16} /> Save
							</button>
							<button
								className="action-button export-button"
								onClick={exportToCSV}
								disabled={results.length === 0}
							>
								<Download size={16} /> CSV
							</button>
							<button
								className="action-button export-button"
								onClick={exportToJSON}
								disabled={results.length === 0}
							>
								<Download size={16} /> JSON
							</button>
						</div>

						{executionTime !== null && (
							<p className="execution-time">
								<Clock size={14} /> Execution time: {executionTime.toFixed(2)}{" "}
								ms
							</p>
						)}

						{querySource === "database" && (
							<div className="database-explorer-container">
								<h3 className="explorer-title">Database Structure</h3>
								<DatabaseExplorer
									structure={databaseStructure.find(
										(db) => db.name === selectedDatabase,
									)}
									onTableClick={handleTableClick}
								/>
							</div>
						)}
					</div>
						<ResultsTable
							data={results}
							columns={columns}
							isLoading={isLoading}
						/>
				</main>
			</div>
		</div>
	);
};
