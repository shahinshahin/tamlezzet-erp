#!/bin/bash
set -e

APP_DIR="/opt/tamlezzet-erp"
DOMAIN="${app_domain}"
REPO_URL="${repo_url}"

# ── System update & dependencies ─────────────────────────
dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ── Docker Compose ───────────────────────────────────────
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── Clone repo ───────────────────────────────────────────
git clone "$REPO_URL" "$APP_DIR"
chown -R ec2-user:ec2-user "$APP_DIR"

# ── Write .env ───────────────────────────────────────────
cat > "$APP_DIR/.env" <<EOF
DB_USERNAME=${db_username}
DB_PASSWORD=${db_password}
JWT_SECRET=${jwt_secret}
CORS_ORIGINS=${cors_origins}
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
OPENAI_API_KEY=
EOF

chmod 600 "$APP_DIR/.env"

# ── Use HTTP-only nginx config if no domain ───────────────
if [ -z "$DOMAIN" ]; then
    cat > "$APP_DIR/frontend/nginx.conf" <<'NGINX'
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX
fi

# ── Start app ─────────────────────────────────────────────
cd "$APP_DIR"
docker-compose up -d --build

# ── SSL via Certbot (only if domain provided) ─────────────
if [ -n "$DOMAIN" ]; then
    dnf install -y certbot python3-certbot-nginx
    sleep 30
    certbot --nginx \
        --non-interactive \
        --agree-tos \
        --email "admin@$DOMAIN" \
        --domains "$DOMAIN" \
        --redirect
    echo "0 3 * * * root certbot renew --quiet --post-hook 'docker-compose -f $APP_DIR/docker-compose.yml restart frontend'" \
        > /etc/cron.d/certbot-renew
    echo "==> App live at: https://$DOMAIN"
else
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    echo "==> App live at: http://$PUBLIC_IP"
fi
