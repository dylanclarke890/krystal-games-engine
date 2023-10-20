import { BaseComponent } from "../components/index.js";

export type InputAction = "held" | "pressed" | "released";
export type InputActionStatus = { [K in InputAction]: boolean };
export type InputStatus = InputActionStatus & { locked: boolean };

export type SystemGroup =
  | "pre-input"
  | "input"
  | "post-input"
  | "pre-physics"
  | "physics"
  | "post-physics"
  | "pre-render"
  | "render"
  | "post-render"
  | "custom";

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
