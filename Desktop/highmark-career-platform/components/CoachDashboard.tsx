"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Logo from "./Logo"
import ResumeUpload from "./ResumeUpload"
import ResumeList from "./ResumeList"
import MatchResults from "./MatchResults"

export default function CoachDashboard() {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="glass-effect rounded-xl p-6 mb-6 flex justify-between items-center">
        <div>
          <Logo size="md" />
          <p className="text-blue-200 mt-2">求职教练工作台</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition"
        >
          退出登录
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload & Resume List */}
        <div className="lg:col-span-1 space-y-6">
          <ResumeUpload onUploadSuccess={() => window.location.reload()} />
          <ResumeList 
            onSelectResume={setSelectedResumeId}
            selectedResumeId={selectedResumeId}
          />
        </div>

        {/* Right: Match Results */}
        <div className="lg:col-span-2">
          {selectedResumeId ? (
            <MatchResults resumeId={selectedResumeId} />
          ) : (
            <div className="card-gradient rounded-xl p-12 text-center">
              <p className="text-blue-200 text-lg">
                请选择一个简历查看匹配结果
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

