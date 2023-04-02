import { Viewport } from "../graphics/viewport.js";
import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["Position", "Velocity", "Size"];
  static systemType = SystemTypes.Physics;

  /** @type {Viewport} */
  viewport;

  /**
   *
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   */
  constructor(entityManager, viewport) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    this.viewport = viewport;
  }

  update(deltaTime) {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicsSystem.requiredComponents);
    for (const entity of entities) {
      const position = em.getComponent(entity, "Position");
      const velocity = em.getComponent(entity, "Velocity");

      // Update position first
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;

      const acceleration = em.getComponent(entity, "Acceleration");
      if (acceleration) {
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
      }

      const friction = em.getComponent(entity, "Friction");
      if (friction) {
        velocity.x *= Math.pow(friction.x, deltaTime);
        velocity.y *= Math.pow(friction.y, deltaTime);
      }

      const gravityFactor = em.getComponent(entity, "GravityFactor");
      if (gravityFactor) {
        velocity.y += 9.81 * gravityFactor.value * deltaTime;
      }
    }
  }
}
