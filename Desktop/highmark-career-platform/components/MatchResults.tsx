"use client"

import { useEffect, useState } from "react"

interface Match {
  id: string
  score: number
  reasoning: string
  jobPosting: {
    id: string
    company: string
    position: string
    location: string
    link: string
  }
}

interface MatchResultsProps {
  resumeId: string
}

export default function MatchResults({ resumeId }: MatchResultsProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [resumeId])

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/matches?resumeId=${resumeId}`)
      const data = await response.json()
      setMatches(data.matches || [])
    } catch (err) {
      console.error("Failed to fetch matches:", err)
    } finally {
      setLoading(false)
    }
  }

  const startMatching = async () => {
    setMatching(true)
    try {
      const response = await fetch(`/api/matches/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      })
      
      if (response.ok) {
        // 实时获取匹配结果
        await fetchMatches()
      }
    } catch (err) {
      console.error("Failed to start matching:", err)
    } finally {
      setMatching(false)
    }
  }

  if (loading) {
    return (
      <div className="card-gradient rounded-xl p-12 text-center">
        <p className="text-blue-200">加载中...</p>
      </div>
    )
  }

  return (
    <div className="card-gradient rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">匹配结果</h2>
        <button
          onClick={startMatching}
          disabled={matching}
          className="btn-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {matching ? "匹配中..." : "开始匹配"}
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {matches.length === 0 ? (
          <p className="text-blue-200 text-center py-8">
            暂无匹配结果，点击"开始匹配"按钮开始匹配
          </p>
        ) : (
          matches
            .sort((a, b) => b.score - a.score)
            .map((match) => (
              <div
                key={match.id}
                className="bg-white/10 rounded-lg p-4 border border-white/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-semibold">
                      {match.jobPosting.company} - {match.jobPosting.position}
                    </h3>
                    <p className="text-blue-200 text-sm mt-1">
                      {match.jobPosting.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {match.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-blue-200">匹配度</div>
                  </div>
                </div>

                <p className="text-blue-100 text-sm mt-3 mb-3">
                  {match.reasoning}
                </p>

                <a
                  href={match.jobPosting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  查看岗位详情 →
                </a>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

