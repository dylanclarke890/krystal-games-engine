import { Guard } from "../utils/guard.js";
import { SystemTypes } from "../systems/system-types.js";
import { System } from "../systems/system.js";
import { Viewport } from "../graphics/viewport.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { EntityCollisionBehaviour } from "./behaviours.js";

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
    const checked = new Set();
    for (let i = 0; i < entities.length; i++) {
      const entityA = entities[i];
      const collisionA = em.getComponent(entityA, "Collision");
      const posA = em.getComponent(entityA, "Position");
      const velA = em.getComponent(entityA, "Velocity") ?? { x: 0, y: 0 };
      const sizeA = em.getComponent(entityA, "Size");

      this.constrainToViewportDimensions(entityA, collisionA.viewportCollision, posA, velA, sizeA);

      if (
        !collisionA.entityCollisionBehaviour === EntityCollisionBehaviour.Ignore ||
        checked.has(entityA)
      ) {
        continue;
      }

      for (let j = i + 1; j < entities.length; j++) {
        const entityB = entities[j];
        const collisionB = em.getComponent(entityB, "Collision");
        if (
          entityA === entityB ||
          !collisionB.entityCollisionBehaviour === EntityCollisionBehaviour.Ignore ||
          checked.has(entityB)
        ) {
          continue;
        }
        const posB = em.getComponent(entityB, "Position");
        const sizeB = em.getComponent(entityB, "Size");
        if (this.entityCollisionCheck(posA, sizeA, posB, sizeB, em)) {
          this.handleEntityCollision(entityA, entityB);
        }
      }
      checked.add(entityA);
    }
  }

  /**
   * @param {number} entityA entity identifier for Entity A
   * @param {number} entityB entity identifier for Entity B
   */
  handleEntityCollision(entityA, entityB) {
    const em = this.entityManager;
    const collisionA = em.getComponent(entityA, "Collision");
    const collisionB = em.getComponent(entityB, "Collision");
    const posA = em.getComponent(entityA, "Position");
    const posB = em.getComponent(entityB, "Position");
    const velA = em.getComponent(entityA, "Velocity") ?? { x: 0, y: 0 };
    const velB = em.getComponent(entityB, "Velocity") ?? { x: 0, y: 0 };
    const sizeA = em.getComponent(entityA, "Size");
    const sizeB = em.getComponent(entityB, "Size");

    switch (collisionA.entityCollision) {
      case EntityCollisionBehaviour.Elastic:
        {
          switch (collisionB.entityCollision) {
            case EntityCollisionBehaviour.Elastic:
              this.elasticCollision(entityA, posA, sizeA, velA, entityB, posB, sizeB, velB);
              break;
            case EntityCollisionBehaviour.Inelastic:
              this.elasticInelasticCollision(entityA, velA, entityB, velB);
              break;
            case EntityCollisionBehaviour.Ignore:
            default:
              break;
          }
        }
        break;
      case EntityCollisionBehaviour.Inelastic:
        {
          switch (collisionB.entityCollision) {
            case EntityCollisionBehaviour.Elastic:
              this.elasticInelasticCollision(entityB, velB, entityA, velA);
              break;
            case EntityCollisionBehaviour.Inelastic:
              this.inelasticCollision(entityA, velA, entityB, velB);
              break;
            case EntityCollisionBehaviour.Ignore:
            default:
              break;
          }
        }
        break;
      case EntityCollisionBehaviour.OverlapResolution:
        // Overlap resolution handling
        break;
      case EntityCollisionBehaviour.Trigger:
        // Trigger handling
        break;
      case EntityCollisionBehaviour.Custom:
        // Custom collision handling
        break;
      case EntityCollisionBehaviour.Ignore:
      default:
        break;
    }

    // Calculate the overlap depth and direction of the collision
    const overlapX =
      sizeA.x / 2 + sizeB.x / 2 - Math.abs(posA.x + sizeA.x / 2 - (posB.x + sizeB.x / 2));
    const overlapY =
      sizeA.y / 2 + sizeB.y / 2 - Math.abs(posA.y + sizeA.y / 2 - (posB.y + sizeB.y / 2));

    // Determine the smallest overlap direction
    const isXSmallestOverlap = overlapX < overlapY;

    // Separate the entities based on the smallest overlap direction
    const separation = isXSmallestOverlap ? overlapX / 2 : overlapY / 2;
    if (isXSmallestOverlap) {
      if (
        collisionA.entityCollision === EntityCollisionBehaviour.Elastic &&
        collisionB.entityCollision !== EntityCollisionBehaviour.Elastic
      ) {
        posA.x -= posA.x < posB.x ? -separation : separation;
      } else if (
        collisionB.entityCollision === EntityCollisionBehaviour.Elastic &&
        collisionA.entityCollision !== EntityCollisionBehaviour.Elastic
      ) {
        posB.x -= posA.x < posB.x ? -separation : separation;
      } else {
        posA.x -= posA.x < posB.x ? -separation : separation;
        posB.x -= posA.x < posB.x ? -separation : separation;
      }
    } else {
      if (
        collisionA.entityCollision === EntityCollisionBehaviour.Elastic &&
        collisionB.entityCollision !== EntityCollisionBehaviour.Elastic
      ) {
        posA.y -= posA.y < posB.y ? -separation : separation;
      } else if (
        collisionB.entityCollision === EntityCollisionBehaviour.Elastic &&
        collisionA.entityCollision !== EntityCollisionBehaviour.Elastic
      ) {
        posB.y -= posA.y < posB.y ? -separation : separation;
      } else {
        posA.y -= posA.y < posB.y ? -separation : separation;
        posB.y -= posA.y < posB.y ? -separation : separation;
      }
    }

    this.eventSystem.dispatch(GameEvents.Entity_Collided, { entityA, entityB });
  }

  //#region Entity Collision

  elasticCollision(entityA, posA, sizeA, velA, entityB, posB, sizeB, velB) {
    const em = this.entityManager;
    const massA = em.getComponent(entityA, "Mass")?.value ?? 1;
    const massB = em.getComponent(entityB, "Mass")?.value ?? 1;
    const coeffRestitutionA = em.getComponent(entityA, "CoeffRestitution")?.value ?? 1;
    const coeffRestitutionB = em.getComponent(entityB, "CoeffRestitution")?.value ?? 1;

    const normal = {
      x: posB.x + sizeB.x / 2 - (posA.x + sizeA.x / 2),
      y: posB.y + sizeB.y / 2 - (posA.y + sizeA.y / 2),
    };

    const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    normal.x /= normalLength;
    normal.y /= normalLength;

    const relativeVelocity = {
      x: velA.x - velB.x,
      y: velA.y - velB.y,
    };

    const impulseScalarNumerator =
      -2 *
      (relativeVelocity.x * normal.x + relativeVelocity.y * normal.y) *
      (coeffRestitutionA * massA * coeffRestitutionB * massB);
    const impulseScalarDenominator =
      (coeffRestitutionA * massA + coeffRestitutionB * massB) *
      (normal.x * normal.x + normal.y * normal.y);

    const impulseScalar = impulseScalarNumerator / impulseScalarDenominator;

    velA.x += (impulseScalar * coeffRestitutionA * massB * normal.x) / massA;
    velA.y += (impulseScalar * coeffRestitutionA * massB * normal.y) / massA;

    velB.x -= (impulseScalar * coeffRestitutionB * massA * normal.x) / massB;
    velB.y -= (impulseScalar * coeffRestitutionB * massA * normal.y) / massB;
  }

  inelasticCollision(entityA, velA, entityB, velB) {
    const em = this.entityManager;
    const massA = em.getComponent(entityA, "Mass")?.value ?? 1;
    const massB = em.getComponent(entityB, "Mass")?.value ?? 1;
    const totalMass = massA + massB;

    // Compute the resulting velocity after the inelastic collision
    const resultingVelX = (massA * velA.x + massB * velB.x) / totalMass;
    const resultingVelY = (massA * velA.y + massB * velB.y) / totalMass;

    // Update the velocities of both entities with the resulting velocity
    velA.x = resultingVelX;
    velA.y = resultingVelY;
    velB.x = resultingVelX;
    velB.y = resultingVelY;
  }

  elasticInelasticCollision(elasticEntity, elasticVel, inelasticEntity, inelasticVel) {
    const em = this.entityManager;
    const elasticMass = em.getComponent(elasticEntity, "Mass")?.value ?? 1;
    const elasticPos = em.getComponent(elasticEntity, "Position");
    const inelasticMass = em.getComponent(inelasticEntity, "Mass")?.value ?? 1;
    const inelasticPos = em.getComponent(inelasticEntity, "Position");
    const coeffRestitution = em.getComponent(elasticEntity, "CoeffRestitution")?.value ?? 1;

    const relativeVelocity = {
      x: elasticVel.x - inelasticVel.x,
      y: elasticVel.y - inelasticVel.y,
    };

    const normal = {
      x: inelasticPos.x - elasticPos.x,
      y: inelasticPos.y - elasticPos.y,
    };

    const normalMagnitude = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    if (normalMagnitude === 0) return; // Prevent division by zero

    normal.x /= normalMagnitude;
    normal.y /= normalMagnitude;

    const normalVelocity = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;

    let impulseScalar;

    if (inelasticMass === Infinity) {
      // Elastic collision
      impulseScalar =
        (-(1 + coeffRestitution) * normalVelocity) /
        (1 / elasticMass + (inelasticMass === Infinity ? 0 : 1 / inelasticMass));
    } else {
      // Inelastic collision
      impulseScalar =
        -normalVelocity /
        (normalMagnitude *
          (1 / elasticMass +
            1 / inelasticMass -
            (normalMagnitude * normalMagnitude) / (em.getSystem("Physics").timeStep * 4)));
    }

    elasticVel.x += (impulseScalar / elasticMass) * normal.x;
    elasticVel.y += (impulseScalar / elasticMass) * normal.y;

    // Move the elastic entity slightly in the opposite direction of the collision normal
    // to prevent sticking
    const separation = 0.001;
    elasticPos.x -= separation * normal.x;
    elasticPos.y -= separation * normal.y;

    if (inelasticMass !== Infinity) {
      // Inelastic collision
      inelasticVel.x += (impulseScalar / inelasticMass) * normal.x;
      inelasticVel.y += (impulseScalar / inelasticMass) * normal.y;

      // Move the inelastic entity slightly in the opposite direction of the collision normal
      // to prevent sticking
      inelasticPos.x += separation * normal.x;
      inelasticPos.y += separation * normal.y;
    }
  }

  //#endregion Entity Collision

  /**
   * @param {number} entity entity identifier
   * @param {{left:boolean, right:boolean, top:boolean, bottom: boolean}} viewportCollision settings for colliding with
   * the sides of the screen.
   * @param {import("../components/position.js").Position} position position component
   * @param {import("../components/velocity.js").Velocity} velocity velocity component
   * @param {import("../components/size.js").Size} size size component
   */
  constrainToViewportDimensions(entity, viewportCollision, position, velocity, size) {
    const { height, width } = this.viewport.canvas;
    const offset = this.entityManager.getComponent(entity, "Offset") ?? { x: 0, y: 0 };
    const bounciness = this.entityManager.getComponent(entity, "Bounciness");
    const absVelX = bounciness ? Math.abs(velocity.x) : 0;
    const absVelY = bounciness ? Math.abs(velocity.y) : 0;

    if (viewportCollision.left && position.x + offset.x < 0) {
      position.x = -offset.x;
      if (bounciness) {
        velocity.x = -velocity.x * bounciness.bounce;
        if (absVelX < bounciness.minVelocity) {
          velocity.x = 0;
        }
      }
    }

    if (viewportCollision.right && position.x + offset.x + size.x > width) {
      position.x = width - size.x - offset.x;
      if (bounciness) {
        velocity.x = -velocity.x * bounciness.bounce;
        if (absVelX < bounciness.minVelocity) {
          velocity.x = 0;
        }
      }
    }

    if (viewportCollision.bottom && position.y + offset.y < 0) {
      position.y = -offset.y;
      if (bounciness) {
        velocity.y = -velocity.y * bounciness.bounce;
        if (absVelY < bounciness.minVelocity) {
          velocity.y = 0;
        }
      }
    }

    if (viewportCollision.top && position.y + offset.y + size.y > height) {
      position.y = height - size.y - offset.y;
      if (bounciness) {
        velocity.y = -velocity.y * bounciness.bounce;
        if (absVelY < bounciness.minVelocity) {
          velocity.y = 0;
        }
      }
    }
  }
}
