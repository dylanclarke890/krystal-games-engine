import { CollisionResponseType, ShapeType } from "../constants/enums.js";
import { Vector2 } from "../maths/vector2.js";
import { ComponentType } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { BaseComponent, RigidBody } from "./index.js";
import { PhysicsMaterial } from "./physics-material.js";

export abstract class Collider extends BaseComponent {
  type: ComponentType = "collider";
  rigidBody?: RigidBody;
  offset: Vector2;
  material: PhysicsMaterial;
  shape: ShapeType;
  dimensions?: Vector2;
  boundsSize: Vector2;
  radius?: number;
  vertices?: Vector2[];

  collisionLayer: number = 0;
  collisionMask: number = 0xffffffff;
  responseType: CollisionResponseType = CollisionResponseType.Physical;
  isTrigger: boolean;

  constructor(material: PhysicsMaterial, shape: ShapeType, offset?: Vector2, isTrigger?: boolean) {
    super();
    this.shape = shape;
    this.isTrigger = isTrigger ?? false;
    this.offset = offset ?? new Vector2();
    this.boundsSize = new Vector2();
    this.material = material;
  }

  protected calculateBoundingBox() {
    switch (this.shape) {
      case ShapeType.Circle:
        if (typeof this.radius === "undefined") {
          throw new InvalidOperationError("radius must be defined", this);
        }
        this.boundsSize.x = this.radius * 2;
        this.boundsSize.y = this.radius * 2;
        break;
      case ShapeType.Rectangle:
        if (typeof this.dimensions === "undefined") {
          throw new InvalidOperationError("dimensions must be defined", this);
        }
        this.boundsSize.x = this.dimensions.x;
        this.boundsSize.y = this.dimensions.y;
        break;
      case ShapeType.Polygon:
        if (!Array.isArray(this.vertices) || this.vertices.length < 3) {
          throw new InvalidOperationError("vertices must be defined and at contain at least 3 points", this);
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        this.vertices.forEach((v) => {
          minX = minX < v.x ? minX : v.x;
          maxX = maxX > v.x ? maxX : v.x;
          minY = minY < v.y ? minY : v.y;
          maxY = maxY > v.y ? maxY : v.y;
        });

        this.boundsSize.x = Math.abs(maxX - minX);
        this.boundsSize.y = Math.abs(maxY - minY);
        break;
    }
  }
}

export class CircleCollider extends Collider {
  constructor(material: PhysicsMaterial, radius: number, offset?: Vector2, isTrigger?: boolean) {
    super(material, ShapeType.Circle, offset, isTrigger);
    this.radius = radius;
    this.calculateBoundingBox();
  }
}

export class RectCollider extends Collider {
  constructor(material: PhysicsMaterial, dimensions: Vector2, offset?: Vector2, isTrigger?: boolean) {
    super(material, ShapeType.Rectangle, offset, isTrigger);
    this.dimensions = dimensions;
    this.calculateBoundingBox();
  }
}

export class PolygonCollider extends Collider {
  constructor(material: PhysicsMaterial, vertices: Vector2[], offset?: Vector2, isTrigger?: boolean) {
    super(material, ShapeType.Polygon, offset, isTrigger);
    this.vertices = vertices;
    this.calculateBoundingBox();
  }
}
