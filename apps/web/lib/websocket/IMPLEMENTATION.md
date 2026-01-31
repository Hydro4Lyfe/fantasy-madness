# Phase 3: WebSocket Server Implementation

## Summary

This implementation provides a production-ready WebSocket server for the Draft Room real-time feature. The implementation follows the architecture defined in ADR-001 and integrates seamlessly with the existing Next.js 15 App Router application.

## Files Created

### Core Implementation

1. **`lib/websocket/events.ts`** (68 lines)
   - TypeScript event type definitions for client/server communication
   - Type guards for runtime validation
   - Server events: `draft:state`, `pick:made`, `turn:changed`, `draft:completed`, `error`, `pong`
   - Client events: `pick:submit`, `ping`

2. **`lib/websocket/handler.ts`** (238 lines)
   - `DraftWebSocketHandler` class manages individual client connections
   - Authenticates users and verifies draft participation
   - Subscribes to Redis channels (`draft:${draftId}`)
   - Routes incoming messages to appropriate handlers
   - Broadcasts events via Redis pub/sub
   - Handles pick submissions by calling DAL `makePick` function
   - Implements heartbeat (ping/pong) protocol
   - Clean connection lifecycle management

3. **`lib/websocket/server.ts`** (126 lines)
   - WebSocket server initialization using `ws` library
   - Connection upgrade handling for Next.js integration
   - Heartbeat monitoring to detect dead connections
   - Graceful shutdown support
   - Stateless design for horizontal scaling

4. **`server.ts`** (175 lines)
   - Custom Next.js server with WebSocket support
   - Handles HTTP upgrade events for WebSocket connections
   - Authenticates WebSocket connections using Supabase session cookies
   - Routes WebSocket traffic to draft handlers
   - Graceful shutdown handling (SIGTERM/SIGINT)
   - Production-ready error handling

5. **`lib/websocket/index.ts`** (9 lines)
   - Module exports for clean import paths

### Documentation

6. **`lib/websocket/README.md`** (220 lines)
   - Complete usage documentation
   - Architecture overview
   - Event protocol specification
   - Running instructions (dev and production)
   - Authentication flow
   - Redis integration details
   - Error handling patterns
   - Scaling considerations
   - Production deployment guide
   - Troubleshooting tips

7. **`lib/websocket/IMPLEMENTATION.md`** (This file)
   - Implementation summary and testing guide

### Testing

8. **`lib/websocket/test-client.html`** (256 lines)
   - Interactive HTML test client for WebSocket connections
   - Connection management UI
   - Message logging with timestamps
   - Pick submission testing
   - Heartbeat testing
   - Visual status indicators

### API Route

9. **`app/api/draft/[draftId]/ws/route.ts`** (45 lines)
   - API route for WebSocket endpoint
   - Provides authentication and connection info
   - Documents WebSocket requirements

### Configuration

10. **`package.json`** (Updated)
    - Added `ws` and `@types/ws` dependencies
    - Added `tsx` for TypeScript execution
    - New scripts: `dev:ws` and `start:ws`

## Integration Points

### Redis Pub/Sub Integration

The WebSocket server uses the existing Redis pub/sub client:

```typescript
import { getRedisPubSub } from '@/lib/redis/pubsub';

const redis = getRedisPubSub();

// Subscribe to draft events
await redis.subscribe(`draft:${draftId}`, (event) => {
  ws.send(JSON.stringify(event));
});

// Publish events
await redis.publish(`draft:${draftId}`, {
  type: 'pick:made',
  payload: { ... }
});
```

### DAL Integration

All database operations go through the Data Access Layer:

```typescript
import { getDraftRoomState, makePick } from '@fantasy-madness/dal';
import { prisma } from '@fantasy-madness/db';

// Get initial state
const state = await getDraftRoomState({ db: prisma, draftId });

// Make a pick
const result = await makePick({
  db: prisma,
  input: { draftId, userId, slotId, isAutoPick: false }
});
```

