import { CollisionDetector } from "../collision/detector.js";
import { CollisionResolver } from "../collision/resolver.js";
import { SystemTypes } from "./system-types.js";
import { System } from "./system.js";
import { EntityManager } from "../entities/entity-manager.js";
import { Assert } from "../utils/assert.js";
import { Collidable, CollidableComponents, ComponentType, PhysicsSystemComponents } from "../utils/types.js";
import { Mass } from "../components/index.js";
import { EventSystem } from "../events/event-system.js";
import { EntityQuadtree } from "../entities/entity-quadtree.js";

export class PhysicSystem extends System {
  static requiredComponents: ComponentType[] = ["Position", "Velocity"];
  static components: ComponentType[] = [
    ...this.requiredComponents,
    "Acceleration",
    "Friction",
    "Collision",
    "GravityFactor",
    "Mass",
    "Size",
  ];

  static defaultComponents = { mass: new Mass(1) };
  static systemType = SystemTypes.Physics;

  entityQuadtree: EntityQuadtree;
  collisionDetector: CollisionDetector;
  collisionResolver: CollisionResolver;

  constructor(
    entityManager: EntityManager,
    entityQuadtree: EntityQuadtree,
    eventSystem: EventSystem,
    collisionDetector: CollisionDetector,
    collisionResolver: CollisionResolver
  ) {
    super(entityManager, eventSystem);
    Assert.instanceOf("collisionDetector", collisionDetector, CollisionDetector);
    Assert.instanceOf("collisionResolver", collisionResolver, CollisionResolver);
    Assert.instanceOf("entityQuadtree", entityQuadtree, EntityQuadtree);

    this.entityQuadtree = entityQuadtree;
    this.collisionDetector = collisionDetector;
    this.collisionResolver = collisionResolver;
  }

  update(dt: number, entities: number[]) {
    const em = this.entityManager;
    const defaults = PhysicSystem.defaultComponents;
    const collidables: Collidable[] = [];
    this.entityQuadtree.clear();

    for (let i = 0; i < entities.length; i++) {
      const entityId = entities[i];
      const entity = em.getComponents(entityId, PhysicSystem.components) as PhysicsSystemComponents;

      entity.Mass ??= defaults.mass;
      const mass = entity.Mass.value;

      if (typeof entity.Acceleration !== "undefined") {
        const accel = entity.Acceleration;
        entity.Velocity.add((accel.x / mass) * dt, (accel.y / mass) * dt);
      }

      if (typeof entity.Friction !== "undefined") {
        entity.Velocity.sub(entity.Friction.x * mass * dt, entity.Friction.y * mass * dt);
      }

      if (typeof entity.GravityFactor !== "undefined") {
        entity.Velocity.add(0, entity.GravityFactor.value * mass * dt);
      }

      entity.Position.add(entity.Velocity.x * dt, entity.Velocity.y * dt);

      if (typeof entity.Collision !== "undefined" && typeof entity.Size !== "undefined") {
        collidables.push([entityId, entity as CollidableComponents]);
      }
    }

    this.collisionDetector.detect(collidables);
    this.collisionResolver.resolveEntityCollisions(this.collisionDetector.entityCollisions);
    this.collisionResolver.resolveViewportCollisions(this.collisionDetector.viewportCollisions);
  }
}
