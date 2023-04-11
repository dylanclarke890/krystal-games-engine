import { CollisionDetector } from "../collision/detector";
import { CollisionResolver } from "../collision/resolver";
import { Guard } from "../utils/guard";
import { SystemTypes } from "./system-types";
import { RequiredComponent, System } from "./system";
import { EntityManager } from "../entities/entity-manager";
import { Collision } from "../components/collision";
import { Position } from "../components/position";

export class PhysicSystem extends System {
  static requiredComponents: RequiredComponent[] = ["Position", "Velocity"];
  static systemType = SystemTypes.Physics;

  collisionDetector: CollisionDetector;
  collisionResolver: CollisionResolver;

  constructor(
    entityManager: EntityManager,
    collisionDetector: CollisionDetector,
    collisionResolver: CollisionResolver
  ) {
    super(entityManager);
    Guard.againstNull({ collisionDetector }).isInstanceOf(CollisionDetector);
    Guard.againstNull({ collisionResolver }).isInstanceOf(CollisionResolver);
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
