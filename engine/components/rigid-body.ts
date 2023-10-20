import { Vector2 } from "../maths/vector2.js";
import { InvalidOperationError } from "../types/errors.js";
import { BaseComponent, Collider, Transform } from "./index.js";

export class RigidBody extends BaseComponent {
  name = "rigid-body";

  /** Indicates whether this rigid body should move or not. */
  isStatic: boolean;
  isSleeping: boolean;

  transform: Transform;
  velocity: Vector2;
  prevVelocity: Vector2;
  acceleration: Vector2;
  mass: number;
  damping: number;
  collider: Collider;

  constructor(
    transform: Transform,
    collider: Collider,
    velocity?: Vector2,
    acceleration?: Vector2,
    mass?: number,
    damping?: number
  ) {
    super();
    this.transform = transform;
    this.velocity = velocity ?? new Vector2(0, 0);
    this.prevVelocity = new Vector2(0, 0);
    this.acceleration = acceleration ?? new Vector2(0, 0);
    this.mass = mass ?? 1;
    this.damping = damping ?? 0.99;
    this.isStatic = false;
    this.isSleeping = false;
    this.collider = collider;
  }

  setCollider(collider: Collider): void {
    if (typeof collider.rigidBody !== "undefined") {
      throw new InvalidOperationError("Collider is already attached to a rigid body.", collider);
    }
    collider.rigidBody = this;
    this.collider = collider;
  }
}
