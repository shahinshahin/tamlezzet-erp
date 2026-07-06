#!/bin/bash
set -e

# -------------------------------------------------------
# TamLezzet ERP — EC2 Deploy Script
# Run once on a fresh Amazon Linux 2023 / Ubuntu EC2
# -------------------------------------------------------

REPO_URL="https://github.com/shahinshahin/tamlezzet-erp.git"
APP_DIR="/opt/tamlezzet-erp"

echo "==> Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Amazon Linux 2023
    if command -v dnf &> /dev/null; then
        sudo dnf update -y
        sudo dnf install -y docker git
    # Ubuntu
    else
        sudo apt-get update -y
        sudo apt-get install -y docker.io docker-compose-plugin git
    fi
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
fi

echo "==> Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "==> Cloning / updating repo..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR" && git pull
else
    sudo git clone "$REPO_URL" "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    cd "$APP_DIR"
fi

echo "==> Setting up environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo ""
    echo "  !! .env file created from .env.example"
    echo "  !! Edit $APP_DIR/.env with your real values before continuing"
    echo "  !! Then re-run this script"
    exit 1
fi

echo "==> Building and starting containers..."
cd "$APP_DIR"
docker-compose pull postgres 2>/dev/null || true
docker-compose up -d --build

echo ""
echo "==> Done! App is running at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "    Logs: docker-compose logs -f"
echo "    Stop: docker-compose down"
