import { CollisionDetector, CollisionResolver } from "../../physics/collision/index.js";
import { IEntityManager, IEventManager, IQuadtree } from "../../types/common-interfaces.js";
import { Assert } from "../../utils/assert.js";
import { BaseSystem } from "../base-system.js";
import { BaseComponent } from "../../components/base.js";

export abstract class BasePhysicsSystem extends BaseSystem {
  priority: number = 5;
  name: string = "PhysicsSystem";
  requiredComponents: string[] = ["rigidBody"];

  quadtree: IQuadtree;
  detector: CollisionDetector;
  resolver: CollisionResolver;

  constructor(
    entityManager: IEntityManager,
    eventManager: IEventManager,
    quadtree: IQuadtree,
    detector: CollisionDetector,
    resolver: CollisionResolver
  ) {
    super(entityManager, eventManager);
    Assert.instanceOf("detector", detector, CollisionDetector);
    Assert.instanceOf("resolver", resolver, CollisionResolver);

    this.quadtree = quadtree;
    this.detector = detector;
    this.resolver = resolver;
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigidBody";
  }

  belongsToSystem(entity: number): boolean {
    return this.entityManager.hasComponent(entity, "rigidBody");
  }
}
