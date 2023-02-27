import { config } from "./config.js";

export class System {
  constructor() {
    this.tick = 0;

    const header = document.querySelector("header");
    const panels = document.querySelector("#panels");

    this.height = window.innerHeight - header.offsetHeight - 1;
    this.width = window.innerWidth - panels.offsetWidth;
    this.realHeight = this.height;
    this.realWidth = this.width;

    this.canvas = document.querySelector("canvas");
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.textBaseline = "top";
    this.ctx.font = config.labels.font;

    this.scale = 1;
    this.drawPosition = this.DRAW.SMOOTH;
    this.ready = true;
  }

  resize() {
    const header = document.querySelector("header");
    const panels = document.querySelector("#panels");
    this.height = window.innerHeight - header.offsetHeight - 1;
    this.width = window.innerWidth - panels.offsetWidth;
    this.canvas = document.querySelector("canvas");
    this.canvas.height = this.height;
    this.canvas.width = this.width;
  }

  get DRAW() {
    return {
      AUTHENTIC: (p) => Math.round(p) * this.scale,
      SMOOTH: (p) => Math.round(p * this.scale),
      SUBPIXEL: (p) => p * this.scale,
    };
  }
}
