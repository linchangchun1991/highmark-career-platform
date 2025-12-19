"use client"

import { useState } from "react"

interface JobUploadProps {
  onUploadSuccess: () => void
}

export default function JobUpload({ onUploadSuccess }: JobUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validTypes = ["text/plain", "text/csv", "application/vnd.ms-excel"]
      const validExtensions = [".txt", ".csv"]
      const fileName = selectedFile.name.toLowerCase()
      
      if (
        validTypes.includes(selectedFile.type) ||
        validExtensions.some(ext => fileName.endsWith(ext))
      ) {
        setFile(selectedFile)
        setError("")
      } else {
        setError("请上传TXT或CSV格式的文件")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("请选择文件")
      return
    }

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/jobs/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "上传失败")
      }

      setFile(null)
      onUploadSuccess()
    } catch (err: any) {
      setError(err.message || "上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card-gradient rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">批量上传岗位</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-blue-200 mb-2">
            选择TXT或CSV文件
          </label>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>

        {file && (
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white text-sm">{file.name}</p>
            <p className="text-blue-200 text-xs mt-1">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <div className="bg-blue-500/20 rounded-lg p-3 text-sm text-blue-200">
          <p className="font-semibold mb-1">文件格式要求：</p>
          <p>公司 | 岗位 | 地点 | 投递链接</p>
          <p className="text-xs mt-2">支持竖线(|)或制表符分隔</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full btn-primary text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "上传中..." : "上传并解析"}
        </button>
      </div>
    </div>
  )
}

