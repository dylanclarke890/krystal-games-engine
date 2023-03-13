import { PositionSystem } from "./entity/systems/position-system.js";
import { RenderSystem } from "./entity/systems/render-system.js";
import { VelocitySystem } from "./entity/systems/velocity-system.js";

export class KG_EngineMain {
  constructor() {
    this.systems = [];
    this.components = [];
  }

  registerSystem(system) {
    this.systems.push(system);
  }

  registerComponent(component) {
    this.components.push(component);
  }

  registerServices() {
    this.registerSystem(VelocitySystem);
    this.registerSystem(PositionSystem);
    this.registerSystem(RenderSystem);

    this.registerComponent(PositionComponent);
    this.registerComponent(VelocityComponent);
    this.registerComponent(SpriteComponent);
  }
}
