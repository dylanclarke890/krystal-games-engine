import { Enum } from "../modules/lib/utils/enum.js";

export class InputEvents extends Enum {
  static {
    this.MouseMove = new InputEvents();
    this.WindowResized = new InputEvents();
    this.freeze();
  }
}

export class EditorActions extends Enum {
  static {
    this.Cursor = new EditorActions();
    this.Move = new EditorActions();
    this.Select = new EditorActions();
    this.Eraser = new EditorActions();
    this.Shape = new EditorActions();
    this.freeze();
  }
}
