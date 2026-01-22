/**
 * Minimal pg-boss interface surface we rely on.
 *
 * Why this exists:
 * - pg-boss is CommonJS and its TS typings can be awkward under NodeNext/ESM.
 * - We only need a few methods, so we type those directly and avoid import drama.
 */
export type Boss = {
  start(): Promise<void>;
  stop?: (opts?: any) => Promise<void>;
  send(name: string, data?: any, options?: any): Promise<any>;
  work(name: string, options: any, handler: (job: any) => Promise<any>): Promise<any>;
  createQueue(name: string, options?: any): Promise<any>;
  on(event: string, cb: (err: any) => void): void;
};
