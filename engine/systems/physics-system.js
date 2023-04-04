import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { CollisionResponseFlags } from "../components/collision.js";
import { AABBCollisionCheck } from "../utils/collision-strategies/aabb.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["Position", "Velocity", "Size"];
  static systemType = SystemTypes.Physics;

  /**
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   */
  constructor(entityManager) {
    super(entityManager);
  }

  update(dt) {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicsSystem.requiredComponents);
    console.log("UpdateStart");
    for (const entity of entities) {
      const collision = em.getComponent(entity, "Collision");
      const position = em.getComponent(entity, "Position");

      if (collision && !collision.hasResponse(CollisionResponseFlags.Ignore)) {
        this.checkForCollisionsWithEntity(entity, entities, collision, position);
      }

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

  checkForCollisionsWithEntity(currentEntity, allEntities, _collisionA, posA) {
    const em = this.entityManager;
    for (const entity of allEntities) {
      if (currentEntity === entity) continue; // same entity
      const collisionB = em.getComponent(entity, "Collision");
      if (!collisionB || collisionB.hasResponse(CollisionResponseFlags.Ignore)) continue; // no collision

      const sizeA = em.getComponent(currentEntity, "Size");
      const sizeB = em.getComponent(entity, "Size");
      const posB = em.getComponent(entity, "Position");

      // handle collision
      const didCollide = AABBCollisionCheck(posA, sizeA, posB, sizeB);
      if (didCollide) {
        // apply collision response to entities
        switch (didCollide) {
          case CollisionResponseFlags.Repel:
            break;
          case CollisionResponseFlags.Bounce:
            break;
        }
      }
    }
  }
}
