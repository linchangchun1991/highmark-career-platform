import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parse } from "csv-parse/sync"
import { readFile } from "fs/promises"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "BD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const text = buffer.toString("utf-8")

    // 解析文件（支持TXT和CSV）
    const lines = text.split("\n").filter(line => line.trim())
    const jobs: any[] = []

    for (const line of lines) {
      // 跳过空行和标题行
      if (!line.trim() || line.includes("公司") || line.includes("岗位")) {
        continue
      }

      // 尝试用竖线分隔
      let parts = line.split(/[丨|]/).map(p => p.trim())
      
      // 如果竖线分隔失败，尝试制表符
      if (parts.length < 4) {
        parts = line.split(/\t/).map(p => p.trim())
      }

      // 如果还是失败，尝试逗号（CSV格式）
      if (parts.length < 4) {
        try {
          const csvRecords = parse(line, { delimiter: ",", quote: '"' })
          if (csvRecords[0] && csvRecords[0].length >= 4) {
            parts = csvRecords[0].map((p: string) => p.trim())
          }
        } catch {
          // 忽略CSV解析错误
        }
      }

      if (parts.length >= 4) {
        const [company, position, location, link] = parts
        
        // 验证链接格式
        if (link && (link.startsWith("http://") || link.startsWith("https://"))) {
          jobs.push({
            company: company || "",
            position: position || "",
            location: location || "",
            link: link || "",
          })
        }
      }
    }

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "未能解析出有效的岗位数据，请检查文件格式" },
        { status: 400 }
      )
    }

    // 批量保存到数据库
    const createdJobs = []
    for (const job of jobs) {
      try {
        const created = await prisma.jobPosting.create({
          data: {
            userId: session.user.id,
            company: job.company,
            position: job.position,
            location: job.location,
            link: job.link,
          },
        })
        createdJobs.push(created)
      } catch (error) {
        // 忽略重复或错误的数据
        console.error("Error creating job:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功上传 ${createdJobs.length} 条岗位数据`,
      count: createdJobs.length,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error.message || "上传失败" },
      { status: 500 }
    )
  }
}

