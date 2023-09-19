import { Position, Collision } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";

export type ComponentType = Key<typeof import("../components/index.js")> & string;
export type Component<T extends ComponentType> = InstanceType<typeof import("../components/index.js")[T]>;
export type ComponentMap<T extends ComponentType> = { [K in T]?: Component<K> };
export type SystemComponents<TRequired extends ComponentType, TOptional extends ComponentType> = DefinedExcept<
  ComponentMap<TRequired | TOptional>,
  TOptional
>;
export type Collidable = [number, Position, Collision];
export type InputBindingFn = (entityId: number, entityManager: EntityManager, dt: number) => void;
export type InputBindingType = "held" | "pressed" | "released";
export type InputBindings = { [K in InputBindingType]?: InputBindingFn };
export type CollisionLayer = "DEFAULT" | "PLAYER" | "ENEMY";
export type CollisionSettings = {
  onEntityCollision?: (entityA: number, entityB: number, side: SideOfCollision) => void;
  onViewportCollision?: (entity: number, side: SideOfCollision) => void;
};