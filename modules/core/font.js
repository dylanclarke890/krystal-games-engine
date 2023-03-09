import { Guard } from "../lib/sanity/guard.js";
import { uniqueId } from "../lib/utils/string.js";
import { Enum } from "../lib/utils/enum.js";
import { noop } from "../lib/utils/func.js";
import { Register } from "./register.js";

export class Align extends Enum {
  static {
    this.Center = new Align();
    this.Left = new Align();
    this.Right = new Align();
    this.freeze();
  }
}

export class Font {
  // Font Settings
  /** @type {Align.Center|Align.Left|Align.Right } */
  #align;
  /** @type {number} */
  #alpha;
  /** @type {string} */
  #color;
  /** @type {(path:string, success: boolean) => void} */
  #loadCallback;
  /** @type {number} */
  #size;

  // Asset Info
  /** @type {string} */
  name;
  /** @type {string} */
  path;
  /** @type {boolean} */
  loaded;
  /** @type {boolean} */
  failed;

  // Dependencies
  /** @type {import("./system.js").System} */
  system;

  constructor({ system, name, path } = {}) {
    Guard.againstNull({ system });
    this.system = system;
    this.name = name ?? uniqueId("font-");
    this.path = path;
    this.load();
  }

  load(loadCallback) {
    if (!this.loaded && this.system.ready) {
      this.#loadCallback = loadCallback || noop;
      const fontFace = new FontFace(this.name, `url(${this.path})`);
      document.fonts.add(fontFace);
      this.data = fontFace;
      this.data.load().then(
        () => this.#onload(),
        (err) => this.#onerror(err)
      );
    } else if (this.loaded) this.#loadCallback(this.path, true);
    else Register.preloadFonts(this);
  }

  #onload() {
    this.loaded = true;
    this.#loadCallback(this.path, true);
  }

  #onerror() {
    this.failed = true;
    this.#loadCallback(this.path, false);
  }

  sizeOf(text) {
    return this.system.ctx.measureText(text);
  }

  write(text, x, y, opts = {}) {
    if (typeof text !== "string") text = text.toString();
    let { align, alpha, color, size } = opts;
    align = align ?? this.#align ?? Align.Left;
    alpha = alpha ?? this.#alpha ?? 1;
    color = color ?? this.#color ?? "black";
    size = size ?? this.#size ?? 36;

    const ctx = this.system.ctx;
    ctx.font = `${size}px ${this.name}`;

    if (align && align !== Align.Left) {
      const textWidth = this.sizeOf(text).width;
      if (align === Align.Center) x -= textWidth / 2;
      else if (align === Align.Right) x += textWidth;
    }

    if (alpha !== 1) ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  }
}
