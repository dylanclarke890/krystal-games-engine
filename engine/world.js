import { Guard } from "./utils/guard.js";
import { Game } from "./game.js";

export class World {
  /** @type {import("./events/event-system.js").EventSystem} */
  eventSystem;
  /** @type {import("./entities/entity-manager.js").EntityManager} */
  entityManager;
  /** @type {Game} */
  game;

  constructor(game) {
    Guard.againstNull({ game }).isInstanceOf(Game);
    this.game = game;
    this.entityManager = game.entityManager;
    this.systemManager = game.systemManager;
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
