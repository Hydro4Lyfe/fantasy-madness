import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { parse } from 'url';
import { DraftWebSocketHandler } from './handler';
import { handleTestWebSocket } from './test-handler';

/**
 * Global WebSocket server instance
 */
let wss: WebSocketServer | null = null;


/**
 * Get or create WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer {
  if (wss) return wss;

  wss = new WebSocketServer({
    noServer: true,
    clientTracking: true,
    perMessageDeflate: false, // Disable compression - can cause issues with some clients/proxies
  });

  console.log('[WebSocket Server] Initialized');

  // Set up heartbeat to detect dead connections
  const heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws: WebSocket & { isAlive?: boolean }) => {
      if (ws.isAlive === false) {
        console.log('[WebSocket Server] Terminating inactive connection');
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // Check every 30 seconds

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

/**
 * Handle WebSocket upgrade for draft rooms
 *
 * This function should be called from an API route or custom server
 * when handling WebSocket upgrade requests
 */
export async function handleDraftWebSocketUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  userId: string
): Promise<void> {
  const wss = getWebSocketServer();

  // Parse URL to extract draft ID
  const { pathname } = parse(request.url || '', true);
  const match = pathname?.match(/\/api\/draft\/([^\/]+)\/ws/);

  if (!match || !match[1]) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
    return;
  }

  const draftId = match[1];

  // Perform WebSocket upgrade
  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log(`[WebSocket Server] Upgrade successful for draft ${draftId}, user ${userId}`);

    // Set up heartbeat tracking
    (ws as WebSocket & { isAlive?: boolean }).isAlive = true;
    ws.on('pong', () => {
      (ws as WebSocket & { isAlive?: boolean }).isAlive = true;
    });

    // Use the proper draft handler
    const handler = new DraftWebSocketHandler();
    handler.handleConnection(ws, userId, draftId).catch((err) => {
      console.error('[WebSocket Server] Handler error:', err);
    });
  });
}

/**
 * Handle test WebSocket upgrade (minimal, no DB/Redis)
 * Used for debugging connection issues
 */
export async function handleTestWebSocketUpgrade(
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer,
  userId: string
): Promise<void> {
  const wss = getWebSocketServer();

  console.log(`[WS Test] Starting upgrade for user ${userId}`);

  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log(`[WS Test] Upgrade successful for user ${userId}`);
    handleTestWebSocket(ws, userId);
  });
}

/**
 * Check if request is a WebSocket upgrade request
 */
export function isWebSocketUpgrade(request: IncomingMessage): boolean {
  const upgrade = request.headers.upgrade?.toLowerCase();
  const connection = request.headers.connection?.toLowerCase();

  return (
    request.method === 'GET' &&
    upgrade === 'websocket' &&
    connection !== undefined &&
    connection.includes('upgrade')
  );
}

/**
 * Close all WebSocket connections (for graceful shutdown)
 */
export async function closeWebSocketServer(): Promise<void> {
  if (!wss) return;

  return new Promise((resolve, reject) => {
    console.log('[WebSocket Server] Closing all connections...');

    wss!.close((err) => {
      if (err) {
        console.error('[WebSocket Server] Error during close:', err);
        reject(err);
      } else {
        console.log('[WebSocket Server] Closed successfully');
        wss = null;
        resolve();
      }
    });
  });
}
