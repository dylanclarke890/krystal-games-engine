export class Acceleration {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  sub(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }
}
