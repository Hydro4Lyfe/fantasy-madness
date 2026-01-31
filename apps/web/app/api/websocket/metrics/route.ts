import { NextResponse } from 'next/server';
import { getWebSocketMonitor, getPrometheusMetrics } from '@/lib/websocket/monitoring';

/**
 * GET /api/websocket/metrics
 *
 * Returns WebSocket metrics in JSON or Prometheus format
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const monitor = getWebSocketMonitor();

  if (format === 'prometheus') {
    return new Response(getPrometheusMetrics(), {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  }

  // JSON format
  const metrics = monitor.getMetrics();
  const connectionDetails = monitor.getConnectionDetails();

  return NextResponse.json({
    metrics: {
      totalConnections: metrics.totalConnections,
      activeConnections: metrics.activeConnections,
      activeDrafts: metrics.connectionsByDraft.size,
      messagesReceived: metrics.messagesReceived,
      messagesSent: metrics.messagesSent,
      errors: metrics.errors,
      averageLatencyMs: Math.round(metrics.averageLatency * 100) / 100,
    },
    connections: connectionDetails,
    timestamp: new Date().toISOString(),
  });
}
