import { IObjectPool, IObjectPoolManager } from "../types/common-interfaces.js";
import { Assert } from "../utils/assert.js";
import { ObjectPool } from "./object-pool.js";

export class ObjectPoolManager implements IObjectPoolManager {
  pools: Map<string, IObjectPool<any>> = new Map();

  get<T>(name: string): IObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  has(name: string): boolean {
    return this.pools.has(name);
  }

  create<T>(name: string, createFn: (...args: any[]) => T, size?: number): IObjectPool<T> {
    if (this.has(name)) {
      return this.get(name)!;
    }

    Assert.isFunction("new object from the object pool", createFn);
    const pool = new ObjectPool<T>(createFn, size);
    this.pools.set(name, pool);
    return pool;
  }

  clear(name: string): void {
    this.get(name)?.clear();
  }

  clearAll(): void {
    for (let pool of this.pools.values()) {
      pool.clear();
    }
  }
}
