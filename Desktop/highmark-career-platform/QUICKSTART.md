# 快速启动指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

确保 `.env` 文件存在并包含：

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="highmark-career-secret-key-change-in-production"
OPENAI_API_KEY="your-openai-api-key"
```

## 3. 初始化数据库

```bash
# 运行数据库迁移
npx prisma migrate dev --name init

# 创建示例用户
npm run db:init
```

## 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 5. 登录

使用以下默认账号登录：

- **教练端**: `coach@highmark.com.cn` / `password123`
- **BD端**: `bd@highmark.com.cn` / `password123`

⚠️ **生产环境请务必修改默认密码！**

## 功能测试

### 教练端
1. 上传PDF简历
2. 等待自动解析（需要配置OPENAI_API_KEY）
3. 查看候选人画像
4. 点击"开始匹配"生成匹配结果

### BD端
1. 准备TXT或CSV格式的岗位文件
2. 格式：`公司 | 岗位 | 地点 | 投递链接`
3. 上传文件
4. 查看岗位库

## 注意事项

1. **OpenAI API**: 简历解析和岗位匹配需要配置 `OPENAI_API_KEY`
2. **文件上传**: 开发环境文件保存在 `uploads/` 目录
3. **数据库**: 使用SQLite，数据库文件为 `prisma/dev.db`
4. **生产部署**: 参考 `DEPLOY.md` 了解Vercel部署详情

## 常见问题

### Q: Prisma生成失败？
A: 确保已安装所有依赖，运行 `npm install`

### Q: 登录失败？
A: 确保已运行 `npm run db:init` 创建用户

### Q: 简历解析失败？
A: 检查 `OPENAI_API_KEY` 是否正确配置

### Q: 文件上传失败？
A: 确保 `uploads/` 目录有写入权限

