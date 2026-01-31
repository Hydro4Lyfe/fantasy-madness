# Draft Room WebSocket Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ DraftRoomPage (Server Component)                            │
│ /apps/web/app/(app)/drafts/[draftId]/room/page.tsx         │
│                                                              │
│ - Fetches initial state via getDraftRoomState()            │
│ - Authenticates user via requireUserId()                    │
│ - Passes initial state to client component                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ initialState, currentUserId
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ DraftRoom (Client Component)                                │
│ /apps/web/components/features/drafts/DraftRoom.tsx         │
│                                                              │
│ - Uses useDraftWebSocket hook                               │
│ - Manages countdown timer                                   │
│ - Handles pick submission                                   │
│ - Renders UI with real-time updates                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ uses
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ useDraftWebSocket (Custom Hook)                             │
│ /apps/web/hooks/useDraftWebSocket.ts                        │
│                                                              │
│ - Manages WebSocket connection lifecycle                    │
│ - Sends heartbeat pings                                     │
│ - Handles auto-reconnection                                 │
│ - Processes server events                                   │
│ - Returns state and actions                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ WebSocket connection
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ WebSocket API Route (Custom Server Required)                │
│ /apps/web/app/api/draft/[draftId]/ws/route.ts              │
│                                                              │
│ Note: Requires custom Next.js server to handle upgrade      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ upgrade request
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ WebSocket Server                                             │
│ /apps/web/lib/websocket/server.ts                          │
│                                                              │
│ - Handles WebSocket upgrade requests                        │
│ - Creates WebSocketServer instance                          │
│ - Manages heartbeat detection                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ creates handler
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ DraftWebSocketHandler                                        │
│ /apps/web/lib/websocket/handler.ts                         │
│                                                              │
│ - Validates user is participant                             │
│ - Subscribes to Redis channel                               │
│ - Sends initial draft:state                                 │
│ - Handles client messages (pick:submit, ping)               │
│ - Broadcasts events via Redis pub/sub                       │
└──────────┬────────────────────────────┬─────────────────────┘
           │                            │
           │ publishes                  │ subscribes
           ▼                            ▼
┌──────────────────────┐     ┌─────────────────────────────┐
│ Redis Pub/Sub        │     │ PostgreSQL                  │
│                      │     │                             │
│ Channel:             │     │ - Draft                     │
│ draft:{draftId}      │     │ - DraftParticipant          │
│                      │     │ - DraftPick                 │
│ - Broadcasts events  │     │ - DraftTurnTimer            │
│   to all clients     │     │ - BracketSlot               │
│   in same draft      │     │                             │
└──────────────────────┘     └─────────────────────────────┘
```

## Data Flow: Making a Pick

```
1. User clicks pick button
   │
   ▼
2. DraftRoom calls handlePick(slotId)
   │
   ▼
3. submitPick(slotId) sends pick:submit event via WebSocket
   │
   ▼
4. DraftWebSocketHandler receives message
   │
   ▼
5. makePick() DAL function (in transaction):
   - Validates turn and slot availability
   - Creates DraftPick record
   - Updates DraftTurnTimer
   - Returns pick result
   │
   ▼
6. Handler broadcasts events via Redis:
   - pick:made (pick details)
   - draft:state (full updated state)
   - turn:changed (next picker + deadline)
   - draft:completed (if applicable)
   │
   ▼
7. All connected clients receive events
   │
   ▼
8. useDraftWebSocket processes events:
   - Updates local state
   - Triggers React re-render
   │
   ▼
9. DraftRoom updates UI:
   - New pick appears in participant's list
   - Available slots updated
   - Current picker changes
   - Timer resets for next turn
```

## State Management Flow

```
Initial State (Server-Side)
─────────────────────────────
getDraftRoomState()
  │
  ├─ Fetches draft details
  ├─ Fetches participants with picks
  ├─ Fetches available slots
  ├─ Calculates current picker
  └─ Returns DraftRoomStateDTO
      │
      └─→ Passed as initialState to DraftRoom

Real-Time Updates (Client-Side)
────────────────────────────────
useDraftWebSocket({initialState})
  │
  ├─ state = initialState (on mount)
  │
  ├─ WebSocket connects
  │   └─→ Receives draft:state event
  │       └─→ state = event.payload
  │
  ├─ Pick is made
  │   └─→ Receives draft:state event
  │       └─→ state = event.payload (includes new pick)
  │
  ├─ Turn changes
  │   └─→ Receives turn:changed event
  │       └─→ state = { ...state, currentPickerUserId, timerDeadlineAt }
  │
  └─ Draft completes
      └─→ Receives draft:completed event
          └─→ state = { ...state, status: "COMPLETE" }

