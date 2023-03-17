import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { SystemManager } from "./systems/system-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { World } from "./world.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { PositionSystem } from "./systems/position-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { Viewport } from "./graphics/viewport.js";

export class Game {
  /** @type {Viewport} */
  viewport;
  /** @type {EventSystem} */
  eventSystem;
  /** @type {EntityManager} */
  entityManager;
  /** @type {SystemManager} */
  systemManager;
  /** @type {GameLoop} */
  loop;
  /** @type {World} */
  world;

  constructor(canvasId, width, height) {
    this.viewport = new Viewport(width, height, canvasId);
    this.eventSystem = new EventSystem();
    this.entityManager = new EntityManager(this.eventSystem);
    this.systemManager = new SystemManager(this.eventSystem, this.entityManager);
    this.loop = new GameLoop(this.eventSystem, 60);
    this.world = new World(this);
    this.#registerSystems();
  }

  #registerSystems() {
    this.systemManager.registerSystem(new PositionSystem(this.entityManager));
    this.systemManager.registerSystem(new PhysicsSystem(this.entityManager));
    this.systemManager.registerSystem(new RenderSystem(this.entityManager, this.viewport));
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
