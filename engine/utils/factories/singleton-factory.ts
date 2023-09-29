import { IObjectFactory } from "../../types/common-interfaces.js";
import { BaseFactory } from "./base-factory.js";

export class SingletonFactory<T, Args extends any[] = any[]>
  extends BaseFactory<T, Args>
  implements IObjectFactory<T, Args>
{
  #instance: T | undefined;

  create(...args: Args): T {
    if (!this.#instance) {
      this.#instance = new this.ClassConstructor(...args);
      this.totalCreated++;
    }
    return this.#instance;
  }
}
