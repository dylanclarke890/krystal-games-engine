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
  #cmds;

  constructor(commands) {
    super();
    this.#cmds = commands || [];
  }

  addCmd(cmd) {
    this.#cmds.push(cmd);
  }

  removeCmd(cmd) {
    const cmdIndex = this.#cmds.findIndex((c) => c === cmd);
    this.#cmds.splice(cmdIndex, 1);
  }

  execute() {
    for (let i = 0; i < this.#cmds.length; i++) this.#cmds[i].execute();
  }

  undo() {
    for (let i = this.#cmds.length - 1; i >= 0; i--) this.#cmds[i].undo();
  }
}

export class MoveCommand extends Command {
  constructor(object, dx, dy) {
    super();
    this.object = object;
    this.dx = dx;
    this.dy = dy;
  }

  undo() {
    this.object.pos.x -= this.dx;
    this.object.pos.y -= this.dy;
  }

  execute() {
    this.object.pos.x += this.dx;
    this.object.pos.y += this.dy;
  }
}

export class CanvasMoveCommand extends MoveCommand {
  undo() {
    this.object.scroll(-this.dx, -this.dy);
  }

  execute() {
    this.object.scroll(this.dx, this.dy);
  }
}
