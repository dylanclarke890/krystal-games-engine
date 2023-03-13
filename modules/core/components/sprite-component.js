export class SpriteComponent {
  /**
   * @param {string} path - The source path of the sprite image.
   * @param {number} width - The width of the sprite image.
   * @param {number} height - The height of the sprite image.
   */
  constructor(path, width, height) {
    this.image = new Image();
    this.image.src = path;
    this.width = width;
    this.height = height;
  }
}