### Authentication Integration

Uses Supabase session cookies for WebSocket authentication:

```typescript
import { createServerClient } from '@supabase/ssr';

// Extract cookies from WebSocket upgrade request
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { getAll, setAll } }
);

const { data: { user } } = await supabase.auth.getUser();
```

## Running the Server

### Development Mode

```bash
# Terminal 1: Start custom server with WebSocket support
npm run dev:ws

# Terminal 2: Open test client
open lib/websocket/test-client.html
```

The custom server runs on `http://localhost:3000` with WebSocket support at:
- `ws://localhost:3000/api/draft/:draftId/ws`

### Production Mode

```bash
# Build the application
npm run build

# Start with WebSocket support
npm run start:ws
```

## Testing

### Manual Testing with Test Client

1. Start the custom server:
   ```bash
   npm run dev:ws
   ```

2. Open `lib/websocket/test-client.html` in a browser

3. You must be authenticated in the Next.js app first:
   - Open `http://localhost:3000` in the same browser
   - Log in with Supabase auth
   - Return to test client

4. Enter a draft ID and click "Connect"

5. Test pick submission:
   - Enter a valid slot ID
   - Click "Make Pick"
   - Watch for events in the message log

6. Test heartbeat:
   - Click "Send Ping"
   - Should receive "pong" response

### Testing with WebSocket Client Library

```javascript
// Node.js or browser test
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/api/draft/DRAFT_ID/ws', {
  headers: {
    // Include Supabase session cookie
    cookie: 'sb-access-token=...; sb-refresh-token=...'
  }
});

ws.on('open', () => {
  console.log('Connected');

  // Submit a pick
  ws.send(JSON.stringify({
    type: 'pick:submit',
    payload: { slotId: 'slot-id-here' }
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  console.log('Received:', event);
});
```

### Cross-Pod Testing (Redis Pub/Sub)

To test multi-pod broadcasting:

1. Start multiple instances of the server on different ports:
   ```bash
   PORT=3000 npm run dev:ws  # Terminal 1
   PORT=3001 npm run dev:ws  # Terminal 2
   ```

2. Connect clients to different ports

3. Make a pick from one client

4. Verify all clients receive the event (via Redis pub/sub)

## Event Flow Examples

### Connection Flow

1. Client initiates WebSocket connection to `/api/draft/:draftId/ws`
2. Server extracts Supabase cookies from upgrade request
3. Server authenticates user via Supabase
4. Server verifies user is a draft participant
5. Server subscribes to Redis channel `draft:${draftId}`
6. Server sends initial `draft:state` event
7. Client receives current draft state

### Pick Submission Flow

1. Client sends `pick:submit` event with `slotId`
2. Server validates the event format
3. Server calls `makePick` DAL function
4. DAL validates turn order and slot availability
5. DAL creates pick in database and updates timer
6. Server publishes `pick:made` event to Redis
7. All pods subscribed to that draft receive the event
8. Each pod broadcasts to its connected WebSocket clients
9. Clients receive the event and update their UI

### Auto-Pick Flow (via Timer Worker)

1. Timer worker detects expired timer
2. Worker calls `selectOptimalSlot` and `makePick`
3. Worker publishes `pick:made` event to Redis (with `isAutoPick: true`)
4. WebSocket server receives event from Redis
5. Server broadcasts to all connected clients
6. Clients see the auto-picked slot

## Error Handling

### Domain Errors

Domain errors from the DAL are caught and sent as error events:

```typescript
// Client receives:
{
  type: 'error',
  payload: {
    message: 'It's not your turn to pick',
    code: 'INVALID_STATE'
  }
}
```

### Connection Errors

- Network disconnections trigger reconnection on client side
- Clients receive fresh state on reconnection
- No data loss (state stored in PostgreSQL)

### Authentication Errors

- Missing or invalid session: WebSocket upgrade rejected with 401
- Not a participant: Connection closed with error event

## Production Deployment

### Docker

