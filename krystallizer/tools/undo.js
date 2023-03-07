import { EventSystem } from "../../modules/core/event-system.js";
import { config } from "../config.js";
import { EditorEvents } from "../enums.js";

export class Undo {
  /** @type {number} */
  #depth;

  /** @type {import("./undo-commands.js").Command[]} */
  #undoStack;

  /** @type {import("./undo-commands.js").Command[]} */
  #redoStack;

  constructor(depth) {
    this.#depth = depth ?? config.general.undoDepth;
    this.#undoStack = [];
    this.#redoStack = [];
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(EditorEvents.NewUndoState, (command) => this.#addUndoCommand(command));
  }

  #addUndoCommand(command, clearRedoStack = true) {
    if (this.#undoStack.push(command) > this.#depth) this.#undoStack.shift();
    if (clearRedoStack) this.#redoStack.length = 0;
  }

  #addRedoCommand(command) {
    if (this.#redoStack.push(command) > this.#depth) this.#redoStack.shift();
  }

  undo() {
    if (this.#undoStack.length === 0) return;
    const command = this.#undoStack.pop();
    command.undo();
    this.#addRedoCommand(command);
  }

  redo() {
    if (this.#redoStack.length === 0) return;
    const command = this.#redoStack.pop();
    command.execute();
    this.#addUndoCommand(command, false);
  }

  clear() {
    this.#undoStack.length = 0;
    this.#redoStack.length = 0;
  }
}
