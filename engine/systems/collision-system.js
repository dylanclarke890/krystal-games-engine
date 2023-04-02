import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { Viewport } from "../graphics/viewport.js";
import { CollisionStrategy } from "../collision-strategies/collision-strategy.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";

export class CollisionSystem extends System {
  static requiredComponents = ["Position", "Size", "Collision"];
  static systemType = SystemTypes.Collision;

  /** @type {Viewport} */
  viewport;
  /** @type {CollisionStrategy} */
  entityCollisionStrategy;

  /**
   *
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {Viewport} viewport
   * @param {EventSystem} eventSystem
   * @param {CollisionStrategy} entityCollisionStrategy
   */
  constructor(entityManager, viewport, eventSystem, entityCollisionStrategy) {
    super(entityManager);
    Guard.againstNull({ viewport }).isInstanceOf(Viewport);
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
    Guard.againstNull({ entityCollisionStrategy }).isInstanceOf(CollisionStrategy);
    this.viewport = viewport;
    this.eventSystem = eventSystem;
    this.entityCollisionStrategy = entityCollisionStrategy;

    this.#bindEvents();
  }

  #bindEvents() {
    this.eventSystem.on(GameEvents.Entity_Collided, (a, b) => this.handleEntityCollision(a, b));
  }

  update() {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...CollisionSystem.requiredComponents);
    const toCheck = [];
    for (const entity of entities) {
      const collision = em.getComponent(entity, "Collision");
      const position = em.getComponent(entity, "Position");
      const velocity = em.getComponent(entity, "Velocity");

      this.constrainToViewportDimensions(entity, collision.viewportCollision, position, velocity);

      if (collision.entityCollision.enabled) {
        toCheck.push(entity);
      }
    }

    this.entityCollisionStrategy.resolve(entities);
  }

  handleEntityCollision(entityA, entityB) {
    console.log(entityA, entityB);
  }

  /**
   * @param {number} entity entity identifier
   * @param {import("../components/position.js").Position} collision collision component
   * @param {import("../components/position.js").Position} position position component
   * @param {import("../components/velocity.js").Velocity} velocity velocity component
   */
  constrainToViewportDimensions(entity, viewportCollision, position, velocity) {
    const canvasWidth = this.viewport.canvas.width;
    const canvasHeight = this.viewport.canvas.height;
    const offset = this.entityManager.getComponent(entity, "Offset") ?? { x: 0, y: 0 };
    const bounciness = this.entityManager.getComponent(entity, "Bounciness");
    const size = this.entityManager.getComponent(entity, "Size");
    const absVelX = Math.abs(velocity.x);
    const absVelY = Math.abs(velocity.y);

    if (viewportCollision.left && position.x + offset.x < 0) {
      position.x = -offset.x;
      if (bounciness) velocity.x = -velocity.x * bounciness.bounce;
      if (absVelX < bounciness.minVelocity) {
        velocity.x = 0;
      }
    }

    if (viewportCollision.right && position.x + offset.x + size.x > canvasWidth) {
      position.x = canvasWidth - size.x - offset.x;
      if (bounciness) velocity.x = -velocity.x * bounciness.bounce;
      if (absVelX < bounciness.minVelocity) {
        velocity.x = 0;
      }
    }

    if (viewportCollision.bottom && position.y + offset.y < 0) {
      position.y = -offset.y;
      if (bounciness) velocity.y = -velocity.y * bounciness.bounce;
      if (absVelY < bounciness.minVelocity) {
        velocity.y = 0;
      }
    }

    if (viewportCollision.top && position.y + offset.y + size.y > canvasHeight) {
      position.y = canvasHeight - size.y - offset.y;
      if (bounciness) velocity.y = -velocity.y * bounciness.bounce;
      if (absVelY < bounciness.minVelocity) {
        velocity.y = 0;
      }
    }
  }
}
