import { IBroadphase } from "../types/common-interfaces.js";
import { CollisionDetector, CollisionResolver } from "./collision/index.js";
import { BaseIntegrator } from "./integrators/base-integrator.js";
import { World } from "./world.js";

export class PhysicsContext {
  integrator: BaseIntegrator;
  broadphase: IBroadphase;
  detector: CollisionDetector;
  resolver: CollisionResolver;
  world: World;

  constructor(
    integrator: BaseIntegrator,
    broadphase: IBroadphase,
    detector: CollisionDetector,
    resolver: CollisionResolver,
    world: World
  ) {
    this.integrator = integrator;
    this.broadphase = broadphase;
    this.detector = detector;
    this.resolver = resolver;
    this.world = world;
  }
}
