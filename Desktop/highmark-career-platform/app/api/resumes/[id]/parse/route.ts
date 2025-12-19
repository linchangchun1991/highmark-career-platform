import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"
import pdfParse from "pdf-parse"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resumeId = params.id
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // 读取PDF文件
    const filePath = join(process.cwd(), resume.fileUrl)
    const fileBuffer = await readFile(filePath)
    const pdfData = await pdfParse(fileBuffer)
    const text = pdfData.text

    // 使用AI解析简历
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    const parsePrompt = `请分析以下简历内容，提取关键信息并生成候选人画像。返回JSON格式：
{
  "keywords": ["关键词1", "关键词2", ...],
  "profile": {
    "name": "姓名",
    "education": "教育背景",
    "experience": "工作经验",
    "skills": ["技能1", "技能2", ...],
    "graduationStatus": "已毕业/在读/应届",
    "location": "期望地点",
    "industry": "行业偏好"
  },
  "summary": "候选人画像总结"
}

简历内容：
${text.substring(0, 3000)}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "你是一个专业的简历解析专家，能够准确提取简历中的关键信息。",
          },
          {
            role: "user",
            content: parsePrompt,
          },
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await response.json()
    const parsedContent = aiData.choices[0]?.message?.content || "{}"
    
    let parsedData
    try {
      parsedData = JSON.parse(parsedContent)
    } catch {
      parsedData = { keywords: [], profile: {}, summary: "" }
    }

    // 更新数据库
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        originalText: text,
        parsedData: JSON.stringify(parsedData),
        candidateProfile: JSON.stringify(parsedData.profile),
        keywords: JSON.stringify(parsedData.keywords || []),
      },
    })

    return NextResponse.json({
      success: true,
      message: "简历解析成功",
      data: parsedData,
    })
  } catch (error: any) {
    console.error("Parse error:", error)
    return NextResponse.json(
      { error: error.message || "解析失败" },
      { status: 500 }
    )
  }
}

