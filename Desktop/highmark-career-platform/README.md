# HIGHMARK CAREER - 海马职加智能求职匹配平台

一个基于Next.js的智能求职匹配平台，支持求职教练和企业BD双端登录，实现精准的人岗匹配。

## 功能特性

### 1. 双端登录系统
- 支持求职教练（COACH）和企业BD（BD）两种角色
- 必须使用 `@highmark.com.cn` 后缀的邮箱登录
- 安全的密码认证系统

### 2. 教练端功能
- **一键上传简历**：支持PDF格式简历上传
- **ATS智能解析**：自动提取简历关键词、教育背景、工作经验等
- **候选人画像**：生成详细的候选人画像
- **自动匹配岗位**：智能匹配至少20个精准岗位
- **匹配评分**：每个匹配结果都有0-100分的评分
- **推荐理由**：详细的匹配理由说明

### 3. 企业BD端功能
- **批量上传岗位**：支持TXT和CSV格式
- **自动解析字段**：自动解析公司、岗位、地点、投递链接
- **岗位库管理**：查看和管理所有上传的岗位

### 4. 智能匹配系统
- **专家级匹配逻辑**：
  - 已毕业候选人不能匹配实习类岗位
  - 在读学生优先匹配实习类岗位
  - 考虑教育背景、技能、经验、地点偏好
  - 行业偏好匹配
- **实时匹配**：边生成推荐岗位边继续筛选
- **至少20个匹配**：确保每个简历至少匹配20个精准岗位

### 5. UI设计
- 深蓝渐变风格，符合硅谷科技大厂设计
- 常青藤学员风格，专业优雅
- HIGHMARK CAREER品牌Logo
- 响应式设计，支持移动端

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **数据库**: SQLite (Prisma ORM)
- **认证**: NextAuth.js v5
- **样式**: Tailwind CSS
- **AI服务**: OpenAI API (GPT-4o-mini)
- **文件处理**: pdf-parse, csv-parse

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. 初始化数据库

```bash
# 生成Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 创建初始用户（通过API）
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@highmark.com.cn",
    "password": "password123",
    "name": "示例教练",
    "role": "COACH"
  }'

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bd@highmark.com.cn",
    "password": "password123",
    "name": "示例BD",
    "role": "BD"
  }'
```

或者启动服务器后，在浏览器中访问注册API端点。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 默认登录账号

- **教练端**: `coach@highmark.com.cn` / `password123`
- **BD端**: `bd@highmark.com.cn` / `password123`

⚠️ **生产环境请务必修改默认密码！**

## 岗位文件格式

支持TXT和CSV格式，字段用竖线(`|`)或制表符分隔：

```
公司 | 岗位 | 地点 | 投递链接
4399 | 产品类，技术类 | 广州 | https://example.com/job/1
```

或CSV格式：
```csv
公司,岗位,地点,投递链接
4399,"产品类，技术类",广州,https://example.com/job/1
```

## 部署到Vercel

### 1. 准备部署

1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目

### 2. 配置环境变量

在Vercel项目设置中添加以下环境变量：

- `DATABASE_URL`: 使用Vercel Postgres或其他数据库服务
- `NEXTAUTH_URL`: 您的Vercel部署URL
- `NEXTAUTH_SECRET`: 随机生成的密钥
- `OPENAI_API_KEY`: OpenAI API密钥

### 3. 数据库迁移

在Vercel部署后，运行数据库迁移：

```bash
npx prisma migrate deploy
```

### 4. 文件存储

⚠️ **注意**: Vercel是无服务器环境，文件上传需要使用外部存储服务（如AWS S3、Cloudinary等）。当前版本将文件保存到本地，在生产环境中需要修改。

## 项目结构

```
highmark-career-platform/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── auth/         # 认证相关
│   │   ├── resumes/      # 简历相关
│   │   ├── jobs/         # 岗位相关
│   │   └── matches/      # 匹配相关
│   ├── dashboard/        # 工作台页面
│   ├── login/            # 登录页面
│   └── layout.tsx        # 根布局
├── components/            # React组件
│   ├── CoachDashboard.tsx
│   ├── BDDashboard.tsx
│   ├── ResumeUpload.tsx
│   ├── ResumeList.tsx
│   ├── MatchResults.tsx
│   ├── JobUpload.tsx
│   └── JobList.tsx
├── lib/                   # 工具库
│   ├── prisma.ts         # Prisma客户端
│   └── auth.ts           # NextAuth配置
├── prisma/                # 数据库Schema
│   └── schema.prisma
├── scripts/               # 脚本文件
│   └── init-db.ts        # 数据库初始化
└── public/               # 静态资源
```

## 开发说明

### 添加新用户

可以通过API注册新用户：

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@highmark.com.cn",
    "password": "password123",
    "name": "新用户",
    "role": "COACH"
  }'
```

### 匹配算法

匹配系统使用OpenAI GPT-4o-mini进行智能匹配，包含以下逻辑：

1. **毕业状态检查**：已毕业不能投递实习岗位
2. **关键词匹配**：简历关键词与岗位要求匹配
3. **教育背景匹配**：教育水平与岗位要求匹配
4. **技能匹配**：技能与岗位要求匹配
5. **地点偏好**：考虑候选人的地点偏好
6. **行业匹配**：行业偏好一致性

## 许可证

MIT License

## 联系方式

如有问题，请联系开发团队。

---

**HIGHMARK CAREER** - 海马职加 | 智能求职匹配平台
