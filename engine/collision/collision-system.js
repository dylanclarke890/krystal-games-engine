import { Guard } from "../utils/guard.js";
import { SystemTypes } from "../systems/system-types.js";
import { System } from "../systems/system.js";
import { Viewport } from "../graphics/viewport.js";
import { EventSystem } from "../events/event-system.js";

export class CollisionSystem extends System {
  static requiredComponents = ["Position", "Size", "Collision"];
  static systemType = SystemTypes.Collision;

  /** @type {Viewport} */
  viewport;
  /** @type {Function} */
  entityCollisionCheck;

  /**
   *
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   * @param {EventSystem} eventSystem
   * @param {Function} entityCollisionStrategy
   */
  constructor(entityManager, viewport, eventSystem, entityCollisionStrategy) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityCollisionStrategy }).isTypeOf("function");
    this.viewport = viewport;
    this.eventSystem = eventSystem;
    this.entityCollisionCheck = entityCollisionStrategy;
  }

  update() {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...CollisionSystem.requiredComponents);
    console.log("UpdateStart");
    for (const entityA of entities) {
      for (const entityB of entities) {
        if (entityA === entityB) continue;
      }
    }
  }
}
