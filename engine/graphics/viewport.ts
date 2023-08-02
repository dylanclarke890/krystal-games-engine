import { uniqueId } from "../utils/string.js";

export class Viewport {
  canvasId: string;
  width: number;
  height: number;
  parent: HTMLElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  realWidth: number;
  scale: number;

  /**
   * @param {number} width
   * @param {number} height
   * @param {string} canvasId
   * @param {HTMLElement} parent
   */
  constructor(width: number, height: number, canvasId?: string, parent: HTMLElement = document.body) {
    this.canvasId = canvasId ?? uniqueId("kg-canvas-");
    this.width = width;
    this.height = height;
    this.scale = 1;
    this.realWidth = this.width;
    this.parent = parent ?? document.body;
    this.createCanvas();
  }

  createCanvas() {
    let canvas = document.querySelector(this.canvasId) as HTMLCanvasElement | null;
    if (typeof canvas === "undefined" || canvas === null) {
      canvas = document.createElement("canvas");
      this.parent.appendChild(canvas);
      canvas.id = this.canvasId;
    }
    canvas.width = this.width;
    canvas.height = this.height;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  clear(color?: string) {
    if (typeof color === "undefined") this.ctx.clearRect(0, 0, this.width, this.height);
    else {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawText(text: string, x: number, y: number, font: string, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.font = font;
    this.ctx.fillText(text, x, y);
  }
}
