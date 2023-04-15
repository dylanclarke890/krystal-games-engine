import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { SystemManager } from "./systems/system-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./input/input-manager.js";
import { settings } from "./config.js";
import { Component, ComponentType } from "./utils/types.js";
import { CollisionDetector } from "./collision/detector.js";
import { CollisionResolver } from "./collision/resolver.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicSystem } from "./systems/physic-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { System } from "./systems/system.js";

export class Game {
  viewport: Viewport;
  eventSystem: EventSystem;
  entityManager: EntityManager;
  systemManager: SystemManager;
  inputManager: InputManager;
  loop: GameLoop;

  /**
   * @param {string?} canvasId Id of the canvas, if known.
   * @param {number} width Width of the canvas.
   * @param {number} height Height of the canvas.
   */
  constructor(canvasId: string | undefined, width: number, height: number) {
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
    this.setup();
  }

  // #region Start / Stop

  start() {
    this.loop.start();
  }

  pause() {
    this.loop.stop();
  }

  stop() {
    this.loop.stop(); // TODO: unload resources
  }

  // #endregion

  setup() {
    const em = this.entityManager;
    const vp = this.viewport;
    const detector = new CollisionDetector(em, vp);
    const resolver = new CollisionResolver(em, vp);

    this.registerSystem(new InputSystem(em, this.inputManager));
    this.registerSystem(new PhysicSystem(em, detector, resolver));
    this.registerSystem(new RenderSystem(em, vp));
  }

  createEntity() {
    return this.entityManager.createEntity();
  }

  addComponent(entityId: number, component: Component<ComponentType>) {
    return this.entityManager.addComponent(entityId, component);
  }

  removeComponent(entityId: number, componentType: ComponentType) {
    return this.entityManager.removeComponent(entityId, componentType);
  }

  destroyEntity(entityId: number) {
    return this.entityManager.destroyEntity(entityId);
  }

  registerSystem(system: System) {
    return this.systemManager.registerSystem(system);
  }

  unregisterSystem(system: System) {
    return this.systemManager.unregisterSystem(system);
  }
}
