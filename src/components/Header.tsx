import React from "react";
import { Moon, Sun, Database, FileText, Menu, ChevronLeft } from "lucide-react";

type QuerySource = "database" | "file";
interface HeaderProps {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	darkMode: boolean;
	setDarkMode: (darkMode: boolean) => void;
	querySource: QuerySource;
	setQuerySource: (source: QuerySource) => void;
}
export const Header: React.FC<HeaderProps> = ({
	sidebarOpen,
	setSidebarOpen,
	darkMode,
	setDarkMode,
	querySource,
	setQuerySource,
}) => {
	const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

	return (
		<header className="app-header">
			<div className="header-left">
				<button
					className="sidebar-toggle"
					onClick={toggleSidebar}
					aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
				>
					{sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
				</button>
				<h1>SQL Query Runner</h1>
			</div>
			<div className="header-right">
				<div className="source-selector">
					<button
						className={`source-button ${
							querySource === "database" ? "active" : ""
						}`}
						onClick={() => setQuerySource("database")}
					>
						<Database size={16} />Query on database
					</button>
					<button
						className={`source-button ${
							querySource === "file" ? "active" : ""
						}`}
						onClick={() => setQuerySource("file")}
					>
						<FileText size={16} />Query on csv/json
					</button>
				</div>
				<button
					className="theme-toggle-button"
					onClick={() => setDarkMode(!darkMode)}
					aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
				>
					{darkMode ? <Sun size={20} /> : <Moon size={20} />}
				</button>
			</div>
		</header>
	);
};
