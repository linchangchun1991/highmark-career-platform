# 🚀 快速部署到 Vercel

## 一键部署命令

```bash
# 1. 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 在项目目录下部署
cd /Users/changchun/产品查询系统
vercel

# 4. 部署到生产环境
vercel --prod
```

## 或者通过网页部署

1. 访问 https://vercel.com
2. 使用 GitHub/GitLab 账号登录
3. 点击 "New Project"
4. 导入你的 Git 仓库
5. 配置：
   - Framework: Other
   - Root Directory: ./
   - Build Command: (留空)
   - Output Directory: ./
6. 点击 "Deploy"

## ✅ 部署检查清单

- [x] `product-price-query.html` 文件存在
- [x] `products_with_policies.json` 文件存在
- [x] `vercel.json` 配置文件已更新
- [x] `.vercelignore` 文件已创建

## 📝 部署后

访问地址：`https://your-project.vercel.app`

如果需要更新数据：
```bash
python3 rebuild_product_data_v2.py
git add products_with_policies.json
git commit -m "更新产品数据"
git push
```

Vercel 会自动重新部署！

