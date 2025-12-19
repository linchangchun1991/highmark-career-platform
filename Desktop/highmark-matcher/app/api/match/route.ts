import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { matchJobsWithResume } from '@/lib/deepseek';

// 执行人岗匹配
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: '请求体格式错误，请提供有效的JSON数据' },
        { status: 400 }
      );
    }

    const { resume } = body;
    
    if (!resume || typeof resume !== 'string' || resume.trim().length === 0) {
      return NextResponse.json(
        { error: '请提供有效的简历内容' },
        { status: 400 }
      );
    }

    // 检查 Supabase 配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('placeholder') || 
        supabaseKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'Supabase 未配置。请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY' },
        { status: 500 }
      );
    }

    // 获取最新100个岗位
    let jobs, jobsError;
    try {
      const result = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      jobs = result.data;
      jobsError = result.error;
    } catch (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json(
        { error: '数据库连接失败，请检查 Supabase 配置和网络连接' },
        { status: 500 }
      );
    }

    if (jobsError) {
      console.error('Supabase error:', jobsError);
      // 提供更友好的错误信息
      let errorMessage = `获取岗位数据失败: ${jobsError.message}`;
      if (jobsError.message.includes('relation') || jobsError.message.includes('does not exist')) {
        errorMessage = '数据库表不存在。请在 Supabase Dashboard 中执行 SQL 创建 jobs 表（参考 lib/supabase.ts 中的注释）';
      } else if (jobsError.message.includes('JWT') || jobsError.message.includes('auth')) {
        errorMessage = 'Supabase 认证失败，请检查 API Key 是否正确';
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        { error: '数据库中暂无岗位数据，请先通过 BD 端添加岗位' },
        { status: 400 }
      );
    }

    // 检查 DeepSeek 配置
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey || deepseekKey.includes('placeholder')) {
      return NextResponse.json(
        { error: 'DeepSeek API 未配置。请在 .env.local 中配置 DEEPSEEK_API_KEY' },
        { status: 500 }
      );
    }

    // 调用 DeepSeek API 进行匹配
    try {
      const matchResult = await matchJobsWithResume(resume, jobs);
      return NextResponse.json(matchResult);
    } catch (error) {
      console.error('DeepSeek API error:', error);
      let errorMessage = 'AI 匹配失败';
      if (error instanceof Error) {
        if (error.message.includes('API key') || error.message.includes('401')) {
          errorMessage = 'DeepSeek API Key 无效，请检查配置';
        } else if (error.message.includes('quota') || error.message.includes('429')) {
          errorMessage = 'DeepSeek API 配额已用完，请检查账户余额';
        } else {
          errorMessage = `AI 匹配失败: ${error.message}`;
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '匹配失败，请稍后重试' 
      },
      { status: 500 }
    );
  }
}

