import { Vector2 } from "../maths/vector2.js";
import { ComponentType } from "../types/common-types.js";
import { InvalidOperationError } from "../types/errors.js";
import { BaseComponent, Collider, Transform } from "./index.js";

export class RigidBody extends BaseComponent {
  type: ComponentType = "rigid-body";

  /** Indicates whether this rigid body should move or not. */
  isStatic: boolean;
  isSleeping: boolean;

  transform: Transform;
  force: Vector2;
  mass: number;
  damping: number;
  velocity: Vector2;
  colliders: Collider[];

  constructor(transform: Transform, velocity = new Vector2(0, 0), force = new Vector2(0, 0), mass = 1, damping = 0.99) {
    super();
    this.transform = transform;
    this.velocity = velocity;
    this.force = force;
    this.mass = mass;
    this.damping = damping;
    this.isStatic = false;
    this.isSleeping = false;
    this.colliders = [];
  }

  addCollider(collider: Collider): void {
    if (typeof collider.rigidBody !== "undefined") {
      throw new InvalidOperationError("Collider is already attached to a rigid body.", collider);
    }
    collider.rigidBody = this;
    this.colliders.push(collider);
  }
}
