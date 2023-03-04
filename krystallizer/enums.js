import { Enum } from "../modules/lib/utils/enum.js";

export class InputEvents extends Enum {
  static {
    this.MouseMove = new InputEvents();
    this.WindowResized = new InputEvents();
    this.freeze();
  }
}

export class ToolbarActions extends Enum {
  static {
    this.Default = new ToolbarActions();
    this.Move = new ToolbarActions();
    this.freeze();
  }
}
