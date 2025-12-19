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

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        createdAt: true,
        candidateProfile: true,
      },
    })

    return NextResponse.json({ resumes })
  } catch (error: any) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json(
      { error: error.message || "获取简历列表失败" },
      { status: 500 }
    )
  }
}

