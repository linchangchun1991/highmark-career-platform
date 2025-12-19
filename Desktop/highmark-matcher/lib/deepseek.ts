import OpenAI from 'openai';
import { Job } from './supabase';

const deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
const deepseekBaseUrl = 'https://api.deepseek.com/v1';

export interface MatchResult {
  job: Job;
  score: number; // 0-100 ATS 评分
  reason: string; // 推荐理由
}

export interface MatchingResponse {
  results: MatchResult[];
  totalJobsAnalyzed: number;
}

// 初始化 DeepSeek 客户端（兼容 OpenAI SDK）
const deepseekClient = deepseekApiKey
  ? new OpenAI({
      apiKey: deepseekApiKey,
      baseURL: deepseekBaseUrl,
    })
  : null;

/**
 * 使用 DeepSeek API 进行人岗匹配
 * @param resume 学生简历文本
 * @param jobs 岗位列表（最新50-100个）
 * @returns 匹配结果
 */
export async function matchJobsWithResume(
  resume: string,
  jobs: Job[]
): Promise<MatchingResponse> {
  if (!deepseekClient) {
    throw new Error('DeepSeek API key is not configured');
  }

  // 限制岗位数量为100个
  const limitedJobs = jobs.slice(0, 100);

  // 构建岗位信息字符串
  const jobsText = limitedJobs
    .map((job, index) => {
      return `${index + 1}. 公司：${job.company} | 岗位：${job.roles} | 地点：${job.location} | 链接：${job.link}`;
    })
    .join('\n');

  const prompt = `你是一位专业的ATS（Applicant Tracking System）评分专家，擅长分析简历与岗位的匹配度。

## 学生简历：
${resume}

## 待匹配岗位列表（共${limitedJobs.length}个）：
${jobsText}

## 任务要求：
1. 对每个岗位进行ATS评分（0-100分），评分标准：
   - 90-100分：高度匹配，强烈推荐
   - 80-89分：良好匹配，推荐
   - 70-79分：中等匹配，可考虑
   - 60-69分：低匹配度
   - 0-59分：不匹配

2. 筛选出评分最高的5-10个岗位（优先选择80分以上的）

3. 为每个选中的岗位生成一句话推荐理由（20-30字），说明为什么匹配

## 输出格式（严格JSON）：
{
  "results": [
    {
      "jobIndex": 1,
      "score": 95,
      "reason": "你的数据分析能力与产品经理岗位高度匹配，且有相关实习经验"
    }
  ]
}

注意：
- jobIndex 对应岗位列表中的序号（从1开始）
- 只返回评分最高的5-10个岗位
- reason 必须是一句话，20-30字
- 确保返回的是有效的JSON格式`;

  try {
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的ATS评分专家，擅长分析简历与岗位的匹配度。请严格按照JSON格式输出结果。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // 尝试解析JSON响应
    let parsedResponse;
    try {
      // 清理可能的markdown代码块标记
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('AI返回格式错误，无法解析结果');
    }

    // 将结果映射回Job对象
    const results: MatchResult[] = parsedResponse.results
      .map((item: { jobIndex: number; score: number; reason: string }) => {
        const jobIndex = item.jobIndex - 1; // 转换为0-based索引
        if (jobIndex >= 0 && jobIndex < limitedJobs.length) {
          return {
            job: limitedJobs[jobIndex],
            score: Math.min(100, Math.max(0, item.score)), // 确保分数在0-100范围内
            reason: item.reason || '匹配度较高',
          };
        }
        return null;
      })
      .filter((item: MatchResult | null): item is MatchResult => item !== null)
      .sort((a: MatchResult, b: MatchResult) => b.score - a.score); // 按分数降序排列

    return {
      results,
      totalJobsAnalyzed: limitedJobs.length,
    };
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw new Error(`匹配失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

