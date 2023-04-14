export type ComponentType = keyof typeof import("../components/index.js") & string;
export type Component<T extends ComponentType> = InstanceType<
  typeof import("../components/index.js")[T]
>;
