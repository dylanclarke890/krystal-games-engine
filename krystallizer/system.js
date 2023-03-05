import { EventSystem } from "../modules/core/events.js";
import { config } from "./config.js";
import { InputEvents } from "./enums.js";

export class System {
  constructor() {
    this.tick = 0;
    this.header = document.querySelector("header");
    this.panels = document.querySelector("#panels");
    this.toolbar = document.querySelector("#toolbar");
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.textBaseline = "top";
    this.ctx.font = config.labels.font;
    this.scale = 1;
    this.drawPosition = this.DRAW.SMOOTH;
    this.mouseLast = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0 };
    this.bindEvents();
    this.resize();
    this.ready = true;
  }

  bindEvents() {
    document.addEventListener("pointermove", (e) => this.updateMousePosition(e));
    window.addEventListener("resize", () => this.resize());
  }

  /** @param {TouchEvent | MouseEvent} e */
  updateMousePosition(e) {
    const internalWidth = this.canvas.offsetWidth || this.realWidth;
    const scale = this.scale * (internalWidth / this.realWidth);

    const pos = this.canvas.getBoundingClientRect();
    const { clientX, clientY } = e.touches ? e.touches[0] : e;

    this.mouseLast.x = this.mouse.x;
    this.mouseLast.y = this.mouse.y;
    this.mouse.x = (clientX - pos.left) / scale;
    this.mouse.y = (clientY - pos.top) / scale;
    this.mouse.dx = this.mouse.x - this.mouseLast.x;
    this.mouse.dy = this.mouse.y - this.mouseLast.y;

    EventSystem.dispatch(InputEvents.MouseMove, this.mouse);
  }

  resize() {
    this.height = window.innerHeight - this.header.offsetHeight - 1;
    this.width = window.innerWidth - this.panels.offsetWidth - this.toolbar.offsetWidth;
    this.realHeight = this.height;
    this.realWidth = this.width;
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
