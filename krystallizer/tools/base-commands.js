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