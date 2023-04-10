import { System } from "./system.js";

export class PhysicSystem extends System {
  constructor(entityManager, collisionDetector, collisionResolver) {
    super(entityManager);
    this.collisionDetector = collisionDetector;
    this.collisionResolver = collisionResolver;
  }
}
