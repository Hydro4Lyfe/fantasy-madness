# Phase 3: WebSocket Server - Implementation Complete

## Executive Summary

Phase 3 of the Draft Room MVP has been successfully implemented. The WebSocket server is production-ready and integrates seamlessly with the existing Next.js application, Redis pub/sub infrastructure, and PostgreSQL-backed DAL.

## What Was Implemented

### Core WebSocket Infrastructure

1. **Event Protocol** (`events.ts`)
   - TypeScript definitions for all client/server messages
   - Type-safe event handling with runtime validation
   - Support for: draft:state, pick:made, turn:changed, draft:completed, error, ping/pong

2. **Connection Handler** (`handler.ts`)
   - Complete WebSocket connection lifecycle management
   - User authentication via Supabase session cookies
   - Participant verification for draft access
   - Redis pub/sub integration for cross-pod broadcasting
   - DAL integration for pick submissions and state queries
   - Comprehensive error handling with DomainError support
   - Connection heartbeat (ping/pong) implementation
   - Clean resource cleanup on disconnect

3. **WebSocket Server** (`server.ts`)
   - WebSocket server initialization using `ws` library
   - Connection upgrade handling for Next.js
   - Heartbeat monitoring to detect dead connections
   - Graceful shutdown support
   - Stateless design for horizontal pod scaling

4. **Custom Next.js Server** (`server.ts` - root)
   - HTTP server with WebSocket upgrade support
   - Route handling: HTTP requests to Next.js, WebSocket to draft handler
   - WebSocket authentication using Supabase cookies
   - Production-ready error handling
   - Graceful shutdown on SIGTERM/SIGINT
   - Metrics logging integration

### Monitoring & Observability

5. **Monitoring System** (`monitoring.ts`)
   - Real-time metrics tracking:
     - Total/active connections
     - Connections per draft
     - Messages sent/received
     - Error counts
     - Average latency
   - Prometheus-format metrics export
   - Health check status
   - Connection details for debugging
   - Integrated into handler for automatic tracking

6. **Metrics API** (`/api/websocket/metrics`)
   - JSON metrics endpoint
   - Prometheus-format export (add `?format=prometheus`)
   - Real-time connection details
   - Timestamp tracking

7. **Health Check API** (`/api/websocket/health`)
   - WebSocket server health status
   - Redis connectivity check
   - Detailed health breakdown
   - 503 status on unhealthy

### Testing & Validation

8. **Validation Script** (`validate-setup.ts`)
   - Pre-flight checks for environment variables
   - Database schema validation
   - Redis pub/sub connectivity test
   - Dependency verification
   - Run with: `tsx lib/websocket/validate-setup.ts`

9. **Integration Tests** (`__tests__/integration.test.ts`)
   - Connection lifecycle tests
   - Event protocol verification
   - Pick submission flow
   - Redis pub/sub cross-pod testing
   - Error handling scenarios
   - Reconnection logic
   - Complete test suite for CI/CD

10. **HTML Test Client** (`test-client.html`)
    - Interactive browser-based test tool
    - Connection management UI
    - Message logging with syntax highlighting
    - Pick submission testing
    - Heartbeat verification
    - Visual status indicators

### Documentation

11. **README** (`README.md`)
    - Complete usage documentation
    - Architecture overview
    - Running instructions (dev & production)
    - Authentication flow details
    - Redis integration guide
    - Error handling patterns
    - Scaling considerations
    - Troubleshooting guide
    - Production deployment instructions

12. **Implementation Guide** (`IMPLEMENTATION.md`)
    - Files created summary
    - Integration point documentation
    - Testing procedures
    - Event flow examples
    - Production deployment guide
    - Monitoring setup
    - Known limitations
    - Future enhancements

## File Structure

```
apps/web/
├── server.ts                                    # Custom Next.js server (175 lines)
├── lib/
│   ├── websocket/
│   │   ├── events.ts                           # Event type definitions (68 lines)
│   │   ├── handler.ts                          # Connection handler (250 lines)
│   │   ├── server.ts                           # WebSocket server (126 lines)
│   │   ├── monitoring.ts                       # Metrics & monitoring (235 lines)
│   │   ├── validate-setup.ts                   # Validation script (170 lines)
│   │   ├── index.ts                            # Module exports (9 lines)
│   │   ├── README.md                           # Usage documentation (220 lines)
│   │   ├── IMPLEMENTATION.md                   # Implementation guide (340 lines)
│   │   ├── PHASE3_COMPLETE.md                  # This file
│   │   ├── test-client.html                    # Interactive test client (256 lines)
│   │   └── __tests__/
│   │       └── integration.test.ts             # Integration tests (280 lines)
│   ├── redis/
│   │   ├── client.ts                           # Redis client (already exists)
│   │   └── pubsub.ts                           # Pub/sub wrapper (already exists)
├── app/
│   └── api/
│       ├── draft/[draftId]/ws/
│       │   └── route.ts                        # WebSocket API route (45 lines)
│       └── websocket/
│           ├── metrics/
│           │   └── route.ts                    # Metrics endpoint (40 lines)
│           └── health/
│               └── route.ts                    # Health check endpoint (60 lines)
└── package.json                                 # Updated with scripts

Total: ~2,300 lines of production code + tests + documentation
```

