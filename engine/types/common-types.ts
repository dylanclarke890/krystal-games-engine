import {
  BaseComponent,
  Collider,
  Input,
  Renderable,
  RigidBody,
  Shape,
  Sprite,
  Transform,
  Animation,
} from "../components/index.js";
import { Vector2 } from "../maths/vector2.js";
import { IEntityManager } from "./common-interfaces.js";

export type Bounds = { position: Vector2; size: Vector2 };
export type InputBindingFn = (entityId: number, entityManager: IEntityManager, dt: number) => void;
export type InputBindingType = "held" | "pressed" | "released";
export type InputBindings = { [K in InputBindingType]?: InputBindingFn };

export type CollisionLayer = "DEFAULT" | "PLAYER" | "ENEMY";
export type Collidable = [number, RigidBody, Collider];

export type ComponentType =
  | "renderable"
  | "collider"
  | "rigid-body"
  | "sprite"
  | "shape"
  | "transform"
  | "input"
  | "animation";
export type ComponentMap = {
  renderable: Renderable;
  collider: Collider;
  "rigid-body": RigidBody;
  sprite: Sprite;
  shape: Shape;
  transform: Transform;
  input: Input;
  animation: Animation;
};

export type SystemType = "physics" | "render" | "input";

export type EntityTemplate = {
  [componentType: string]: BaseComponent;
};
