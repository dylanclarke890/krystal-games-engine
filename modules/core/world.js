import { EntityManager } from "./managers/entity-manager.js";
import { PhysicsSystem } from "./systems/physics-system.js";
import { PositionSystem } from "./systems/position-system.js";
import { RenderSystem } from "./systems/render-system.js";

export class World {
  constructor() {
    this.managers = {
      entity: new EntityManager(),
    };
    this.systems = {
      position: new PositionSystem(this.managers.entity),
      graphics: new RenderSystem(this.managers.entity),
      physics: new PhysicsSystem(this.managers.entity),
    };
  }

  update(tick) {
    this.tick = tick;
    this.systems.position.update();
    this.systems.physics.update();
    this.systems.graphics.update();
  }
}
