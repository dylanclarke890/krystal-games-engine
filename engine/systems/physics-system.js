import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { Guard } from "../utils/guard.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["Position", "Velocity", "Size"];
  static systemType = SystemTypes.Physics;

  /** @param {import("../entities/entity-manager.js").EntityManager} entityManager */
  /** @param {Function} entityCollisionStrategy */
  constructor(entityManager, entityCollisionStrategy) {
    super(entityManager);
    Guard.againstNull({ entityCollisionStrategy }).isTypeOf("function");
    this.entityCollisionStrategy = entityCollisionStrategy;
  }

  update(dt) {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicsSystem.requiredComponents);
    console.log("UpdateStart");
    for (const entity of entities) {
      const collision = em.getComponent(entity, "Collision");
      if (collision) this.checkForCollisionsWithEntity(entity, collision);

      const position = em.getComponent(entity, "Position");
      const velocity = em.getComponent(entity, "Velocity");

      // Update position first
      position.x += velocity.x * dt;
      position.y += velocity.y * dt;

      const acceleration = em.getComponent(entity, "Acceleration");
      if (acceleration) {
        velocity.x += acceleration.x * dt;
        velocity.y += acceleration.y * dt;
      }

      const friction = em.getComponent(entity, "Friction");
      if (friction) {
        velocity.x *= Math.pow(friction.x, dt);
        velocity.y *= Math.pow(friction.y, dt);
      }

      const gravityFactor = em.getComponent(entity, "GravityFactor");
      if (gravityFactor) {
        velocity.y += 9.81 * gravityFactor.value * dt;
      }
    }
  }

  checkForCollisionsWithEntity(currentEntity, allEntities, collision) {
    console.log(collision);
    for (const entity of allEntities) {
      if (currentEntity === entity) continue;
    }
  }
}
