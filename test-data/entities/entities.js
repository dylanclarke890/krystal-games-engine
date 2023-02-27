import { Entity } from "../../modules/core/entity.js";
import { Register } from "../../modules/core/register.js";
import { Logger } from "../../modules/lib/utils/logger.js";

class Test extends Entity {
  constructor(opts) {
    super(opts);
    this.size = { x: 50, y: 50 };
    this.logger = Logger.getInstance();
  }

  draw() {
    this.game.system.ctx.fillStyle = "orange";
    this.game.system.ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}

export class A extends Test {}
export class B extends Test {}
export class C extends Test {}

Register.entityTypes(A, B, C);
