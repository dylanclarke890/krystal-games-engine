import { EventSystem } from "../../modules/core/event-system.js";
import { config } from "../config.js";
import { EditorEvents } from "../enums.js";

export class CommandManager {
  /** @type {number} */
  #depth;

  /** @type {import("./base-commands.js").Command[]} */
  #undoStack;

  /** @type {import("./base-commands.js").Command[]} */
  #redoStack;

  constructor(depth) {
    this.#depth = depth ?? config.general.undoDepth;
    this.#undoStack = [];
    this.#redoStack = [];
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(EditorEvents.NewUndoState, (command) => this.#addUndoCommand(command));
    // TODO: This should be moved to the input class when it's created.
    document.addEventListener("keyup", (e) => {
      const key = e.key.toUpperCase();
      if (key === "Z") this.undo();
      else if (key === "R") this.redo();
    });
  }

  #addUndoCommand(command, clearRedoStack = true) {
    if (this.#undoStack.push(command) > this.#depth) this.#undoStack.shift();
    if (clearRedoStack) this.#redoStack.length = 0;
    console.log(this.#undoStack);
  }

  #addRedoCommand(command) {
    if (this.#redoStack.push(command) > this.#depth) this.#redoStack.shift();
    console.log(this.#redoStack);
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
