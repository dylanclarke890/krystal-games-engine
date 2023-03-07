import { EventSystem } from "../../modules/core/event-system.js";
import { config } from "../config.js";
import { EditorEvents } from "../enums.js";

export class Undo {
  /** @type {number} */
  #depth;

  /** @type {any[]} */
  #undoStack;

  /** @type {any[]} */
  #redoStack;

  constructor(depth) {
    this.#depth = depth ?? config.general.undoDepth;
    this.#undoStack = [];
    this.#redoStack = [];
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(EditorEvents.UndoStateCreated, (state, type) => this.#addUndoState(state, type));
  }

  #addUndoState(state, type) {
    if (this.#undoStack.push(new ActionState(state, type)) > this.#depth) this.#undoStack.pop();
    this.#redoStack.length = 0; // clear the array
  }

  undo() {
    if (this.#undoStack.length === 0) return;
  }
  redo() {
    if (this.#redoStack.length === 0) return;
  }
}

class ActionState {
  constructor(state, type) {
    this.state = state;
    this.type = type;
  }
}
