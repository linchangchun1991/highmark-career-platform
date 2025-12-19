# Vercel 部署完整指南

## 📋 部署前准备

### 1. 将代码推送到GitHub

```bash
cd /Users/changchun/Desktop/highmark-career-platform

# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Highmark Career Platform"

# 在GitHub上创建新仓库，然后推送
git remote add origin https://github.com/your-username/highmark-career-platform.git
git branch -M main
git push -u origin main
```

### 2. 准备环境变量

在部署前，准备好以下信息：
- OpenAI API Key
- 数据库连接字符串（如果使用外部数据库）
- 一个随机生成的密钥（用于NEXTAUTH_SECRET）

生成随机密钥：
```bash
openssl rand -base64 32
```

## 🚀 部署步骤

### 步骤1: 在Vercel创建项目

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 **"Add New Project"** 或 **"New Project"**
4. 选择你的GitHub仓库 `highmark-career-platform`
5. Vercel会自动检测到Next.js项目

### 步骤2: 配置项目设置

在项目配置页面：

- **Framework Preset**: Next.js（自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `npm run build`（默认）
- **Output Directory**: `.next`（默认）
- **Install Command**: `npm install`（默认）

**⚠️ 重要**: 不要点击 "Deploy" 按钮，先配置环境变量！

### 步骤3: 配置环境变量

在项目设置页面，点击 **"Environment Variables"**，添加以下变量：

#### 必需的环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 见下方说明 | 数据库连接字符串 |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | 部署后的URL（部署后会自动更新） |
| `NEXTAUTH_SECRET` | 随机生成的32位字符串 | 使用 `openssl rand -base64 32` 生成 |
| `OPENAI_API_KEY` | `sk-...` | 你的OpenAI API密钥 |

#### 数据库配置选项

**选项A: 使用Vercel Postgres（推荐，最简单）**

1. 在Vercel项目页面，点击 **"Storage"** 标签
2. 点击 **"Create Database"**
3. 选择 **"Postgres"**
4. 创建数据库后，Vercel会自动添加 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`
5. 使用 `POSTGRES_PRISMA_URL` 作为 `DATABASE_URL`

**选项B: 使用外部PostgreSQL数据库**

- **Supabase** (免费): https://supabase.com
- **Neon** (免费): https://neon.tech
- **PlanetScale** (免费): https://planetscale.com

获取连接字符串后，设置为 `DATABASE_URL`

### 步骤4: 修改数据库配置（如果使用PostgreSQL）

如果使用PostgreSQL（非SQLite），需要修改 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
}
```

然后提交更改：
```bash
git add prisma/schema.prisma
git commit -m "Update to PostgreSQL"
git push
```

### 步骤5: 添加构建脚本

在 `package.json` 中添加构建后脚本以运行数据库迁移：

```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

### 步骤6: 部署项目

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（通常需要2-5分钟）
3. 构建完成后，Vercel会提供一个URL，例如：`https://highmark-career-platform.vercel.app`

### 步骤7: 运行数据库迁移

部署完成后，需要运行数据库迁移：

**方法1: 使用Vercel CLI（推荐）**

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
cd /Users/changchun/Desktop/highmark-career-platform
vercel link

# 拉取环境变量
vercel env pull .env.local

# 运行迁移
npx prisma migrate deploy
```

**方法2: 在Vercel Dashboard中运行**

1. 进入项目设置
2. 点击 "Functions" 标签
3. 创建一个新的Serverless Function来运行迁移

**方法3: 使用Vercel的构建命令**

在 `package.json` 中已经添加了 `postbuild` 脚本，迁移会在每次部署时自动运行。

### 步骤8: 创建初始用户

部署完成后，通过API创建初始用户：

```bash
# 创建教练账号
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@highmark.com.cn",
    "password": "your-secure-password",
    "name": "管理员",
    "role": "COACH"
  }'

# 创建BD账号
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bd@highmark.com.cn",
    "password": "your-secure-password",
    "name": "BD管理员",
    "role": "BD"
  }'
```

或者使用Postman、Insomnia等工具发送POST请求。

## 🔧 重要配置说明

### 文件存储问题

⚠️ **Vercel是无服务器环境，不支持本地文件存储！**

当前版本的文件上传功能在Vercel上无法正常工作。需要修改为使用外部存储：

**推荐方案：Vercel Blob Storage**

1. 在Vercel项目页面，点击 **"Storage"** 标签
2. 创建 **"Blob"** 存储
3. 安装依赖：`npm install @vercel/blob`
4. 修改上传逻辑使用Vercel Blob

或者使用：
- AWS S3
- Cloudinary
- Supabase Storage

### Prisma配置

确保 `prisma.config.ts` 文件存在且配置正确：

```typescript
import { defineConfig } from "prisma/config"
import "dotenv/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

## ✅ 部署后检查清单

- [ ] 项目成功部署，可以访问
- [ ] 环境变量已正确配置
- [ ] 数据库连接正常（检查Vercel日志）
- [ ] 数据库迁移已运行
- [ ] 可以访问登录页面
- [ ] 可以注册新用户
- [ ] 可以登录
- [ ] 文件上传功能（需要配置外部存储）

## 🐛 常见问题排查

### 问题1: 构建失败 - Prisma错误

**错误**: `Cannot find module '.prisma/client'`

**解决方案**:
1. 确保 `prisma generate` 在构建时运行
2. 在 `package.json` 的 `build` 脚本中添加：
   ```json
   {
     "scripts": {
       "build": "prisma generate && next build"
     }
   }
   ```

### 问题2: 数据库连接失败

**解决方案**:
1. 检查 `DATABASE_URL` 格式是否正确
2. 确保数据库服务正在运行
3. 检查数据库防火墙设置（允许Vercel IP访问）

### 问题3: NextAuth错误

**错误**: `NEXTAUTH_URL is not set`

**解决方案**:
1. 确保 `NEXTAUTH_URL` 设置为完整的部署URL
2. 确保 `NEXTAUTH_SECRET` 已设置
3. 重新部署项目

### 问题4: 文件上传失败

**错误**: `ENOENT: no such file or directory`

**解决方案**:
- Vercel不支持本地文件系统写入
- 必须使用外部存储服务（见上方"文件存储问题"）

## 📝 后续优化

1. **配置自定义域名**
   - 在Vercel项目设置中添加自定义域名
   - 更新 `NEXTAUTH_URL` 环境变量

2. **设置环境变量**
   - Production: 生产环境变量
   - Preview: 预览环境变量
   - Development: 开发环境变量

3. **配置CI/CD**
   - 每次推送到main分支自动部署
   - 创建Pull Request时自动创建预览部署

4. **监控和日志**
   - 查看Vercel的实时日志
   - 集成错误监控服务（Sentry）

## 🎉 完成！

部署完成后，你的应用就可以通过Vercel提供的URL访问了！

如有问题，请查看：
- [Vercel文档](https://vercel.com/docs)
- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [Prisma部署指南](https://www.prisma.io/docs/guides/deployment)

