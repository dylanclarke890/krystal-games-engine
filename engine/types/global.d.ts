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

declare type ClassConstructor<T, Args extends any[]> = new (...args: Args) => T;

/** 
 * Generic type which can be used in places of concrete vector types (i.e `Vector2D`) when you just need access
 * to the 'x' and 'y' properties.
 */
declare type Vector = {
  x: number;
  y: number;
};