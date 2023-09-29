import { IObjectFactory } from "../types/common-interfaces.js";

export class ObjectPool<T, Args extends any[]> {
  factory: IObjectFactory<T, Args>;
  onReuse: ((obj: T, ...args: Args) => void) | undefined;
  pool: T[];
  poolSize: number;

  constructor(factory: IObjectFactory<T, Args>, onReuse?: (obj: T, ...args: Args) => void, size: number = 0) {
    this.factory = factory;
    this.onReuse = onReuse;
    this.pool = [];
    this.poolSize = size;
  }

  acquire(...args: Args): T {
    const object = this.pool.pop();
    if (typeof object !== "undefined" && object !== null) {
      this.onReuse?.(object, ...args);
      return object;
    }
    return this.factory.create(...args);
  }

  release(obj: T): void {
    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }
}
