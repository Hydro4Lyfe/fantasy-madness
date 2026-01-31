/**
 * WebSocket Monitoring and Metrics
 *
 * This module provides monitoring capabilities for WebSocket connections
 * and draft room activity.
 */

import { getWebSocketServer } from './server';
import type { WebSocket } from 'ws';

export interface WebSocketMetrics {
  totalConnections: number;
  activeConnections: number;
  connectionsByDraft: Map<string, number>;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
  averageLatency: number;
}

class WebSocketMonitor {
  private metrics: WebSocketMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    connectionsByDraft: new Map(),
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0,
    averageLatency: 0,
  };

  private latencySamples: number[] = [];
  private maxLatencySamples = 100;

  /**
   * Record a new connection
   */
  recordConnection(draftId: string): void {
    this.metrics.totalConnections++;
    this.metrics.activeConnections++;

    const currentCount = this.metrics.connectionsByDraft.get(draftId) || 0;
    this.metrics.connectionsByDraft.set(draftId, currentCount + 1);
  }

  /**
   * Record a disconnection
   */
  recordDisconnection(draftId: string): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);

    const currentCount = this.metrics.connectionsByDraft.get(draftId) || 0;
    const newCount = Math.max(0, currentCount - 1);

    if (newCount === 0) {
      this.metrics.connectionsByDraft.delete(draftId);
    } else {
      this.metrics.connectionsByDraft.set(draftId, newCount);
    }
  }

  /**
   * Record a message received
   */
  recordMessageReceived(): void {
    this.metrics.messagesReceived++;
  }

  /**
   * Record a message sent
   */
  recordMessageSent(): void {
    this.metrics.messagesSent++;
  }

  /**
   * Record an error
   */
  recordError(): void {
    this.metrics.errors++;
  }

  /**
   * Record message processing latency
   */
  recordLatency(latencyMs: number): void {
    this.latencySamples.push(latencyMs);

    // Keep only recent samples
    if (this.latencySamples.length > this.maxLatencySamples) {
      this.latencySamples.shift();
    }

    // Calculate average
    const sum = this.latencySamples.reduce((a, b) => a + b, 0);
    this.metrics.averageLatency = sum / this.latencySamples.length;
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebSocketMetrics {
    return {
      ...this.metrics,
      connectionsByDraft: new Map(this.metrics.connectionsByDraft),
    };
  }

  /**
   * Get active connection count from WebSocket server
   */
  getActiveConnectionsFromServer(): number {
    try {
      const wss = getWebSocketServer();
      return wss.clients.size;
    } catch {
      return 0;
    }
  }

  /**
   * Log metrics summary
   */
  logMetrics(): void {
    const metrics = this.getMetrics();
    const serverConnections = this.getActiveConnectionsFromServer();

    console.log('[WebSocket Metrics]', {
      totalConnections: metrics.totalConnections,
      activeConnections: metrics.activeConnections,
      serverConnections,
      activeDrafts: metrics.connectionsByDraft.size,
      messagesReceived: metrics.messagesReceived,
      messagesSent: metrics.messagesSent,
      errors: metrics.errors,
      averageLatencyMs: Math.round(metrics.averageLatency * 100) / 100,
    });
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      totalConnections: this.metrics.totalConnections, // Keep lifetime total
      activeConnections: this.getActiveConnectionsFromServer(),
      connectionsByDraft: new Map(),
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      averageLatency: 0,
    };
    this.latencySamples = [];
  }

  /**
   * Get connection details for debugging
   */
  getConnectionDetails(): {
    draftId: string;
    connections: number;
  }[] {
    return Array.from(this.metrics.connectionsByDraft.entries()).map(
      ([draftId, connections]) => ({
        draftId,
        connections,
      })
    );
  }
}

// Singleton instance
const monitor = new WebSocketMonitor();

/**
 * Get WebSocket monitor instance
 */
export function getWebSocketMonitor(): WebSocketMonitor {
  return monitor;
}

/**
 * Start periodic metrics logging
 */
export function startMetricsLogging(intervalMs: number = 60000): NodeJS.Timeout {
  const interval = setInterval(() => {
    monitor.logMetrics();
  }, intervalMs);

  console.log(`[WebSocket Monitor] Started metrics logging (interval: ${intervalMs}ms)`);

  return interval;
}

/**
 * Export metrics in Prometheus format
 */
export function getPrometheusMetrics(): string {
  const metrics = monitor.getMetrics();
  const lines: string[] = [];

  lines.push('# HELP websocket_connections_total Total WebSocket connections');
  lines.push('# TYPE websocket_connections_total counter');
  lines.push(`websocket_connections_total ${metrics.totalConnections}`);

  lines.push('# HELP websocket_connections_active Active WebSocket connections');
  lines.push('# TYPE websocket_connections_active gauge');
  lines.push(`websocket_connections_active ${metrics.activeConnections}`);

  lines.push('# HELP websocket_messages_received_total Total messages received');
  lines.push('# TYPE websocket_messages_received_total counter');
  lines.push(`websocket_messages_received_total ${metrics.messagesReceived}`);

  lines.push('# HELP websocket_messages_sent_total Total messages sent');
  lines.push('# TYPE websocket_messages_sent_total counter');
  lines.push(`websocket_messages_sent_total ${metrics.messagesSent}`);

  lines.push('# HELP websocket_errors_total Total WebSocket errors');
  lines.push('# TYPE websocket_errors_total counter');
  lines.push(`websocket_errors_total ${metrics.errors}`);

  lines.push('# HELP websocket_latency_average_ms Average message processing latency');
  lines.push('# TYPE websocket_latency_average_ms gauge');
  lines.push(`websocket_latency_average_ms ${metrics.averageLatency}`);

  lines.push('# HELP websocket_active_drafts Active draft rooms');
  lines.push('# TYPE websocket_active_drafts gauge');
  lines.push(`websocket_active_drafts ${metrics.connectionsByDraft.size}`);

  return lines.join('\n') + '\n';
}

/**
 * Health check for WebSocket server
 */
export function getHealthStatus(): {
  healthy: boolean;
  details: {
    activeConnections: number;
    activeDrafts: number;
    errors: number;
    averageLatency: number;
  };
} {
  const metrics = monitor.getMetrics();

  // Consider unhealthy if high error rate or high latency
  const errorRate = metrics.errors / Math.max(1, metrics.messagesReceived);
  const isHighErrorRate = errorRate > 0.1; // More than 10% errors
  const isHighLatency = metrics.averageLatency > 1000; // More than 1 second

  return {
    healthy: !isHighErrorRate && !isHighLatency,
    details: {
      activeConnections: metrics.activeConnections,
      activeDrafts: metrics.connectionsByDraft.size,
      errors: metrics.errors,
      averageLatency: metrics.averageLatency,
    },
  };
}
