import type { DraftRoomStateDTO } from '@/server/dal';

/**
 * Events sent from server to client
 */
export type ServerEvent =
  | {
      type: 'draft:state';
      payload: DraftRoomStateDTO;
    }
  | {
      type: 'pick:made';
      payload: {
        pickId: string;
        userId: string;
        slotId: string;
        overallPickNo: number;
        isAutoPick: boolean;
      };
    }
  | {
      type: 'turn:changed';
      payload: {
        currentPickerUserId: string;
        deadlineAt: string | null;
      };
    }
  | {
      type: 'draft:completed';
      payload: Record<string, never>;
    }
  | {
      type: 'error';
      payload: {
        message: string;
        code?: string;
      };
    }
  | {
      type: 'pong';
      payload: Record<string, never>;
    }
  | {
      type: 'queue:state';
      payload: {
        slotIds: string[];
        autoPickEnabled: boolean;
      };
    };

/**
 * Events sent from client to server
 */
export type ClientEvent =
  | {
      type: 'pick:submit';
      payload: {
        slotId: string;
      };
    }
  | {
      type: 'ping';
      payload?: Record<string, never>;
    }
  | {
      type: 'queue:update';
      payload: {
        slotIds: string[];
        autoPickEnabled: boolean;
      };
    };

/**
 * Type guard for client events
 */
export function isClientEvent(data: unknown): data is ClientEvent {
  if (!data || typeof data !== 'object') return false;
  const event = data as Record<string, unknown>;
  return typeof event.type === 'string' && ['pick:submit', 'ping', 'queue:update'].includes(event.type);
}
