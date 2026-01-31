# WebSocket Server - Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites

Ensure you have:
- ✅ PostgreSQL running with migrations applied
- ✅ Redis running (or set `REDIS_URL`)
- ✅ Environment variables configured
- ✅ Phase 1 & 2 complete (database schema, timer worker)

```bash
# Check database
psql $DATABASE_URL -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'draft_turn_timers');"

# Check Redis
redis-cli ping

# Check environment
echo $DATABASE_URL
echo $REDIS_URL
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 2. Validate Setup

```bash
cd apps/web
npx tsx lib/websocket/validate-setup.ts
```

Expected output:
```
🔍 Validating WebSocket server setup...

✅ Environment: All required environment variables present
✅ Dependencies: All WebSocket dependencies installed
✅ Database: Database connection successful
✅ Redis: Redis pub/sub working correctly

✅ All validations passed! WebSocket server is ready to start.
```

### 3. Start Server

```bash
# Development mode
npm run dev:ws

# Server logs:
# [Server] Preparing Next.js app...
# [Server] Ready on http://localhost:3000
# [Server] WebSocket support enabled for /api/draft/:draftId/ws
# [WebSocket Monitor] Started metrics logging (interval: 60000ms)
```

### 4. Test Connection

Open browser to `http://localhost:3000` and authenticate.

Then open `apps/web/lib/websocket/test-client.html` in the same browser:

1. Enter a draft ID (must be in DRAFTING status)
2. Click "Connect"
3. See "Status: Connected" and receive `draft:state` event
4. Click "Send Ping" → should receive "pong"

### 5. Monitor

```bash
# Health check
curl http://localhost:3000/api/websocket/health | jq

# Metrics
curl http://localhost:3000/api/websocket/metrics | jq

# Watch logs
tail -f server.log | grep WebSocket
```

## Common Commands

```bash
# Start development server with WebSocket
npm run dev:ws

# Build for production
npm run build

# Start production server
npm run start:ws

# Validate setup
npx tsx lib/websocket/validate-setup.ts

# Check types
npm run typecheck

# Run tests (when configured)
npm test -- integration.test.ts
```

## Testing a Pick Submission

1. Start server: `npm run dev:ws`
2. Open app: `http://localhost:3000`
3. Create a draft or join existing one
4. Start the draft (must be host)
5. Open test client: `lib/websocket/test-client.html`
6. Connect to draft
7. When it's your turn:
   - Enter a slot ID (from available slots in state)
   - Click "Make Pick"
   - Watch for `pick:made` event
   - Watch for `turn:changed` event

## Troubleshooting

### "Connection failed (401)"
- Not authenticated in main app
- Solution: Open `http://localhost:3000`, log in, then try test client

### "Connection failed (403)"
- User is not a participant in the draft
- Solution: Join the draft first via app UI

### "Connection failed (404)"
- Draft ID doesn't exist
- Solution: Check draft ID is correct

### "Events not broadcasting"
- Redis not running
- Solution: Start Redis: `redis-server`

### "Database errors"
- Migrations not applied
- Solution: `npm run migrate:dev -w @fantasy-madness/db`

## Environment Variables

Minimal required `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/fantasy_madness?schema=public"
DIRECT_URL="postgresql://user:pass@localhost:5432/fantasy_madness?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Redis (optional, defaults to localhost)
REDIS_URL="redis://localhost:6379"

# Server (optional)
PORT=3000
HOSTNAME=localhost
```

## Next: Frontend Integration

The WebSocket server is ready. Now update your React component:

```typescript
// components/features/drafts/DraftRoom.tsx
'use client';

import { useEffect, useState } from 'react';

export function DraftRoom({ draftId, userId }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [state, setState] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket(
      `ws://localhost:3000/api/draft/${draftId}/ws`
    );

    websocket.onopen = () => {
      console.log('Connected to draft room');
    };

    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'draft:state') {
        setState(msg.payload);
      } else if (msg.type === 'pick:made') {
        // Refresh state or update optimistically
      } else if (msg.type === 'turn:changed') {
        // Update timer
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [draftId]);

  const handlePick = (slotId: string) => {
    if (!ws) return;

    ws.send(JSON.stringify({
      type: 'pick:submit',
      payload: { slotId }
    }));
  };

  // Render UI...
}
```

## Production Checklist

Before deploying to production:

- [ ] All validations pass
- [ ] Environment variables configured
- [ ] Redis is HA-configured (not single instance)
- [ ] Database has proper indexes
- [ ] Metrics endpoint accessible
- [ ] Health check endpoint accessible
- [ ] Load balancer configured (optional: sticky sessions)
- [ ] Monitoring/alerting configured
- [ ] Log aggregation configured
- [ ] Tested with multiple concurrent connections
- [ ] Tested cross-pod event delivery
- [ ] Tested reconnection scenarios
- [ ] Tested error handling

## Performance Benchmarks

Expected performance (single pod):

- **Connections**: 1000+ concurrent connections
- **Latency**: <50ms average message processing
- **Throughput**: 100+ picks/second
- **Memory**: ~200MB baseline + ~1KB per connection

Scale horizontally for more capacity.

## Need Help?

1. Check logs: `tail -f server.log`
2. Check health: `curl localhost:3000/api/websocket/health`
3. Check metrics: `curl localhost:3000/api/websocket/metrics`
4. Run validation: `npx tsx lib/websocket/validate-setup.ts`
5. Review `README.md` for detailed documentation
6. Review `IMPLEMENTATION.md` for architecture details
7. Review `PHASE3_COMPLETE.md` for complete summary
