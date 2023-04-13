import { Game } from "./game.js";
import { Sprite } from "./components/sprite.js";
import { Size } from "./components/size.js";
import { Velocity } from "./components/velocity.js";
import { Position } from "./components/position.js";
import { Animation } from "./components/animation.js";
import { Input } from "./components/input.js";
import { Bounciness } from "./components/bounciness.js";
import { GravityFactor } from "./components/gravity-factor.js";
import { Friction } from "./components/friction.js";
import { Collision, CollisionResponseFlags } from "./components/collision.js";
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
import { ComponentType } from "./entities/entity-manager.js";
import { ComponentMap } from "./entities/entity-manager.js";
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
    this.registerSystem(new InputSystem(em, this.inputManager));
    const detector = new CollisionDetector(em);
    const resolver = new CollisionResolver(em);
    this.registerSystem(new PhysicSystem(em, detector, resolver));
    this.registerSystem(new RenderSystem(em, this.viewport));

    this.#createTestEntity(50, 50);
    this.#createTestEntity(450, -100);
  }

  #createTestEntity(posX: number, speedX: number) {
    const em = this.entityManager;
    const entity = em.createEntity();
    em.addComponent(entity, new Position(posX, 50));
    em.addComponent(entity, new Size(32, 32));

    em.addComponent(entity, new Velocity(speedX, 0));

    em.addComponent(entity, new Bounciness(1));
    em.addComponent(entity, new GravityFactor(0));
    em.addComponent(entity, new Friction(1, 1));

    em.addComponent(entity, new Sprite("test-data/assets/multi-square.png", 32, 32));
    const rnd = Math.random();
    const sequence = rnd > 0.5 ? "[0,3]" : "[3, 0]";
    em.addComponent(entity, new Animation(sequence, rnd, false));
    const bindings = new Map([
      ["move-left", () => console.log("Moving left!")],
      ["move-right", () => console.log("Moving right!")],
    ]);
    em.addComponent(entity, new Input(bindings));
    em.addComponent(entity, new Collision(CollisionResponseFlags.Push_Other));
  }

  createEntity() {
    return this.entityManager.createEntity();
  }

  addComponent(entityId: number, component: ComponentMap[ComponentType]) {
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
