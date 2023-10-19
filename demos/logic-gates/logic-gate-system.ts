import { BaseComponent } from "../../engine/components/base.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemGroup } from "../../engine/types/common-types.js";
import { LogicGate } from "./logic-gate-component.js";

export class LogicGateSystem extends BaseSystem {
  name: string = "logic-gate";
  group: SystemGroup = "post-physics";

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "renderable";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "renderable");
  }

  update(_dt: number, entities: Set<number>): void {
    for (const id of entities) {
      const logicGate = this.gameContext.entities.getComponent(id, "renderable") as LogicGate;
      console.log(logicGate);
    }
  }
}
