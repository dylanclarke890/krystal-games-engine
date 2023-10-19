import { RenderableShape } from "../../engine/components/renderable.js";
import { Rectangle } from "../../engine/components/shape.js";
import { Transform } from "../../engine/components/transform.js";
import { Vector2 } from "../../engine/maths/vector2.js";

export class LogicGate extends RenderableShape {
  operation: keyof typeof LOGIC_GATE_OPERATIONS;
  constructor(operation: keyof typeof LOGIC_GATE_OPERATIONS) {
    super(new Transform(), new Rectangle(new Vector2(0, 0), "red"));
    this.operation = operation;
  }
}
