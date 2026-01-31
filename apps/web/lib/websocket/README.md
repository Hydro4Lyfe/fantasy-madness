# WebSocket Implementation for Draft Rooms

This module implements real-time WebSocket communication for the draft room feature.

## Architecture

The WebSocket implementation consists of:

1. **Event Definitions** (`events.ts`) - TypeScript types for client/server messages
2. **Connection Handler** (`handler.ts`) - Manages WebSocket connections and message routing
3. **Server Setup** (`server.ts`) - WebSocket server initialization and upgrade handling
4. **Custom Server** (`/server.ts`) - Custom Next.js server with WebSocket support

## Event Protocol

### Server → Client Events

- `draft:state` - Full room state on connect/reconnect
- `pick:made` - Someone made a pick
- `turn:changed` - Next picker + deadline
- `draft:completed` - Draft finished
- `error` - Validation/system error
- `pong` - Heartbeat response

### Client → Server Events

- `pick:submit` - User submits pick
- `ping` - Heartbeat

## Running the WebSocket Server

### Development

```bash
npm run dev:ws
```

This starts the custom Next.js server with WebSocket support using tsx.

### Production

```bash
npm run build
npm run start:ws
```

## WebSocket Connection Flow

1. Client connects to `ws://localhost:3000/api/draft/:draftId/ws`
2. Server authenticates using Supabase session cookies
3. Server verifies user is a participant in the draft
4. Server subscribes to Redis channel `draft:${draftId}`
5. Server sends initial `draft:state` event
6. Server sets up message handlers for incoming events
7. Redis pub/sub broadcasts events to all connected clients

## Connection Authentication

WebSocket connections are authenticated using Supabase session cookies:

1. Client must have valid Supabase session (authenticated via Next.js auth)
2. Custom server extracts cookies from upgrade request headers
3. Server creates Supabase client and validates user session
4. If authentication fails, upgrade is rejected with 401

## Heartbeat / Ping-Pong

- Client sends `ping` event every 30 seconds
- Server responds with `pong` event
- Server terminates connections that miss heartbeat checks

## Redis Integration

The WebSocket server uses Redis pub/sub for cross-pod communication:

- Each draft has a channel: `draft:${draftId}`
- When a pick is made, the event is published to Redis
- All pods subscribed to that channel receive the event
- Each pod broadcasts the event to its connected WebSocket clients

## Error Handling

### Domain Errors

DAL functions throw `DomainError` instances with specific error codes:
- `UNAUTHORIZED` - User not authorized for action
- `NOT_FOUND` - Resource not found
- `INVALID_STATE` - Action not valid in current state
- `CONFLICT` - Resource conflict (e.g., slot already picked)

These are caught and sent to the client as error events.

### Connection Errors

- Network disconnections trigger client reconnection logic
- Reconnected clients receive fresh `draft:state` event
- No data loss - state is stored in PostgreSQL

## Scaling Considerations

The WebSocket implementation is designed for horizontal scaling:

1. **Stateless** - No in-memory state (all state in PostgreSQL)
2. **Redis Pub/Sub** - Cross-pod event broadcasting
3. **No Session Affinity Required** - Clients can connect to any pod
4. **Graceful Reconnection** - Clients can recover from pod restarts

## Testing

To test WebSocket connections:

```javascript
const ws = new WebSocket('ws://localhost:3000/api/draft/DRAFT_ID/ws');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Submit a pick
ws.send(JSON.stringify({
  type: 'pick:submit',
  payload: { slotId: 'SLOT_ID' }
}));

// Send heartbeat
ws.send(JSON.stringify({
  type: 'ping'
}));
```

## Production Deployment

For production, the custom server must be deployed instead of the default Next.js server:

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

Update the web deployment command:

```yaml
containers:
  - name: web
    image: your-registry/fm-web:latest
    command: ["npm", "run", "start:ws"]
    ports:
      - containerPort: 3000
    env:
      - name: REDIS_URL
        value: "redis://fm-redis:6379"
```

## Troubleshooting

### WebSocket upgrade fails

- Check that Supabase session cookies are being sent
- Verify user is authenticated in Next.js
- Check server logs for authentication errors

### Events not broadcasting

- Verify Redis is running and accessible
- Check Redis connection in server logs
- Ensure multiple pods can connect to Redis

### Connections timing out

- Check client heartbeat implementation
- Verify server heartbeat interval (30s default)
- Check for network issues or firewall rules

## Future Enhancements

- Connection pooling optimization
- Delta-based state updates (only send changes)
- Compression for large state payloads
- Rate limiting per user
- Connection metrics and monitoring
