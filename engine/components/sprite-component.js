import { Guard } from "../utils/guard.js";

export class SpriteComponent {
  /**
   * @param {string} path - The source path of the sprite image.
   * @param {number} width - The width of a single sprite frame.
   * @param {number} height - The height of a single sprite frame.
   */
  constructor(path, width, height) {
    Guard.againstNull({ path });
    this.image = new Image();
    this.image.addEventListener("load", () => {
      this.columns = Math.floor(this.image.width / width);
    });
    this.image.src = path;
    this.width = width;
    this.height = height;

    this.columns = 1;
  }
}
