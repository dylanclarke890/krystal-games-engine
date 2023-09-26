import { GameConfig } from "../config/config.js";
import { IConfigManager } from "../types/common-interfaces.js";

export class ObjectFactory<T, Args extends any[] = any[]> {
  createFn: (...args: Args) => T;
  factoryStats: {
    enabled: boolean;
    creationCount: number;
  };

  constructor(ClassConstructor: ClassConstructor<T, Args>, configManager: IConfigManager<GameConfig>) {
    this.createFn = (...args) => new ClassConstructor(...args);
    this.factoryStats = { enabled: configManager.getBool("trackObjectCreation") ?? false, creationCount: 0 };
  }

  create(...args: Args): T {
    if (this.factoryStats.enabled) {
      this.factoryStats.creationCount++;
    }

    return this.createFn(...args);
  }
}
