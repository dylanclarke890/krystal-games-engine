import { Guard } from "../../lib/sanity/guard.js";
import { uniqueId } from "../../lib/utils/string.js";
import { Enum } from "../../lib/utils/enum.js";
import { noop } from "../../lib/utils/func.js";
import { Register } from "../register.js";

export class TextAlign extends Enum {
  static {
    this.Center = new TextAlign();
    this.Left = new TextAlign();
    this.Right = new TextAlign();
    this.freeze();
  }
}

export class Font {
  // Font Settings
  /** @type {keyof TextAlign} */
  #align;
  /** @type {number} */
  #alpha;
  /** @type {string} */
  #color;
  /** @type {(path:string, success: boolean) => void} */
  #onResultCallback;
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
  /** @type {import("../system.js").System} */
  system;

  constructor({ system, path, name = uniqueId("font-") } = {}) {
    Guard.againstNull({ system });
    Guard.againstNull({ path });

    this.system = system;
    this.path = path;
    this.name = name;

    this.load();
  }

  load(onResultCallback) {
    if (!this.loaded && this.system.ready) {
      this.#onResultCallback = onResultCallback || noop;
      const fontFace = new FontFace(this.name, `url(${this.path})`);
      document.fonts.add(fontFace);
      this.data = fontFace;
      this.data.load().then(
        () => this.#onload(),
        (err) => this.#onerror(err)
      );
    } else if (this.loaded) this.#onResultCallback(this.path, true);
    else Register.preloadFonts(this);
  }

  #onload() {
    this.loaded = true;
    this.#onResultCallback(this.path, true);
  }

  #onerror() {
    this.failed = true;
    this.#onResultCallback(this.path, false);
  }

  sizeOf(text) {
    return this.system.ctx.measureText(text);
  }

  write(text, x, y, opts = {}) {
    if (typeof text !== "string") text = text.toString();
    let { align, alpha, color, size } = opts;
    align = align ?? this.#align ?? TextAlign.Left;
    alpha = alpha ?? this.#alpha ?? 1;
    color = color ?? this.#color ?? "black";
    size = size ?? this.#size ?? 36;

    const { ctx, scale } = this.system;
    ctx.font = `${size * scale}px ${this.name}`;

    if (align && align !== TextAlign.Left) {
      const textWidth = this.sizeOf(text).width;
      if (align === TextAlign.Center) x -= textWidth / 2;
      else if (align === TextAlign.Right) x += textWidth;
    }

    if (alpha !== 1) ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  }
}
