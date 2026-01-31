import type { WebSocket } from 'ws';

/**
 * Minimal WebSocket handler for debugging
 * No database, no Redis, just echo messages back
 */
export function handleTestWebSocket(ws: WebSocket, userId: string): void {
  console.log(`[WS Test] Connection opened for user ${userId}`);
  console.log(`[WS Test] readyState: ${ws.readyState}`);

  // Send welcome message immediately
  try {
    ws.send(JSON.stringify({ type: 'welcome', userId, timestamp: Date.now() }));
    console.log(`[WS Test] Welcome message sent`);
  } catch (err) {
    console.error(`[WS Test] Failed to send welcome:`, err);
  }

  // Echo all messages back
  ws.on('message', (data) => {
    console.log(`[WS Test] Received message: ${data}`);
    try {
      ws.send(JSON.stringify({ type: 'echo', original: String(data), timestamp: Date.now() }));
      console.log(`[WS Test] Echo sent`);
    } catch (err) {
      console.error(`[WS Test] Failed to send echo:`, err);
    }
  });

  // Log close with details
  ws.on('close', (code, reason) => {
    console.log(`[WS Test] Connection closed: code=${code}, reason=${String(reason || 'none')}`);
  });

  // Log errors
  ws.on('error', (err) => {
    console.error(`[WS Test] Error:`, err);
  });

  // Send periodic pings to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === 1) {
      console.log(`[WS Test] Sending ping, readyState: ${ws.readyState}`);
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    } else {
      console.log(`[WS Test] Skipping ping, readyState: ${ws.readyState}`);
      clearInterval(pingInterval);
    }
  }, 5000);

  ws.on('close', () => {
    clearInterval(pingInterval);
  });
}
