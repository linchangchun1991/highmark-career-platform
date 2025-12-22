# Vercel 部署指南

## 快速部署步骤

### 方法一：使用 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /Users/changchun/产品查询系统
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

### 方法二：通过 Vercel 网站

1. **访问 Vercel 网站**
   - 打开 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 Git 仓库（如果已连接）
   - 或者直接拖拽项目文件夹

3. **配置项目**
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (留空)
   - Output Directory: ./

4. **环境变量**（如果需要）
   - 在项目设置中添加环境变量

5. **部署**
   - 点击 "Deploy"

## 部署后的访问地址

部署成功后，你会获得：
- 生产环境地址：`https://your-project.vercel.app`
- 预览地址：`https://your-project-git-branch.vercel.app`

## 重要文件说明

- `product-price-query.html` - 主应用文件
- `products_with_policies.json` - 产品数据文件
- `vercel.json` - Vercel 配置文件
- `.vercelignore` - 忽略文件列表

## 更新数据

如果需要更新产品数据：

1. **更新 JSON 文件**
   ```bash
   python3 rebuild_product_data_v2.py
   ```

2. **提交并推送**
   ```bash
   git add products_with_policies.json
   git commit -m "更新产品数据"
   git push
   ```

3. **Vercel 会自动重新部署**

## 自定义域名

1. 在 Vercel 项目设置中
2. 点击 "Domains"
3. 添加你的自定义域名
4. 按照提示配置 DNS

## 故障排除

### 问题：JSON 文件无法访问
- 检查 `vercel.json` 中的路由配置
- 确保文件路径正确

### 问题：页面显示空白
- 检查浏览器控制台错误
- 确认 JSON 文件路径正确
- 检查 CORS 设置

### 问题：样式丢失
- 确认 HTML 文件中的 CSS 已内联
- 检查文件编码为 UTF-8

## 性能优化建议

1. **启用缓存**
   - JSON 文件已配置缓存头
   - 静态资源会自动缓存

2. **CDN 加速**
   - Vercel 自动提供全球 CDN
   - 无需额外配置

3. **压缩**
   - Vercel 自动压缩静态资源
   - 包括 HTML、CSS、JS

## 联系支持

如有问题，请查看：
- Vercel 文档：https://vercel.com/docs
- 项目 README：PRODUCT_PRICE_QUERY_README.md

