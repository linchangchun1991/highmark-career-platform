"use client"

import { useEffect, useState } from "react"

interface JobPosting {
  id: string
  company: string
  position: string
  location: string
  link: string
  createdAt: string
}

export default function JobList() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchJobs()
  }, [page])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs?page=${page}&limit=20`)
      const data = await response.json()
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error("Failed to fetch jobs:", err)
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          岗位库 ({total} 条)
        </h2>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {jobs.length === 0 ? (
          <p className="text-blue-200 text-center py-8">暂无岗位数据</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {job.company} - {job.position}
                  </h3>
                  <p className="text-blue-200 text-sm mt-1">{job.location}</p>
                  <p className="text-blue-300 text-xs mt-2">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  查看 →
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-blue-200 px-4 py-2">
            第 {page} 页 / 共 {Math.ceil(total / 20)} 页
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  )
}

