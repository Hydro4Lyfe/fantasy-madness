# WebSocket Draft Room Setup Guide

This guide explains how to set up and run the Draft Room WebSocket server for real-time draft functionality.

## Prerequisites

The Draft Room feature requires:

1. **PostgreSQL** - Already configured via DATABASE_URL
2. **Redis** - For pub/sub communication between WebSocket connections
3. **Custom Next.js Server** - Standard `next dev` does NOT support WebSocket

## Quick Start

```bash
# 1. Install Redis
# See "Redis Installation" section below for your platform

# 2. Start Redis
redis-server --daemonize yes

# 3. Verify Redis is running
redis-cli ping  # Should return PONG

# 4. Start the custom WebSocket server (NOT next dev)
npm run dev:web

# This now runs: npm run dev:ws -w @fantasy-madness/web
# Which executes: tsx server.ts
```

## Redis Installation

### Ubuntu / WSL (Debian-based)

```bash
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo service redis-server start

# Verify
redis-cli ping
```

### macOS

```bash
brew install redis

# Start Redis as a service
brew services start redis

# Or run in foreground
redis-server

# Verify
redis-cli ping
```

### Docker (Any Platform)

```bash
# Run Redis in background
docker run -d --name fantasy-redis -p 6379:6379 redis:7-alpine

# Verify
docker exec fantasy-redis redis-cli ping

# Stop
docker stop fantasy-redis

# Start again
docker start fantasy-redis
```

### Windows (Native)

1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Run the installer
3. Start Redis from Windows Services or command line: `redis-server.exe`

## Environment Variables

The custom server needs these environment variables (already in your `.env`):

```bash
# Required
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional (defaults shown)
REDIS_URL=redis://localhost:6379
PORT=3000
HOSTNAME=localhost
```

## Server Validation

The custom server runs automatic validation on startup. It checks:

1. Environment variables (DATABASE_URL, Supabase keys, etc.)
2. Database connection and schema (draft_turn_timers table)
3. Redis connection and pub/sub functionality
4. Required dependencies (ws, ioredis, @supabase/ssr)

If validation fails, the server will not start and will display clear error messages.

You can also run validation manually:

```bash
cd apps/web
npx tsx lib/websocket/validate-setup.ts
```

## Understanding the Server Architecture

### Standard Next.js Dev Server (DOES NOT WORK)

```bash
npm run dev:web-no-websocket  # or: next dev
```

- Runs Next.js built-in development server
- Handles HTTP requests only
- API routes at `/api/draft/[draftId]/ws/route.ts` return JSON
- **Cannot upgrade connections to WebSocket**
- WebSocket clients will fail to connect

### Custom WebSocket Server (REQUIRED)

```bash
npm run dev:web  # or: npm run dev:ws -w @fantasy-madness/web
```

- Runs custom Node.js HTTP server via `server.ts`
- Wraps Next.js request handler
- Intercepts `upgrade` events for WebSocket connections
- Authenticates via Supabase cookies
- Handles WebSocket upgrade for `/api/draft/[draftId]/ws` paths
- **Required for Draft Room functionality**

## How WebSocket Connections Work

1. **Client connects** via `useDraftWebSocket` hook
   - URL: `ws://localhost:3000/api/draft/{draftId}/ws`
   - Sends Supabase auth cookies

2. **Server receives upgrade request**
   - HTTP server emits `upgrade` event
   - Custom handler authenticates via Supabase
   - If valid, upgrades to WebSocket

3. **Connection established**
   - `DraftWebSocketHandler` verifies user is draft participant
   - Subscribes to Redis channel `draft:{draftId}`
   - Sends initial draft state

4. **Real-time updates**
   - User submits pick → handler calls `makePick` DAL function
   - Handler publishes events to Redis
   - Redis broadcasts to all connections for that draft
   - All clients receive `pick:made`, `turn:changed`, `draft:state` events

5. **Disconnect**
   - Handler unsubscribes from Redis
   - Connection closed gracefully

## Troubleshooting

### Redis Connection Failed

