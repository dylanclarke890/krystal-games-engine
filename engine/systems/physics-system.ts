import { CollisionDetector, CollisionResolver } from "../physics/collision/index.js";
import { IQuadtree } from "../types/common-interfaces.js";
import { BaseSystem } from "./base-system.js";
import { BaseComponent } from "../components/index.js";
import { Collidable, SystemType } from "../types/common-types.js";
import { CollisionResponseType } from "../constants/enums.js";
import { GameContext } from "../core/context.js";
import { BaseIntegrator } from "../physics/integrators/base-integrator.js";

export class PhysicsSystem extends BaseSystem {
  priority: number = 5;
  name: SystemType = "physics";

  quadtree: IQuadtree;
  detector: CollisionDetector;
  resolver: CollisionResolver;
  integrator: BaseIntegrator;

  constructor(
    context: GameContext,
    quadtree: IQuadtree,
    detector: CollisionDetector,
    resolver: CollisionResolver,
    integrator: BaseIntegrator
  ) {
    super(context);
    this.integrator = integrator;
    this.quadtree = quadtree;
    this.detector = detector;
    this.resolver = resolver;
  }

  update(dt: number, entities: Set<number>) {
    const em = this.context.entities;
    const dynamicCollidables: Collidable[] = [];
    const staticCollidables: any[] = [];
    this.quadtree.clear();

    for (const id of entities) {
      const rigidBody = em.getComponent(id, "rigid-body");

      if (typeof rigidBody === "undefined") {
        const collider = em.getComponent(id, "collider");
        if (typeof collider === "undefined") {
          continue;
        }

        staticCollidables.push([id, collider]);
        this.quadtree.insert(id, collider.getAbsolutePosition(), collider.bounds);
      } else if (!rigidBody.isStatic) {
        this.integrator.integrate(id, rigidBody, dt);

        for (const collider of rigidBody.colliders) {
          if (collider.responseType === CollisionResponseType.None) {
            continue;
          }

          dynamicCollidables.push([id, rigidBody, collider]);
          this.quadtree.insert(id, collider.getAbsolutePosition(), collider.bounds);
        }
      }
    }

    this.detector.detect(dynamicCollidables);
    this.resolver.resolve(this.detector);

    // Reset forces back to zero
    for (const id of entities) {
      const rigidBody = em.getComponent(id, "rigid-body");
      if (typeof rigidBody === "undefined" || rigidBody.isStatic) {
        continue;
      }
      rigidBody.force.set(0, 0);
    }
  }

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "rigid-body" || component.type === "collider";
  }

  belongsToSystem(entity: number): boolean {
    return this.context.entities.hasComponents(entity, ["rigid-body", "collider"]);
  }
}
