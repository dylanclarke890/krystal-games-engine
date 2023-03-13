import { SpriteComponent } from "./components/sprite-component.js";
import { VelocityComponent } from "./components/sprite-component.js";
import { PositionComponent } from "./components/sprite-component.js";
import { PositionSystem } from "./systems/position-system.js";
import { RenderSystem } from "./systems/render-system.js";
import { VelocitySystem } from "./systems/velocity-system.js";

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
    // Systems
    this.registerSystem(VelocitySystem);
    this.registerSystem(PositionSystem);
    this.registerSystem(RenderSystem);

    // Components
    this.registerComponent(PositionComponent);
    this.registerComponent(VelocityComponent);
    this.registerComponent(SpriteComponent);
  }
}
