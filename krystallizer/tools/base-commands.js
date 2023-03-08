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

// #region Move Commands

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

// #endregion Move Commands

// #region Entity Commands

class EntityCommand extends Command {
  constructor(entity, entityList) {
    super();
    /** @type {import("../../modules/core/entity.js").Entity} */
    this.entity = entity;
    /** @type {import("../../modules/core/entity.js").Entity[]} */
    this.entityList = entityList;
  }
}

export class EntityDeleteCommand extends EntityCommand {
  constructor(entity, entityList) {
    super(entity, entityList);
  }

  undo() {
    this.entityList.push(this.entity);
  }
  execute() {
    const eIndex = this.entityList.findIndex((e) => e === this.entity);
    if (eIndex !== -1) this.entityList.splice(eIndex, 1);
  }
}

export class EntityCreateCommand extends EntityCommand {
  constructor(entity, entityList) {
    super(entity, entityList);
  }

  undo() {
    const eIndex = this.entityList.findIndex((e) => e === this.entity);
    if (eIndex !== -1) this.entityList.splice(eIndex, 1);
  }

  execute() {
    this.entityList.push(this.entity);
  }
}

// #endregion Entity Commands
