import { RenderableShape } from "../../engine/components/renderable.js";
import { Rectangle } from "../../engine/components/shape.js";
import { Transform } from "../../engine/components/transform.js";
import { LogicGateOperation } from "../../engine/maths/logic-gates.js";
import { Vector2 } from "../../engine/maths/vector2.js";

export class LogicGateComponent extends RenderableShape {
  operation: LogicGateOperation;
  state: Bit | "X";
  inputs: number[];

  constructor(operation: LogicGateOperation) {
    super(new Transform(), new Rectangle(new Vector2(0, 0), "red"));
    this.operation = operation;
    this.state = 0;
    this.inputs = [];
  }
}

export class VoltageComponent extends RenderableShape {
  state: Bit;

  constructor(v: "high" | "low") {
    super(new Transform(), new Rectangle(new Vector2(0, 0), "blue"));
    this.state = v === "high" ? 1 : 0;
  }
}
