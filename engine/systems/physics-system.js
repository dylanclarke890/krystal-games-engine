import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { CollisionResponseFlags } from "../components/collision.js";
import { AABBCollisionCheck } from "../utils/collision-strategies/aabb.js";
import { Guard } from "../utils/guard.js";

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
    console.log("Start");
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicsSystem.requiredComponents);
    const collisions = [];
    for (const entity of entities) {
      const collision = em.getComponent(entity, "Collision");
      const position = em.getComponent(entity, "Position");

      if (collision && !collision.hasResponse(CollisionResponseFlags.Ignore)) {
        collisions.push(...this.checkForCollisionsWithEntity(entity, entities, position));
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

    const checkedPairs = new Set();
    collisions.forEach((pair) => {
      pair.sort();
      const [a, b] = pair;
      const pairKey = `${a}-${b}`;
      if (checkedPairs.has(pairKey)) return;
      this.handleCollisionResponse(a, b);
      checkedPairs.add(pairKey);
    });
  }

  checkForCollisionsWithEntity(currentEntity, allEntities, posA) {
    const em = this.entityManager;
    const collisions = [];
    for (const entity of allEntities) {
      if (currentEntity === entity) continue; // same entity
      const collisionB = em.getComponent(entity, "Collision");
      if (!collisionB || collisionB.hasResponse(CollisionResponseFlags.Ignore)) continue; // no collision

      const sizeA = em.getComponent(currentEntity, "Size");
      const sizeB = em.getComponent(entity, "Size");
      const posB = em.getComponent(entity, "Position");

      if (!AABBCollisionCheck(posA, sizeA, posB, sizeB)) continue;
      // this.handleCollisionResponse(currentEntity, entity);
      collisions.push([currentEntity, entity]);
    }
    return collisions;
  }

  /**
   * @param {number} entityA
   * @param {number} entityB
   */
  handleCollisionResponse(entityA, entityB) {
    const collisionA = this.entityManager.getComponent(entityA, "Collision");
    const collisionB = this.entityManager.getComponent(entityB, "Collision");

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
        case "Push_Self":
          this.push(entityA, entityB);
          break;
        case "Push_Other":
          this.push(entityB, entityA);
          break;
        case "Damage_Self":
          this.damage(entityA, this.entityManager.getComponent(entityA, "Damage"));
          break;
        case "Damage_Other":
          this.damage(entityB, this.entityManager.getComponent(entityA, "Damage"));
          break;
        case "Destroy_Self":
          this.destroy(entityA);
          break;
        case "Destroy_Other":
          this.destroy(entityB);
          break;
      }
    }

    const responsesB = collisionB.getResponses();
    for (const response of responsesB) {
      switch (response) {
        case "Repel":
          this.repel(entityB, collisionB, entityA, collisionA);
          break;
        case "Bounce":
          this.bounce(entityB, collisionB, entityA, collisionA);
          break;
        case "Stick":
          this.stick(entityB, collisionB, entityA, collisionA);
          break;
        case "Slide":
          this.slide(entityB, collisionB, entityA, collisionA);
          break;
        case "Push_Self":
          this.push(entityB, entityA);
          break;
        case "Push_Other":
          this.push(entityA, entityB);
          break;
        case "Damage_Self":
          this.damage(entityB, this.entityManager.getComponent(entityB, "Damage"));
          break;
        case "Damage_Other":
          this.damage(entityA, this.entityManager.getComponent(entityB, "Damage"));
          break;
        case "Destroy_Self":
          this.destroy(entityB);
          break;
        case "Destroy_Other":
          this.destroy(entityA);
          break;
      }
    }
  }

  // #region Collision responses

  // bounce(entityA, collisionA, entityB, collisionB) {}
  // repel(entityA, collisionA, entityB, collisionB) {}
  // stick(entityA, collisionA, entityB, collisionB) {}
  // slide(entityA, collisionA, entityB, collisionB) {}

  push(entityA, entityB) {
    const em = this.entityManager;
    const posA = em.getComponent(entityA, "Position");
    const posB = em.getComponent(entityB, "Position");

    // Calculate the normal vector pointing from B to A
    const normal = posB.clone().subtract(posA.x, posA.y).normalize();

    // Calculate the magnitude of the projection of A's velocity onto the normal vector
    const velocityA = em.getComponent(entityA, "Velocity");
    const velProj = velocityA.dot(normal);
    
    if (velProj <= 0) return; // If the two velocities are moving away from each other, return early
    
    // Calculate the impulse to apply
    const bounceA = em.getComponent(entityA, "Bounciness")?.value ?? 0;
    const bounceB = em.getComponent(entityB, "Bounciness")?.value ?? 0;
    const restitution = bounceA * bounceB;

    const massA = em.getComponent(entityA, "Mass")?.value ?? 1;
    const massB = em.getComponent(entityB, "Mass")?.value ?? 1;
    const impulse = ((1 + restitution) * velProj) / (massA + massB);

    // Apply the impulse
    velocityA.x -= impulse * normal.x * massB;
    velocityA.y -= impulse * normal.y * massB;

    const velocityB = em.getComponent(entityB, "Velocity");
    velocityB.x += impulse * normal.x * massA;
    velocityB.y += impulse * normal.y * massA;

    const sizeA = em.getComponent(entityA, "Size");
    const sizeB = em.getComponent(entityB, "Size");

    // Separate the entities along the collision normal
    const overlap = this.calculateOverlapDistance(posA, sizeA, posB, sizeB);
    const separationDistance = overlap * 0.5;
    posA.x += separationDistance * normal.x;
    posA.y += separationDistance * normal.y;
    posB.x -= separationDistance * normal.x;
    posB.y -= separationDistance * normal.y;
  }

  calculateOverlapDistance(posA, sizeA, posB, sizeB) {
    // Calculate the distance between the centers of the two AABBs
    const dx = posA.x + sizeA.x / 2 - (posB.x + sizeB.x / 2);
    const dy = posA.y + sizeA.y / 2 - (posB.y + sizeB.y / 2);

    // Calculate the minimum and maximum distances between the centers of the two AABBs
    const minDx = (sizeA.x + sizeB.x) / 2;
    const minDy = (sizeA.y + sizeB.y) / 2;

    // Calculate the overlap distance in each axis (if any)
    const overlapX = Math.max(0, minDx - Math.abs(dx));
    const overlapY = Math.max(0, minDy - Math.abs(dy));

    // Return the minimum overlap distance between the two axes
    return Math.min(overlapX, overlapY);
  }

  /**
   * @param {number} entity
   * @param {import("../components/damage.js").Damage} damage
   */
  damage(entity, damage) {
    Guard.againstNull({ damage });

    const health = this.entityManager.getComponent(entity, "Health");
    Guard.againstNull({ health });

    const isDead = health.takeDamage(damage.value);
    if (isDead) this.destroy(entity);
  }

  /** @param {number} entity */
  destroy(entity) {
    this.entityManager.destroyEntity(entity);
  }

  // #endregion Collision responses
}
