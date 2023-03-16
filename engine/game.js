import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { SystemManager } from "./systems/system-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { World } from "./world.js";

export class Game {
  constructor() {
    this.eventSystem = new EventSystem();
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager(this.eventSystem, this.entityManager);
    this.loop = new GameLoop(60);
    this.world = new World(this);
  }

  start() {
    this.loop.start();
  }

  pause() {
    this.loop.stop();
  }

  stop() {
    this.loop.stop(); // TODO: unload resources
  }
}
