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
import { InputSystem, PhysicsSystem, RenderSystem } from "../systems/index.js";

export type Bounds = { position: Vector2; size: Vector2 };

export type InputAction = "held" | "pressed" | "released";
export type InputActionStatus = { [K in InputAction]: boolean };

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

export type SystemType = "input" | "physics" | "render";
export type SystemMap = {
  input: InputSystem;
  physics: PhysicsSystem;
  render: RenderSystem;
};

export type EntityTemplate = {
  [componentType: string]: BaseComponent;
};

export type ObjectPoolSettings<TConstructor extends new (...args: any[]) => InstanceType<TConstructor>> = {
  ClassConstructor: TConstructor;
  initialReserveSize?: number;
  events?: {
    onCreate?: (obj: InstanceType<TConstructor>) => void;
    onReuse?: (obj: InstanceType<TConstructor>) => void;
    onRelease?: (obj: InstanceType<TConstructor>) => void;
  };
};