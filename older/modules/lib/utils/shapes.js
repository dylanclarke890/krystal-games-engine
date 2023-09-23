/**
 * An object with 'x' and 'y' properties.
 * @typedef {Object} Vector2d
 * @property {number} x
 * @property {number} y
 */

export class Rect {
  /**
   * @param {Vector2d} pos
   * @param {Vector2d} size
   */
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
  }

  /**
   * @param {Vector2d} p
   */
  containsPoint(p) {
    return !(
      p.x < this.pos.x ||
      p.y < this.pos.y ||
      p.x >= this.pos.x + this.size.x ||
      p.y >= this.pos.y + this.size.y
    );
  }

  /** @param {Rect} r */
  containsRect(r) {
    return (
      r.pos.x >= this.pos.x &&
      r.pos.x + r.size.x < this.pos.x + this.size.x &&
      r.pos.y >= this.pos.y &&
      r.pos.y + r.size.y < this.pos.y + this.size.y
    );
  }

  /** @param {Rect} r */
  overlapsRect(r) {
    return (
      this.pos.x < r.pos.x + r.size.x &&
      this.pos.x + this.size.x >= r.pos.x &&
      this.pos.y < r.pos.y + r.size.y &&
      this.pos.y + this.size.y >= r.pos.y
    );
  }
}
