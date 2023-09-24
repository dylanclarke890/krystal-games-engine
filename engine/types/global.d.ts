declare type Key<T> = keyof T;

declare type ValueOfObj<T> = T[Key<T>];

declare type Defined<TObj> = {
  [P in Key<TObj>]-?: NonNullable<TObj[P]>;
};

declare type DefinedExcept<TObj, TExcept extends Key<TObj>> = {
  [P in Key<Pick<TObj, Exclude<Key<TObj>, TExcept>>>]-?: NonNullable<TObj[P]>;
} & { [P in TExcept]?: Nullable<TObj[P]> };

declare type MapObj<TObj, TValue, TOptional extends boolean> = TOptional extends true
  ? {
      [P in Key<TObj>]?: TValue;
    }
  : {
      [P in Key<TObj>]: TValue;
    };

declare type Pair<T> = [T, T];

declare type EventHandler<T> = (data: T) => void;

declare type Nullable<T> = T | undefined;

type IPoolableMethods = {
  init: (...args: any[]) => void;
  reset: (...args: any[]) => void;
  clear: (...args: any[]) => void;
} & { [x: string]: any };

declare type RequiresAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>>;
  }[Keys];

declare type IPoolable<T extends IPoolableMethods> = RequiresAtLeastOne<{
  [K in keyof T]?: T[K];
}>;
