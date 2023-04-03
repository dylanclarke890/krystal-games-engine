import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { SystemManager } from "./systems/system-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { World } from "./world.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { Viewport } from "./graphics/viewport.js";
import { InputSystem } from "./systems/input-system.js";
import { InputManager } from "./input/input-manager.js";
import { settings } from "./config.js";
import { CollisionSystem } from "./collision/collision-system.js";
import { AABBCollisionCheck } from "./collision/strategies/aabb.js";

export class Game {
  /** @type {Viewport} */
  viewport;
  /** @type {EventSystem} */
  eventSystem;
  /** @type {EntityManager} */
  entityManager;
  /** @type {SystemManager} */
  systemManager;
  /** @type {InputManager} */
  inputManager;
  /** @type {GameLoop} */
  loop;
  /** @type {World} */
  world;

  /**
   * @param {string?} canvasId Id of the canvas, if known.
   * @param {number} width Width of the canvas.
   * @param {number} height Height of the canvas.
   */
  constructor(canvasId, width, height) {
    this.viewport = new Viewport(width, height, canvasId);
    this.eventSystem = new EventSystem();
    this.entityManager = new EntityManager(this.eventSystem);
    this.systemManager = new SystemManager(
      this.eventSystem,
      this.entityManager,
      settings.registration.components.throwIfMissing
    );
    this.inputManager = new InputManager(this.eventSystem, this.viewport);
    this.loop = new GameLoop(this.eventSystem, 60);
    this.world = new World(this);
    this.#registerSystems();
  }

  #registerSystems() {
    this.systemManager.registerSystem(new InputSystem(this.entityManager, this.inputManager));
    this.systemManager.registerSystem(new PhysicsSystem(this.entityManager));
    this.systemManager.registerSystem(
      new CollisionSystem(this.entityManager, this.viewport, this.eventSystem, AABBCollisionCheck)
    );
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
