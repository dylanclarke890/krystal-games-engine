import { CollisionDetector } from "../collision/detector.js";
import { CollisionResolver } from "../collision/resolver.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { Collidable, ComponentMap, ComponentType, DefinedExcept } from "../utils/types.js";
import { Mass } from "../components/mass.js";

type RequiredComponents = "Position" | "Velocity";
type OptionalComponents = "Acceleration" | "Friction" | "Collision" | "GravityFactor" | "Mass";
const defaultComponents = {
  mass: new Mass(1),
};

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

    const collidables: Collidable[] = [];
    for (let i = 0; i < entities.length; i++) {
      const id = entities[i];
      const entity = em.getComponents(
        id,
        "Position",
        "Velocity",
        "Acceleration",
        "Friction",
        "Collision",
        "GravityFactor",
        "Mass"
      ) as DefinedExcept<ComponentMap<RequiredComponents | OptionalComponents>, OptionalComponents>;
      if (!entity.Mass) {
        entity.Mass = defaultComponents.mass;
      }

      if (entity.Acceleration) {
        entity.Velocity.add(entity.Acceleration.x * dt, entity.Acceleration.y * dt);
      }

      if (entity.Friction) {
        entity.Velocity.sub(entity.Friction.x * dt, entity.Friction.y * dt);
      }

      if (entity.GravityFactor) {
        entity.Velocity.add(0, entity.GravityFactor.value * dt);
      }

      entity.Position.add(entity.Velocity.x * dt, entity.Velocity.y * dt);

      if (entity.Collision) {
        collidables.push([id, entity.Position, entity.Collision]);
      }
    }

    const collided = this.collisionDetector.detect(collidables);
    this.collisionResolver.resolve(collided);
  }
}
