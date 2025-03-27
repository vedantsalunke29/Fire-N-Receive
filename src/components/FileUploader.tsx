/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"
import { useRef, useState } from "react"
import { Upload, AlertCircle } from "lucide-react"
import "../styles/FileUploader.css"

interface FileUploaderProps {
  onFileUpload: (data: any[]) => void
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

    const result = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values: string[] = []
      let currentValue = ""
      let inQuotes = false

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.replace(/^"|"$/g, ""))
          currentValue = ""
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.replace(/^"|"$/g, ""))

      const row: Record<string, any> = {}
      headers.forEach((header, index) => {
        if (index < values.length) {
          row[header] = values[index]
        }
      })

      result.push(row)
    }

    return result
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        let data: any[] = []

        if (file.name.endsWith(".json")) {
          data = JSON.parse(content)
          if (!Array.isArray(data)) {
            if (typeof data === "object" && data !== null) {
              const arrayProp = Object.keys(data).find((key) => Array.isArray(data[key]))
              if (arrayProp) {
                data = data[arrayProp]
              } else {
                throw new Error("JSON file must contain an array of objects")
              }
            } else {
              throw new Error("JSON file must contain an array of objects")
            }
          }
        } else if (file.name.endsWith(".csv")) {
          data = parseCSV(content)
        } else {
          throw new Error("Unsupported file format. Please upload a JSON or CSV file.")
        }

        if (data.length === 0) {
          throw new Error("File contains no data")
        }

        onFileUpload(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error parsing file")
      } finally {
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError("Error reading file")
      setLoading(false)
    }

    if (file.name.endsWith(".json") || file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      setError("Unsupported file format. Please upload a JSON or CSV file.")
      setLoading(false)
    }
  }

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.csv"
        style={{ display: "none" }}
      />
      <button className="upload-button" onClick={handleClick} disabled={loading}>
        <Upload size={16} />
        {loading ? "Uploading..." : "Upload JSON/CSV"}
      </button>

      {error && (
        <div className="upload-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

