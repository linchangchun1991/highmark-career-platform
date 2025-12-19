"use client"

import { useState } from "react"

interface ResumeUploadProps {
  onUploadSuccess: () => void
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setError("")
      } else {
        setError("请上传PDF格式的简历")
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

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "上传失败")
      }

      // 触发解析和匹配
      await fetch(`/api/resumes/${data.resumeId}/parse`, {
        method: "POST",
      })

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
      <h2 className="text-xl font-semibold text-white mb-4">上传学员简历</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-blue-200 mb-2">
            选择PDF简历文件
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>

        {file && (
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-white text-sm">{file.name}</p>
            <p className="text-blue-200 text-xs mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

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
          {uploading ? "上传中..." : "一键上传并解析"}
        </button>
      </div>
    </div>
  )
}

