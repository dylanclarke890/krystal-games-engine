import { Guard } from "../lib/sanity/guard.js";
import { uniqueId } from "../lib/utils/string.js";
import { $el, $new } from "../lib/utils/dom.js";
import { VendorAttributes } from "../lib/utils/vendor-attributes.js";

export class System {
  /** @type {import("./runner.js").GameRunner} */
  #runner;

  /** @type {HTMLCanvasElement} */
  canvas;
  /** @type {CanvasRenderingContext2D} */
  ctx;
  /** @type {import("./timer.js").Timer} */
  clock;
  tick = 0;
  scale = 1;
  drawPosition = this.DRAW.SMOOTH;
  realHeight = 800;
  realWidth = 600;
  scaleMode = this.SCALE.SMOOTH;
  height = 800;
  width = 600;

  constructor({ runner, canvasId = null, width, height, scale }) {
    Guard.againstNull({ runner });
    this.#runner = runner;

    let insertElement = false;
    this.canvas = $el("#" + canvasId);
    if (!this.canvas) {
      this.canvas = $new("canvas");
      insertElement = true;
    }

    this.canvas.id = canvasId ?? uniqueId("canvas-");
    this.resize(width, height, scale);
    this.ctx = this.canvas.getContext("2d");

    if (insertElement) document.body.insertBefore(this.canvas, document.body.firstChild);
    this.width = width;
    this.height = height;

    // Automatically switch to crisp scaling when using a scale other than 1
    if (this.scale !== 1) this.scaleMode = this.SCALE.CRISP;
    this.scaleMode(this.ctx);
  }

  resize(width, height, scale) {
    this.width = width;
    this.height = height;
    this.scale = scale || this.scale;

    this.realWidth = this.width * this.scale;
    this.realHeight = this.height * this.scale;
    this.canvas.width = this.realWidth;
    this.canvas.height = this.realHeight;
  }

  get ready() {
    return this.#runner.ready;
  }

  clear(color) {
    const { ctx, realHeight, realWidth } = this;
    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, realWidth, realHeight);
    } else ctx.clearRect(0, 0, realWidth, realHeight);
  }

  get DRAW() {
    return {
      AUTHENTIC: (p) => Math.round(p) * this.scale,
      SMOOTH: (p) => Math.round(p * this.scale),
      SUBPIXEL: (p) => p * this.scale,
    };
  }

  get SCALE() {
    return {
      CRISP: (ctx) => {
        const canvas = ctx.canvas;
        VendorAttributes.set(ctx, "imageSmoothingEnabled", false);
        canvas.style.imageRendering = "-moz-crisp-edges";
        canvas.style.imageRendering = "-o-crisp-edges";
        canvas.style.imageRendering = "-webkit-optimize-contrast";
        canvas.style.imageRendering = "crisp-edges";
        canvas.style.msInterpolationMode = "nearest-neighbor"; // No effect on Canvas :/
      },
      SMOOTH: (ctx) => {
        const canvas = ctx.canvas;
        VendorAttributes.set(ctx, "imageSmoothingEnabled", true);
        canvas.style.imageRendering = "";
        canvas.style.msInterpolationMode = "";
      },
    };
  }

}
