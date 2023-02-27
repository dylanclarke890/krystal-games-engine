import { Entity } from "../../modules/core/entity.js";
import { Register } from "../../modules/core/register.js";
import { Logger } from "../../modules/lib/utils/logger.js";

class Test extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 50, y: 50 };
    this.logger = Logger.getInstance();
    this.color = "white";
  }

  draw() {
    this.game.system.ctx.fillStyle = this.color;
    this.game.system.ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}

export class A extends Test {
  constructor(opts) {
    super(opts);
    this.color = "orange";
  }
}
export class B extends Test {
  constructor(opts) {
    super(opts);
    this.color = "blue";
  }
}
export class C extends Test {
  constructor(opts) {
    super(opts);
    this.color = "purple";
  }
}

Register.entityTypes(A, B, C);
