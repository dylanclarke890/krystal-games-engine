type ShapeType = "circle" | "rectangle";

export class Shape {
  type: ShapeType;
  color: string;
  width?: number;
  height?: number;
  radius?: number;

  constructor(type: ShapeType, color: string, width: number, height: number, radius: number) {
    this.type = type;
    this.color = color;
    this.width = width;
    this.height = height;
    this.radius = radius;
  }
}
