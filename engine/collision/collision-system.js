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
      const sizeA = this.entityManager.getComponent(entityA, "Size");

      this.constrainToViewportDimensions(entityA, collisionA.viewportCollision, posA, velA, sizeA);
      if (
        !collisionA.entityCollisionBehaviour === EntityCollisionBehaviour.None ||
        checked.has(entityA)
      ) {
        continue;
      }

      for (let j = i + 1; j < entities.length; j++) {
        const entityB = entities[j];
        const collisionB = em.getComponent(entityB, "Collision");
        if (
          entityA === entityB ||
          !collisionB.entityCollisionBehaviour === EntityCollisionBehaviour.None ||
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
    // const collisionB = em.getComponent(entityB, "Collision");
    // const posA = em.getComponent(entityA, "Position");
    // const posB = em.getComponent(entityB, "Position");
    // const velA = em.getComponent(entityA, "Velocity") ?? { x: 0, y: 0 };
    // const velB = em.getComponent(entityB, "Velocity") ?? { x: 0, y: 0 };
    // const sizeA = em.getComponent(entityA, "Size");
    // const sizeB = em.getComponent(entityB, "Size");

    switch (collisionA.entityCollisionBehaviour) {
      case EntityCollisionBehaviour.Elastic:
        // Elastic collision handling
        break;
      case EntityCollisionBehaviour.Inelastic:
        // Inelastic collision handling
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
        // Ignore collision handling
        break;
    }

    this.eventSystem.dispatch(GameEvents.Entity_Collided, { entityA, entityB });
  }

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
