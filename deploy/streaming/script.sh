#!/bin/bash
# Script deploy zma-signaling

SERVER="root@94.100.26.6"
APP_DIR="dhte-nestjs-monorepo"
APP_PATH="apps/zma-signaling"
PM2_NAME="zma-signaling"

ssh $SERVER << 'EOF'
  set -e
  cd ~/$APP_DIR

  echo "🔄 Pulling latest code..."
  git pull

  cd $APP_PATH

  echo "🛑 Stopping old process..."
  pm2 stop 0 || true
  pm2 delete 0 || true

  echo "🚀 Starting new process..."
  pm2 start "npx nx serve $PM2_NAME" --name $PM2_NAME

  echo "✅ Deployment completed."
EOF