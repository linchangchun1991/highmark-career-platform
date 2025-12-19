import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          company: true,
          position: true,
          location: true,
          link: true,
          createdAt: true,
        },
      }),
      prisma.jobPosting.count(),
    ])

    return NextResponse.json({ jobs, total })
  } catch (error: any) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: error.message || "获取岗位列表失败" },
      { status: 500 }
    )
  }
}

