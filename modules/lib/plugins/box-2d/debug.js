import { Game } from "../../../core/game.js";
import { plugin } from "../../plugin.js";
import { Box2D } from "./lib.js";

export class Box2DDebug {
  static {
    plugin([
      {
        name: "loadLevel",
        value(data) {
          this.parent(data);
          this.debugDrawer = new Box2DDebug(this.world);
        },
        needsBase: true,
      },
      {
        name: "draw",
        value() {
          this.parent();
          this.debugDrawer.draw();
        },
        needsBase: true,
      },
    ]).to(Game);
  }

  drawer = null;
  canvas = null;
  world = null;

  alpha = 0.5;
  thickness = 1.0;

  constructor(game, world, alpha, thickness) {
    this.world = world;
    this.game = game;
    this.drawer = new Box2D.Dynamics.b2DebugDraw();
    this.drawer.SetSprite(this);
    this.drawer.SetDrawScale((1 / Box2D.SCALE) * this.game.system.scale);
    this.drawer.SetFillAlpha(alpha || this.alpha);
    this.drawer.SetLineThickness(thickness || this.thickness);
    this.drawer.SetFlags(
      Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit
    );
    world.SetDebugDraw(this.drawer);
  }

  draw() {
    const { x, y } = this.game.screen.actual;
    const { ctx, scale } = this.game.system;
    ctx.save();
    ctx.translate(-x * scale, -y * scale);
    this.world.DrawDebugData();
    ctx.restore();
  }

  clearRect() {}

  beginPath() {
    this.game.system.ctx.lineWidth = this.strokeWidth;
    this.game.system.ctx.fillStyle = this.fillStyle;
    this.game.system.ctx.strokeStyle = this.strokeSyle;
    this.game.system.ctx.beginPath();
  }

  arc(x, y, radius, startAngle, endAngle, counterClockwise) {
    this.game.system.ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
  }

  closePath() {
    this.game.system.ctx.closePath();
  }

  fill() {
    this.game.system.ctx.fillStyle = this.fillStyle;
    this.game.system.ctx.fill();
  }

  stroke() {
    this.game.system.ctx.stroke();
  }

  moveTo(x, y) {
    this.game.system.ctx.moveTo(x, y);
  }

  lineTo(x, y) {
    this.game.system.ctx.lineTo(x, y);
    this.game.system.ctx.stroke();
  }
}
