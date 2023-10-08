import { CollisionResponseType, ShapeType } from "../../constants/enums.js";
import { InvalidOperationError } from "../../types/errors.js";
import { Vector2 } from "../../maths/vector2.js";
import { BaseComponent } from "../base.js";

export abstract class Collider extends BaseComponent {
  type = "collision";

  // Bounding box
  shape: ShapeType;
  offset: Vector2;
  radius?: number;
  dimensions?: Vector2;
  vertices?: Vector2[];

  // Used to represent the area based on the ShapeType.
  size: Vector2;

  collisionLayer: number = 0;
  collisionMask: number = 0xffffffff;
  responseType: CollisionResponseType = CollisionResponseType.Physical;
  isTrigger: boolean;

  constructor(shape: ShapeType, offset?: Vector2, isTrigger?: boolean) {
    super();
    this.shape = shape;
    this.isTrigger = isTrigger ?? false;
    this.offset = offset ?? new Vector2();
    this.size = new Vector2();
  }

  setSize() {
    switch (this.shape) {
      case ShapeType.Circle:
        if (typeof this.radius === "undefined") {
          throw new InvalidOperationError("radius must be defined", this);
        }
        this.size.x = this.radius * 2;
        this.size.y = this.radius * 2;
        break;
      case ShapeType.Rectangle:
        if (typeof this.dimensions === "undefined") {
          throw new InvalidOperationError("dimensions must be defined", this);
        }
        this.size.x = this.dimensions.x;
        this.size.y = this.dimensions.y;
        break;
      case ShapeType.Polygon:
        if (!Array.isArray(this.vertices) || this.vertices.length < 3) {
          throw new InvalidOperationError("vertices must be defined and at contain at least 3 points", this);
        }
        break;
    }
  }
}

export class CircleCollider extends Collider {
  constructor(radius: number, offset?: Vector2, isTrigger?: boolean) {
    super(ShapeType.Circle, offset, isTrigger);
    this.radius = radius;
    this.setSize();
  }
}

export class RectCollider extends Collider {
  constructor(dimensions: Vector2, offset?: Vector2, isTrigger?: boolean) {
    super(ShapeType.Rectangle, offset, isTrigger);
    this.dimensions = dimensions;
    this.setSize();
  }
}

export class PolygonCollider extends Collider {
  constructor(vertices: Vector2[], offset?: Vector2, isTrigger?: boolean) {
    super(ShapeType.Polygon, offset, isTrigger);
    this.vertices = vertices;
    this.setSize();
  }
}
