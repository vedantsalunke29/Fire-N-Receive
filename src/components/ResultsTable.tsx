/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
	ArrowUp,
	ArrowDown,
	SortAsc,
	Loader2,
	Maximize2,
	Minimize2,
} from "lucide-react";
import "../styles/ResultsTable.css";

interface ResultsTableProps {
	data: any[];
	columns: string[];
	isLoading: boolean;
}

export const ResultsTable = ({
	data,
	columns,
	isLoading,
}: ResultsTableProps) => {
	const [sortColumn, setSortColumn] = useState("");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
	const [visibleData, setVisibleData] = useState<any[]>([]);
	const [startIndex, setStartIndex] = useState(0);
	const [endIndex, setEndIndex] = useState(0);
	const [isScrolling, setIsScrolling] = useState(false);
	const [totalHeight, setTotalHeight] = useState(0);
	const [initialRenderComplete, setInitialRenderComplete] = useState(false);
	const [loadedData, setLoadedData] = useState<any[]>([]);
	const [loadedDataSize, setLoadedDataSize] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);
	const headerRef = useRef<HTMLTableSectionElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const ROW_HEIGHT = 40;
	const BUFFER_SIZE = 20;
	const INITIAL_LOAD_SIZE = 2000;
	const BATCH_SIZE = 15000;

  
	useEffect(() => {
		if (!data.length) return;

		const initialData = data.slice(0, INITIAL_LOAD_SIZE);
		setLoadedData(initialData);
		setLoadedDataSize(initialData.length);
		setInitialRenderComplete(true);
	}, [data]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const toggleFullscreen = () => {
		if (!containerRef.current) return;

		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	};

	const loadMoreData = useCallback(() => {
		if (loadedDataSize >= data.length) return;
    
    const nextBatchSize = Math.min(BATCH_SIZE, data.length - loadedDataSize);
		const nextBatch = data.slice(
			loadedDataSize,
			loadedDataSize + nextBatchSize,
		);

		setLoadedData((prevData) => [...prevData, ...nextBatch]);
		setLoadedDataSize((prevSize) => prevSize + nextBatchSize);
	}, [data, loadedDataSize]);

	const getSortedData = useCallback(() => {
		if (!loadedData.length || !sortColumn) return loadedData;

		return [...loadedData].sort((a, b) => {
			const aValue = a[sortColumn];
			const bValue = b[sortColumn];

			if (typeof aValue === "number" && typeof bValue === "number") {
				return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
			}

			if (aValue == null && bValue == null) return 0;
			if (aValue == null) return sortDirection === "asc" ? -1 : 1;
			if (bValue == null) return sortDirection === "asc" ? 1 : -1;

			const aString = String(aValue).toLowerCase();
			const bString = String(bValue).toLowerCase();

			if (aString < bString) return sortDirection === "asc" ? -1 : 1;
			if (aString > bString) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [loadedData, sortColumn, sortDirection]);

	const sortedData = useMemo(() => getSortedData(), [getSortedData]);

	const calculateVisibleRows = useCallback(() => {
		if (!scrollRef.current || !sortedData.length) return;

		const scrollTop = scrollRef.current.scrollTop;
		const scrollHeight = scrollRef.current.clientHeight;
		const scrollBottom = scrollTop + scrollHeight;
		const scrollPercentage = scrollBottom / (sortedData.length * ROW_HEIGHT);

		if (scrollPercentage > 0.7 && loadedDataSize < data.length) {
			loadMoreData();
		}

		const start = Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE;
		const visibleCount = Math.ceil(scrollHeight / ROW_HEIGHT) + BUFFER_SIZE * 2;

		const startIdx = Math.max(0, start);
		const endIdx = Math.min(sortedData.length, startIdx + visibleCount);

		setStartIndex(startIdx);
		setEndIndex(endIdx);

		if (headerRef.current && scrollRef.current) {
			if (headerRef.current?.parentElement) {
				headerRef.current.parentElement.scrollLeft =
					scrollRef.current.scrollLeft;
			}
		}
	}, [sortedData.length, loadedDataSize, data.length, loadMoreData]);

	const handleScroll = useCallback(() => {
		if (!isScrolling) {
			setIsScrolling(true);
		}

		window.requestAnimationFrame(() => {
			calculateVisibleRows();

			clearTimeout((window as any).scrollTimeout);
			(window as any).scrollTimeout = setTimeout(() => {
				setIsScrolling(false);
			}, 150);
		});
	}, [calculateVisibleRows, isScrolling]);

	useEffect(() => {
		setTotalHeight(data.length * ROW_HEIGHT);
	}, [data.length]);

	useEffect(() => {
		if (sortedData.length === 0) return;

		const visibleRows = sortedData.slice(startIndex, endIndex);
		setVisibleData(visibleRows);
	}, [startIndex, endIndex, sortedData]);

	useEffect(() => {
		const scrollContainer = scrollRef.current;
		if (scrollContainer) {
			scrollContainer.addEventListener("scroll", handleScroll, {
				passive: true,
			});
			return () => {
				scrollContainer.removeEventListener("scroll", handleScroll);
			};
		}
	}, [handleScroll]);

	useEffect(() => {
		if (initialRenderComplete) {
			calculateVisibleRows();
		}
	}, [initialRenderComplete, calculateVisibleRows]);

	const handleSort = (column: string) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	const renderLoadingState = () => {
		const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
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
		);
	};

	const renderEmptyState = () => {
		return (
			<div className="table-container">
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
		);
	};

	const getSortIcon = (column: string) => {
		if (sortColumn !== column) {
			return (
				<SortAsc
					size={14}
					className="sort-icon"
				/>
			);
		}
		return sortDirection === "asc" ? (
			<ArrowUp
				size={14}
				className="sort-icon active"
			/>
		) : (
			<ArrowDown
				size={14}
				className="sort-icon active"
			/>
		);
	};

	if (isLoading) {
		return renderLoadingState();
	}

	if (data.length === 0) {
		return renderEmptyState();
	}

	return (
		<div
			className={`results-section ${isFullscreen ? "fullscreen" : ""}`}
			ref={containerRef}
		>
			<div className="results-header">
				<h2>Results</h2>
				<div className="results-meta">
					{data.length > 0 && (
						<span className="results-count">{data.length} rows returned</span>
					)}
					{loadedDataSize < data.length && (
						<span className="loaded-count">({loadedDataSize} loaded)</span>
					)}
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
					<div className="header-scroll">
						<table className="results-table header-table">
							<thead ref={headerRef}>
								<tr>
									{columns.map((column) => (
										<th
											key={column}
											className={`sortable-header ${
												sortColumn === column ? "sorted" : ""
											}`}
											onClick={() => handleSort(column)}
										>
											<div className="header-content">
												<span>{column}</span>
												{getSortIcon(column)}
											</div>
										</th>
									))}
								</tr>
							</thead>
						</table>
					</div>
				</div>

				<div
					className="table-scroll"
					ref={scrollRef}
				>
					<div
						className="virtual-scroll-container"
						style={{ height: `${totalHeight}px` }}
					>
						<table
							className="results-table body-table"
							style={{
								transform: `translateY(${startIndex * ROW_HEIGHT}px)`,
							}}
						>
							<colgroup>
								{columns.map((index) => (
									<col key={index} />
								))}
							</colgroup>
							<tbody>
								{visibleData.map((row, rowIndex) => (
									<tr key={startIndex + rowIndex}>
										{columns.map((column) => (
											<td
												key={column}
												title={String(row[column] || "")}
											>
												{row[column] !== null && row[column] !== undefined
													? String(row[column])
													: ""}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="table-footer">
					<div className="scroll-info">
						{isScrolling && (
							<div className="scrolling-indicator">
								<Loader2
									size={14}
									className="spinning"
								/>
								<span>
									Viewing rows {startIndex + 1}-
									{Math.min(endIndex, loadedDataSize)} of {data.length}
								</span>
							</div>
						)}
						{!isScrolling && data.length > 0 && (
							<span>
								Viewing rows {startIndex + 1}-
								{Math.min(endIndex, loadedDataSize)} of {data.length}
							</span>
						)}
					</div>

					{loadedDataSize < data.length && !isScrolling && (
						<button
							className="load-more-button"
							onClick={loadMoreData}
						>
							Load more data
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
