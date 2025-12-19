-- ============================================
-- Supabase 数据库表创建脚本
-- ============================================
-- 使用方法：
-- 1. 登录 Supabase Dashboard
-- 2. 进入你的项目：ysscurevsdenbmsnixpc
-- 3. 点击左侧菜单 "SQL Editor"
-- 4. 点击 "New query"
-- 5. 复制粘贴下面的所有代码
-- 6. 点击 "Run" 执行
-- ============================================

-- 创建 jobs 表（如果不存在）
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  company TEXT NOT NULL,
  roles TEXT NOT NULL,
  location TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- 启用行级安全策略
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON jobs;
DROP POLICY IF EXISTS "Allow public insert" ON jobs;

-- 创建读取策略：允许所有人读取
CREATE POLICY "Allow public read access" ON jobs
  FOR SELECT USING (true);

-- 创建插入策略：允许所有人插入
CREATE POLICY "Allow public insert" ON jobs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 执行完成后，你应该看到：
-- "Success. No rows returned"
-- ============================================

