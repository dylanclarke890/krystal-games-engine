import { CollisionResponseType, ShapeType } from "../../constants/enums.js";
import { InvalidOperationError } from "../../types/errors.js";
import { Vector2D } from "../../utils/maths/vector-2d.js";
import { BaseComponent } from "../base.js";

export abstract class Collider extends BaseComponent {
  type = "collision";

  // Bounding box
  shape: ShapeType;
  offset: Vector2D;
  radius?: number;
  dimensions?: Vector2D;
  vertices?: Vector2D[];

  // Used to represent the area based on the ShapeType.
  size: Vector2D;

  collisionLayer: number = 0;
  collisionMask: number = 0xffffffff;
  responseType: CollisionResponseType = CollisionResponseType.Physical;
  isTrigger: boolean;

  constructor(shape: ShapeType, offset?: Vector2D, isTrigger?: boolean) {
    super();
    this.shape = shape;
    this.isTrigger = isTrigger ?? false;
    this.offset = offset ?? new Vector2D();
    this.size = new Vector2D();
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
  constructor(radius: number, offset?: Vector2D, isTrigger?: boolean) {
    super(ShapeType.Circle, offset, isTrigger);
    this.radius = radius;
    this.setSize();
  }
}

export class RectCollider extends Collider {
  constructor(dimensions: Vector2D, offset?: Vector2D, isTrigger?: boolean) {
    super(ShapeType.Rectangle, offset, isTrigger);
    this.dimensions = dimensions;
    this.setSize();
  }
}

export class PolygonCollider extends Collider {
  constructor(vertices: Vector2D[], offset?: Vector2D, isTrigger?: boolean) {
    super(ShapeType.Polygon, offset, isTrigger);
    this.vertices = vertices;
    this.setSize();
  }
}
