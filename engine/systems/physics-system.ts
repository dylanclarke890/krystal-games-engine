import { CollisionDetector, CollisionResolver } from "../physics/collision/index.js";
import { Mass } from "../components/2d/index.js";
import { SystemTypes } from "../constants/enums.js";
import { IEntityManager, IEventManager, IQuadtree } from "../types/common-interfaces.js";
import { Collidable, CollidableComponents, ComponentType, PhysicsComponents } from "../types/common-types.js";
import { Assert } from "../utils/assert.js";
import { RigidBodySystem } from "./base/rigid-body-system.js";

export class PhysicsSystem extends RigidBodySystem {
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

  quadtree: IQuadtree;
  detector: CollisionDetector;
  resolver: CollisionResolver;

  constructor(
    entityManager: IEntityManager,
    eventSystem: IEventManager,
    quadtree: IQuadtree,
    detector: CollisionDetector,
    resolver: CollisionResolver
  ) {
    super(entityManager, eventSystem);
    Assert.instanceOf("detector", detector, CollisionDetector);
    Assert.instanceOf("resolver", resolver, CollisionResolver);

    this.quadtree = quadtree;
    this.detector = detector;
    this.resolver = resolver;
  }

  update(dt: number, entities: Set<number>) {
    const em = this.entityManager;
    const defaults = PhysicsSystem.defaultComponents;
    const collidables: Collidable[] = [];
    this.quadtree.clear();

    for (const id of entities) {
      const components = em.getComponents(id, PhysicsSystem.components) as PhysicsComponents;

      components.Mass ??= defaults.mass;
      const mass = components.Mass.value;

      if (typeof components.Acceleration !== "undefined") {
        const changeInVelocity = components.Acceleration.clone().div(mass).mul(dt);
        components.Velocity.add(changeInVelocity);
      }

      if (typeof components.Friction !== "undefined") {
        const frictionDrag = components.Friction.clone().mul(mass).mul(dt);
        components.Velocity.sub(frictionDrag);
      }

      if (typeof components.GravityFactor !== "undefined") {
        components.Velocity.add(components.GravityFactor.clone().mul(dt));
      }

      components.Position.add(components.Velocity.clone().mul(dt));

      if (typeof components.Collision !== "undefined" && typeof components.Size !== "undefined") {
        collidables.push([id, components as CollidableComponents]);
        this.quadtree.insert(id, components.Position, components.Size);
      }
    }

    this.detector.detect(collidables);
    this.resolver.resolve(this.detector);
  }
}
