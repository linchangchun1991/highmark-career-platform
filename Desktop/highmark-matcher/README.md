# 海马职加人岗匹配系统 (Highmark Matcher)

一个服务于留学生求职机构的高端内部效能工具，连接"岗位供给端（BD）"和"服务交付端（教练）"的智能匹配平台。

## ✨ 核心特性

- 🎯 **极简登录**：角色选择 + 访问码验证
- 🔧 **BD端岗位清洗引擎**：智能解析、链接清洗、批量入库
- 🤖 **AI匹配驾驶舱**：DeepSeek AI 驱动的智能人岗匹配
- 🎨 **极致体验**：Framer Motion 动画，对标 Linear/Vercel
- 📊 **结果导出**：微信话术复制、Excel 导出

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router) + TypeScript
- **样式库**: Tailwind CSS + Shadcn/UI
- **动画库**: Framer Motion
- **数据库**: Supabase (PostgreSQL)
- **AI 模型**: DeepSeek API (兼容 OpenAI SDK)
- **工具库**: xlsx, lucide-react

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的配置：

```bash
cp .env.example .env.local
```

需要配置的变量：
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名密钥
- `DEEPSEEK_API_KEY`: DeepSeek API 密钥

### 3. 创建 Supabase 数据库表

在 Supabase Dashboard 的 SQL Editor 中执行：

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

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用说明

### BD 端使用流程

1. 登录系统，选择"我是BD"角色
2. 输入访问码：`haima2025`
3. 在文本框中粘贴岗位数据，格式：
   ```
   公司名 | 职位1, 职位2 | 地点 | 链接
   ```
   示例：
   ```
   4399 | 产品类，技术类 | 广州 | https://mp.weixin.qq.com/s/xxxx
   ```
4. 点击"解析数据"，系统会自动：
   - 解析每行数据
   - 清洗链接（删除查询参数）
   - 标记格式错误的数据
5. 检查预览表格，确认无误后点击"确认入库"

### 教练端使用流程

1. 登录系统，选择"我是教练"角色
2. 输入访问码：`haima2025`
3. 粘贴学生简历内容
4. 点击"开始匹配"，系统将：
   - 初始化 AI 引擎
   - 解析简历画像
   - 比对岗位库
   - 返回匹配结果
5. 查看匹配结果卡片，可以：
   - 复制微信话术
   - 导出 Excel 文件
   - 重新匹配

## 🎨 设计规范

### 配色方案

- **主色（牛津深蓝）**: `#0F172A` - 代表专业与信赖
- **点缀色（香槟金）**: `#D97706` - 代表精英与 Offer
- **背景色（极简灰白）**: `#F8FAFC` - 高级纸张质感

### 字体

- **标题**: Playfair Display (衬线体) - 增加学术感
- **正文**: Inter (无衬线体) - 现代简洁

## 📁 项目结构

```
highmark-matcher/
├── app/
│   ├── api/
│   │   ├── jobs/route.ts      # 岗位 CRUD API
│   │   └── match/route.ts      # 匹配 API
│   ├── bd/
│   │   └── page.tsx            # BD 端页面
│   ├── coach/
│   │   └── page.tsx            # 教练端页面
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 登录页面
│   └── globals.css             # 全局样式
├── components/
│   ├── ui/                     # Shadcn/UI 组件
│   └── MatchingLoader.tsx      # 匹配加载动画组件
├── lib/
│   ├── deepseek.ts             # DeepSeek API 集成
│   ├── supabase.ts             # Supabase 客户端
│   └── utils.ts                # 工具函数
└── utils/
    └── jobParser.ts             # 岗位解析工具
```

## 🔐 安全说明

- 访问码目前硬编码为 `haima2025`，生产环境建议：
  - 使用环境变量
  - 实现真正的用户认证系统
  - 添加角色权限控制

## 🐛 故障排查

### Supabase 连接失败

- 检查环境变量是否正确配置
- 确认 Supabase 项目 URL 和密钥正确
- 检查网络连接

### DeepSeek API 调用失败

- 确认 API 密钥有效
- 检查 API 配额是否充足
- 查看控制台错误日志

### 岗位解析错误

- 确认数据格式正确（使用 `|` 分隔）
- 检查链接是否为有效 URL
- 查看错误提示信息

## 📝 开发计划

- [ ] 添加用户认证系统
- [ ] 实现岗位搜索和筛选
- [ ] 添加匹配历史记录
- [ ] 优化 AI 匹配算法
- [ ] 添加数据统计面板

## 📄 许可证

内部使用，版权所有。
