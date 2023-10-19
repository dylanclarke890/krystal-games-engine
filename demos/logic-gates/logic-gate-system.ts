import { BaseComponent } from "../../engine/components/base.js";
import { LogicGates } from "../../engine/maths/logic-gates.js";
import { BaseSystem } from "../../engine/systems/base-system.js";
import { SystemGroup } from "../../engine/types/common-types.js";
import { LogicGateComponent } from "./components.js";

export class LogicGateSystem extends BaseSystem {
  name: string = "logic-gate";
  group: SystemGroup = "post-physics";

  isInterestedInComponent(component: BaseComponent): boolean {
    return component.type === "renderable";
  }

  belongsToSystem(entity: number): boolean {
    return this.gameContext.entities.hasComponent(entity, "renderable");
  }

  binaryOp(logicGate: LogicGateComponent, inputs: (Bit | "X")[], logicFn: (a: Bit, b: Bit) => Bit): void {
    const initialLogicArg = inputs.shift()!;
    logicGate.state = inputs.reduce((s, bit) => {
      if (s === "X" || bit === "X") {
        return "X";
      }

      return logicFn.call(LogicGates, s, bit);
    }, initialLogicArg);
  }

  update(_dt: number, entities: Set<number>): void {
    for (const id of entities) {
      const logicGate = this.gameContext.entities.getComponent(id, "renderable") as LogicGateComponent;
      const inputs = logicGate.inputs.map(
        (i) => (this.gameContext.entities.getComponent(i, "renderable") as LogicGateComponent).state
      );

      if (logicGate.operation === "not") {
        logicGate.state = inputs[0] !== "X" ? LogicGates.not(inputs[0]) : "X";
        continue;
      }

      switch (logicGate.operation) {
        case "and":
          this.binaryOp(logicGate, inputs, LogicGates.and);
          continue;
        case "nand":
          this.binaryOp(logicGate, inputs, LogicGates.nand);
          continue;
        case "nor":
          this.binaryOp(logicGate, inputs, LogicGates.nor);
          continue;
        case "or":
          this.binaryOp(logicGate, inputs, LogicGates.or);
          continue;
        case "xnor":
          this.binaryOp(logicGate, inputs, LogicGates.xnor);
          continue;
        case "xor":
          this.binaryOp(logicGate, inputs, LogicGates.xor);
          continue;

        default:
          continue;
      }
    }
  }
}
