import { Guard } from "./utils/guard.js";
import { Game } from "./game.js";
import { SpriteComponent } from "./components/sprite-component.js";
import { VelocityComponent } from "./components/velocity-component.js";
import { PositionComponent } from "./components/position-component.js";

export class World {
  /** @type {import("./events/event-system.js").EventSystem} */
  eventSystem;
  /** @type {import("./entities/entity-manager.js").EntityManager} */
  entityManager;
  /** @type {import("./systems/system-manager.js").SystemManager} */
  systemManager;
  /** @type {Game} */
  game;

  constructor(game) {
    Guard.againstNull({ game }).isInstanceOf(Game);
    this.game = game;
    this.entityManager = game.entityManager;
    this.systemManager = game.systemManager;
    this.createTestEntity();
  }

  createTestEntity() {
    const id = this.entityManager.createEntity();
    this.entityManager.addComponent(id, new PositionComponent(50, 50));
    this.entityManager.addComponent(id, new VelocityComponent(0, 0));
    this.entityManager.addComponent(
      id,
      new SpriteComponent("test-data/assets/entities/mover.png", 24, 8)
    );
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