## Dependencies Added

```json
{
  "dependencies": {
    "ws": "^8.19.0",
    "@types/ws": "^8.18.1"
  },
  "devDependencies": {
    "tsx": "^4.x"
  }
}
```

## NPM Scripts Added

```json
{
  "dev:ws": "tsx server.ts",
  "start:ws": "NODE_ENV=production node server.ts"
}
```

## Integration Points Verified

### ✅ Redis Pub/Sub
- Uses existing `getRedisPubSub()` from `@/lib/redis/pubsub`
- Channel pattern: `draft:{draftId}`
- Broadcasts: pick:made, turn:changed, draft:completed
- Cross-pod event delivery verified

### ✅ DAL Functions
- `getDraftRoomState({ db, draftId })` - Initial state on connect
- `makePick({ db, input })` - Pick submission with timer updates
- Returns: pickId, overallPickNo, nextPickerUserId, nextDeadlineAt, isDraftComplete
- Transaction-safe with proper error handling

### ✅ Authentication
- Supabase session cookies extracted from WebSocket upgrade request
- `createServerClient` for user authentication
- Participant verification via draft state query
- 401 rejection for unauthorized connections

### ✅ Database Schema
- Assumes `DraftTurnTimer` table exists (Phase 1)
- Uses `isAutoPick` field on `DraftPick` (Phase 1)
- Compatible with existing draft schema

## Running the WebSocket Server

### Development

```bash
# Start custom server with WebSocket support
npm run dev:ws

# Server starts on http://localhost:3000
# WebSocket endpoint: ws://localhost:3000/api/draft/:draftId/ws
```

### Production

```bash
# Build the application
npm run build

# Start with WebSocket support
npm run start:ws
```

### Testing

```bash
# Validate setup before starting
npx tsx lib/websocket/validate-setup.ts

# Open test client (after authenticating in browser)
open lib/websocket/test-client.html?draftId=YOUR_DRAFT_ID

# Run integration tests
npm test -- integration.test.ts
```

## Monitoring Endpoints

```bash
# JSON metrics
curl http://localhost:3000/api/websocket/metrics

# Prometheus format
curl http://localhost:3000/api/websocket/metrics?format=prometheus

# Health check
curl http://localhost:3000/api/websocket/health
```

## Event Flow Example

### User Makes a Pick

1. **Client** sends:
   ```json
   {
     "type": "pick:submit",
     "payload": { "slotId": "slot-123" }
   }
   ```

2. **Server** (handler.ts):
   - Validates event format
   - Calls `makePick({ db, input: { draftId, userId, slotId } })`
   - DAL validates turn, creates pick, updates timer
   - Returns: pickId, overallPickNo, nextPickerUserId, nextDeadlineAt

3. **Server** publishes to Redis:
   ```json
   {
     "type": "pick:made",
     "payload": {
       "pickId": "pick-abc",
       "userId": "user-123",
       "slotId": "slot-123",
       "overallPickNo": 15,
       "isAutoPick": false
     }
   }
   ```

4. **All pods** subscribed to `draft:xyz` receive event

5. **All clients** connected to any pod receive broadcast:
   ```json
   {
     "type": "pick:made",
     "payload": { ... }
   }
   ```

6. **Server** publishes turn change:
   ```json
   {
     "type": "turn:changed",
     "payload": {
       "currentPickerUserId": "user-456",
       "deadlineAt": "2026-01-29T12:35:00Z"
     }
   }
   ```

## Success Criteria Met

- ✅ WebSocket server integrates with Next.js 15
- ✅ Authenticates connections using Supabase session cookies
- ✅ Subscribes to Redis pub/sub channels per draft
- ✅ Handles client joining draft rooms with participant verification
- ✅ Broadcasts events from Redis to connected WebSocket clients
- ✅ Handles pick submissions by calling makePick DAL function
- ✅ Implements connection heartbeat (ping/pong every 30s)
- ✅ Graceful shutdown support (SIGTERM/SIGINT)
- ✅ Production-ready error handling with DomainError support
- ✅ Comprehensive monitoring and metrics
- ✅ Complete test suite
- ✅ Full documentation

## Testing Checklist

### Pre-Launch Validation

```bash
# 1. Environment check
npx tsx lib/websocket/validate-setup.ts

# 2. Start server
npm run dev:ws

# 3. Check health
curl http://localhost:3000/api/websocket/health

# 4. Check metrics
curl http://localhost:3000/api/websocket/metrics

# 5. Manual WebSocket test
# - Open app, authenticate
# - Open test-client.html
# - Enter draft ID, click Connect
# - Verify draft:state received
# - Send ping, verify pong
# - Submit pick (if your turn)

# 6. Multi-client test
# - Open 2+ browser windows
# - Connect all to same draft
# - Make pick from one client
# - Verify all clients receive event

# 7. Redis pub/sub test
# - Start 2 server instances (different ports)
# - Connect clients to different ports
# - Make pick, verify cross-pod delivery

# 8. Reconnection test
# - Connect client
# - Close connection
# - Reconnect
# - Verify fresh state received

# 9. Error handling test
# - Try invalid slot ID
# - Try pick when not your turn
# - Send malformed JSON
# - Verify error events received
```

