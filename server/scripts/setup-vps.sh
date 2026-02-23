#!/bin/bash
# ============================================
# Kladovka78 — Скрипт настройки VPS
# Ubuntu 22.04 LTS | Node.js 20 | MySQL 8 | Nginx | PM2
# ============================================
set -euo pipefail

echo "🚀 Настройка VPS для Kladovka78..."

# --- 1. Обновление системы ---
echo "📦 Обновление пакетов..."
apt update && apt upgrade -y

# --- 2. Node.js 20 ---
echo "📦 Установка Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"

# --- 3. MySQL 8 ---
echo "📦 Установка MySQL 8..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

echo "⚙️  Настройка MySQL..."
# Создание БД и пользователя (замените пароль!)
mysql -e "
  CREATE DATABASE IF NOT EXISTS kladovka78 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER IF NOT EXISTS 'kladovka78'@'localhost' 
    IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
  GRANT ALL PRIVILEGES ON kladovka78.* TO 'kladovka78'@'localhost';
  FLUSH PRIVILEGES;
"
echo "  ✅ MySQL настроен"

# --- 4. Nginx ---
echo "📦 Установка Nginx..."
apt install -y nginx

# Rate limiting zone (добавить в nginx.conf)
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
  sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;' /etc/nginx/nginx.conf
fi

systemctl restart nginx
systemctl enable nginx
echo "  ✅ Nginx установлен"

# --- 5. PM2 ---
echo "📦 Установка PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
echo "  ✅ PM2 установлен"

# --- 6. Certbot (SSL) ---
echo "📦 Установка Certbot..."
apt install -y certbot python3-certbot-nginx
echo "  ✅ Certbot установлен"
echo "  ⚠️  SSL настроите позже: certbot --nginx -d api.kladovka78.ru"

# --- 7. Создание директорий ---
echo "📁 Создание директорий..."
mkdir -p /var/www/kladovka78/server
mkdir -p /var/www/kladovka78/uploads/cells
mkdir -p /var/log/kladovka78
chown -R www-data:www-data /var/www/kladovka78/uploads

# --- 8. Git ---
echo "📦 Установка Git..."
apt install -y git

# --- 9. Firewall ---
echo "🔥 Настройка UFW..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "  ✅ Firewall настроен"

# --- 10. SSH ключ для деплоя ---
echo ""
echo "============================================"
echo "✅ VPS настроен!"
echo "============================================"
echo ""
echo "Следующие шаги:"
echo "1. Клонировать репо:  cd /var/www/kladovka78 && git clone <repo-url> ."
echo "2. Создать .env:      cp server/.env.example server/.env && nano server/.env"
echo "3. Установить deps:   cd server && npm install"
echo "4. Запустить миграции: npm run migrate"
echo "5. Собрать проект:    npm run build"
echo "6. Запустить PM2:     pm2 start ecosystem.config.js"
echo "7. Nginx конфиг:      cp server/nginx/api.kladovka78.ru.conf /etc/nginx/sites-available/"
echo "                      ln -s /etc/nginx/sites-available/api.kladovka78.ru.conf /etc/nginx/sites-enabled/"
echo "                      nginx -t && systemctl reload nginx"
echo "8. SSL сертификат:    certbot --nginx -d api.kladovka78.ru"
echo ""
echo "Для GitHub Actions деплоя добавьте секреты в репозиторий:"
echo "  VPS_HOST=217.25.94.93"
echo "  VPS_USER=root"
echo "  VPS_SSH_KEY=<приватный SSH ключ>"
