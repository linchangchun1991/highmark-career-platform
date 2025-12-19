import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import CoachDashboard from "@/components/CoachDashboard"
import BDDashboard from "@/components/BDDashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  return (
    <div className="min-h-screen">
      {role === "COACH" ? <CoachDashboard /> : <BDDashboard />}
    </div>
  )
}

