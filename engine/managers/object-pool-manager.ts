import { IObjectPool, IObjectPoolManager } from "../types/common-interfaces.js";
import { ObjectPoolSettings } from "../types/common-types.js";
import { ObjectPool } from "../utils/object-pool.js";

export class ObjectPoolManager implements IObjectPoolManager {
  pools: Map<string, IObjectPool<any>> = new Map();

  get<T extends new (...args: any[]) => InstanceType<T>>(name: string): IObjectPool<T> | undefined {
    return this.pools.get(name) as IObjectPool<T> | undefined;
  }

  has(name: string): boolean {
    return this.pools.has(name);
  }

  create<T extends new (...args: any[]) => InstanceType<T>>(
    name: string,
    settings: ObjectPoolSettings<T>
  ): IObjectPool<T> {
    if (this.has(name)) {
      return this.get(name)!;
    }

    const pool = new ObjectPool<T>(settings);
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
