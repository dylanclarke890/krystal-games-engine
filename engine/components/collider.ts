import { CollisionResponseType, ShapeType } from "../constants/enums.js";
import { Vector2 } from "../maths/vector2.js";
import { ComponentType } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { BaseComponent, RigidBody, Transform } from "./index.js";
import { PhysicsMaterial } from "./physics-material.js";

export abstract class Collider extends BaseComponent {
  type: ComponentType = "collider";
  rigidBody?: RigidBody;
  transform: Transform;
  material: PhysicsMaterial;
  shape: ShapeType;
  bounds: Vector2;
  radius?: number;
  vertices?: Vector2[];

  collisionLayer: number = 0;
  collisionMask: number = 0xffffffff;
  responseType: CollisionResponseType = CollisionResponseType.Physical;
  isTrigger: boolean;

  constructor(material: PhysicsMaterial, shape: ShapeType, isTrigger?: boolean) {
    super();
    this.shape = shape;
    this.isTrigger = isTrigger ?? false;
    this.material = material;
    this.bounds = new Vector2();
    this.transform = new Transform();
  }

  protected calculateBoundingBox() {
    switch (this.shape) {
      case ShapeType.Rectangle:
        break;
      case ShapeType.Circle:
        if (typeof this.radius === "undefined") {
          throw new InvalidOperationError("radius must be defined", this);
        }
        this.bounds.x = this.radius * 2;
        this.bounds.y = this.radius * 2;
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

        this.bounds.x = Math.abs(maxX - minX);
        this.bounds.y = Math.abs(maxY - minY);
        break;
    }
  }

  getAbsolutePosition() {
    if (typeof this.rigidBody === "undefined") {
      return this.transform.position.clone();
    }
    return this.rigidBody.transform.position.clone().add(this.transform.position);
  }
}

export class CircleCollider extends Collider {
  constructor(material: PhysicsMaterial, radius: number, isTrigger?: boolean) {
    super(material, ShapeType.Circle, isTrigger);
    this.radius = radius;
    this.calculateBoundingBox();
  }
}

export class RectCollider extends Collider {
  constructor(material: PhysicsMaterial, dimensions: Vector2, isTrigger?: boolean) {
    super(material, ShapeType.Rectangle, isTrigger);
    this.bounds = dimensions;
  }
}

export class PolygonCollider extends Collider {
  constructor(material: PhysicsMaterial, vertices: Vector2[], isTrigger?: boolean) {
    super(material, ShapeType.Polygon, isTrigger);
    this.vertices = vertices;
    this.calculateBoundingBox();
  }
}
