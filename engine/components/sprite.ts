import { Guard } from "../utils/guard";

export class Sprite {
  image: HTMLImageElement;
  width: number;
  height: number;
  columns: number;

  /**
   * @param path - The source path of the sprite image.
   * @param width - The width of a single sprite frame.
   * @param height - The height of a single sprite frame.
   */
  constructor(path: string, width: number, height: number) {
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
