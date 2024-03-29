import { Viewport } from "../graphics/viewport.js";
import { InputManager } from "../managers/index.js";
import {
  IConfigManager,
  IEntityManager,
  IEventManager,
  IObjectPoolManager,
  ISystemManager,
} from "../types/common-interfaces.js";
import { UserAgent } from "../utils/user-agent.js";
import { GameConfig } from "./config.js";

export class GameContext {
  events: IEventManager;
  entities: IEntityManager;
  systems: ISystemManager;
  input: InputManager;
  config: IConfigManager<GameConfig>;
  objectPools: IObjectPoolManager;
  viewport: Viewport;
  agent: UserAgent;

  constructor(
    eventManager: IEventManager,
    entityManager: IEntityManager,
    systemManager: ISystemManager,
    inputManager: InputManager,
    configManager: IConfigManager<GameConfig>,
    objectPoolManager: IObjectPoolManager,
    viewport: Viewport,
    agent: UserAgent
  ) {
    this.events = eventManager;
    this.entities = entityManager;
    this.systems = systemManager;
    this.input = inputManager;
    this.config = configManager;
    this.objectPools = objectPoolManager;
    this.viewport = viewport;
    this.agent = agent;
  }
}
