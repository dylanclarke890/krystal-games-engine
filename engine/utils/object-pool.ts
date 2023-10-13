import { IObjectPool } from "../types/common-interfaces.js";
import { ObjectPoolSettings } from "../types/common-types.js";

export class ObjectPool<TConstructor extends new (...args: any[]) => InstanceType<TConstructor>>
  implements IObjectPool<TConstructor>
{
  ClassConstructor: TConstructor;
  events: {
    onCreate?: (obj: InstanceType<TConstructor>) => void;
    onReuse?: (obj: InstanceType<TConstructor>) => void;
    onRelease?: (obj: InstanceType<TConstructor>) => void;
  };
  pool: InstanceType<TConstructor>[] = [];

  constructor(settings: ObjectPoolSettings<TConstructor>) {
    this.ClassConstructor = settings.ClassConstructor;
    this.events = settings.events ?? {};
    if (settings.initialReserveSize) {
      this.initialiseReserve(settings.initialReserveSize);
    }
  }

  initialiseReserve(size: number) {
    for (let i = 0; i < size; i++) {
      const obj = new this.ClassConstructor();
      this.events.onCreate?.(obj);
      this.pool.push(obj);
    }
  }

  acquire(): InstanceType<TConstructor> {
    let object = this.pool.pop();

    if (typeof object === "undefined") {
      object = new this.ClassConstructor();
      this.events.onCreate?.(object);
    } else {
      this.events.onReuse?.(object);
    }

    return object;
  }

  release(obj: InstanceType<TConstructor>) {
    this.events.onRelease?.(obj);
    this.pool.push(obj);
  }

  clear() {
    this.pool = [];
  }
}
