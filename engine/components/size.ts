export class Size {
  x: number;
  y: number;
  halfX!: number;
  halfY!: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.updateBounds();
  }

  updateBounds() {
    this.halfX = this.x * 0.5;
    this.halfY = this.y * 0.5;
  }
}
