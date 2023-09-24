import { IObjectPool } from "../types/common-interfaces.js";

export class ObjectPool<T extends new (...args: any[]) => any> implements IObjectPool<T> {
  pool: InstanceType<T>[] = [];
  poolSize: number;
  createFn: (...args: ConstructorParameters<T>) => InstanceType<T>;

  constructor(createFn: (...args: ConstructorParameters<T>) => InstanceType<T>, size: number = 0) {
    this.createFn = createFn;
    this.poolSize = size;
  }

  acquire(...args: ConstructorParameters<T>): InstanceType<T> {
    const object = this.pool.pop();
    if (typeof object !== "undefined" && object !== null) {
      return object;
    }
    return this.createFn(...args);
  }

  release(obj: InstanceType<T>): void {
    this.pool.push(obj);
  }

  clear(): void {
    this.pool = [];
  }
}
