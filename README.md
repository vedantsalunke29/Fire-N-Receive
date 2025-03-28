# Fire N' Receive

## Overview

Fire N' Receive is a high-performance SQL query execution and data visualization tool designed to handle massive datasets with ease. The application allows users to write and execute SQL queries against both databases and uploaded files (CSV/JSON), visualize results in a responsive table, and export data in various formats.

### Key Features

- **Powerful SQL Editor** with line numbering
- **Dual Data Source Support** for both databases and file uploads
- **High-Performance Results Table** capable of handling millions of rows
- **Efficient Pagination System** for navigating large datasets
- **Database Schema Explorer** for easy table and column discovery
- **Query History** for tracking previously executed queries
- **Saved Queries** for quick access to frequently used queries
- **Export Functionality** for CSV and JSON formats
- **Dark/Light Mode** for comfortable viewing in any environment
- **Responsive Design** that works on desktop, tablet, and mobile devices

## Technology Stack

### Core Framework
- **React 18** with TypeScript for type-safe component development

### Major Packages
- **Lucide React** for consistent, high-quality icons
- **React DOM** for efficient DOM manipulation
- **TypeScript** for type safety and improved developer experience

### UI Components
- Custom-built components for specialized functionality:
  - `QueryEditor`: SQL editor with syntax highlighting
  - `ResultsTable`: High-performance table with pagination
  - `DatabaseExplorer`: Interactive database schema browser
  - `FileUploader`: File upload and parsing utility

### Styling
- CSS Modules for component-scoped styling
- CSS Variables for theming and consistent design

## Performance Metrics

### Page Load Time
- **Initial Load**: ~52ms
- **Time to Interactive**: ~70ms
- **Last Contentful Paint (LCP)**: ~160ms

### Measurement Methodology
Performance metrics were measured using:
- **Chrome DevTools Performance panel**
- **Lighthouse audits**
- **React Profiler**
- **Custom performance markers using the Performance API**:

```javascript
import { useEffect } from "react";
import { HomePage } from "./pages/HomePage";

function App() {
  useEffect(() => {
    const start = performance.now();

    requestAnimationFrame(() => {
      const loadTime = performance.now() - start;
      console.log(`Page loaded in ${loadTime.toFixed(2)} ms`);
    });
  }, []);

  return <HomePage />;
}

export default App;
```
## Performance Metrices on Chrome DevTools

<img width="1710" alt="Screenshot 2025-03-29 at 02 05 22" src="https://github.com/user-attachments/assets/cbc59eff-3882-4593-8431-00ba718be2c0" />
<img width="1710" alt="Screenshot 2025-03-29 at 00 41 35" src="https://github.com/user-attachments/assets/ffd04402-291a-4980-9497-dd2d2912d957" />

## Performance Optimizations
### Large Dataset Handling

- **Efficient Pagination**: Only renders the current page of data, regardless of total dataset size
- **Fixed Table Headers**: Maintains column headers during scrolling without performance impact
- **Virtualized Rendering**: Optimized table rendering that can handle millions of rows without lag
- **Memory Management**: Doesn't store the entire dataset in memory, only the visible portion

### UI Optimizations

- **Throttled UI Updates**: Prevents excessive re-renders during scrolling and data loading
- **Optimized DOM Operations**: Minimizes DOM manipulations for better performance
- **CSS Optimizations**: Uses efficient CSS selectors and avoids expensive properties
- **Lazy Loading**: Components and features are loaded only when needed

### Query Execution

- **Execution Time Tracking**: Measures and displays query execution time
- **Optimized Query Parsing**: Efficient parsing of SQL for file-based queries
- **Chunked Data Processing**: Processes large datasets in chunks to prevent UI freezing

## Key Differentiators

### Handling Millions of Rows

Fire N' Receive is specifically optimized to handle extremely large datasets (millions of rows) with:

- **Smart Pagination**: Efficiently manages data without loading everything into memory
- **Optimized Rendering**: Only renders what's visible to the user
- **Performance-First Design**: Every component is built with performance as the primary consideration

### No Local Storage Dependency

Unlike many similar tools, Fire N' Receive doesn't rely on browser storage:

- **No localStorage Dependencies**: Doesn't store data in browser storage
- **Session-Based Operation**: All operations happen within the current session
- **Privacy-Focused**: No data persists after the browser is closed

## Getting Started

### Installation

```shell
# Clone the repository
git clone https://github.com/vedantsalunke29/Fire-N-Receive.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Usage

1. Select your data source (Database or File)
2. If using a file, upload a CSV or JSON file
3. If using a database, select from the available connections
4. Write your SQL query in the editor
5. Click "Run Query" to execute
6. View results in the table below
7. Use pagination controls to navigate through large result sets
8. Export results as CSV or JSON if needed

