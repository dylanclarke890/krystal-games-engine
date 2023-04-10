import { Guard } from "../utils/guard.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";

export class PhysicSystem extends System {
  static requiredComponents = ["Position", "Velocity"];
  static systemType = SystemTypes.Physics;

  collisionDetector;
  collisionResolver;

  /**
   * @param {import("../entities/entity-manager.js").EntityManager} entityManager
   * @param {CollisionDetector} collisionDetector
   * @param {CollisionResolver} collisionResolver
   */
  constructor(entityManager, collisionDetector, collisionResolver) {
    super(entityManager);
    // Guard.againstNull({ collisionDetector });
    // Guard.againstNull({ collisionResolver });
    // this.collisionDetector = collisionDetector;
    // this.collisionResolver = collisionResolver;
  }

  update(dt) {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicSystem.requiredComponents);

    /** @type {[number, import("../components/collision.js").Collision][]} */
    const collidables = [];
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const position = em.getComponent(entity, "Position");
      const velocity = em.getComponent(entity, "Velocity");
      const acceleration = em.getComponent(entity, "Acceleration");

      if (acceleration) {
        velocity.add(acceleration.x * dt, acceleration.y * dt);
      }

      position.add(velocity.x, velocity.y);

      const collision = em.getComponent(entity, "Collision");
      if (collision) {
        collidables.push([entity, collision]);
      }
    }

    // this.collisionDetector.detect(collidables);
  }
}