**Error**: `Redis connection failed: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**: Redis is not running. Start it:
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
redis-server --daemonize yes  # Linux/Mac
brew services start redis      # macOS with Homebrew
docker start fantasy-redis     # Docker
```

### WebSocket Upgrade Failed

**Error**: Client logs `WebSocket error: [Event]` and reconnects infinitely

**Possible causes**:

1. **Wrong server running**
   - Check: `ps aux | grep -E "next|tsx"`
   - Should see: `tsx server.ts`
   - Should NOT see: `next dev`
   - Fix: Stop `next dev` and run `npm run dev:web`

2. **Redis not running**
   - Check: `redis-cli ping`
   - Fix: Start Redis (see above)

3. **Authentication issue**
   - Check: User is logged in with valid Supabase session
   - Check: Cookies are being sent with WebSocket request
   - Fix: Log out and log back in

4. **Draft participant check**
   - Check: User is a participant in the draft
   - Fix: Join the draft before connecting

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: Another process is using port 3000
```bash
# Find the process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev:web
```

### Database Migrations Not Applied

**Error**: `draft_turn_timers table not found`

**Solution**: Run migrations
```bash
npm run migrate:dev -w @fantasy-madness/db
```

## Production Deployment

For production, use the production server script:

```bash
# Build the app
npm run build:web

# Start production server with WebSocket support
npm run start:ws -w @fantasy-madness/web
# Or: NODE_ENV=production node server.ts

# NOT: npm run start (this runs next start without WebSocket)
```

### Docker Compose

The Docker setup includes Redis and uses the custom server:

```bash
cd infra/compose
docker-compose up --build

# This runs:
# - PostgreSQL
# - Redis
# - Web app with custom server (server.ts)
```

### Kubernetes

In production Kubernetes:

1. Deploy Redis StatefulSet or managed Redis (ElastiCache, Cloud Memorystore)
2. Set `REDIS_URL` environment variable
3. Web pods run `NODE_ENV=production node server.ts`
4. Multiple pods share Redis for cross-pod pub/sub

## Testing WebSocket Connections

### Manual Test with wscat

```bash
# Install wscat
npm install -g wscat

# Connect (replace {draftId} and add auth cookies)
wscat -c "ws://localhost:3000/api/draft/{draftId}/ws" \
  --header "Cookie: supabase-auth-token=..."

# You should see:
# Connected
# < {"type":"draft:state","payload":{...}}
```

### Automated Tests

```bash
cd apps/web
npm test -- lib/websocket/__tests__/integration.test.ts
```

## Monitoring

### Metrics Endpoint

```bash
curl http://localhost:3000/api/websocket/metrics

# Returns:
# {
#   "totalConnections": 5,
#   "messagesReceived": 123,
#   "messagesSent": 456,
#   "errors": 0,
#   "averageLatency": 45.2,
#   "connectionsByDraft": { "draft-id": 3 }
# }
```

### Health Check

```bash
curl http://localhost:3000/api/websocket/health

# Returns: {"status": "ok"}
```

### Logs

The custom server logs WebSocket events:

```
[Server] WebSocket support enabled for /api/draft/:draftId/ws
[WebSocket] User abc123 connected to draft xyz789
[WebSocket] Pick submit: user=abc123, draft=xyz789, slot=slot-1-1
[WebSocket] Pick successful: 1
[WebSocket] User abc123 disconnected from draft xyz789
```

## Related Documentation

- [Draft Room Architecture ADR](/docs/ADR-001-DRAFT-ROOM-ARCHITECTURE.md)
- [WebSocket Connection Failure Bug](/bugs/2026-01-29-websocket-connection-failure.md)
- [CLAUDE.md - Build Commands](/CLAUDE.md)

## Summary

To run the Draft Room with WebSocket support:

1. **Install and start Redis**: `redis-server --daemonize yes`
2. **Use the custom server**: `npm run dev:web` (NOT `next dev`)
3. **Verify setup**: Server runs validation automatically on startup
4. **Check logs**: Ensure you see `[Server] WebSocket support enabled`

For production: Use `NODE_ENV=production node server.ts` and configure Redis URL.
