import type { WebSocket } from 'ws';
import { prisma } from '@fantasy-madness/db';
import { getDraftRoomState, makePick, savePickQueue, getPickQueue } from '@/server/dal';
import { DomainError } from '@fantasy-madness/domain';
import { getRedisPubSub } from '../redis/pubsub';
import type { ClientEvent, ServerEvent } from './events';
import { isClientEvent } from './events';
import { getWebSocketMonitor } from './monitoring';

/**
 * WebSocket connection handler for draft rooms
 * Manages individual client connections, message routing, and Redis pub/sub
 */
export class DraftWebSocketHandler {
  private redis: ReturnType<typeof getRedisPubSub> | null = null;
  private redisCallbacks = new Map<string, (event: ServerEvent) => void>();

  private getRedis() {
    if (!this.redis) {
      this.redis = getRedisPubSub();
    }
    return this.redis;
  }

  /**
   * Handle a new WebSocket connection
   */
  async handleConnection(
    ws: WebSocket,
    userId: string,
    draftId: string
  ): Promise<void> {
    console.log(`[WebSocket] User ${userId} connected to draft ${draftId}`);

    const monitor = getWebSocketMonitor();
    monitor.recordConnection(draftId);

    // SET UP EVENT HANDLERS FIRST - before any async operations
    ws.on('close', (code, reason) => {
      console.log(`[WebSocket] Connection closed for user ${userId}: code=${code}, reason=${String(reason || 'none')}`);
      this.handleClose(userId, draftId);
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket] Connection error for user ${userId}:`, error);
    });

    ws.on('message', (data) => {
      this.handleMessage(ws, userId, draftId, data).catch((err) => {
        console.error('[WebSocket] Message handler error:', err);
        this.sendError(ws, 'Internal server error');
      });
    });

    try {
      // 1. Verify user is a participant
      const state = await getDraftRoomState({ db: prisma, draftId });

      if (ws.readyState !== 1) {
        console.log(`[WebSocket] Connection closed during state fetch, aborting`);
        return;
      }

      const isParticipant = state.participants.some((p) => p.oduserId === userId);

      if (!isParticipant) {
        console.log(`[WebSocket] Rejecting non-participant user ${userId}`);
        this.sendError(ws, 'You are not a participant in this draft', 'UNAUTHORIZED');
        ws.close(1008, 'Unauthorized');
        return;
      }

      // 2. Subscribe to Redis channel for this draft
      const redis = this.getRedis();

      const redisCallback = (event: ServerEvent) => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify(event));
        }
      };

      this.redisCallbacks.set(`${draftId}:${userId}`, redisCallback);
      await redis.subscribe(`draft:${draftId}`, redisCallback);

      if (ws.readyState !== 1) {
        console.log(`[WebSocket] Connection closed during Redis subscribe, aborting`);
        await redis.unsubscribe(`draft:${draftId}`, redisCallback);
        this.redisCallbacks.delete(`${draftId}:${userId}`);
        return;
      }

      // 3. Send initial state
      const stateEvent: ServerEvent = {
        type: 'draft:state',
        payload: state,
      };
      ws.send(JSON.stringify(stateEvent));

      // 4. Send user's saved queue (if any)
      try {
        const queue = await getPickQueue({ db: prisma, draftId, userId });
        if (queue) {
          const queueEvent: ServerEvent = {
            type: 'queue:state',
            payload: queue,
          };
          ws.send(JSON.stringify(queueEvent));
        }
      } catch (err) {
        console.error('[WebSocket] Failed to load queue:', err);
      }

      console.log(`[WebSocket] Connection setup complete for user ${userId}`);
    } catch (err) {
      console.error('[WebSocket] Connection setup error:', err);
      if (ws.readyState === 1) {
        this.sendError(ws, 'Failed to establish connection');
        ws.close(1011, 'Internal error');
      }
    }
  }

  /**
   * Handle incoming messages from client
   */
  private async handleMessage(
    ws: WebSocket,
    userId: string,
    draftId: string,
    data: unknown
  ): Promise<void> {
    const startTime = Date.now();
    const monitor = getWebSocketMonitor();
    monitor.recordMessageReceived();

    try {
      let message: string;
      if (typeof data === 'string') {
        message = data;
      } else if (Buffer.isBuffer(data)) {
        message = data.toString('utf-8');
      } else {
        this.sendError(ws, 'Invalid message format', 'INVALID_FORMAT');
        return;
      }

      const event = JSON.parse(message);

      if (!isClientEvent(event)) {
        this.sendError(ws, 'Invalid event format', 'INVALID_FORMAT');
        return;
      }

      switch (event.type) {
        case 'pick:submit':
          await this.handlePickSubmit(ws, userId, draftId, event.payload.slotId);
          break;

        case 'queue:update':
          await this.handleQueueUpdate(ws, userId, draftId, event.payload);
          break;

        case 'ping':
          await this.handlePing(ws);
          break;

        default:
          this.sendError(ws, 'Unknown event type', 'UNKNOWN_EVENT');
      }

      const latency = Date.now() - startTime;
      monitor.recordLatency(latency);
    } catch (err) {
      monitor.recordError();

      if (err instanceof SyntaxError) {
        this.sendError(ws, 'Invalid JSON', 'INVALID_JSON');
      } else {
        console.error('[WebSocket] Message handling error:', err);
        this.sendError(ws, 'Failed to process message');
      }
    }
  }

  /**
   * Handle pick submission
   */
  private async handlePickSubmit(
    ws: WebSocket,
    userId: string,
    draftId: string,
    slotId: string
  ): Promise<void> {
    try {
      console.log(`[WebSocket] Pick submit: user=${userId}, draft=${draftId}, slot=${slotId}`);

      if (!slotId || typeof slotId !== 'string') {
        this.sendError(ws, 'Invalid slot ID', 'INVALID_INPUT');
        return;
      }

      const result = await makePick({
        db: prisma,
        input: {
          draftId,
          userId,
          slotId,
          isAutoPick: false,
        },
      });

      console.log(`[WebSocket] Pick successful: ${result.overallPickNo}`);

      // Broadcast pick to all clients in this draft
      const pickEvent: ServerEvent = {
        type: 'pick:made',
        payload: {
          pickId: result.pickId,
          userId,
          slotId,
          overallPickNo: result.overallPickNo,
          isAutoPick: false,
        },
      };
      await this.getRedis().publish(`draft:${draftId}`, pickEvent);

      // Fetch and broadcast updated state
      const updatedState = await getDraftRoomState({ db: prisma, draftId });
      const stateEvent: ServerEvent = {
        type: 'draft:state',
        payload: updatedState,
      };
      await this.getRedis().publish(`draft:${draftId}`, stateEvent);

      // If draft not complete, broadcast turn change
      if (!result.isDraftComplete && result.nextPickerUserId) {
        const turnEvent: ServerEvent = {
          type: 'turn:changed',
          payload: {
            currentPickerUserId: result.nextPickerUserId,
            deadlineAt: result.nextDeadlineAt?.toISOString() ?? null,
          },
        };
        await this.getRedis().publish(`draft:${draftId}`, turnEvent);
      } else if (result.isDraftComplete) {
        const completeEvent: ServerEvent = {
          type: 'draft:completed',
          payload: {},
        };
        await this.getRedis().publish(`draft:${draftId}`, completeEvent);
      }
    } catch (err) {
      console.error('[WebSocket] Pick submit error:', err);

      if (err instanceof DomainError) {
        this.sendError(ws, err.message, err.code);
      } else if (err instanceof Error) {
        this.sendError(ws, err.message);
      } else {
        this.sendError(ws, 'Failed to make pick');
      }
    }
  }

  /**
   * Handle queue update from client
   */
  private async handleQueueUpdate(
    ws: WebSocket,
    userId: string,
    draftId: string,
    payload: { slotIds: string[]; autoPickEnabled: boolean }
  ): Promise<void> {
    try {
      await savePickQueue({
        db: prisma,
        input: {
          draftId,
          userId,
          slotIds: payload.slotIds,
          autoPickEnabled: payload.autoPickEnabled,
        },
      });
    } catch (err) {
      console.error('[WebSocket] Queue update error:', err);
      this.sendError(ws, 'Failed to save queue');
    }
  }

  /**
   * Handle ping (heartbeat)
   */
  private async handlePing(ws: WebSocket): Promise<void> {
    const pongEvent: ServerEvent = {
      type: 'pong',
      payload: {},
    };
    ws.send(JSON.stringify(pongEvent));
  }

  /**
   * Handle connection close
   */
  private handleClose(userId: string, draftId: string): void {
    const monitor = getWebSocketMonitor();
    monitor.recordDisconnection(draftId);

    const callbackKey = `${draftId}:${userId}`;
    const callback = this.redisCallbacks.get(callbackKey);
    if (callback && this.redis) {
      this.redis.unsubscribe(`draft:${draftId}`, callback).catch((err) => {
        console.error('[WebSocket] Failed to unsubscribe from Redis:', err);
      });
      this.redisCallbacks.delete(callbackKey);
    }
  }

  /**
   * Send error event to client
   */
  private sendError(ws: WebSocket, message: string, code?: string): void {
    if (ws.readyState === 1) {
      const errorEvent: ServerEvent = {
        type: 'error',
        payload: { message, code },
      };
      ws.send(JSON.stringify(errorEvent));
    }
  }
}
