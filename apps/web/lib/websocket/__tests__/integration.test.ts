/**
 * WebSocket Integration Tests
 *
 * These tests verify the WebSocket server implementation works correctly
 * with Redis pub/sub and the DAL.
 *
 * Note: These are integration tests that require:
 * - PostgreSQL database with test data
 * - Redis server running
 * - Proper environment variables
 *
 * Run with: npm test -- integration.test.ts
 */

import { WebSocket } from 'ws';
import type { ServerEvent, ClientEvent } from '../events';
import { getRedisPubSub } from '../../redis/pubsub';
import { prisma } from '@fantasy-madness/db';
import { getDraftRoomState, makePick } from '@/server/dal';

// Test configuration
const WS_URL = process.env.TEST_WS_URL || 'ws://localhost:3000';
const TEST_TIMEOUT = 10000;

describe('WebSocket Integration Tests', () => {
  let testDraftId: string;
  let testUserId: string;
  let testSlotId: string;

  beforeAll(async () => {
    // Note: In a real test suite, you would set up test data here
    // For now, we document what's needed
    console.log('Prerequisites:');
    console.log('- Draft must be in DRAFTING status');
    console.log('- User must be a participant');
    console.log('- At least one slot must be available');
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  describe('Connection Lifecycle', () => {
    it('should accept authenticated WebSocket connections', (done) => {
      // This test requires valid session cookies
      // Skip if not in integration test environment
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);

      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
      });

      ws.on('close', () => {
        done();
      });

      ws.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);

    it('should reject unauthenticated connections', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);

      ws.on('open', () => {
        // Should not reach here
        ws.close();
        done(new Error('Connection should have been rejected'));
      });

      ws.on('close', (code) => {
        expect(code).toBe(401); // Unauthorized
        done();
      });

      ws.on('error', () => {
        // Expected for auth failure
        done();
      });
    }, TEST_TIMEOUT);
  });

  describe('Event Protocol', () => {
    it('should receive draft:state event on connection', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);

      ws.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          expect(event.payload).toBeDefined();
          expect(event.payload.id).toBe(testDraftId);
          expect(event.payload.participants).toBeInstanceOf(Array);
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);

    it('should respond to ping with pong', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);
      let receivedState = false;

      ws.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          receivedState = true;

          // Send ping
          const pingEvent: ClientEvent = { type: 'ping' };
          ws.send(JSON.stringify(pingEvent));
        } else if (event.type === 'pong') {
          expect(receivedState).toBe(true);
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);
  });

  describe('Pick Submission', () => {
    it('should broadcast pick:made event to all clients', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      // Create two WebSocket connections
      const ws1 = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);
      const ws2 = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);

      let ws1Ready = false;
      let ws2Ready = false;
      let ws2ReceivedPick = false;

      const checkReady = () => {
        if (ws1Ready && ws2Ready) {
          // Both clients ready, submit pick from ws1
          const pickEvent: ClientEvent = {
            type: 'pick:submit',
            payload: { slotId: testSlotId },
          };
          ws1.send(JSON.stringify(pickEvent));
        }
      };

      ws1.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          ws1Ready = true;
          checkReady();
        }
      });

      ws2.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          ws2Ready = true;
          checkReady();
        } else if (event.type === 'pick:made') {
          expect(event.payload.slotId).toBe(testSlotId);
          ws2ReceivedPick = true;
          ws1.close();
          ws2.close();
          done();
        }
      });

      ws1.on('error', (err) => done(err));
      ws2.on('error', (err) => done(err));
    }, TEST_TIMEOUT);

    it('should reject invalid picks with error event', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);
      let receivedState = false;

      ws.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          receivedState = true;

          // Submit pick with invalid slot ID
          const pickEvent: ClientEvent = {
            type: 'pick:submit',
            payload: { slotId: 'invalid-slot-id' },
          };
          ws.send(JSON.stringify(pickEvent));
        } else if (event.type === 'error') {
          expect(receivedState).toBe(true);
          expect(event.payload.message).toBeDefined();
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);
  });

  describe('Redis Pub/Sub Integration', () => {
    it('should broadcast events via Redis to multiple pods', async () => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return;
      }

      const redis = getRedisPubSub();
      const channel = `draft:${testDraftId}`;
      const testEvent: ServerEvent = {
        type: 'pick:made',
        payload: {
          pickId: 'test-pick-id',
          userId: 'test-user-id',
          slotId: 'test-slot-id',
          overallPickNo: 1,
          isAutoPick: false,
        },
      };

      let received = false;

      await redis.subscribe(channel, (event) => {
        if (
          event.type === 'pick:made' &&
          event.payload.pickId === 'test-pick-id'
        ) {
          received = true;
        }
      });

      await redis.publish(channel, testEvent);

      // Wait for message
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(received).toBe(true);

      // Cleanup
      await redis.unsubscribe(channel, () => {});
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);
      let receivedState = false;

      ws.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          receivedState = true;

          // Send malformed JSON
          ws.send('{ invalid json');
        } else if (event.type === 'error') {
          expect(receivedState).toBe(true);
          expect(event.payload.code).toBe('INVALID_JSON');
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);

    it('should handle unknown event types', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      const ws = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);
      let receivedState = false;

      ws.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          receivedState = true;

          // Send unknown event type
          ws.send(JSON.stringify({ type: 'unknown:event', payload: {} }));
        } else if (event.type === 'error') {
          expect(receivedState).toBe(true);
          expect(event.payload.code).toBe('INVALID_FORMAT');
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);
  });

  describe('Connection Management', () => {
    it('should handle reconnection gracefully', (done) => {
      if (!process.env.INTEGRATION_TEST) {
        console.log('Skipping: INTEGRATION_TEST not set');
        return done();
      }

      // Connect, disconnect, reconnect
      const ws1 = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);

      ws1.on('message', (data) => {
        const event: ServerEvent = JSON.parse(data.toString());

        if (event.type === 'draft:state') {
          // Disconnect
          ws1.close();
        }
      });

      ws1.on('close', () => {
        // Reconnect
        const ws2 = new WebSocket(`${WS_URL}/api/draft/${testDraftId}/ws`);

        ws2.on('message', (data) => {
          const event: ServerEvent = JSON.parse(data.toString());

          if (event.type === 'draft:state') {
            // Successfully reconnected and received state
            ws2.close();
            done();
          }
        });

        ws2.on('error', (err) => {
          done(err);
        });
      });

      ws1.on('error', (err) => {
        done(err);
      });
    }, TEST_TIMEOUT);
  });
});

/**
 * Helper: Create test draft and return ID
 */
async function createTestDraft(): Promise<string> {
  // Implementation would create a test draft
  // For now, return placeholder
  throw new Error('Not implemented: Create test draft helper');
}

/**
 * Helper: Create test user and return ID
 */
async function createTestUser(): Promise<string> {
  // Implementation would create a test user
  // For now, return placeholder
  throw new Error('Not implemented: Create test user helper');
}

/**
 * Helper: Get available slot ID for draft
 */
async function getAvailableSlotId(draftId: string): Promise<string> {
  const state = await getDraftRoomState({ draftId });
  if (state.availableSlots.length === 0) {
    throw new Error('No available slots for test');
  }
  return state.availableSlots[0].slotId;
}
