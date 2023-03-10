import { removeItem } from "../lib/utils/array.js";
import { Guard } from "../lib/sanity/guard.js";
import { Register } from "./register.js";
import { EventSystem } from "./event-system.js";
import { GameEvents } from "./events.js";

export class GameLoader {
  // Asset Data
  /** @type {any[]} */
  #assetsToPreload;
  /** @type {any[]} */
  #pending;

  // Load Status
  /** @type {boolean} */
  #done;
  /** @type {number} */
  #intervalId;
  /** @type {number} */
  #progressPercent = 0;
  /** @type {number} */
  status;

  // Dependencies
  /** @type {import("./system.js").System} */
  #system;

  constructor(system) {
    Guard.againstNull({ system });
    this.#system = system;
    this.load();
  }

  #loadCallback(path, wasSuccessful) {
    if (!wasSuccessful) throw new Error(`Failed to load resource: ${path}`);
    removeItem(this.#pending, path);
    this.status = 1 - this.#pending.length / this.#assetsToPreload.length;
    if (this.#pending.length === 0) setTimeout(() => this.end(), 250);
  }

  load() {
    this.#system.clear("#000");
    this.#assetsToPreload = Register.assetsToPreload;
    if (!this.#assetsToPreload?.length) {
      this.end();
      return;
    }

    this.#pending = [];
    for (let i = 0; i < this.#assetsToPreload.length; i++) {
      this.#pending.push(this.#assetsToPreload[i].path);
      this.#assetsToPreload[i].load((path, success) => this.#loadCallback(path, success));
    }
    this.#intervalId = setInterval(() => this.#drawLoadingScreen(), 16);
  }

  end() {
    if (this.#done) return;
    this.#done = true;
    clearInterval(this.#intervalId);
    Register.clearPreloadCache();
    EventSystem.dispatch(GameEvents.System_PreloadingComplete);
  }

  #drawLoadingScreen() {
    this.#progressPercent += (this.status - this.#progressPercent) / 5;
    const { scale, width, height, ctx } = this.#system;

    let barWidth = Math.floor(width * 0.6);
    let barHeight = Math.floor(height * 0.1);
    const x = Math.floor(width * 0.5 - barWidth / 2) * scale;
    const y = Math.floor(height * 0.5 - barHeight / 2) * scale;
    barWidth = barWidth * scale;
    barHeight = barHeight * scale;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + scale, y + scale, barWidth - scale - scale, barHeight - scale - scale);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, barWidth * this.#progressPercent, barHeight);
  }
}
