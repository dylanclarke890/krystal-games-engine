import { Entity } from "../../modules/core/entity.js";
import { Register } from "../../modules/core/register.js";

class Test extends Entity {}

export class A extends Test {
  constructor(opts) {
    super(opts);
    this.size = {
      x: 50,
      y: 58,
    };
    this.offset = {
      x: 8,
      y: 3,
    };
    this.createAnimationSheet("./test-data/assets/spritesheets/pitchfork_guy.png", this.size);
    const threeFrames = (1 / 60) * 3;
    this.addAnim("attack", threeFrames, "[0..19]", false);
  }
}
export class B extends Test {}
export class C extends Test {}

Register.entityTypes(A, B, C);
