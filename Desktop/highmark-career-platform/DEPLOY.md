# Vercel 部署指南

## 前置准备

1. 确保代码已推送到GitHub仓库
2. 在Vercel注册账号并连接GitHub

## 部署步骤

### 1. 在Vercel中导入项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 选择您的GitHub仓库
4. 配置项目设置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (默认)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (默认)

### 2. 配置环境变量

在Vercel项目设置中添加以下环境变量：

#### 必需的环境变量

```
DATABASE_URL=your-database-url
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
OPENAI_API_KEY=your-openai-api-key
```

#### 数据库选项

**选项1: Vercel Postgres (推荐)**
- 在Vercel项目设置中创建Postgres数据库
- 自动获取 `DATABASE_URL`

**选项2: 外部数据库**
- 使用PlanetScale、Supabase或其他PostgreSQL服务
- 手动配置 `DATABASE_URL`

### 3. 修改数据库配置

如果使用PostgreSQL（非SQLite），需要修改 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // 改为 postgresql
  url      = env("DATABASE_URL")
}
```

然后重新生成Prisma Client：
```bash
npx prisma generate
```

### 4. 运行数据库迁移

在Vercel部署后，通过Vercel CLI或直接在部署日志中运行：

```bash
npx prisma migrate deploy
```

或者添加一个构建后脚本：

在 `package.json` 中添加：
```json
{
  "scripts": {
    "postbuild": "prisma migrate deploy"
  }
}
```

### 5. 文件存储配置

⚠️ **重要**: Vercel是无服务器环境，本地文件系统是只读的。需要修改文件上传逻辑使用外部存储：

**推荐方案**:
- AWS S3
- Cloudinary
- Vercel Blob Storage

修改 `app/api/resumes/upload/route.ts` 和 `app/api/jobs/upload/route.ts` 使用外部存储服务。

### 6. 初始化数据库

部署后，通过Vercel CLI或API调用初始化脚本：

```bash
vercel env pull .env.local
npx tsx scripts/init-db.ts
```

或通过API创建初始用户：
```bash
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@highmark.com.cn",
    "password": "your-secure-password",
    "name": "管理员",
    "role": "COACH"
  }'
```

## 部署后检查清单

- [ ] 环境变量已正确配置
- [ ] 数据库连接正常
- [ ] 数据库迁移已运行
- [ ] 文件上传功能已配置外部存储
- [ ] 初始用户已创建
- [ ] 登录功能正常
- [ ] 简历上传和解析功能正常
- [ ] 岗位上传功能正常
- [ ] 匹配功能正常

## 常见问题

### 问题1: 数据库连接失败

**解决方案**:
- 检查 `DATABASE_URL` 格式是否正确
- 确认数据库服务已启动
- 检查网络连接和防火墙设置

### 问题2: 文件上传失败

**解决方案**:
- Vercel不支持本地文件写入
- 必须使用外部存储服务（S3、Cloudinary等）
- 修改上传逻辑使用外部存储API

### 问题3: Prisma Client错误

**解决方案**:
```bash
npx prisma generate
npm run build
```

### 问题4: NextAuth错误

**解决方案**:
- 确保 `NEXTAUTH_URL` 与部署URL一致
- 确保 `NEXTAUTH_SECRET` 已设置
- 检查回调URL配置

## 生产环境优化建议

1. **使用PostgreSQL**: 生产环境建议使用PostgreSQL而非SQLite
2. **CDN配置**: 配置CDN加速静态资源
3. **监控**: 集成Sentry等错误监控服务
4. **日志**: 配置日志收集和分析
5. **备份**: 定期备份数据库
6. **安全**: 
   - 使用强密码
   - 启用HTTPS
   - 配置CORS策略
   - 限制API访问频率

## 支持

如有部署问题，请查看：
- [Vercel文档](https://vercel.com/docs)
- [Next.js部署文档](https://nextjs.org/docs/deployment)
- [Prisma部署指南](https://www.prisma.io/docs/guides/deployment)

