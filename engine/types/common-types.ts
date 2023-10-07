import { Collider } from "../components/2d/collision.js";
import { RigidBody } from "../components/2d/rigid-body.js";
import { SideOfCollision } from "../constants/enums.js";
import { Vector2D } from "../utils/maths/vector-2d.js";
import { IEntityManager } from "./common-interfaces.js";

export type Bounds = { position: Vector2D; size: Vector2D };
export type InputBindingFn = (entityId: number, entityManager: IEntityManager, dt: number) => void;
export type InputBindingType = "held" | "pressed" | "released";
export type InputBindings = { [K in InputBindingType]?: InputBindingFn };
export type CollisionLayer = "DEFAULT" | "PLAYER" | "ENEMY";
type CollisionBehaviour = "NONE" | "BOUNCE";
export type EntityCollisionBehaviour = CollisionBehaviour;
export type ViewportCollisionBehaviour = CollisionBehaviour;
export type EntityCollisionCallback = (entityA: number, entityB: number, side: SideOfCollision) => void;
export type ViewportCollisionCallback = (entity: number, side: SideOfCollision) => void;
export type CollisionSettings = {
  onEntityCollision?: EntityCollisionCallback;
  onViewportCollision?: ViewportCollisionCallback;
  entityCollisionBehaviour?: EntityCollisionBehaviour;
  viewportCollisionBehaviour?: ViewportCollisionBehaviour;
};
export type Collidable = [number, RigidBody, Collider];
