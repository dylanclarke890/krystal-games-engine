import { Enum } from "../modules/lib/utils/enum.js";

export class EditorEvents extends Enum {
  static {
    this.NewUndoState = new EditorEvents();
    this.EntityAdded = new EditorEvents();
    this.EntityDeleted = new EditorEvents();
    this.ObjectMoved = new EditorEvents();
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
    this.EntityDragStart = new EditorActions();
    this.EntityDragEnd = new EditorActions();
    this.freeze();
  }
}
