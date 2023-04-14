import { Game } from "./game.js";
import * as Components from "./components/index.js";
import { InputKeys } from "./input/input-keys.js";
import { RenderSystem } from "./systems/render-system.js";
import { InputSystem } from "./systems/input-system.js";
import { PhysicSystem } from "./systems/physic-system.js";
import { CollisionDetector } from "./collision/detector.js";
import { CollisionResolver } from "./collision/resolver.js";
import { EventSystem } from "./events/event-system.js";
import { SystemManager } from "./systems/system-manager.js";
import { EntityManager } from "./entities/entity-manager.js";
import { InputManager } from "./input/input-manager.js";
import { Viewport } from "./graphics/viewport.js";
import { System } from "./systems/system.js";
import { Component, ComponentType } from "./utils/types.js";
import { Assert } from "./utils/assert.js";

export class World {
  eventSystem: EventSystem;
  entityManager: EntityManager;
  inputManager: InputManager;
  systemManager: SystemManager;
  game: Game;
  viewport: Viewport;

  constructor(game: Game) {
    Assert.instanceOf("Game class", game, Game);
    this.game = game;
    this.entityManager = game.entityManager;
    this.systemManager = game.systemManager;
    this.inputManager = game.inputManager;
    this.eventSystem = game.eventSystem;
    this.viewport = game.viewport;
    this.#setup();
  }

  #setup() {
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
    const bindings = new Map([
      ["move-left", () => console.log("Moving left!")],
      ["move-right", () => console.log("Moving right!")],
    ]);
    const collisionSettings = {
      viewportCollision: { left: true, right: true },
      entityCollision: { bounce: true },
    };

    em.addComponent(entity, new Components.Position(posX, 50));
    em.addComponent(entity, new Components.Size(32, 32));
    em.addComponent(entity, new Components.Velocity(speedX, 0));
    em.addComponent(entity, new Components.Bounciness(1)); // TODO - unused
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
