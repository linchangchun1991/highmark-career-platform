#!/bin/bash

echo "🔍 检查部署准备情况..."
echo ""

# 检查 Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node -v)"
else
    echo "❌ Node.js 未安装"
fi

# 检查 npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm -v)"
else
    echo "❌ npm 未安装"
fi

# 检查 Git
if command -v git &> /dev/null; then
    echo "✅ Git: $(git --version)"
else
    echo "❌ Git 未安装"
fi

# 检查依赖
if [ -d "node_modules" ]; then
    echo "✅ 依赖已安装"
else
    echo "⚠️  依赖未安装，运行: npm install"
fi

# 检查环境变量文件
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ Supabase URL 已配置"
    else
        echo "⚠️  Supabase URL 未配置"
    fi
else
    echo "⚠️  .env.local 文件不存在（部署时需要手动配置环境变量）"
fi

# 检查构建
echo ""
echo "🔨 测试构建..."
npm run build > /tmp/build_test.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败，查看错误："
    tail -20 /tmp/build_test.log
fi

echo ""
echo "📋 部署前检查清单："
echo "1. [ ] Supabase 数据库表已创建（参考：紧急部署指南-必看.md）"
echo "2. [ ] 代码已推送到 GitHub"
echo "3. [ ] 在 Vercel/Zeabur 添加了环境变量（参考：部署环境变量.txt）"
echo ""
echo "📖 详细部署步骤请查看：紧急部署指南-必看.md"

