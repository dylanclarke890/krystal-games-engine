import { Guard } from "../lib/sanity/guard.js";
import { noop } from "../lib/utils/func.js";
import { Register } from "./register.js";
import { ImageScaler } from "./assets/image-scaler.js";

export class GameImage {
  // Image properties
  /** @type {Image} */
  data;
  /** @type {number} */
  height;
  /** @type {number} */
  width;
  /** @type {string} */
  path;

  // Load properties
  /** @type {(path: string, success: boolean) => void} */
  #loadCallback;
  /** @type {boolean} */
  loaded;
  /** @type {boolean} */
  failed;

  // Dependencies
  /** @type {import("./system.js").System} */
  #system;

  constructor({ system, path } = {}) {
    Guard.againstNull({ system });
    Guard.againstNull({ path });

    this.#system = system;
    this.path = path;

    this.load();
  }

  load(loadCallback) {
    this.#loadCallback = loadCallback || noop;
    if (!this.loaded && this.#system.ready) {
      this.data = new Image();
      this.data.onload = (ev) => this.#onload(ev);
      this.data.onerror = (ev) => this.#onerror(ev);
      this.data.src = this.path;
    } else if (this.loaded) this.#loadCallback(this.path, true);
    else Register.preloadImages(this);
  }

  #onload() {
    this.width = this.data.width;
    this.height = this.data.height;
    this.loaded = true;
    if (this.#system.scale !== 1) this.resize(this.#system.scale);
    if (this.#loadCallback) this.#loadCallback(this.path, true);
  }

  #onerror() {
    this.failed = true;
    if (this.#loadCallback) this.#loadCallback(this.path, false);
  }

  resize(scale) {
    this.data = ImageScaler.resizeImage(this.data, scale);
    this.height = this.data.height;
    this.width = this.data.width;
  }

  draw(targetX, targetY, sourceX, sourceY, width, height) {
    if (!this.loaded) return;
    const { scale, ctx, drawPosition } = this.#system;
    targetX = drawPosition(targetX);
    targetY = drawPosition(targetY);
    sourceX = sourceX ?? 0 * scale;
    sourceY = sourceY ?? 0 * scale;
    width = (width ?? this.width) * scale;
    height = (height ?? this.height) * scale;
    ctx.drawImage(this.data, sourceX, sourceY, width, height, targetX, targetY, width, height);
  }

  drawTile(targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY) {
    tileHeight = tileHeight ? tileHeight : tileWidth;

    if (!this.loaded || tileWidth > this.width || tileHeight > this.height) return;

    const { scale, ctx, drawPosition } = this.#system;
    const tileWidthScaled = Math.floor(tileWidth * scale);
    const tileHeightScaled = Math.floor(tileHeight * scale);

    const scaleX = flipX ? -1 : 1;
    const scaleY = flipY ? -1 : 1;

    if (flipX || flipY) {
      ctx.save();
      ctx.scale(scaleX, scaleY);
    }

    ctx.drawImage(
      this.data,
      (Math.floor(tile * tileWidth) % this.width) * scale,
      Math.floor((tile * tileWidth) / this.width) * tileHeight * scale,
      tileWidthScaled,
      tileHeightScaled,
      drawPosition(targetX) * scaleX - (flipX ? tileWidthScaled : 0),
      drawPosition(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
      tileWidthScaled,
      tileHeightScaled
    );
    if (flipX || flipY) ctx.restore();
  }
}
