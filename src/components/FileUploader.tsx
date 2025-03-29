/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"
import { useRef, useState } from "react"
import { Upload, AlertCircle } from "lucide-react"
import "../styles/FileUploader.css"

interface DataRow {
  [key: string]: any; 
}

interface FileUploaderProps {
  onFileUpload: (data: DataRow[]) => void
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const parseCSV = (text: string): DataRow[] => {
    try {
      const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim().length > 0)
      
      if (lines.length === 0) {
        throw new Error("No data found in CSV file")
      }
      
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
      
      if (headers.length === 0) {
        throw new Error("No headers found in CSV file")
      }
      

      const result: DataRow[] = []
      
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
    } catch (err) {
      console.error("Error parsing CSV:", err)
      throw err
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setProgress(0)

    

    if (file.name.endsWith(".json")) {
      handleLargeJsonFile(file)
    } 

    else if (file.name.endsWith(".csv")) {
      handleLargeCsvFile(file)
    } 
    else {
      setError("Unsupported file format. Please upload a JSON or CSV file.")
      setLoading(false)
    }
  }

  const handleLargeJsonFile = (file: File) => {
    const chunkSize = 20 * 1024 * 1024 
    let offset = 0
    let fileContent = ""
    
    const readNextChunk = () => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        if (e.target?.result) {
          fileContent += e.target.result
          offset += chunkSize
          setProgress(Math.min(100, Math.round((offset / file.size) * 100)))
          
          if (offset < file.size) {
            readNextChunk()
          } else {
            try {
              let data: DataRow[] = JSON.parse(fileContent)
              
              if (!Array.isArray(data)) {
                if (typeof data === "object" && data !== null) {
                  const arrayProp = Object.keys(data).find((key: string) => {
                    const value = (data as unknown as Record<string, unknown>)[key]
                    return Array.isArray(value)
                  })
                  
                  if (arrayProp) {
                    data = (data as Record<string, DataRow[]>)[arrayProp]
                  } else {
                    throw new Error("JSON file must contain an array of objects")
                  }
                } else {
                  throw new Error("JSON file must contain an array of objects")
                }
              }
              
              if (data.length === 0) {
                throw new Error("File contains no data")
              }
              
              onFileUpload(data)
              setLoading(false)
            } catch (err) {
              console.error("Error parsing JSON:", err)
              if (err instanceof Error) {
                setError(err.message)
              } else {
                setError("Error parsing JSON file")
              }
              setLoading(false)
            }
          }
        }
      }
      
      reader.onerror = () => {
        setError("Error reading file")
        setLoading(false)
      }
      
      const slice = file.slice(offset, offset + chunkSize)
      reader.readAsText(slice)
    }
    
    readNextChunk()
  }

  const handleLargeCsvFile = (file: File) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          throw new Error("Failed to read file")
        }
        
        const content = e.target.result as string
        
        if (!content.trim()) {
          throw new Error("File is empty")
        }
        
        
        const data = parseCSV(content)
        
        if (data.length === 0) {
          throw new Error("No data rows found in the file")
        }
        
        onFileUpload(data)
      } catch (err) {
        console.error("Error processing CSV:", err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
      } finally {
        setLoading(false)
      }
    }
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    
    reader.onerror = () => {
      console.error("FileReader error:", reader.error)
      setError(`Error reading file: ${reader.error?.message || "Unknown error"}`)
      setLoading(false)
    }
    
    reader.readAsText(file)
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
        {loading ? `Uploading... ${progress}%` : "Upload JSON/CSV"}
      </button>

      {loading && progress > 0 && (
        <div className="upload-progress">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}