import { BaseComponent } from "../base.js";
import { Vector2 } from "../../maths/vector2.js";
import { Collider } from "./collision.js";
import { Transform } from "./transform.js";

export class RigidBody extends BaseComponent {
  type = "rigidBody";

  /** Indicates whether this rigid body should move or not. */
  isStatic: boolean;
  acceleration: Vector2;
  bounciness: number;
  colliders: Collider[];
  friction?: number;
  gravity?: Vector2;
  mass: number;
  transform: Transform;
  velocity: Vector2;

  constructor(
    transform: Transform,
    velocity = new Vector2(0, 0),
    acceleration = new Vector2(0, 0),
    mass = 1,
    bounciness = 1,
    isStatic = false
  ) {
    super();
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.mass = mass;
    this.bounciness = bounciness;
    this.isStatic = isStatic;
    this.colliders = [];
    this.transform = transform;
  }

  applyForce(force: Vector2): void {
    if (!this.isStatic) {
      const forceCopy = force.clone();
      forceCopy.divScalar(this.mass);
      this.acceleration.add(forceCopy);
    }
  }

  addCollider(collider: Collider): void {
    this.colliders.push(collider);
  }
}
