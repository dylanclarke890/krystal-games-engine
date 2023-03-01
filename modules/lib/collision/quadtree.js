import { Rect } from "../utils/shapes.js";

export class QuadTree {
  static MAX_DEPTH = 8;

  constructor(size = new Rect({ x: 0, y: 0 }, { x: 100, y: 100 }), depth = 0) {
    /** @type {Rect} */
    this.area;
    /** @type {Rect[]} */
    this.childAreas = Array.from({ length: 4 });
    /** @type {QuadTree[]} */
    this.childTrees = Array.from({ length: 4 });
    /** @type {[Rect, Object][]} */
    this.items = [];
    /** @type {number} */
    this.depth = depth;

    this.resize(size);
  }

  /** @param {Rect} size */
  resize(size) {
    this.clear();
    const childSize = { x: size.x / 2, y: size.y / 2 };
    this.area = size;

    this.childAreas = [
      new Rect(this.area.pos, childSize), // Top left
      new Rect({ x: this.area.pos.x + childSize.x, y: this.area.pos.y }, childSize), // Top right
      new Rect({ x: this.area.pos.x, y: this.area.pos.y + childSize.y }, childSize), // Bottom left
      new Rect({ x: this.area.pos.x + childSize.x, y: this.area.pos.y + childSize.y }, childSize), // Bottom right
    ];
  }

  clear() {
    this.items = [];
    for (let i = 0; i < 4; i++) if (this.childTrees[i]) this.childTrees[i].clear();
  }

  size() {
    let totalSize = this.items.length; // 4
    for (let i = 0; i < 4; i++) {
      totalSize += this.childTrees[i].size();
    }
    return totalSize;
  }

  /**
   * @param {Object} item
   * @param {Rect} size
   */
  insert(item, size) {
    for (let i = 0; i < 4; i++) {
      if (!this.childAreas[i].containsRect(size) || this.depth + 1 < QuadTree.MAX_DEPTH) continue;
      if (!this.childTrees[i])
        this.childTrees[i] = new QuadTree(this.childAreas[i], this.depth + 1);
      this.childTrees[i].insert(item, size);
      return;
    }

    // Item couldn't be inserted into any children, so belongs to this quad.
    this.items.push([size, item]);
  }

  /** @param {Rect} area */
  search(area) {
    const list = [];
    this.searchRecursive(area, list);
    return list;
  }

  /**
   *  @param {Rect} area
   *  @param {Object[]} list
   */
  searchRecursive(area, list) {
    for (let i = 0; i < this.items.length; i++) {
      const [size, item] = this.items[i];
      if (area.overlapsRect(size)) list.push(item);
    }

    for (let i = 0; i < 4; i++) {
      if (!this.childTrees[i]) continue;

      if (this.childAreas[i].containsRect(area)) this.childTrees[i].items(list);
      else if (this.childAreas[i].overlapsRect(area))
        this.childTrees[i].searchRecursive(area, list);
    }
  }
}
