import { Guard } from "../utils/guard.js";
import { Viewport } from "../graphics/viewport.js";
import { EventSystem } from "../events/event-system.js";
import { EntityManager } from "../entities/entity-manager.js";

export class CollisionSystem {
  /** @type {EntityManager} */
  entityManager;
  /** @type {Viewport} */
  viewport;
  /** @type {EventSystem} */
  eventSystem;

  /**
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   * @param {EventSystem} eventSystem
   */
  constructor(entityManager, viewport, eventSystem) {
    Guard.againstNull({ entityManager }).isInstanceOf(EntityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    this.entityManager = entityManager;
    this.viewport = viewport;
    this.eventSystem = eventSystem;
  }
}
