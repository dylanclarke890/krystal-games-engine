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

  checkForCollisionsWithEntity(currentEntity, allEntities, collisionA, posA) {
    const em = this.entityManager;
    for (const entity of allEntities) {
      if (currentEntity === entity) continue; // same entity
      const collisionB = em.getComponent(entity, "Collision");
      if (!collisionB || collisionB.hasResponse(CollisionResponseFlags.Ignore)) continue; // no collision

      const sizeA = em.getComponent(currentEntity, "Size");
      const sizeB = em.getComponent(entity, "Size");
      const posB = em.getComponent(entity, "Position");

      if (!AABBCollisionCheck(posA, sizeA, posB, sizeB)) continue;

      this.handleCollisionResponse(currentEntity, collisionA, entity, collisionB);
    }
  }

  handleCollisionResponse(entityA, collisionA, entityB, collisionB) {
    const responsesA = collisionA.getResponses();
    for (const response of responsesA) {
      switch (response) {
        case "Repel":
          this.repel(entityA, collisionA, entityB, collisionB);
          break;
        case "Bounce":
          this.bounce(entityA, collisionA, entityB, collisionB);
          break;
        case "Stick":
          this.stick(entityA, collisionA, entityB, collisionB);
          break;
        case "Slide":
          this.slide(entityA, collisionA, entityB, collisionB);
          break;
        case "Push_EntityA":
          this.push(entityA, collisionA, entityB, collisionB);
          break;
        case "Push_EntityB":
          this.push(entityB, collisionB, entityA, collisionA);
          break;
        case "Damage_EntityA":
          this.damage(entityA, this.entityManager.getComponent(entityA, "Damage"));
          break;
        case "Damage_EntityB":
          this.damage(entityB, this.entityManager.getComponent(entityA, "Damage"));
          break;
        case "Destroy_EntityA":
          this.destroy(entityA);
          break;
        case "Destroy_EntityB":
          this.destroy(entityB);
          break;
      }
    }
  }

  // #region Collision responses

  bounce(entityA, collisionA, entityB, collisionB) {}
  repel(entityA, collisionA, entityB, collisionB) {}
  stick(entityA, collisionA, entityB, collisionB) {}
  slide(entityA, collisionA, entityB, collisionB) {}
  push(entityA, collisionA, entityB, collisionB) {}

  /**
   * @param {number} entity
   * @param {number} damage
   */
  damage(entity, damage) {
    const health = this.entityManager.getComponent(entity, "Health");
    if (!health) {
      return; // Should we destroy the entity if it has no health?
    }
    const dead = health.takeDamage(damage);
    if (dead) this.destroy(entity);
  }

  /** @param {number} entity */
  destroy(entity) {
    this.entityManager.destroyEntity(entity);
  }

  // #endregion Collision responses
}
