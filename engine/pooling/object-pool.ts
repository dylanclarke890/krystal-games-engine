import { ObjectFactory } from "./object-factory.js";

export class ObjectPool<T, Args extends any[]> {
  pool: T[] = [];
  poolSize: number;
  factory: ObjectFactory<T, Args>;

  constructor(factory: ObjectFactory<T, Args>, size: number = 0) {
    this.factory = factory;
    this.poolSize = size;
  }

  acquire(...args: Args): T {
    const object = this.pool.pop();
    if (typeof object !== "undefined" && object !== null) {
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
