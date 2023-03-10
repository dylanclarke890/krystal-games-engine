import { Assert } from "../../lib/sanity/assert.js";
import { Guard } from "../../lib/sanity/guard.js";
import { arrayFromInterval } from "../../lib/utils/array.js";
import { Timer } from "../timer.js";

export class GameAnimationSheet {
  /** @type {number} */
  height;
  /** @type {import("./image.js").GameImage} */
  image;
  /** @type {import("../system.js").System} */
  system;
  /** @type {number} */
  width;

  constructor({ path, size = {}, system, mediaFactory }) {
    Guard.againstNull({ system });
    Guard.againstNull({ mediaFactory });
    this.system = system;
    this.width = size.x ?? 8;
    this.height = size.y ?? 8;
    this.image = mediaFactory.createImage({ path });
  }
}

export class GameAnimation {
  /** @type {number} */
  #frame;
  /** @type {number} */
  #frameTime;
  /** @type {number[]} */
  #sequence;
  /** @type {GameAnimationSheet} */
  #sheet;
  /** @type {boolean} */
  #stop;
  /** @type {number} */
  #tile;
  /** @type {Timer} */
  #timer;

  /** @type {number} */
  alpha;
  /** @type {number} */
  angle;
  /** @type {{x: boolean, y:boolean}} */
  flip;
  /** @type {{x:number, y:number}} */
  pivot;
  /** @type {number} */
  loopCount;

  constructor(sheet, frameTime, sequence, stop) {
    Guard.againstNull({ sheet });
    this.#timer = new Timer();
    this.#sheet = sheet;
    this.#frameTime = frameTime;
    this.#sequence = Assert.isType(sequence, "string") ? arrayFromInterval(sequence) : sequence;
    this.#stop = !!stop;
    this.#tile = this.#sequence[0];

    this.angle = 0;
    this.alpha = 1;
    this.pivot = { x: sheet.width / 2, y: sheet.height / 2 };
    this.flip = { x: false, y: false };
  }

  /**
   * Draw the current animation frame.
   * @param {number} targetX
   * @param {number} targetY
   */
  draw(targetX, targetY) {
    const bbsize = Math.max(this.#sheet.width, this.#sheet.height);
    const { width, height, ctx, drawPosition } = this.#sheet.system;
    // Exit early if not on screen.
    if (targetX > width || targetY > height || targetX + bbsize < 0 || targetY + bbsize < 0) return;

    if (this.alpha !== 1) ctx.globalAlpha = this.alpha;
    if (this.angle === 0) {
      this.#sheet.image.drawTile(
        targetX,
        targetY,
        this.#tile,
        this.#sheet.width,
        this.#sheet.height,
        this.flip.x,
        this.flip.y
      );
    } else {
      ctx.save();
      ctx.translate(drawPosition(targetX + this.pivot.x), drawPosition(targetY + this.pivot.y));
      ctx.rotate(this.angle);
      this.#sheet.image.drawTile(
        -this.pivot.x,
        -this.pivot.y,
        this.#tile,
        this.#sheet.width,
        this.#sheet.height,
        this.flip.x,
        this.flip.y
      );
      ctx.restore();
    }
    if (this.alpha !== 1) ctx.globalAlpha = 1;
  }

  /** Updates the current frame of the animation. */
  update() {
    const frameTotal = Math.floor(this.#timer.delta() / this.#frameTime);
    this.loopCount = Math.floor(frameTotal / this.#sequence.length);
    if (this.#stop && this.loopCount > 0) this.#frame = this.#sequence.length - 1;
    else this.#frame = frameTotal % this.#sequence.length;
    this.#tile = this.#sequence[this.#frame];
  }

  /** Restart this animation. */
  rewind() {
    this.#timer.set();
    this.loopCount = 0;
    this.#frame = 0;
    this.#tile = this.#sequence[0];
    return this;
  }

  /**
   * Go to a specific frame.
   * @param {number} frame
   */
  gotoFrame(frame) {
    // Offset the timer by one tenth of a millisecond to make sure we
    // jump to the correct frame and circumvent rounding errors
    this.#timer.set(this.#frameTime * -frame - 0.0001);
    this.update();
  }

  /** Go to a random frame. */
  gotoRandomFrame() {
    this.gotoFrame(Math.floor(Math.random() * this.#sequence.length));
  }
}
