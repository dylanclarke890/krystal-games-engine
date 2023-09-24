import { IObjectPool } from "../types/common-interfaces.js";

export class ObjectPool<T> implements IObjectPool<T> {
  pool: T[] = [];
  poolSize: number;
  createFn: (...args: any[]) => T;

  constructor(createFn: (...args: any[]) => T, poolSize?: number) {
    this.createFn = createFn;
    this.poolSize = poolSize ?? 5000;
  }

  acquire(...args: any[]): T {
    const object = this.pool.pop();
    if (typeof object !== "undefined") {
      return object;
    }
    return this.createFn(...args);
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }
}
