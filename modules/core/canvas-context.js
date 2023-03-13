import { uniqueId } from "../lib/utils/string.js";

export class CanvasContext {
  constructor(width, height, canvasId = null, parent = document.body) {
    this.canvasId = canvasId;
    this.width = width;
    this.height = height;
    this.parent = parent ?? document.body;
    this.createCanvas();
  }

  createCanvas() {
    let canvas = document.querySelector(this.canvasId);
    if (!canvas) {
      canvas = document.createElement("canvas");
      this.parent.appendChild(canvas);
      canvas.id = this.canvasId ?? uniqueId("kg-canvas-");
    }
    canvas.width = this.width;
    canvas.height = this.height;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  clear(color) {
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawText(text, x, y, font, color) {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.fillText(text, x, y);
  }
}
