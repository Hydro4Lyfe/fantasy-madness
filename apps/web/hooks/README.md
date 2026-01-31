# React Hooks

## useDraftWebSocket

A custom React hook for managing real-time WebSocket connections to draft rooms.

### Features

- Auto-connect on mount with authentication
- Auto-reconnect on disconnect (up to 5 attempts)
- Heartbeat ping/pong every 25 seconds
- Real-time state updates via Server-Sent Events
- Optimistic UI updates
- Connection state management
- Error handling with user feedback

### Usage

```tsx
import { useDraftWebSocket } from "@/hooks/useDraftWebSocket";

function DraftRoom({ initialState, currentUserId }) {
  const {
    state,              // Current draft state (DraftRoomStateDTO)
    connectionState,    // "connecting" | "connected" | "disconnected" | "error"
    error,              // Error message (if any)
    submitPick,         // Function to submit a pick
    reconnect,          // Manual reconnect function
  } = useDraftWebSocket({
    draftId: initialState.id,
    initialState,
    enabled: true,      // Optional: disable connection
  });

  // Use state for rendering
  const isMyTurn = state.currentPickerUserId === currentUserId;

  // Submit a pick
  const handlePick = (slotId: string) => {
    submitPick(slotId);
  };

  return (
    <div>
      {connectionState === "disconnected" && (
        <button onClick={reconnect}>Reconnect</button>
      )}
      {/* Rest of component */}
    </div>
  );
}
```

### Event Protocol

**Server → Client:**

- `draft:state` - Full room state on connect/reconnect or after significant changes
- `pick:made` - Notification that a pick was made (includes pick details)
- `turn:changed` - Current picker and timer deadline updated
- `draft:completed` - Draft has finished
- `error` - Validation or system error
- `pong` - Heartbeat response

**Client → Server:**

- `pick:submit` - Submit a pick for the current turn
- `ping` - Heartbeat to maintain connection

### Connection Lifecycle

1. **Mount**: Hook connects to WebSocket at `/api/draft/{draftId}/ws`
2. **Connected**: Server sends initial `draft:state` event
3. **Heartbeat**: Client sends `ping` every 25 seconds, server responds with `pong`
4. **Updates**: Server broadcasts events to all connected clients via Redis pub/sub
5. **Disconnect**: On disconnect, hook attempts to reconnect up to 5 times with 3-second delays
6. **Unmount**: Connection is closed gracefully

### Error Handling

The hook handles the following error scenarios:

- **Connection errors**: Sets `connectionState` to "error" and provides error message
- **Server errors**: Displays error from `error` event payload
- **Reconnection failures**: After 5 failed attempts, prompts user to refresh page
- **Invalid messages**: Logs to console, doesn't crash component

### Performance Considerations

- State updates are batched via React's state setter
- Timer countdown runs locally (no server polling)
- WebSocket messages are JSON-parsed once per message
- Heartbeat interval (25s) is longer than typical server timeout (30s)

### Testing

To test the hook in isolation:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useDraftWebSocket } from '@/hooks/useDraftWebSocket';

test('connects and receives initial state', async () => {
  const { result } = renderHook(() => useDraftWebSocket({
    draftId: 'test-draft-id',
    initialState: mockDraftState,
  }));

  await waitFor(() => {
    expect(result.current.connectionState).toBe('connected');
  });
});
```

### Implementation Notes

- Uses native browser WebSocket API
- Handles both `ws://` (dev) and `wss://` (production) protocols automatically
- Connection state is tracked via refs to avoid unnecessary re-renders
- All event handlers are memoized with `useCallback` for stable references
