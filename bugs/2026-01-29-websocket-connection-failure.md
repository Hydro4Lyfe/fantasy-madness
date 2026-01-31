# WebSocket Connection Failure - Wrong Server Running

**Date**: 2026-01-29
**Component**: apps/web/server.ts, WebSocket infrastructure

## Symptom

Draft Room WebSocket connections fail immediately with "connection error" and enter infinite reconnect loop. Browser console shows:

```
[useDraftWebSocket] WebSocket error: [Event]
[useDraftWebSocket] Disconnected: 1006
```

## Root Causes

### 1. Standard Next.js Dev Server Running (PRIMARY ISSUE)

**Current State**: App running via `npm run dev` → `next dev`

**Problem**: Next.js 15 API routes do not support WebSocket upgrades. The endpoint `/api/draft/[draftId]/ws/route.ts` returns JSON (401 or info) instead of upgrading the connection.

**Evidence**:
- `curl http://localhost:3000/api/draft/test-draft-id/ws` returns `{"error":"Unauthorized"}` with status 401
- Process list shows `jest-worker` processes (Next.js compiler) but no custom server
- No WebSocket upgrade handler registered

**Fix**: Run `npm run dev:ws` which executes `tsx server.ts` to start the custom server that handles WebSocket upgrade events.

### 2. Redis Not Running (SECONDARY ISSUE)

**Problem**: The WebSocket handler uses Redis pub/sub for broadcasting events across connections and pods. Redis is not installed or running locally.

**Evidence**:
- `redis-cli ping` → command not found
- `RedisPubSubClient` in `/apps/web/lib/redis/pubsub.ts` will fail on first subscribe/publish attempt

**Fix**: Install and start Redis:
```bash
# Ubuntu/WSL
sudo apt-get install redis-server
sudo service redis-server start

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Authentication Flow Issue (MINOR)

The WebSocket client connects before authentication can be validated server-side, causing the 401 response from the API route (which shouldn't be handling WebSocket requests anyway).

## Fix Implementation

### Step 1: Start Redis

```bash
# Check if Redis is installed
which redis-server

# If not installed:
# WSL/Ubuntu: sudo apt-get install redis-server
# macOS: brew install redis

# Start Redis
redis-server --daemonize yes

# Verify
redis-cli ping  # Should return PONG
```

### Step 2: Update Development Workflow

**Before (broken)**:
```bash
npm run dev:web  # → next dev (no WebSocket support)
```

**After (working)**:
```bash
npm run dev:ws -w @fantasy-madness/web  # → tsx server.ts (custom server)
```

### Step 3: Update Root package.json Scripts

```json
{
  "scripts": {
    "dev:web": "npm run dev:ws -w @fantasy-madness/web",  // Changed from "dev"
    "dev:web-nowebsocket": "npm run dev -w @fantasy-madness/web"  // Fallback
  }
}
```

### Step 4: Verify Custom Server Works

```bash
# Terminal 1: Start custom server
npm run dev:ws -w @fantasy-madness/web

# Terminal 2: Test WebSocket upgrade
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:3000/api/draft/test-draft-id/ws

# Should see: HTTP/1.1 101 Switching Protocols (after auth is added)
# or HTTP/1.1 401 Unauthorized (if not authenticated)
```

## Architecture Context

The Draft Room MVP requires WebSocket for real-time updates:

```
Client (Browser)
    ↓ WebSocket connection
Custom Server (server.ts)
    ↓ Upgrade event
WebSocketServer (lib/websocket/server.ts)
    ↓ handleDraftWebSocketUpgrade
DraftWebSocketHandler (lib/websocket/handler.ts)
    ↓ pub/sub
Redis (ioredis)
```

Next.js standard dev server (`next dev`) cannot handle the upgrade event, so the connection fails at step 2.

## Prevention

1. **Documentation**: Add setup instructions to README emphasizing Redis + custom server requirement
2. **Validation Script**: Create `lib/websocket/validate-setup.ts` to check Redis connectivity on server start
3. **Clear Error Messages**: Update WebSocket client to differentiate between auth failures and infrastructure failures

## Related Files

- `/apps/web/server.ts` - Custom server with WebSocket upgrade handling
- `/apps/web/lib/websocket/server.ts` - WebSocket server singleton
- `/apps/web/lib/websocket/handler.ts` - Connection handler with Redis pub/sub
- `/apps/web/lib/redis/pubsub.ts` - Redis pub/sub client
- `/apps/web/hooks/useDraftWebSocket.ts` - Client-side WebSocket hook
- `/apps/web/package.json` - Scripts: `dev:ws` vs `dev`

## Success Criteria

After fix:
1. Redis responds to `redis-cli ping` with `PONG`
2. Custom server starts and logs `[Server] WebSocket support enabled for /api/draft/:draftId/ws`
3. WebSocket client can connect (after proper authentication)
4. Draft room state updates broadcast to all connected clients within 500ms
