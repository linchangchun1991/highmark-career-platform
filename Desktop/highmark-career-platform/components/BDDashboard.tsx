"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Logo from "./Logo"
import JobUpload from "./JobUpload"
import JobList from "./JobList"

export default function BDDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="glass-effect rounded-xl p-6 mb-6 flex justify-between items-center">
        <div>
          <Logo size="md" />
          <p className="text-blue-200 mt-2">企业BD工作台</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition"
        >
          退出登录
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload */}
        <div className="lg:col-span-1">
          <JobUpload onUploadSuccess={() => setRefreshKey(k => k + 1)} />
        </div>

        {/* Right: Job List */}
        <div className="lg:col-span-2">
          <JobList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}

