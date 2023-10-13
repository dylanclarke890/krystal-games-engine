import { Collider } from "../../components/collider.js";
import { Vector2 } from "../../maths/vector2.js";

export class ColliderEntity {
  id: number;
  collider: Collider;

  constructor(id: number, collider: Collider) {
    this.id = id;
    this.collider = collider;
  }
}

export class CollisionInfo {
  entityA: ColliderEntity;
  entityB: ColliderEntity;
  normal: Vector2;
  penetration: number;
  contactPoints: Vector2[];

  constructor(a: ColliderEntity, b: ColliderEntity) {
    this.entityA = a;
    this.entityB = b;
    this.normal = new Vector2();
    this.penetration = 0;
    this.contactPoints = [];
  }
}
