import { ShapeType } from "../../constants/enums.js";
import { Vector2D } from "../../utils/maths/vector-2d.js";
import { BaseComponent } from "../base.js";

export abstract class Shape extends BaseComponent {
  type: string = "shape";
  shapeType: ShapeType;

  color: string;
  size?: Vector2D;
  radius?: number;
  vertices?: Vector2D[];

  constructor(type: ShapeType, color: string) {
    super();
    this.shapeType = type;
    this.color = color;
  }
}

export class Rectangle extends Shape {
  constructor(size: Vector2D, color: string) {
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
  constructor(vertices: Vector2D[], color: string) {
    super(ShapeType.Polygon, color);
    this.vertices = vertices;
  }
}
