#!/bin/bash
set -e

# Fantasy Madness - VPS Deployment Script
# ----------------------------------------
# Usage: ./scripts/deploy.sh
#
# Prerequisites:
#   - Docker and Docker Compose installed on VPS
#   - .env file configured with your values
#   - Domain DNS pointing to your VPS IP

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_DIR="$PROJECT_ROOT/infra/compose"

echo "==================================="
echo "Fantasy Madness - Deployment"
echo "==================================="

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "ERROR: .env file not found at $PROJECT_ROOT/.env"
    echo "Copy .env.example to .env and configure your values"
    exit 1
fi

# Source .env to check required variables
set -a
source "$PROJECT_ROOT/.env"
set +a

# Validate required variables
MISSING_VARS=""
[ -z "$DOMAIN" ] && MISSING_VARS="$MISSING_VARS DOMAIN"
[ -z "$ACME_EMAIL" ] && MISSING_VARS="$MISSING_VARS ACME_EMAIL"
[ -z "$DATABASE_URL" ] && MISSING_VARS="$MISSING_VARS DATABASE_URL"
[ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && MISSING_VARS="$MISSING_VARS NEXT_PUBLIC_SUPABASE_URL"
[ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && MISSING_VARS="$MISSING_VARS NEXT_PUBLIC_SUPABASE_ANON_KEY"

if [ -n "$MISSING_VARS" ]; then
    echo "ERROR: Missing required environment variables:"
    echo "$MISSING_VARS"
    exit 1
fi

echo "Domain: $DOMAIN"
echo "Email: $ACME_EMAIL"
echo ""

# Navigate to compose directory
cd "$COMPOSE_DIR"

# Pull latest images and rebuild
echo "[1/3] Building containers..."
docker compose -f docker-compose.prod.yml build

# Run database migrations (from /app root, not /app/apps/web)
echo "[2/3] Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm --workdir /app web \
    npx prisma migrate deploy --schema ./packages/db/prisma/schema.prisma || {
    echo "WARNING: Migration failed or already up to date"
}

# Start services
echo "[3/3] Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "Your app will be available at: https://$DOMAIN"
echo ""
echo "First-time SSL certificate may take 1-2 minutes to provision."
echo ""
echo "Useful commands:"
echo "  View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          docker compose -f docker-compose.prod.yml down"
echo "  Restart web:   docker compose -f docker-compose.prod.yml restart web"
echo ""
