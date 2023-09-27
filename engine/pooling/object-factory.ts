import { GameConfig } from "../config/config.js";
import { IConfigManager, IObjectFactory } from "../types/common-interfaces.js";

export class ObjectFactory<T, Args extends any[] = any[]> implements IObjectFactory<T, Args> {
  createFn: (...args: Args) => T;
  stats: {
    enabled: boolean;
    creationCount: number;
  };

  constructor(ClassConstructor: ClassConstructor<T, Args>, configManager: IConfigManager<GameConfig>) {
    this.createFn = (...args) => new ClassConstructor(...args);
    this.stats = { enabled: configManager.getBool("trackObjectCreation") ?? false, creationCount: 0 };
  }

  create(...args: Args): T {
    if (this.stats.enabled) {
      this.stats.creationCount++;
    }

    return this.createFn(...args);
  }
}
