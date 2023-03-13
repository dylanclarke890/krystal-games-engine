import { PositionComponent } from "../../modules/core/entity/components/position-component.js";
import { VelocityComponent } from "../../modules/core/entity/components/velocity-component.js";
import { Register } from "../../modules/core/register.js";

class Entity {
  constructor() {
    this.components = [];
  }

  addComponent(component) {
    this.components.push(component);
  }
}

export class Player extends Entity {
  constructor() {
    super();
    this.addComponent(PositionComponent);
    this.addComponent(VelocityComponent);
  }
}

Register.entityTypes(Player);
