import { IObjectPool } from "../types/common-interfaces.js";
import { isFunction } from "./func.js";

export class ObjectPool<T extends Initialisable> implements IObjectPool<T> {
  pool: T[] = [];
  createFn: (...args: any[]) => T;

  constructor(createFn: (...args: any[]) => T) {
    this.createFn = createFn;
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
}
