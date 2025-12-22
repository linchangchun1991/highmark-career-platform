# 🚀 GitHub Pages 部署指南

## 快速部署步骤

### 方法一：自动部署（推荐）

1. **在 GitHub 仓库中启用 GitHub Pages**
   - 访问：https://github.com/linchangchun1991/highmark-career-platform/settings/pages
   - 或者：仓库 → Settings → Pages
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 `main`
   - Folder: 选择 `/海马职加人岗匹配系统` (如果文件在子目录) 或 `/ (root)`
   - 点击 "Save"

2. **等待部署完成**（约1-2分钟）

3. **访问地址**
   - `https://linchangchun1991.github.io/highmark-career-platform/`
   - 或者自定义域名

### 方法二：使用 GitHub Actions 自动部署

已创建 `.github/workflows/deploy.yml`，会自动部署。

## 其他部署平台选项

### 1. Netlify（推荐）
- 访问：https://app.netlify.com
- 点击 "Add new site" → "Import an existing project"
- 连接 GitHub 仓库
- Build command: (留空)
- Publish directory: `海马职加人岗匹配系统` 或 `.`
- 点击 "Deploy site"

### 2. Cloudflare Pages
- 访问：https://pages.cloudflare.com
- 点击 "Create a project"
- 连接 GitHub 仓库
- Framework preset: None
- Build command: (留空)
- Build output directory: `海马职加人岗匹配系统` 或 `.`
- 点击 "Save and Deploy"

### 3. Railway
- 访问：https://railway.app
- 点击 "New Project" → "Deploy from GitHub repo"
- 选择仓库
- 使用静态文件服务

