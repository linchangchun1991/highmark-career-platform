"use client"

import { useEffect, useState } from "react"

interface Resume {
  id: string
  fileName: string
  createdAt: string
  candidateProfile: string | null
}

interface ResumeListProps {
  onSelectResume: (id: string) => void
  selectedResumeId: string | null
}

export default function ResumeList({ onSelectResume, selectedResumeId }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes")
      const data = await response.json()
      setResumes(data.resumes || [])
    } catch (err) {
      console.error("Failed to fetch resumes:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card-gradient rounded-xl p-6">
        <p className="text-blue-200">加载中...</p>
      </div>
    )
  }

  return (
    <div className="card-gradient rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">简历列表</h2>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {resumes.length === 0 ? (
          <p className="text-blue-200 text-sm">暂无简历</p>
        ) : (
          resumes.map((resume) => (
            <button
              key={resume.id}
              onClick={() => onSelectResume(resume.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedResumeId === resume.id
                  ? "bg-blue-500/30 border-2 border-blue-400"
                  : "bg-white/10 hover:bg-white/20 border border-white/10"
              }`}
            >
              <p className="text-white font-medium text-sm">{resume.fileName}</p>
              <p className="text-blue-200 text-xs mt-1">
                {new Date(resume.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

