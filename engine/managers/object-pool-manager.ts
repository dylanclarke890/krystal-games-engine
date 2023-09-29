import { IObjectPool, IObjectPoolManager } from "../types/common-interfaces.js";
import { ObjectFactory } from "../utils/factories/object-factory.js";
import { ObjectPool } from "../utils/object-pool.js";

export class ObjectPoolManager implements IObjectPoolManager {
  pools: Map<string, IObjectPool<any, any[]>> = new Map();

  get<T, Args extends any[] = any[]>(name: string): IObjectPool<T, Args> | undefined {
    return this.pools.get(name) as IObjectPool<T, Args> | undefined;
  }

  has(name: string): boolean {
    return this.pools.has(name);
  }

  create<T, Args extends any[]>(
    name: string,
    ClassConstructor: ClassConstructor<T, Args>,
    onReuse?: (obj: T, ...args: Args) => void,
    size?: number
  ): IObjectPool<T, Args> {
    if (this.has(name)) {
      return this.get(name)!;
    }

    const factory = new ObjectFactory<T, Args>(ClassConstructor);
    const pool = new ObjectPool<T, Args>(factory, onReuse, size);

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
