import { IObjectPool } from "../types/common-interfaces.js";

export class ObjectPool<T> implements IObjectPool<T> {
  pool: T[] = [];
  createFn: (...args: any[]) => T;

  constructor(createFn: (...args: any[]) => T) {
    this.createFn = createFn;
  }

  acquire(...args: any[]): T {
    if (this.pool.length > 0) {
      return this.pool.pop() as T;
    }
    return this.createFn(...args);
  }

  release(obj: T): void {
    this.pool.push(obj);
  }
}
