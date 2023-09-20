declare type Key<T> = keyof T;

declare type ValueOfObj<T> = T[Key<T>];

declare type Defined<TObj> = {
  [P in Key<TObj>]-?: NonNullable<TObj[P]>;
};

declare type DefinedExcept<TObj, TExcept extends Key<TObj>> = {
  [P in Key<Pick<TObj, Exclude<Key<TObj>, TExcept>>>]-?: NonNullable<TObj[P]>;
} & { [P in TExcept]?: TObj[P] | undefined };

declare type MapObj<TObj, TValue, TOptional extends boolean> = TOptional extends true
  ? {
      [P in Key<TObj>]?: TValue;
    }
  : {
      [P in Key<TObj>]: TValue;
    };

declare type Pair<T> = [T, T];

declare type SideOfCollision = "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "NONE";

declare type EventHandler<T> = (data: T) => void;