import { Vector2 } from "../maths/vector2.js";
import { ComponentType } from "../types/common-types.js";
import { BaseComponent, Collider, Transform } from "./index.js";

export class RigidBody extends BaseComponent {
  type: ComponentType = "rigid-body";

  /** Indicates whether this rigid body should move or not. */
  isStatic: boolean;
  force: Vector2;
  bounciness: number;
  colliders: Collider[];
  friction: number;
  mass: number;
  transform: Transform;
  velocity: Vector2;

  constructor(
    transform: Transform,
    velocity = new Vector2(0, 0),
    force = new Vector2(0, 0),
    mass = 1,
    bounciness = 1,
    isStatic = false
  ) {
    super();
    this.transform = transform;
    this.velocity = velocity;
    this.force = force;
    this.mass = mass;
    this.bounciness = bounciness;
    this.friction = 0;
    this.isStatic = isStatic;
    this.colliders = [];
  }

  applyForce(force: Vector2): void {
    if (!this.isStatic) {
      const forceCopy = force.clone();
      forceCopy.divScalar(this.mass);
      this.force.add(forceCopy);
    }
  }

  addCollider(collider: Collider): void {
    this.colliders.push(collider);
  }
}
