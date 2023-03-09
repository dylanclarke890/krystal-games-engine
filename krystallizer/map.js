export class Map {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: this.width * this.height }, () => new MapCell());
  }

  getCell(x, y) {
    return this.cells[y * this.width + x];
  }
}

class MapCell {
  constructor() {
    this.bgLayers = [];
    this.collision = false;
  }
}
