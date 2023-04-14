import { CollisionDetector } from "../collision/detector.js";
import { CollisionResolver } from "../collision/resolver.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Collision, Position } from "../components/index.js";
import { Assert } from "../utils/assert.js";
import { ComponentType } from "../utils/types.js";

export class PhysicSystem extends System {
  static requiredComponents: ComponentType[] = ["Position", "Velocity"];
  static systemType = SystemTypes.Physics;

  collisionDetector: CollisionDetector;
  collisionResolver: CollisionResolver;

  constructor(
    entityManager: EntityManager,
    collisionDetector: CollisionDetector,
    collisionResolver: CollisionResolver
  ) {
    super(entityManager);
    Assert.instanceOf("collisionDetector", collisionDetector, CollisionDetector);
    Assert.instanceOf("collisionResolver", collisionResolver, CollisionResolver);
    this.collisionDetector = collisionDetector;
    this.collisionResolver = collisionResolver;
  }

  update(dt: number) {
    const em = this.entityManager;
    const entities = em.getEntitiesWithComponents(...PhysicSystem.requiredComponents);

    const collidables: [number, Position, Collision][] = [];
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const position = em.getComponent(entity, "Position")!;
      const velocity = em.getComponent(entity, "Velocity")!;
      const acceleration = em.getComponent(entity, "Acceleration");

      if (acceleration) {
        velocity.add(acceleration.x * dt, acceleration.y * dt);
      }

      position.add(velocity.x * dt, velocity.y * dt);

      const collision = em.getComponent(entity, "Collision");
      if (collision) {
        collidables.push([entity, position, collision]);
      }
    }

    const collided = this.collisionDetector.detect(collidables);
    this.collisionResolver.resolve(collided);
  }
}
