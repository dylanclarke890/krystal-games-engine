import { Position, Collision } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { PairedSet } from "./paired-set.js";

export type Defined<TObj> = {
  [P in keyof TObj]-?: NonNullable<TObj[P]>;
};

export type DefinedExcept1<TObj, TExcept extends keyof TObj> = {
  [P in keyof TObj]-?: P extends TExcept ? never : NonNullable<TObj[P]>;
} & { [P in TExcept]?: TObj[P] | undefined };

export type DefinedExcept<TObj, TExcept extends keyof TObj> = {
  [P in keyof Pick<TObj, Exclude<keyof TObj, TExcept>>]-?: NonNullable<TObj[P]>;
} & { [P in TExcept]?: TObj[P] | undefined };

export type Key<T> = keyof T;
export type ComponentType = Key<typeof import("../components/index.js")> & string;
export type Component<T extends ComponentType> = InstanceType<
  typeof import("../components/index.js")[T]
>;
export type ComponentMap<T extends ComponentType> = {
  [K in T]?: Component<K>;
};

export type Side = "left" | "right" | "top" | "bottom";
export type Collidable = [number, Position, Collision];

export type ViewportCollision = [number, { [K in Side]?: boolean }];
export type DetectionResult = {
  entityCollisions: PairedSet<number>;
  viewportCollisions: ViewportCollision[];
};

export type InputBindingFn = (entityId: number, entityManager: EntityManager, dt: number) => void;
export type InputBindingType = "held" | "pressed" | "released";
export type InputBindings = { [K in InputBindingType]?: InputBindingFn };

export const ViewportCollisionTypes = {
  IGNORE: 1,
  LEFT: 2,
  TOP: 4,
  RIGHT: 8,
  BOTTOM: 16,
  ALL: 32,
} as const;

export const EntityCollisionTypes = {
  IGNORE: 1,
  RIGID: 2,
  BOUNCE: 4,
  STICK: 8,
} as const;
export type CollisionSettings = {
  viewportCollision?: {
    [P in Key<typeof ViewportCollisionTypes>]?: boolean;
  };
  entityCollision?: {
    [P in Key<typeof EntityCollisionTypes>]?: boolean;
  };
};
