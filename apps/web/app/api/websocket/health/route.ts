import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/websocket/monitoring';
import { getRedisPubSub } from '@/lib/redis/pubsub';

/**
 * GET /api/websocket/health
 *
 * Health check endpoint for WebSocket server
 */
export async function GET() {
  try {
    // Check WebSocket metrics health
    const wsHealth = getHealthStatus();

    // Check Redis connectivity
    let redisHealthy = true;
    let redisError = null;

    try {
      const redis = getRedisPubSub();
      // Simple check - try to subscribe/unsubscribe
      const testChannel = `__health_check_${Date.now()}`;
      await redis.subscribe(testChannel, () => {});
      await redis.unsubscribe(testChannel, () => {});
    } catch (err) {
      redisHealthy = false;
      redisError = err instanceof Error ? err.message : String(err);
    }

    const isHealthy = wsHealth.healthy && redisHealthy;

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        websocket: {
          healthy: wsHealth.healthy,
          ...wsHealth.details,
        },
        redis: {
          healthy: redisHealthy,
          error: redisError,
        },
      },
    };

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
    });
  } catch (err) {
    console.error('[WebSocket Health] Health check failed:', err);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }
}
