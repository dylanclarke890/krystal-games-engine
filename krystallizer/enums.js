import { Enum } from "../modules/lib/utils/enum.js";

export class InputEvents extends Enum {
  static {
    this.MouseMove = new InputEvents();
    this.WindowResized = new InputEvents();
    this.freeze();
  }
}
