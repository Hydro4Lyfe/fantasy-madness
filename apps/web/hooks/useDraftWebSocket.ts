"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { parseDeadlineMs } from "@/lib/date";
import type { DraftRoomStateDTO } from "@/server/dal";
import type { ServerEvent, ClientEvent } from "@/lib/websocket/events";

export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

export type QueueState = {
  slotIds: string[];
  autoPickEnabled: boolean;
};

export interface UseDraftWebSocketReturn {
  state: DraftRoomStateDTO | null;
  connectionState: ConnectionState;
  error: string | null;
  submitPick: (slotId: string) => void;
  updateQueue: (queue: QueueState) => void;
  savedQueue: QueueState | null;
  reconnect: () => void;
}

interface UseDraftWebSocketOptions {
  draftId: string;
  initialState: DraftRoomStateDTO;
  enabled?: boolean;
}

const WS_PING_INTERVAL = 25000;
const WS_RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Hook for managing WebSocket connection to draft room
 */
export function useDraftWebSocket({
  draftId,
  initialState,
  enabled = true,
}: UseDraftWebSocketOptions): UseDraftWebSocketReturn {
  const [state, setState] = useState<DraftRoomStateDTO | null>(initialState);
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [savedQueue, setSavedQueue] = useState<QueueState | null>(null);

  // Use refs to avoid stale closures and prevent duplicate connections
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);
  const pendingQueueRef = useRef<QueueState | null>(null);

  // Cleanup function - no useCallback to avoid dependency issues
  const cleanup = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Submit a pick
  const submitPick = useCallback((slotId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const event: ClientEvent = { type: "pick:submit", payload: { slotId } };
      wsRef.current.send(JSON.stringify(event));
    }
  }, []);

  // Update queue on server (buffers if WS is not open, flushed on reconnect)
  const updateQueue = useCallback((queue: QueueState) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      pendingQueueRef.current = null;
      const event: ClientEvent = {
        type: "queue:update",
        payload: { slotIds: queue.slotIds, autoPickEnabled: queue.autoPickEnabled },
      };
      wsRef.current.send(JSON.stringify(event));
    } else {
      // Buffer the update so it can be flushed on reconnect
      pendingQueueRef.current = queue;
    }
  }, []);

  // Main effect - handles connection lifecycle
  useEffect(() => {
    if (!enabled) return;

    mountedRef.current = true;
    let initTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      // Triple-check we don't have an existing connection
      if (isConnectingRef.current) {
        console.log("[WS] Already connecting, skipping");
        return;
      }
      if (wsRef.current) {
        const state = wsRef.current.readyState;
        if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
          console.log(`[WS] Already have connection in state ${state}, skipping`);
          return;
        }
      }

      isConnectingRef.current = true;
      setConnectionState("connecting");
      setError(null);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/draft/${draftId}/ws`;

      console.log(`[WS] Connecting to ${wsUrl}`);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] Connected");
        isConnectingRef.current = false;

        if (!mountedRef.current) {
          ws.close(1000, "Component unmounted during connect");
          return;
        }

        setConnectionState("connected");
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, WS_PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const serverEvent = JSON.parse(event.data) as ServerEvent;

          switch (serverEvent.type) {
            case "draft:state":
              console.log("[WS] Received state update");
              setState(serverEvent.payload);
              // Flush any pending queue update that was buffered while disconnected
              // (handles case where user had no saved queue, so queue:state isn't sent)
              if (pendingQueueRef.current && ws.readyState === WebSocket.OPEN) {
                const pending = pendingQueueRef.current;
                pendingQueueRef.current = null;
                console.log("[WS] Flushing pending queue update on draft:state");
                const flushEvent: ClientEvent = {
                  type: "queue:update",
                  payload: { slotIds: pending.slotIds, autoPickEnabled: pending.autoPickEnabled },
                };
                ws.send(JSON.stringify(flushEvent));
                setSavedQueue(pending);
              }
              break;

            case "pick:made":
              console.log("[WS] Pick made:", serverEvent.payload);
              break;

            case "turn:changed":
              console.log("[WS] Turn changed");
              setState((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  currentPickerUserId: serverEvent.payload.currentPickerUserId,
                  timerDeadlineAt: serverEvent.payload.deadlineAt,
                  timerSecondsRemaining: serverEvent.payload.deadlineAt
                    ? Math.max(0, Math.floor((parseDeadlineMs(serverEvent.payload.deadlineAt) - Date.now()) / 1000))
                    : null,
                };
              });
              break;

            case "draft:completed":
              console.log("[WS] Draft completed");
              setState((prev) => prev ? { ...prev, status: "COMPLETE" } : prev);
              break;

            case "error":
              console.error("[WS] Server error:", serverEvent.payload.message);
              setError(serverEvent.payload.message);
              break;

            case "queue:state":
              console.log("[WS] Received queue state");
              // If we have buffered queue changes from while disconnected, flush them
              if (pendingQueueRef.current) {
                const pending = pendingQueueRef.current;
                pendingQueueRef.current = null;
                console.log("[WS] Flushing pending queue update");
                const flushEvent: ClientEvent = {
                  type: "queue:update",
                  payload: { slotIds: pending.slotIds, autoPickEnabled: pending.autoPickEnabled },
                };
                ws.send(JSON.stringify(flushEvent));
                // Use the pending (more recent) state as the saved queue
                setSavedQueue(pending);
              } else {
                setSavedQueue(serverEvent.payload);
              }
              break;

            case "pong":
              // Heartbeat response
              break;

            default:
              console.warn("[WS] Unknown event:", (serverEvent as any).type);
          }
        } catch (err) {
          console.error("[WS] Parse error:", err);
        }
      };

      ws.onerror = () => {
        console.error("[WS] Connection error");
        isConnectingRef.current = false;
        if (mountedRef.current) {
          setConnectionState("error");
          setError("Connection error");
        }
      };

      ws.onclose = (event) => {
        console.log(`[WS] Closed: code=${event.code}, reason=${event.reason}`);
        isConnectingRef.current = false;
        cleanup();
        wsRef.current = null;

        if (!mountedRef.current) return;

        setConnectionState("disconnected");

        // Auto-reconnect for abnormal closures
        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`[WS] Reconnecting (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          reconnectTimeoutRef.current = setTimeout(connect, WS_RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError("Connection lost. Please refresh the page.");
        }
      };
    };

    // Initial connection - delay to let React/Next.js hydration settle
    initTimeout = setTimeout(() => {
      if (!mountedRef.current) {
        console.log("[WS] Component unmounted before connect, skipping");
        return;
      }
      connect();
    }, 100);

    // Cleanup on unmount
    return () => {
      console.log("[WS] Unmounting, cleaning up");
      mountedRef.current = false;
      clearTimeout(initTimeout);
      cleanup();

      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, enabled]); // Only re-run if draftId or enabled changes

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
    setError(null);

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual reconnect");
      wsRef.current = null;
    }

    // The useEffect will handle reconnection when wsRef becomes null
    // Force a state update to trigger re-render
    setConnectionState("disconnected");
  }, []);

  return {
    state,
    connectionState,
    error,
    submitPick,
    updateQueue,
    savedQueue,
    reconnect,
  };
}
