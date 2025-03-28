import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import "../styles/QueryEditor.css";

interface QueryEditorProps {
	value: string;
	onChange: (value: string) => void;
}

export const QueryEditor: React.FC<QueryEditorProps> = ({
	value,
	onChange,
}) => {
	const [editorHeight, setEditorHeight] = useState(200);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const editorRef = useRef<HTMLDivElement>(null);

	const LINE_HEIGHT = 20;

	const MAX_ROWS_NORMAL = 20;
	const MAX_ROWS_FULLSCREEN = 50;

	const updateHeight = useCallback(() => {
		if (textareaRef.current) {
			const lineCount = value.split("\n").length;

			const maxVisibleRows = isFullscreen
				? MAX_ROWS_FULLSCREEN
				: MAX_ROWS_NORMAL;

			const newHeight = Math.max(
				Math.min(maxVisibleRows, lineCount) * LINE_HEIGHT,
				200,
			);
			setEditorHeight(newHeight);
		}
	}, [value, isFullscreen]);

	useEffect(() => {
		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, [updateHeight]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Tab") {
			e.preventDefault();
			const start = e.currentTarget.selectionStart;
			const end = e.currentTarget.selectionEnd;
			const newValue = value.substring(0, start) + "  " + value.substring(end);
			onChange(newValue);
			setTimeout(() => {
				if (textareaRef.current) {
					textareaRef.current.selectionStart =
						textareaRef.current.selectionEnd = start + 2;
				}
			}, 0);
		}
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
		const lineNumbersElement = e.currentTarget.parentElement
			?.previousSibling as HTMLElement;
		if (lineNumbersElement) {
			lineNumbersElement.scrollTop = e.currentTarget.scrollTop;
		}
	};

	return (
		<div
			ref={editorRef}
			className={`query-editor-container ${isFullscreen ? "fullscreen" : ""}`}
		>
			<div className="editor-header">
				<span>SQL Editor</span>
				<button
					className="fullscreen-toggle"
					onClick={toggleFullscreen}
					aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
				>
					{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
				</button>
			</div>
			<div
				className="editor-content"
				style={{
					height: isFullscreen ? "calc(100vh - 40px)" : `${editorHeight}px`,
				}}
			>
				<div className="line-numbers">
					{Array.from({ length: value.split("\n").length }, (_, i) => (
						<div
							key={i}
							className="line-number"
						>
							{i + 1}
						</div>
					))}
				</div>
				<div className="query-editor-wrapper">
					<label
						htmlFor="query-textarea"
						className="sr-only"
						style={{ display: "none" }}
					>
						SQL Query Editor
					</label>
					<textarea
						id="query-textarea"
						ref={textareaRef}
						className="query-textarea"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={handleKeyDown}
						onScroll={syncScroll}
						spellCheck={false}
						aria-label="SQL Query Editor"
					/>
				</div>
			</div>
		</div>
	);
};
