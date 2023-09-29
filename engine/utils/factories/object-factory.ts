import { IObjectFactory } from "../../types/common-interfaces.js";
import { BaseFactory } from "./base-factory.js";

export class ObjectFactory<T, Args extends any[] = any[]>
  extends BaseFactory<T, Args>
  implements IObjectFactory<T, Args>
{
  create(...args: Args): T {
    this.totalCreated++;
    return new this.ClassConstructor(...args);
  }
}
