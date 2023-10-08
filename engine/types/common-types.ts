import { Collider } from "../components/2d/collision.js";
import { RigidBody } from "../components/2d/rigid-body.js";
import { SideOfCollision } from "../constants/enums.js";
import { Vector2 } from "../maths/vector2.js";
import { IEntityManager } from "./common-interfaces.js";

export type Bounds = { position: Vector2; size: Vector2 };
export type InputBindingFn = (entityId: number, entityManager: IEntityManager, dt: number) => void;
export type InputBindingType = "held" | "pressed" | "released";
export type InputBindings = { [K in InputBindingType]?: InputBindingFn };

export type CollisionLayer = "DEFAULT" | "PLAYER" | "ENEMY";
export type Collidable = [number, RigidBody, Collider];
export type ViewportCollisionEvent = { id: number; rigidBody: RigidBody; collider: Collider; side: SideOfCollision };
