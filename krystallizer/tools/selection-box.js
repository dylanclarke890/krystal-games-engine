import { Rect } from "../../modules/lib/utils/shapes.js";

export class SelectionBox {
  constructor() {
    this.rect = new Rect({ x: 0, y: 0 }, { x: 0, y: 0 });
    this.selected = [];
    this.active = false;
  }

  select() {}

  /**
   * Move the selection box. Number passed should be the distance to move, not the new position.
   * @param {number} x
   * @param {number} y
   */
  move(x, y) {
    this.rect.pos.x += x;
    this.rect.pos.y += y;
    for (let i = 0; i < this.selected.length; i++) {
      this.selected[i].x += x;
      this.selected[i].y += y;
    }
  }

  clear(setActive) {
    this.rect.pos.x = 0;
    this.rect.pos.y = 0;
    this.rect.size.x = 0;
    this.rect.size.y = 0;
    this.selected = [];
    if (setActive != null) this.active = !!setActive;
  }

  draw() {
    if (!this.active) return;
  }
}
