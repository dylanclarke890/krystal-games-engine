type ShapeType = "circle" | "rectangle";
type ShapeSizeSettings = { width?: number; height?: number; radius?: number };

export class Shape {
  type: ShapeType;
  color: string;
  width?: number;
  height?: number;
  radius?: number;

  constructor(type: ShapeType, color: string, size: ShapeSizeSettings) {
    this.type = type;
    this.color = color;
    this.width = size.width;
    this.height = size.height;
    this.radius = size.radius;
  }
}
