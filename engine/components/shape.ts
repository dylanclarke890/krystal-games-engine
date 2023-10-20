import { ShapeType } from "../constants/enums.js";
import { Vector2 } from "../maths/vector2.js";
import { BaseComponent } from "./index.js";

export abstract class Shape extends BaseComponent {
  name = "shape";
  shapeType: ShapeType;

  color: string;
  size?: Vector2;
  radius?: number;
  vertices?: Vector2[];

  constructor(type: ShapeType, color: string) {
    super();
    this.shapeType = type;
    this.color = color;
  }
}

export class Rectangle extends Shape {
  constructor(size: Vector2, color: string) {
    super(ShapeType.Rectangle, color);
    this.size = size;
  }
}

export class Circle extends Shape {
  constructor(radius: number, color: string) {
    super(ShapeType.Circle, color);
    this.radius = radius;
  }
}

export class Polygon extends Shape {
  constructor(vertices: Vector2[], color: string) {
    super(ShapeType.Polygon, color);
    this.vertices = vertices;
  }
}
