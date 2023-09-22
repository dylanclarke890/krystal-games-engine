import { EntityManager } from "../entities/entity-manager.js";
import { Enum } from "./enum.js";
import { Vector2D } from "./maths/vector-2d.js";

export type Bounds = { position: Vector2D; size: Vector2D };
export class SideOfCollision extends Enum {
  static None = new SideOfCollision();
  static Left = new SideOfCollision();
  static Right = new SideOfCollision();
  static Top = new SideOfCollision();
  static Bottom = new SideOfCollision();

  static {
    this.freeze();
  }
}
export type ComponentType = Key<typeof import("../components/index.js")> & string;
export type ComponentMap<T extends ComponentType> = { [K in T]?: Component<K> };
export type Component<T extends ComponentType> = InstanceType<typeof import("../components/index.js")[T]>;
export type Components<TRequired extends ComponentType, TOptional extends ComponentType> = DefinedExcept<
  ComponentMap<TRequired | TOptional>,
  TOptional
>;
export type RequiredComponents<T extends ComponentType> = Defined<ComponentMap<T>>;
export type PhysicsComponents = Components<
  "Position" | "Velocity",
  "Acceleration" | "Friction" | "Collision" | "GravityFactor" | "Mass" | "Size"
>;

export type GameSystem<T extends GameSystemType> = InstanceType<typeof import("../systems/index.js")[T]>;
export type GameSystemType = Key<typeof import("../systems/index.js")> & string;

export type InputBindingFn = (entityId: number, entityManager: EntityManager, dt: number) => void;
export type InputBindingType = "held" | "pressed" | "released";
export type InputBindings = { [K in InputBindingType]?: InputBindingFn };

export type CollidableComponents = DefinedExcept<
  PhysicsComponents,
  "Acceleration" | "Friction" | "GravityFactor" | "Mass"
>;
export type Collidable = [number, CollidableComponents];
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
