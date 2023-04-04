import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { SystemManager } from "./systems/system-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { World } from "./world.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./input/input-manager.js";
import { settings } from "./config.js";

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
