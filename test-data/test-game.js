import { Entity } from "../modules/core/entity.js";
import { KrystalGame } from "../modules/core/game.js";
import { Register } from "../modules/core/register.js";
import { GameRunner } from "../modules/core/runner.js";

class TestPlayer extends Entity {
  constructor(opts) {
    super(opts);
  }
}

class TestGame extends KrystalGame {
  constructor(opts) {
    super(opts);
  }

  draw() {
    super.draw();
    console.log("being called");
  }
}

Register.entityType(TestPlayer);

new GameRunner({
  gameClass: TestGame,
  canvasId: "canvas1",
  width: 500,
  height: 500,
  fonts: { standard: "test-data/assets/arcade-classic.TTF" },
});
