import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// 创建客户端（即使没有配置也不会报错，但 API 调用会失败）
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// 数据库表类型定义
export interface Job {
  id: string;
  raw_text: string;
  company: string;
  roles: string;
  location: string;
  link: string;
  created_at: string;
}

// 创建 jobs 表的 SQL（需要在 Supabase Dashboard 中执行）
/*
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  company TEXT NOT NULL,
  roles TEXT NOT NULL,
  location TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
*/

