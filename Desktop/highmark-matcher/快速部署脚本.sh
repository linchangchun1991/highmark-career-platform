#!/bin/bash

# 海马职加系统 - 快速部署脚本（阿里云 Ubuntu）
# 使用方法：在服务器上执行 bash 快速部署脚本.sh

echo "🚀 开始部署海马职加系统..."

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
  echo "❌ 请使用 root 用户运行此脚本"
  exit 1
fi

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装 Node.js 18
echo "📦 安装 Node.js 18..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"

# 安装 PM2
echo "📦 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

# 安装 Git
echo "📦 安装 Git..."
if ! command -v git &> /dev/null; then
  apt install git -y
fi

# 安装 Nginx
echo "📦 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
  apt install nginx -y
fi

echo ""
echo "✅ 基础环境安装完成！"
echo ""
echo "📝 接下来请手动执行："
echo "1. 克隆代码: git clone https://github.com/你的用户名/highmark-matcher.git"
echo "2. 进入目录: cd highmark-matcher"
echo "3. 安装依赖: npm install"
echo "4. 创建 .env.local 文件并配置环境变量"
echo "5. 构建项目: npm run build"
echo "6. 启动服务: pm2 start npm --name 'highmark-matcher' -- start"
echo "7. 设置自启: pm2 startup && pm2 save"
echo ""
echo "详细步骤请参考: 部署指南-国内版.md"

