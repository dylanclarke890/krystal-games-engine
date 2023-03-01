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
    this.itemsWithin = [];
    /** @type {number} */
    this.depth = depth;

    this.resize(size);
  }

  /**
   * Resizes the QuadTree to fit within the given size.
   * @param {Rect} size */
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

  /**
   * Add an item to this QuadTree.
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
    this.itemsWithin.push([size, item]);
  }

  /** Remove an item from the tree. Currently only checks for reference equality if the item is an object. */
  remove(item) {
    // Check if the item exists in this quad
    const index = this.itemsWithin.findIndex(([, obj]) => obj === item);
    if (index !== -1) {
      this.itemsWithin.splice(index, 1);
      return true;
    }

    // If not, check if it exists in any of the child quads
    for (let i = 0; i < 4; i++) {
      if (!this.childTrees[i]) continue;
      if (this.childTrees[i].remove(item)) {
        // If the item was found and removed from a child quad, check if the child quad is now empty
        if (this.childTrees[i].size() === 0) this.childTrees[i] = null;
        return true;
      }
    }

    // Item not found in this quad or any of its children
    return false;
  }

  /**
   * Search for items in the QuadTree that intersect with the given area.
   * @param {Rect} area */
  search(area) {
    const list = [];
    this.searchRecursive(area, list);
    return list;
  }

  /**
   * Recursively search this QuadTree for the items that intersect with the given area.
   * @param {Rect} area
   * @param {Object[]} list
   */
  searchRecursive(area, list) {
    for (let i = 0; i < this.itemsWithin.length; i++) {
      const [size, item] = this.itemsWithin[i];
      if (area.overlapsRect(size)) list.push(item);
    }

    for (let i = 0; i < 4; i++) {
      if (!this.childTrees[i]) continue;

      if (this.childAreas[i].containsRect(area)) this.childTrees[i].items(list);
      else if (this.childAreas[i].overlapsRect(area))
        this.childTrees[i].searchRecursive(area, list);
    }
  }

  /**
   * Get all the items this QuadTree holds.
   * @param {any[]} list
   */
  items(list) {
    // this.itemsWithin is an array of [sizeOfObj, Object]. We just want the object.
    for (let i = 0; i < this.itemsWithin.length; i++) list.push(this.itemsWithin[i])[1];
  }

  /** Get the area of this QuadTree. */
  areaOf() {
    return this.area;
  }

  /** Get the total amount of items in this QuadTree. */
  size() {
    let totalSize = this.itemsWithin.length;
    for (let i = 0; i < 4; i++) if (this.childTrees[i]) totalSize += this.childTrees[i].size();
    return totalSize;
  }

  /** Reset this QuadTree. */
  clear() {
    this.itemsWithin = [];
    for (let i = 0; i < 4; i++) if (this.childTrees[i]) this.childTrees[i].clear();
  }
}
