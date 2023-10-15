import { ShapeType } from "../constants/enums.js";
import { AABB } from "../maths/aabb.js";
import { Vector2 } from "../maths/vector2.js";
import { ComponentType } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { BaseComponent } from "./base.js";
import { PhysicsMaterial } from "./physics-material.js";
import { RigidBody } from "./rigid-body.js";
import { Transform } from "./transform.js";

export abstract class Collider extends BaseComponent {
  abstract shapeType: ShapeType;
  type: ComponentType = "collider";

  transform: Transform;
  rigidBody?: RigidBody;
  material: PhysicsMaterial;
  aabb: AABB;
  isTrigger: boolean;

  constructor(transform: Transform, material: PhysicsMaterial, isTrigger = false) {
    super();
    this.transform = transform;
    this.material = material;
    this.isTrigger = isTrigger;
    this.aabb = new AABB();
  }

  abstract computeAABB(): void;

  getAbsolutePosition() {
    const position = this.transform.position.clone();
    if (this.rigidBody) {
      position.add(this.rigidBody.transform.position);
    }
    return position;
  }

  setAbsolutePosition(vector: Vector2) {
    if (this.rigidBody) {
      this.rigidBody.transform.position.assign(vector);
    } else {
      this.transform.position.assign(vector);
    }
  }
}

export class CircleCollider extends Collider {
  shapeType: ShapeType = ShapeType.Circle;
  radius: number;

  constructor(transform: Transform, material: PhysicsMaterial, radius: number, isTrigger?: boolean) {
    super(transform, material, isTrigger);
    this.radius = radius;
  }

  computeAABB() {
    const position = this.getAbsolutePosition();
    this.aabb.minX = position.x - this.radius;
    this.aabb.maxX = position.x + this.radius;
    this.aabb.minY = position.y - this.radius;
    this.aabb.maxY = position.y + this.radius;
  }
}

export class RectCollider extends Collider {
  shapeType: ShapeType = ShapeType.Rectangle;
  size: Vector2;

  constructor(transform: Transform, material: PhysicsMaterial, size: Vector2, isTrigger?: boolean) {
    super(transform, material, isTrigger);
    this.size = size;
  }

  computeAABB() {
    const position = this.getAbsolutePosition();
    this.aabb.minX = position.x;
    this.aabb.maxX = position.x + this.size.x;
    this.aabb.minY = position.y;
    this.aabb.maxY = position.y + this.size.y;
  }
}

export class PolygonCollider extends Collider {
  shapeType: ShapeType = ShapeType.Polygon;
  vertices: Vector2[];

  constructor(transform: Transform, material: PhysicsMaterial, vertices: Vector2[], isTrigger?: boolean) {
    super(transform, material, isTrigger);
    this.vertices = vertices;
  }

  computeAABB() {
    if (this.vertices.length < 3) {
      throw new InvalidOperationError("vertices must be defined and contain at least 3 points", this);
    }

    const position = this.getAbsolutePosition();

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.vertices.forEach((v) => {
      const absX = position.x + v.x;
      const absY = position.y + v.y;

      minX = Math.min(minX, absX);
      maxX = Math.max(maxX, absX);
      minY = Math.min(minY, absY);
      maxY = Math.max(maxY, absY);
    });

    this.aabb.minX = minX;
    this.aabb.minY = minY;
    this.aabb.maxX = maxX;
    this.aabb.maxY = maxY;
  }
}
