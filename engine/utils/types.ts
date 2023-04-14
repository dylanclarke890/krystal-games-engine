import { PairedSet } from "./paired-set.js";

export type ComponentType = keyof typeof import("../components/index.js") & string;
export type Component<T extends ComponentType> = InstanceType<
  typeof import("../components/index.js")[T]
>;

export type Side = "left" | "right" | "top" | "bottom";
export type ViewportCollision = [number, { [K in Side]?: boolean }];
export type DetectionResult = {
  entityCollisions: PairedSet<number>;
  viewportCollisions: ViewportCollision[];
};
