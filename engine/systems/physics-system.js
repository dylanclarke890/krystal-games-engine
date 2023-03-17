import { System } from "./system.js";

export class PhysicsSystem extends System {
  static requiredComponents = ["PositionComponent", "VelocityComponent"];

  update() {
    const entities = this.entityManager.getEntitiesForSystem("physics");
    console.log(entities);
  }
}
