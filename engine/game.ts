import { EventSystem } from "./events/event-system.js";
import { EntityManager } from "./entities/entity-manager.js";
import { SystemManager } from "./systems/system-manager.js";
import { GameLoop } from "./time/game-loop.js";
import { Viewport } from "./graphics/viewport.js";
import { InputManager } from "./input/input-manager.js";
import { settings } from "./config.js";
import { Component, ComponentType, InputBindings } from "./utils/types.js";
import { CollisionDetector } from "./collision/detector.js";
import { CollisionResolver } from "./collision/resolver.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicSystem } from "./systems/physic-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { InputKeys } from "./input/input-keys.js";
import { System } from "./systems/system.js";
import * as Components from "./components/index.js";

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
    this.inputManager.bind(InputKeys.Arrow_Left, "move-left");
    this.inputManager.bind(InputKeys.Arrow_Right, "move-right");

    const em = this.entityManager;
    const vp = this.viewport;
    const detector = new CollisionDetector(em, vp);
    const resolver = new CollisionResolver(em, vp);

    this.registerSystem(new InputSystem(em, this.inputManager));
    this.registerSystem(new PhysicSystem(em, detector, resolver));
    this.registerSystem(new RenderSystem(em, vp));
    this.#createTestEntity(50, 50);
    this.#createTestEntity(450, -100);
  }

  #createTestEntity(posX: number, speedX: number) {
    const em = this.entityManager;
    const entity = em.createEntity();

    const rnd = Math.random();
    const sequence = rnd > 0.5 ? "[0,3]" : "[3, 0]";
    const bindings = new Map<string, InputBindings>([
      [
        "move-left",
        {
          pressed: (e) => console.log(`${e} pressed left.`),
          held: (e) => console.log(`${e} is moving left.`),
          released: (e) => console.log(`${e} released left.`),
        },
      ],
      [
        "move-right",
        {
          pressed: (e) => console.log(`${e} pressed right.`),
          held: (e) => console.log(`${e} is moving right.`),
          released: (e) => console.log(`${e} released right.`),
        },
      ],
    ]);
    const collisionSettings = {
      viewportCollision: { LEFT: true, RIGHT: true },
      entityCollision: { BOUNCE: true },
    };

    em.addComponent(entity, new Components.Position(posX, 50));
    em.addComponent(entity, new Components.Size(32, 32));
    em.addComponent(entity, new Components.Velocity(speedX, 0));
    em.addComponent(entity, new Components.Bounciness(1));
    em.addComponent(entity, new Components.GravityFactor(0)); // TODO - unused
    em.addComponent(entity, new Components.Friction(1, 1)); // TODO - unused
    em.addComponent(entity, new Components.Sprite("test-data/assets/multi-square.png", 32, 32));
    em.addComponent(entity, new Components.Animation(sequence, rnd, false));
    em.addComponent(entity, new Components.Input(bindings)); // TODO - can't affect other components currently
    em.addComponent(entity, new Components.Collision(collisionSettings));
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
