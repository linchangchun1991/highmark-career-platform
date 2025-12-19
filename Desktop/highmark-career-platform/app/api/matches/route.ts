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
    const resumeId = searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    const matches = await prisma.match.findMany({
      where: { resumeId },
      include: {
        jobPosting: {
          select: {
            id: true,
            company: true,
            position: true,
            location: true,
            link: true,
          },
        },
      },
      orderBy: { score: "desc" },
    })

    return NextResponse.json({ matches })
  } catch (error: any) {
    console.error("Error fetching matches:", error)
    return NextResponse.json(
      { error: error.message || "获取匹配结果失败" },
      { status: 500 }
    )
  }
}

