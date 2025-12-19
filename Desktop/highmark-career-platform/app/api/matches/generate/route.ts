import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "COACH") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeId } = await request.json()
    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID required" }, { status: 400 })
    }

    // 获取简历信息
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    })

    if (!resume || !resume.candidateProfile) {
      return NextResponse.json(
        { error: "简历未解析，请先解析简历" },
        { status: 400 }
      )
    }

    const candidateProfile = JSON.parse(resume.candidateProfile)
    const keywords = resume.keywords ? JSON.parse(resume.keywords) : []

    // 获取所有岗位（分批处理，避免一次性加载太多）
    const allJobs = await prisma.jobPosting.findMany({
      select: {
        id: true,
        company: true,
        position: true,
        location: true,
        link: true,
        description: true,
      },
    })

    if (allJobs.length === 0) {
      return NextResponse.json(
        { error: "岗位库为空，请先上传岗位" },
        { status: 400 }
      )
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // 专家级匹配Prompt
    const expertMatchingPrompt = `你是一个专业的职业匹配专家，需要根据候选人画像和岗位信息进行精准匹配。

匹配规则：
1. 已毕业的候选人不能匹配实习类岗位（包含"实习"、"实习生"等关键词）
2. 在读学生优先匹配实习类岗位
3. 考虑教育背景、技能、经验、地点偏好等因素
4. 岗位要求必须与候选人能力匹配
5. 行业偏好要一致

候选人画像：
${JSON.stringify(candidateProfile, null, 2)}

候选人关键词：
${keywords.join(", ")}

请对以下岗位进行匹配评分（0-100分），并给出推荐理由。返回JSON数组格式：
[
  {
    "jobId": "岗位ID",
    "score": 85,
    "reasoning": "详细推荐理由，说明为什么匹配"
  }
]

岗位列表：
${JSON.stringify(allJobs.slice(0, 100), null, 2)}

注意：只返回匹配度≥60分的岗位，至少返回20个匹配结果。`

    // 调用AI进行匹配
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
            content: "你是一个专业的职业匹配专家，能够准确评估候选人与岗位的匹配度。",
          },
          {
            role: "user",
            content: expertMatchingPrompt,
          },
        ],
        temperature: 0.3,
      }),
    })

    const aiData = await response.json()
    const matchContent = aiData.choices[0]?.message?.content || "[]"
    
    let matches
    try {
      matches = JSON.parse(matchContent)
      if (!Array.isArray(matches)) {
        matches = []
      }
    } catch {
      matches = []
    }

    // 如果AI返回的匹配结果少于20个，继续处理更多岗位
    if (matches.length < 20 && allJobs.length > 100) {
      // 分批处理剩余岗位
      for (let i = 100; i < allJobs.length && matches.length < 20; i += 100) {
        const batch = allJobs.slice(i, i + 100)
        const batchPrompt = `继续匹配以下岗位，只返回匹配度≥60分的结果：

${JSON.stringify(batch, null, 2)}`

        const batchResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
                content: "你是一个专业的职业匹配专家。",
              },
              {
                role: "user",
                content: batchPrompt,
              },
            ],
            temperature: 0.3,
          }),
        })

        const batchData = await batchResponse.json()
        const batchContent = batchData.choices[0]?.message?.content || "[]"
        try {
          const batchMatches = JSON.parse(batchContent)
          if (Array.isArray(batchMatches)) {
            matches.push(...batchMatches)
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    // 确保至少有20个匹配结果
    if (matches.length < 20) {
      // 如果AI返回的结果不足，使用简单的关键词匹配补充
      const remainingJobs = allJobs
        .filter(job => !matches.some((m: any) => m.jobId === job.id))
        .slice(0, 20 - matches.length)

      for (const job of remainingJobs) {
        const positionLower = job.position.toLowerCase()
        const hasInternKeyword = positionLower.includes("实习") || positionLower.includes("实习生")
        const isGraduated = candidateProfile.graduationStatus === "已毕业"

        // 已毕业不能投实习
        if (isGraduated && hasInternKeyword) {
          continue
        }

        // 简单评分
        let score = 60
        if (keywords.some((kw: string) => positionLower.includes(kw.toLowerCase()))) {
          score = 70
        }

        matches.push({
          jobId: job.id,
          score,
          reasoning: "基于关键词匹配的推荐",
        })
      }
    }

    // 保存匹配结果到数据库
    const createdMatches = []
    for (const match of matches.slice(0, 50)) { // 最多保存50个匹配结果
      try {
        const created = await prisma.match.upsert({
          where: {
            resumeId_jobPostingId: {
              resumeId,
              jobPostingId: match.jobId,
            },
          },
          update: {
            score: match.score,
            reasoning: match.reasoning,
          },
          create: {
            resumeId,
            jobPostingId: match.jobId,
            score: match.score,
            reasoning: match.reasoning,
            userId: session.user.id,
          },
        })
        createdMatches.push(created)
      } catch (error) {
        console.error("Error creating match:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功生成 ${createdMatches.length} 个匹配结果`,
      count: createdMatches.length,
    })
  } catch (error: any) {
    console.error("Match generation error:", error)
    return NextResponse.json(
      { error: error.message || "匹配失败" },
      { status: 500 }
    )
  }
}

