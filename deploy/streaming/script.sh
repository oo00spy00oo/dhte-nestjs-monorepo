#!/bin/bash
# Script deploy zma-signaling

SERVER="root@94.100.26.6"

ssh $SERVER << 'EOF'
  set -e

  cd ~/dhte-nestjs-monorepo

  pwd

  echo "🔄 Pulling latest code..."
  git pull origin main

  cd apps/zma-signaling

  echo "🛑 Stopping old process..."
  pm2 stop 0 || true
  pm2 delete 0 || true

  echo "🚀 Starting new process..."
  pm2 start "npx nx serve zma-signaling" --name zma-signaling

  echo "✅ Deployment completed."
EOF