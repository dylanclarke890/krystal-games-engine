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
  }
}
