# 环境变量配置指南

## 必需的环境变量

在项目根目录创建 `.env.local` 文件（此文件不会被提交到 Git），并配置以下变量：

### Supabase 配置

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在项目设置中找到以下信息：
   - **Project URL**: 在 Settings > API 中找到
   - **Anon Key**: 在 Settings > API 中找到（anon/public key）

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### DeepSeek API 配置

1. 访问 [DeepSeek](https://platform.deepseek.com) 并注册账号
2. 在控制台创建 API Key

```env
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

## 数据库表创建

在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL：

```sql
-- 创建 jobs 表
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  company TEXT NOT NULL,
  roles TEXT NOT NULL,
  location TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- 可选：启用 Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取和插入（根据你的安全需求调整）
CREATE POLICY "Allow public read access" ON jobs
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON jobs
  FOR INSERT WITH CHECK (true);
```

## 验证配置

配置完成后，重启开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000 测试系统是否正常工作。

