import { EventSystem } from "../../modules/core/event-system.js";
import { config } from "../config.js";
import { EditorEvents } from "../enums.js";

export class Undo {
  /** @type {number} */
  #depth;

  /** @type {ActionState[]} */
  #undoStack;

  /** @type {ActionState[]} */
  #redoStack;

  constructor(depth) {
    this.#depth = depth ?? config.general.undoDepth;
    this.#undoStack = [];
    this.#redoStack = [];
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(EditorEvents.NewUndoState, (state, type) => this.#addUndoState(state, type));
  }

  #addUndoState(state, type) {
    if (this.#undoStack.push(new ActionState(state, type)) > this.#depth) this.#undoStack.shift();
    this.#redoStack.length = 0; // clear the redo array whenever a new undo action is created.
  }

  undo() {
    if (this.#undoStack.length === 0) return;
    EventSystem.dispatch(EditorEvents.UndoAction, this.#undoStack.pop());
  }

  redo() {
    if (this.#redoStack.length === 0) return;
    EventSystem.dispatch(EditorEvents.RedoAction, this.#redoStack.pop());
  }

  clear() {
    this.#undoStack.length = 0;
    this.#redoStack.length = 0;
  }
}

class ActionState {
  constructor(state, type) {
    this.state = state;
    this.type = type;
  }
}
