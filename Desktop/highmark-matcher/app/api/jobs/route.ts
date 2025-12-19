import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseJobs, ParsedJob } from '@/utils/jobParser';

// 批量创建岗位
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

    const { jobs } = body;
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { error: '请提供有效的岗位数据数组' },
        { status: 400 }
      );
    }

    // 只插入有效的岗位
    const validJobs = jobs.filter((job: ParsedJob) => job.isValid);
    
    if (validJobs.length === 0) {
      return NextResponse.json(
        { error: '没有有效的岗位数据可插入' },
        { status: 400 }
      );
    }

    // 准备插入数据
    const insertData = validJobs.map(job => ({
      raw_text: job.rawText,
      company: job.company,
      roles: job.roles,
      location: job.location,
      link: job.link,
    }));

    // 批量插入
    const { data, error } = await supabase
      .from('jobs')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `数据库错误: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: data?.length || 0,
      total: validJobs.length,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 获取最新岗位（用于匹配）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `数据库错误: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

