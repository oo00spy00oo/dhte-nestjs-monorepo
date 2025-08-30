#!/bin/bash

# Bước 1: Start nginx tạm để lấy cert
docker compose up -d nginx

# Bước 2: Kiểm tra truy cập test.txt
echo "==> Kiểm tra thử file challenge"
mkdir -p certbot/www/.well-known/acme-challenge
echo "ok" > certbot/www/.well-known/acme-challenge/test.txt

curl -s http://dev-streaming.dhte.vn/.well-known/acme-challenge/test.txt

# Bước 3: Lấy cert
docker compose run --rm certbot

# Bước 4: Thông báo
echo "==> Xong. Nếu ok, sửa Nginx config thành HTTPS và restart"