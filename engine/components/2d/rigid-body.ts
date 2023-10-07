import { BaseComponent } from "../base.js";
import { Vector2D } from "../../utils/maths/vector-2d.js";
import { Collider } from "./collision.js";

export class RigidBody extends BaseComponent {
  type = "rigidBody";

  /** Indicates whether this rigid body should move or not. */
  isStatic: boolean;
  acceleration: Vector2D;
  bounciness: number;
  colliders: Collider[];
  friction?: Vector2D;
  gravity?: Vector2D;
  position: Vector2D;
  mass: number;
  velocity: Vector2D;

  constructor(
    position = new Vector2D(0, 0),
    velocity = new Vector2D(0, 0),
    acceleration = new Vector2D(0, 0),
    mass = 1,
    bounciness = 1,
    isStatic = false
  ) {
    super();
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.mass = mass;
    this.bounciness = bounciness;
    this.isStatic = isStatic;
    this.colliders = [];
  }

  applyForce(force: Vector2D): void {
    if (!this.isStatic) {
      const forceCopy = force.clone();
      forceCopy.div(this.mass);
      this.acceleration.add(forceCopy);
    }
  }

  addCollider(collider: Collider): void {
    this.colliders.push(collider);
  }
}
