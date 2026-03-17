#!/usr/bin/env node

/**
 * Custom Next.js Server with WebSocket Support
 *
 * This server wraps the Next.js app and adds WebSocket upgrade handling
 * for the draft room feature.
 *
 * Usage:
 *   Development: node server.ts
 *   Production: NODE_ENV=production node server.ts
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createServerClient } from '@supabase/ssr';
import {
  handleDraftWebSocketUpgrade,
  handleTestWebSocketUpgrade,
  isWebSocketUpgrade,
  closeWebSocketServer,
} from './lib/websocket/server';
import { startMetricsLogging } from './lib/websocket/monitoring';
import { validateSetup } from './lib/websocket/validate-setup';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * Authenticate WebSocket request using Supabase
 */
async function authenticateWebSocketRequest(
  url: string,
  headers: Record<string, string | string[] | undefined>
): Promise<string | null> {
  try {
    // Extract cookies from request headers
    const cookieHeader = headers.cookie;
    if (!cookieHeader) {
      console.log('[WebSocket Auth] No cookies found');
      return null;
    }

    // Parse cookies (handle both string and string[] cases)
    const cookies = new Map<string, string>();
    const cookieString = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
    if (cookieString) {
      cookieString.split(';').forEach((cookie: string) => {
        const [name, ...rest] = cookie.split('=');
        cookies.set(name.trim(), rest.join('=').trim());
      });
    }

    // Create Supabase client for authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return Array.from(cookies.entries()).map(([name, value]) => ({
              name,
              value,
            }));
          },
          setAll() {
            // No-op for WebSocket auth
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('[WebSocket Auth] User not authenticated');
      return null;
    }

    return user.id;
  } catch (err) {
    console.error('[WebSocket Auth] Authentication error:', err);
    return null;
  }
}

/**
 * Main server setup
 */
async function main() {
  // Validate setup before starting
  const validation = await validateSetup();
  if (!validation.success) {
    console.error('[Server] Setup validation failed. Cannot start server.');
    process.exit(1);
  }

  console.log('[Server] Preparing Next.js app...');
  await app.prepare();

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);

      // WebSocket upgrades are handled by the 'upgrade' event, not here
      // Just pass through to Next.js for non-WebSocket requests
      if (isWebSocketUpgrade(req)) {
        // Don't respond - the 'upgrade' event will handle this
        return;
      }

      // Handle all other requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[Server] Request handling error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Handle WebSocket upgrade events
  server.on('upgrade', async (request, socket, head) => {
    const { pathname } = parse(request.url || '', true);

    console.log(`[Server] Upgrade event for: ${pathname}`);

    // TEST ENDPOINT: /api/ws-test - minimal WebSocket for debugging
    if (pathname === '/api/ws-test') {
      try {
        const userId = await authenticateWebSocketRequest(
          request.url || '',
          request.headers as Record<string, string | string[] | undefined>
        );
        await handleTestWebSocketUpgrade(request, socket, head, userId || 'anonymous');
      } catch (err) {
        console.error('[Server] Test WebSocket upgrade error:', err);
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
      }
      return;
    }

    // DRAFT ENDPOINT
    if (pathname?.startsWith('/api/draft/') && pathname?.endsWith('/ws')) {
      try {
        const userId = await authenticateWebSocketRequest(
          request.url || '',
          request.headers as Record<string, string | string[] | undefined>
        );

        if (!userId) {
          console.log('[Server] WebSocket authentication failed');
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        await handleDraftWebSocketUpgrade(request, socket, head, userId);
      } catch (err) {
        console.error('[Server] WebSocket upgrade error:', err);
        socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
        socket.destroy();
      }
      return;
    }

    // Reject other upgrade requests (fallback)
    if (!pathname?.startsWith('/api/draft/') && pathname !== '/api/ws-test') {
      // Reject other upgrade requests
      console.log('[Server] Rejecting non-draft WebSocket upgrade');
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
    }
  });

  // Start listening
  server.listen(port, () => {
    console.log(`[Server] Ready on http://${hostname}:${port}`);
    console.log(`[Server] WebSocket support enabled for /api/draft/:draftId/ws`);

    // Start metrics logging (every minute)
    const metricsInterval = startMetricsLogging(60000);

    // Stop metrics on shutdown
    process.on('exit', () => {
      clearInterval(metricsInterval);
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] ${signal} received, shutting down gracefully...`);

    // Close WebSocket server
    await closeWebSocketServer();

    // Close HTTP server
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the server
main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
