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

  quadtree: EntityQuadtree;
  detector: CollisionDetector;
  resolver: CollisionResolver;

  constructor(
    entityManager: EntityManager,
    eventSystem: EventSystem,
    quadtree: EntityQuadtree,
    detector: CollisionDetector,
    resolver: CollisionResolver
  ) {
    super(entityManager, eventSystem);
    Assert.instanceOf("detector", detector, CollisionDetector);
    Assert.instanceOf("resolver", resolver, CollisionResolver);
    Assert.instanceOf("quadtree", quadtree, EntityQuadtree);

    this.quadtree = quadtree;
    this.detector = detector;
    this.resolver = resolver;
  }

  update(dt: number, entities: Set<number>) {
    const em = this.entityManager;
    const defaults = PhysicSystem.defaultComponents;
    const collidables: Collidable[] = [];
    this.quadtree.clear();

    for (const id of entities) {
      const components = em.getComponents(id, PhysicSystem.components) as PhysicsSystemComponents;

      components.Mass ??= defaults.mass;
      const mass = components.Mass.value;

      if (typeof components.Acceleration !== "undefined") {
        const accel = components.Acceleration;
        components.Velocity.add((accel.x / mass) * dt, (accel.y / mass) * dt);
      }

      if (typeof components.Friction !== "undefined") {
        components.Velocity.sub(components.Friction.x * mass * dt, components.Friction.y * mass * dt);
      }

      if (typeof components.GravityFactor !== "undefined") {
        components.Velocity.add(0, components.GravityFactor.value * mass * dt);
      }

      components.Position.add(components.Velocity.x * dt, components.Velocity.y * dt);

      if (typeof components.Collision !== "undefined" && typeof components.Size !== "undefined") {
        collidables.push([id, components as CollidableComponents]);
        this.quadtree.insertEntity(id, components.Position, components.Size);
      }
    }

    this.detector.detect(collidables);
    this.resolver.resolve(this.detector);
  }
}
