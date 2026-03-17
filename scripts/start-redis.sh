#!/bin/bash
# Start Redis for Draft Room WebSocket support

set -e

CONTAINER_NAME="fantasy-madness-redis"
REDIS_PORT="6379"

echo "🔍 Checking for existing Redis container..."

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "📦 Found existing container: ${CONTAINER_NAME}"

  if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ Redis is already running"
  else
    echo "🚀 Starting existing Redis container..."
    docker start ${CONTAINER_NAME}
    echo "✅ Redis started"
  fi
else
  echo "🆕 Creating new Redis container..."
  docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${REDIS_PORT}:6379 \
    redis:7-alpine
  echo "✅ Redis container created and started"
fi

echo ""
echo "🔍 Verifying Redis connection..."
sleep 1

if docker exec ${CONTAINER_NAME} redis-cli ping | grep -q "PONG"; then
  echo "✅ Redis is responding to PING"
else
  echo "❌ Redis is not responding"
  exit 1
fi

echo ""
echo "✅ Redis is ready!"
echo ""
echo "To connect: redis://localhost:${REDIS_PORT}"
echo "To stop:    docker stop ${CONTAINER_NAME}"
echo "To remove:  docker rm ${CONTAINER_NAME}"
