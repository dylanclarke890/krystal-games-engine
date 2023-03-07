export class Command {
  execute() {
    throw new Error("execute() must be implemented");
  }

  undo() {
    throw new Error("undo() must be implemented");
  }
}

export class CompositeCommand extends Command {
  /** @type {Command[]} */
  #commands;

  constructor(commands) {
    super();
    this.#commands = commands;
  }

  execute() {
    for (let i = 0; i < this.#commands.length; i++) this.#commands[i].execute();
  }

  undo() {
    for (let i = this.#commands.length - 1; i >= 0; i--) this.#commands[i].undo();
  }
}

//#region SelectionBox Actions

export class SelectionBoxMoveCommand extends Command {
  constructor(box, dx, dy) {
    super();
    /** @type {import("./selection-box.js").SelectionBox} */
    this.box = box;
    this.dx = dx;
    this.dy = dy;
  }

  execute() {
    this.box.move(this.dx, this.dy);
  }

  undo() {
    this.box.move(-this.dx, -this.dy);
  }
}

export class SelectionBoxResizeCommand extends Command {
  constructor(box, dw, dh) {
    super();
    /** @type {import("./selection-box.js").SelectionBox} */
    this.box = box;
    this.dw = dw;
    this.dh = dh;
  }

  execute() {
    this.box.resize(this.dw, this.dh);
  }

  undo() {
    this.box.resize(-this.dw, -this.dh);
  }
}

//#endregion SelectionBox Actions
