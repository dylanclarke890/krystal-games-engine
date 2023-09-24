import { IObjectPool } from "../types/common-interfaces.js";
import { isFunction } from "../utils/func.js";

export class ObjectPool<T extends Initialisable> implements IObjectPool<T> {
  pool: T[] = [];
  poolSize: number;
  createFn: (...args: any[]) => T;

  constructor(createFn: (...args: any[]) => T, poolSize?: number) {
    this.createFn = createFn;
    this.poolSize = poolSize ?? 5000;
  }

  acquire(...args: any[]): T {
    const object = this.pool.pop();
    if (object) {
      if (isFunction(object, "initialise")) {
        object.initialise(...args);
      }
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
