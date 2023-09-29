import { GameConfig } from "../config.js";
import { IConfigManager, IObjectFactory } from "../types/common-interfaces.js";

export class ObjectFactory<T, Args extends any[] = any[]> implements IObjectFactory<T, Args> {
  createFn: (...args: Args) => T;
  totalCreated: number;
  constructor(ClassConstructor: ClassConstructor<T, Args>) {
    this.createFn = (...args) => new ClassConstructor(...args);
    this.totalCreated = 0;
  }

  create(...args: Args): T {
    this.totalCreated++;
    return this.createFn(...args);
  }
}
