import { Guard } from "./utils/guard.js";
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
import { Collision } from "./components/collision.js";

export class World {
  /** @type {import("./events/event-system.js").EventSystem} */
  eventSystem;
  /** @type {import("./entities/entity-manager.js").EntityManager} */
  entityManager;
  /** @type {import("./systems/system-manager.js").SystemManager} */
  systemManager;
  /** @type {Game} */
  game;

  /**
   * @param {Game} game
   */
  constructor(game) {
    Guard.againstNull({ game }).isInstanceOf(Game);
    this.game = game;
    this.entityManager = game.entityManager;
    this.systemManager = game.systemManager;
    this.createTestEntity(50, 50);
    this.createTestEntity(600, -50);
  }

  createTestEntity(posX, speedX) {
    const em = this.entityManager;
    const id = em.createEntity();
    em.addComponent(id, new Position(posX, 50));
    em.addComponent(id, new Size(32, 32));

    em.addComponent(id, new Velocity(speedX, 0));

    em.addComponent(id, new Bounciness(1));
    em.addComponent(id, new GravityFactor(0));
    em.addComponent(id, new Friction(1, 1));

    em.addComponent(id, new Sprite("test-data/assets/multi-square.png", 32, 32));
    em.addComponent(id, new Animation("[0,3]", 0.5, false));
    const bindings = new Map([
      ["move-left", () => console.log("Moving left!")],
      ["move-right", () => console.log("Moving right!")],
    ]);
    em.addComponent(id, new Input(bindings));
    em.addComponent(id, new Collision({ right: true, left: true }, { enabled: true }));
  }

  createEntity() {
    return this.entityManager.createEntity();
  }

  addComponent(entityId, component) {
    return this.entityManager.addComponent(entityId, component);
  }

  removeComponent(entityId, componentType) {
    return this.entityManager.removeComponent(entityId, componentType);
  }

  destroyEntity(entityId) {
    return this.entityManager.destroyEntity(entityId);
  }

  registerSystem(system) {
    return this.systemManager.registerSystem(system);
  }

  unregisterSystem(system) {
    return this.systemManager.unregisterSystem(system);
  }
}