Rendering (React)
─────────────────
DraftRoom component
  │
  ├─ state = wsState ?? initialState
  │   (use WebSocket state if available, otherwise initial)
  │
  ├─ Derives UI state:
  │   ├─ isMyTurn = state.currentPickerUserId === currentUserId
  │   ├─ currentPicker = find participant by currentPickerUserId
  │   ├─ progressPercent = totalPicks / totalExpectedPicks
  │   └─ countdown = calculate from timerDeadlineAt
  │
  └─ Renders:
      ├─ Header (status, connection, progress)
      ├─ Current picker + timer
      ├─ Available slots (interactive if your turn)
      └─ Participants with their picks
```

## Event Types & Payloads

### Server → Client

**draft:state**
```typescript
{
  type: "draft:state",
  payload: DraftRoomStateDTO // Full state
}
```

**pick:made**
```typescript
{
  type: "pick:made",
  payload: {
    pickId: string,
    userId: string,
    slotId: string,
    overallPickNo: number,
    isAutoPick: boolean
  }
}
```

**turn:changed**
```typescript
{
  type: "turn:changed",
  payload: {
    currentPickerUserId: string,
    deadlineAt: string | null // ISO timestamp
  }
}
```

**draft:completed**
```typescript
{
  type: "draft:completed",
  payload: {}
}
```

**error**
```typescript
{
  type: "error",
  payload: {
    message: string,
    code?: string
  }
}
```

**pong**
```typescript
{
  type: "pong",
  payload: {}
}
```

### Client → Server

**pick:submit**
```typescript
{
  type: "pick:submit",
  payload: {
    slotId: string
  }
}
```

**ping**
```typescript
{
  type: "ping",
  payload?: {}
}
```

## Connection States

```
┌─────────────┐
│ INITIAL     │
│ (unmounted) │
└──────┬──────┘
       │ Component mounts
       ▼
┌─────────────┐
│ CONNECTING  │ ◄──────────────┐
└──────┬──────┘                │
       │ onopen                │
       ▼                       │ Auto-reconnect
┌─────────────┐                │ (max 5 attempts)
│ CONNECTED   │                │
│ (sending    │                │
│  pings)     │                │
└──────┬──────┘                │
       │ onclose/onerror       │
       ▼                       │
┌─────────────┐                │
│ DISCONNECTED│ ───────────────┘
└──────┬──────┘
       │ Max attempts exceeded
       ▼
┌─────────────┐
│ ERROR       │
│ (show       │
│  reconnect  │
│  button)    │
└─────────────┘
```

## Scalability Considerations

### Horizontal Scaling (Multiple Pods)

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│ Web Pod 1  │     │ Web Pod 2  │     │ Web Pod N  │
│ + WS       │     │ + WS       │     │ + WS       │
│            │     │            │     │            │
│ Client A ──┼─┐   │ Client B ──┼─┐   │ Client C ──┼─┐
│ Client D ──┼─┤   │            │ │   │            │ │
└────────────┘ │   └────────────┘ │   └────────────┘ │
               │                  │                  │
               └──────────┬───────┴──────────────────┘
                          │ All publish/subscribe
                          ▼
                   ┌─────────────┐
                   │    Redis    │
                   │  Pub/Sub    │
                   │             │
                   │ Channel:    │
                   │ draft:123   │
                   └──────┬──────┘
                          │
                          │ All pods receive events
                          │ broadcast to their clients
                          ▼
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │ (Source of  │
                   │  Truth)     │
                   └─────────────┘
```

**Why Redis?**
- Enables cross-pod event broadcasting
- Low-latency pub/sub (<5ms typical)
- Stateless pods (no in-memory coordination needed)
- Horizontal scaling friendly

**Alternative**: If using sticky sessions, could use in-memory Map. But Redis is better for K8s.

## Performance Optimizations

1. **Batched State Updates**: React batches multiple setState calls
2. **Memoized Callbacks**: useCallback prevents unnecessary re-renders
3. **Local Timer**: Countdown calculated locally, not via WebSocket polling
4. **Heartbeat Tuning**: 25-second interval balances liveness vs. traffic
5. **Lazy Reconnection**: Exponential backoff could be added for high-load scenarios

## Security

1. **Authentication**: User validated on WebSocket upgrade
2. **Authorization**: Participant check before allowing connection
3. **Validation**: Server validates all pick submissions
4. **Rate Limiting**: (TODO) Could add per-user rate limits
5. **Input Sanitization**: slotId validated before database query
