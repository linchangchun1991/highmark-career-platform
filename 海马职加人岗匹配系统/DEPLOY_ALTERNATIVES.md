# 🌐 替代部署平台指南

## 平台对比

| 平台 | 免费额度 | 部署速度 | 自定义域名 | 推荐度 |
|------|---------|---------|-----------|--------|
| **GitHub Pages** | ✅ 无限 | ⚡ 快 | ✅ 支持 | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ 100GB/月 | ⚡ 快 | ✅ 支持 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | ✅ 无限 | ⚡ 极快 | ✅ 支持 | ⭐⭐⭐⭐⭐ |
| **Vercel** | ✅ 100GB/月 | ⚡ 快 | ✅ 支持 | ⭐⭐⭐⭐ |

## 🎯 推荐：GitHub Pages（最简单）

### 步骤 1: 启用 GitHub Pages

1. 访问你的仓库设置：
   ```
   https://github.com/linchangchun1991/highmark-career-platform/settings/pages
   ```

2. 配置：
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/海马职加人岗匹配系统` （如果文件在子目录）
   - 点击 **"Save"**

3. 等待 1-2 分钟，部署完成

4. 访问地址：
   ```
   https://linchangchun1991.github.io/highmark-career-platform/
   ```

### 或者：使用 GitHub Actions（已配置）

如果文件在子目录，GitHub Actions 会自动部署。

## 🚀 Netlify 部署

### 步骤：

1. **访问 Netlify**
   - https://app.netlify.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 GitHub
   - 选择仓库：`highmark-career-platform`

3. **配置构建**
   - Base directory: `海马职加人岗匹配系统`
   - Build command: (留空)
   - Publish directory: `海马职加人岗匹配系统` 或 `.`

4. **点击 "Deploy site"**

5. **访问地址**
   - `https://random-name-123.netlify.app`
   - 可以在设置中自定义域名

## ☁️ Cloudflare Pages 部署

### 步骤：

1. **访问 Cloudflare Pages**
   - https://pages.cloudflare.com
   - 使用 GitHub 账号登录

2. **创建项目**
   - 点击 "Create a project"
   - 连接 GitHub 账户
   - 选择仓库：`highmark-career-platform`

3. **配置构建**
   - Framework preset: **None**
   - Build command: (留空)
   - Build output directory: `海马职加人岗匹配系统`

4. **点击 "Save and Deploy"**

5. **访问地址**
   - `https://your-project.pages.dev`
   - 可以绑定自定义域名

## 📋 文件位置说明

如果产品查询系统的文件在 `海马职加人岗匹配系统` 子目录中：
- Base directory / Root directory: `海马职加人岗匹配系统`
- Publish directory: `海马职加人岗匹配系统` 或 `.`

如果文件直接在仓库根目录：
- Base directory / Root directory: `.` 或留空
- Publish directory: `.`

## ✅ 推荐顺序

1. **GitHub Pages** - 最简单，文件已在 GitHub
2. **Netlify** - 功能强大，配置简单
3. **Cloudflare Pages** - 全球 CDN，速度快

