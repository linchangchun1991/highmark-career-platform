#!/bin/bash

echo "🚀 开始部署到 Vercel..."
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装"
    echo "正在安装 Vercel CLI..."
    npm i -g vercel
    echo "✅ Vercel CLI 安装完成"
    echo ""
fi

# 检查是否已登录
echo "检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "⚠️  未登录 Vercel，请先登录..."
    vercel login
fi

echo ""
echo "📦 准备部署文件..."
echo "  - product-price-query.html"
echo "  - products_with_policies.json"
echo "  - vercel.json"
echo ""

# 部署到预览环境
echo "🚀 部署到预览环境..."
vercel

echo ""
echo "✅ 预览部署完成！"
echo ""
read -p "是否部署到生产环境？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 部署到生产环境..."
    vercel --prod
    echo ""
    echo "✅ 生产环境部署完成！"
fi

echo ""
echo "✨ 部署完成！"
echo "访问你的 Vercel 项目查看部署地址"

