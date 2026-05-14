#!/bin/bash
set -e

echo "=== Pi Storage ==="

# Backend deps
cd "$(dirname "$0")/backend"
if [ ! -f ".env" ]; then
  echo "HATA: backend/.env bulunamadı!"
  echo "1. backend/.env.example dosyasını backend/.env olarak kopyalayın"
  echo "2. JWT_SECRET değerini düzenleyin"
  echo "3. npm run setup-password ile şifre hash'i oluşturun"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Backend bağımlılıkları yükleniyor..."
  npm install
fi

# Frontend build
cd ../frontend
if [ ! -d "node_modules" ]; then
  echo "Frontend bağımlılıkları yükleniyor..."
  npm install
fi

echo "Frontend derleniyor..."
npm run build

# Start
cd ../backend
echo "Sunucu başlatılıyor..."
echo "Adresi: http://$(hostname -I | awk '{print $1}'):${PORT:-3001}"
node server.js
