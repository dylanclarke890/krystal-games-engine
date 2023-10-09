import { Viewport } from "../graphics/viewport.js";
import { InputManager, SystemManager } from "../managers/index.js";
import { World } from "../physics/world.js";
import { IConfigManager, IEntityManager, IEventManager, IObjectPoolManager } from "../types/common-interfaces.js";
import { GameConfig } from "./config.js";

export class GameContext {
  events: IEventManager;
  entities: IEntityManager;
  systems: SystemManager;
  input: InputManager;
  config: IConfigManager<GameConfig>;
  objectPools: IObjectPoolManager;
  viewport: Viewport;
  world!: World;

  constructor(
    eventManager: IEventManager,
    entityManager: IEntityManager,
    systemManager: SystemManager,
    inputManager: InputManager,
    configManager: IConfigManager<GameConfig>,
    objectPoolManager: IObjectPoolManager,
    viewport: Viewport
  ) {
    this.events = eventManager;
    this.entities = entityManager;
    this.systems = systemManager;
    this.input = inputManager;
    this.config = configManager;
    this.objectPools = objectPoolManager;
    this.viewport = viewport;
  }
}
