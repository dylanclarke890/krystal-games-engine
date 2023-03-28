import { Guard } from "./utils/guard.js";
import { Game } from "./game.js";
import { SpriteComponent } from "./components/sprite-component.js";
import { VelocityComponent } from "./components/velocity-component.js";
import { PositionComponent } from "./components/position-component.js";
import { AnimationComponent } from "./components/animation-component.js";
import { InputComponent } from "./components/input-component.js";
import { InputKeys } from "./input/input-keys.js";

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
    const em = this.entityManager;
    const id = em.createEntity();
    em.addComponent(id, new PositionComponent(50, 50));
    em.addComponent(id, new VelocityComponent(50, 0));
    em.addComponent(id, new SpriteComponent("test-data/assets/multi-square.png", 32, 32));
    em.addComponent(id, new AnimationComponent("[0,3]", 0.5, false));
    const bindings = new Map([
      [InputKeys.Arrow_Left, () => console.log("Moving left!")],
      [InputKeys.Arrow_Right, () => console.log("Moving right!")],
    ]);
    em.addComponent(id, new InputComponent(bindings));
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