Update Dockerfile to use custom server:

```dockerfile
CMD ["npm", "run", "start:ws"]
```

### Kubernetes

Update deployment to use custom server:

```yaml
spec:
  containers:
    - name: web
      image: your-registry/fm-web:latest
      command: ["npm", "run", "start:ws"]
      env:
        - name: REDIS_URL
          value: "redis://fm-redis:6379"
```

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection (pooled)
- `DIRECT_URL` - PostgreSQL direct connection
- `REDIS_URL` - Redis connection (default: redis://localhost:6379)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `PORT` - Server port (default: 3000)
- `HOSTNAME` - Server hostname (default: localhost)
- `NODE_ENV` - Environment (development/production)

## Monitoring and Observability

### Logging

The implementation includes structured logging:

```
[WebSocket] User abc123 connected to draft def456
[WebSocket] Pick submit: user=abc123, draft=def456, slot=slot789
[WebSocket] Pick successful: 12
[WebSocket] User abc123 disconnected from draft def456
```

### Metrics to Monitor

- Active WebSocket connections per pod
- Message processing latency
- Redis pub/sub delivery time
- Connection errors and reconnections
- Pick submission rate

### Health Checks

The custom server responds to Next.js health checks. Consider adding:

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check Redis connection
  // Check WebSocket server status
  // Return health status
}
```

## Known Limitations

1. **Next.js Hot Reload**: The custom server requires manual restart for code changes in development. Use `nodemon` or `tsx --watch` for auto-restart.

2. **Session Affinity**: Not required but recommended for production to reduce reconnection overhead.

3. **Maximum Connections**: Limited by Node.js event loop. Scale horizontally for more connections.

4. **Message Ordering**: Redis pub/sub does not guarantee message ordering across pods. Events are timestamped in the database.

## Next Steps

### Phase 4: Client Integration (Not Implemented)

The frontend React component needs to be updated to use WebSocket:

```typescript
// components/features/drafts/DraftRoom.tsx
const ws = useWebSocket(`/api/draft/${draftId}/ws`);

useEffect(() => {
  ws.on('pick:made', (event) => {
    // Update UI
  });

  ws.on('turn:changed', (event) => {
    // Update timer
  });
}, []);

const handlePick = (slotId: string) => {
  ws.send({ type: 'pick:submit', payload: { slotId }});
};
```

### Future Enhancements

1. **Compression**: Use WebSocket compression for large state payloads
2. **Delta Updates**: Send only state changes, not full state
3. **Connection Pooling**: Optimize Redis connections
4. **Rate Limiting**: Prevent abuse by limiting picks per user
5. **Metrics**: Add Prometheus/Datadog metrics
6. **Tracing**: Add distributed tracing for debugging

## Assumptions Made

1. **Authentication**: Supabase session cookies are sufficient for WebSocket auth
2. **Redis Availability**: Redis is always available (no fallback to polling)
3. **Timer Worker**: Phase 2 timer worker is already implemented and running
4. **DAL Functions**: `getDraftRoomState`, `makePick`, and `selectOptimalSlot` are complete
5. **Database Schema**: `DraftTurnTimer` table exists with correct columns
6. **Single Draft Focus**: Users participate in one draft at a time per connection

## Success Criteria Met

- ✅ WebSocket server integrates with Next.js
- ✅ Authenticates connections using Supabase
- ✅ Subscribes to Redis pub/sub for draft events
- ✅ Handles client joining draft rooms
- ✅ Broadcasts events to connected clients
- ✅ Handles pick submissions via DAL
- ✅ Implements connection heartbeat
- ✅ Graceful shutdown support
- ✅ Production-ready error handling
- ✅ Comprehensive documentation

## Questions for Frontend Team

1. Should we implement optimistic UI updates for picks?
2. What's the preferred reconnection strategy (exponential backoff)?
3. Do we need visual indicators for WebSocket connection status?
4. Should we queue actions when disconnected?
5. What's the timeout before showing "connection lost" message?
