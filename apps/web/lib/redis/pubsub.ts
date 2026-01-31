import Redis from 'ioredis';

export class RedisPubSubClient {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private handlers = new Map<string, Set<(msg: any) => void>>();
  private initialized = false;

  private initialize(): void {
    if (this.initialized) return;

    // Use separate connections for pub and sub
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.publisher = new Redis(redisUrl, { lazyConnect: true });
    this.subscriber = new Redis(redisUrl, { lazyConnect: true });

    this.subscriber.on('message', (channel, message) => {
      const callbacks = this.handlers.get(channel);
      if (callbacks) {
        try {
          const parsed = JSON.parse(message);
          callbacks.forEach(cb => {
            try {
              cb(parsed);
            } catch (err) {
              console.error('Pub/sub callback error:', err);
            }
          });
        } catch (err) {
          console.error('Failed to parse Redis message:', err);
        }
      }
    });

    this.initialized = true;
  }

  async subscribe(channel: string, callback: (msg: any) => void): Promise<void> {
    this.initialize();
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.subscriber!.subscribe(channel);
      console.log(`Subscribed to channel: ${channel}`);
    }
    this.handlers.get(channel)!.add(callback);
  }

  async unsubscribe(channel: string, callback: (msg: any) => void): Promise<void> {
    if (!this.subscriber) return;
    const callbacks = this.handlers.get(channel);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        await this.subscriber.unsubscribe(channel);
        this.handlers.delete(channel);
        console.log(`Unsubscribed from channel: ${channel}`);
      }
    }
  }

  async publish(channel: string, message: any): Promise<void> {
    this.initialize();
    await this.publisher!.publish(channel, JSON.stringify(message));
  }

  async disconnect(): Promise<void> {
    if (!this.publisher || !this.subscriber) return;
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }
}

let pubsubClient: RedisPubSubClient | null = null;

export function getRedisPubSub(): RedisPubSubClient {
  if (!pubsubClient) {
    pubsubClient = new RedisPubSubClient();
  }
  return pubsubClient;
}
