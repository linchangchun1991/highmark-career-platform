# 快速启动指南

## 5 分钟快速部署

### 步骤 1: 安装依赖（已完成）

```bash
cd highmark-matcher
npm install
```

### 步骤 2: 配置 Supabase

1. 访问 https://supabase.com 注册/登录
2. 创建新项目（选择免费计划即可）
3. 等待项目初始化完成（约 2 分钟）
4. 在项目 Dashboard 中：
   - 进入 **Settings** > **API**
   - 复制 **Project URL** 和 **anon public** key

### 步骤 3: 创建数据库表

在 Supabase Dashboard 中：
1. 点击左侧 **SQL Editor**
2. 点击 **New query**
3. 粘贴以下 SQL 并执行：

```sql
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
```

### 步骤 4: 配置 DeepSeek API

1. 访问 https://platform.deepseek.com 注册/登录
2. 在控制台创建 API Key
3. 复制 API Key

### 步骤 5: 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# 复制示例文件
cp .env.example .env.local
```

编辑 `.env.local`，填入你的配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DEEPSEEK_API_KEY=sk-xxxxx
```

### 步骤 6: 启动项目

```bash
npm run dev
```

访问 http://localhost:3000

### 步骤 7: 测试系统

#### 测试 BD 端：
1. 选择"我是BD"
2. 输入访问码：`haima2025`
3. 粘贴测试数据：
   ```
   4399 | 产品经理, 技术开发 | 广州 | https://mp.weixin.qq.com/s/test?wxwork_userid=123
   腾讯 | 产品类, 运营类 | 深圳 | https://careers.tencent.com/position?id=123&source=wechat
   ```
4. 点击"解析数据"，确认链接被清洗（`?` 后面的参数被删除）
5. 点击"确认入库"

#### 测试教练端：
1. 选择"我是教练"
2. 输入访问码：`haima2025`
3. 粘贴测试简历：
   ```
   姓名：张三
   学历：本科
   专业：计算机科学
   技能：Python, 数据分析, 产品设计
   实习经历：在XX公司担任产品实习生，负责数据分析工作
   ```
4. 点击"开始匹配"
5. 观察加载动画（3-5秒）
6. 查看匹配结果
7. 测试"复制微信话术"和"导出Excel"功能

## 常见问题

### Q: Supabase 连接失败？
A: 检查环境变量是否正确，确保 URL 和 Key 没有多余空格

### Q: DeepSeek API 调用失败？
A: 确认 API Key 有效，检查账户余额

### Q: 岗位解析失败？
A: 确认数据格式正确，使用 `|` 分隔四个字段

### Q: 匹配结果为空？
A: 确保数据库中已有岗位数据，先通过 BD 端添加岗位

## 下一步

- 修改访问码（在 `app/page.tsx` 中）
- 自定义配色方案（在 `app/globals.css` 中）
- 调整 AI 匹配逻辑（在 `lib/deepseek.ts` 中）

