import { Position, Collision } from "../components/index.js";
import { EntityManager } from "../entities/entity-manager.js";
import { PairedSet } from "./paired-set.js";

export type ComponentType = keyof typeof import("../components/index.js") & string;
export type Component<T extends ComponentType> = InstanceType<
  typeof import("../components/index.js")[T]
>;

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