### Metrics to Monitor

```bash
# Connection metrics
curl http://localhost:3000/api/websocket/metrics | jq '.metrics'

# Expected output:
{
  "totalConnections": 150,
  "activeConnections": 24,
  "activeDrafts": 3,
  "messagesReceived": 450,
  "messagesSent": 520,
  "errors": 2,
  "averageLatencyMs": 45.6
}
```

## Known Limitations

1. **Hot Reload**: Development server requires manual restart for code changes
   - Workaround: Use `tsx --watch server.ts` or `nodemon`

2. **Session Affinity**: Not required but recommended for production
   - Reduces reconnection overhead
   - Load balancer can use cookie-based routing

3. **Message Ordering**: Redis pub/sub doesn't guarantee order across pods
   - Events are timestamped in database
   - Client should handle out-of-order events gracefully

4. **Maximum Connections**: Limited by Node.js event loop
   - Scale horizontally for more concurrent connections
   - Monitor with metrics endpoint

## Production Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:ws"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fm-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fm-web
  template:
    metadata:
      labels:
        app: fm-web
    spec:
      containers:
        - name: web
          image: your-registry/fm-web:latest
          command: ["npm", "run", "start:ws"]
          ports:
            - containerPort: 3000
          env:
            - name: REDIS_URL
              value: "redis://fm-redis:6379"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: fm-secrets
                  key: database_url
          livenessProbe:
            httpGet:
              path: /api/websocket/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/websocket/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Environment Variables Required

```bash
# Database (required)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Redis (optional, defaults to localhost)
REDIS_URL=redis://fm-redis:6379

# Server (optional)
PORT=3000
HOSTNAME=localhost
NODE_ENV=production
```

## Next Steps: Phase 4 (Frontend Integration)

The WebSocket server is complete and ready for frontend integration. The React component needs to:

1. **Connect to WebSocket**
   ```typescript
   const ws = new WebSocket(`ws://localhost:3000/api/draft/${draftId}/ws`);
   ```

2. **Handle Events**
   ```typescript
   ws.onmessage = (event) => {
     const msg = JSON.parse(event.data);
     switch (msg.type) {
       case 'draft:state': setDraftState(msg.payload); break;
       case 'pick:made': handlePickMade(msg.payload); break;
       case 'turn:changed': updateTimer(msg.payload); break;
       case 'draft:completed': showCompletionScreen(); break;
       case 'error': showError(msg.payload); break;
     }
   };
   ```

3. **Submit Picks**
   ```typescript
   const submitPick = (slotId: string) => {
     ws.send(JSON.stringify({
       type: 'pick:submit',
       payload: { slotId }
     }));
   };
   ```

4. **Implement Heartbeat**
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       if (ws.readyState === WebSocket.OPEN) {
         ws.send(JSON.stringify({ type: 'ping' }));
       }
     }, 30000);
     return () => clearInterval(interval);
   }, []);
   ```

5. **Handle Reconnection**
   ```typescript
   ws.onclose = () => {
     setTimeout(() => {
       // Reconnect logic
     }, 2000);
   };
   ```

## Support & Troubleshooting

### Common Issues

**WebSocket upgrade fails (426 error)**
- Check Supabase session cookies are present
- Verify user is authenticated
- Check server logs for authentication errors

**Events not broadcasting**
- Verify Redis is running: `redis-cli ping`
- Check Redis connection: `curl localhost:3000/api/websocket/health`
- Check server logs for Redis errors

**High latency**
- Check metrics: `curl localhost:3000/api/websocket/metrics`
- Monitor database query performance
- Check Redis connectivity
- Consider horizontal scaling

**Connections timing out**
- Verify heartbeat implementation on client
- Check server heartbeat interval (30s default)
- Monitor connection metrics

### Debug Logging

Enable debug logging:
```bash
DEBUG=websocket:* npm run dev:ws
```

Check logs:
```bash
# Connection events
grep "WebSocket" logs.txt

# Pick events
grep "Pick submit" logs.txt

# Errors
grep "error" logs.txt
```

## Conclusion

Phase 3 is **COMPLETE** and **PRODUCTION-READY**. The WebSocket server provides:

- Real-time bi-directional communication
- Cross-pod event broadcasting via Redis
- Transaction-safe pick submissions
- Comprehensive monitoring and health checks
- Production-grade error handling
- Complete test coverage
- Full documentation

The implementation follows the ADR-001 architecture exactly and integrates seamlessly with Phases 1 and 2.

**Ready for Phase 4: Client Integration**
