import { EventSystem } from "../modules/core/events.js";
import { config } from "./config.js";
import { InputEvents } from "./enums.js";

export class System {
  constructor() {
    this.tick = 0;

    this.header = document.querySelector("header");
    this.panels = document.querySelector("#panels");
    this.toolbar = document.querySelector("#toolbar");
    this.height = window.innerHeight - this.header.offsetHeight - 1;
    this.width = window.innerWidth - this.panels.offsetWidth - this.toolbar.offsetWidth;
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
    this.mouse = { x: 0, y: 0 };
    this.bindEvents();
    this.ready = true;
  }

  bindEvents() {
    document.addEventListener("mousemove", (e) => this.updateMousePosition(e));
    window.addEventListener("resize", () => this.resize());
  }

  /** @param {TouchEvent | MouseEvent} e */
  updateMousePosition(e) {
    const internalWidth = this.canvas.offsetWidth || this.realWidth;
    const scale = this.scale * (internalWidth / this.realWidth);

    const pos = this.canvas.getBoundingClientRect();
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    this.mouse.x = (clientX - pos.left + this.toolbar.offsetWidth) / scale;
    this.mouse.y = (clientY - pos.top) / scale;

    EventSystem.dispatch(InputEvents.MouseMove, this.mouse);
  }

  resize() {
    const header = document.querySelector("header");
    const panels = document.querySelector("#panels");
    this.height = window.innerHeight - header.offsetHeight - 1;
    this.width = window.innerWidth - panels.offsetWidth;
    this.realHeight = this.height;
    this.realWidth = this.width;
    this.canvas = document.querySelector("canvas");
    this.canvas.height = this.height;
    this.canvas.width = this.width;

    EventSystem.dispatch(InputEvents.WindowResized, {
      w: this.width,
      h: this.height,
      rw: this.realWidth,
      rh: this.realHeight,
    });
  }

  get DRAW() {
    return {
      AUTHENTIC: (p) => Math.round(p) * this.scale,
      SMOOTH: (p) => Math.round(p * this.scale),
      SUBPIXEL: (p) => p * this.scale,
    };
  }
}
