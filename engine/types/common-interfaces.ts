import { PriorityLevel, Quadrant } from "../constants/enums.js";
import { Enum } from "../utils/enum.js";
import { Vector2D } from "../utils/maths/vector-2d.js";
import { Component, ComponentMap, ComponentType } from "./common-types.js";

export interface IConfigManager<T> {
  config: T;

  getValue<TValue>(key: string): Nullable<TValue>;

  getString(key: string): Nullable<string>;

  getInt(key: string): Nullable<number>;

  getBool(key: string): Nullable<boolean>;

  getDate(key: string): Nullable<Date>;

  getObject<TObj>(key: string): Nullable<TObj>;

  getArray<TItem>(key: string): Nullable<TItem[]>;
}

export interface IEventSystem {
  /** Get the parent EventSystem. */
  get parent(): Nullable<IEventSystem>;

  /** Subscribe to an event. */
  on<T>(event: Enum, listener: EventHandler<T>, priority?: number | PriorityLevel): void;

  /** Unsubscribe from an event. */
  off<T>(event: Enum, listener: EventHandler<T>): void;

  /** Trigger an event. */
  trigger<T>(event: Enum, data?: T): void;
}

export interface IEntityManager {
  entities: Set<number>;

  /** Create a new entity */
  createEntity(): number;

  /** Destroy an entity and remove all of its components. */
  destroyEntity(id: number): void;

  /**
   * Adds a component to an entity.
   * @param id ID of the entity.
   * @param component component to add
   */
  addComponent(id: number, component: Component<ComponentType>): void;

  /**
   * Remove a component from an entity.
   * @param id ID of the entity.
   * @param componentType component to remove
   */
  removeComponent(id: number, componentType: ComponentType): void;

  getComponents<T extends ComponentType>(entity: number, componentTypes: T[]): ComponentMap<T>;

  /** Get all entities that have a set of components. */
  getEntitiesWithComponents<T extends ComponentType>(componentTypes: T[]): Set<number>;

  /**
   * Check if any entity has a specific component.
   * @param componentTypes the component type to check.
   */
  hasComponentType(componentType: ComponentType): boolean;

  /**
   * Check if an entity has a range of component types.
   * @param componentTypes the component types to check.
   */
  hasComponents(entity: number, componentTypes: ComponentType[]): boolean;
}

export interface ILoop {
  start(): void;
  main(timestamp: number): void;
  stop(unloadAssets?: boolean): void;
}

export interface IQuadtree {
  insert(id: number, position: Vector2D, size: Vector2D): void;
  retrieve(position: Vector2D, size: Vector2D): IQuadtreeNode[];
  retrieveById(id: number, node?: IQuadtreeNode): Nullable<IQuadtreeNode>;
  removeById(id: number, node?: IQuadtreeNode): boolean;
  drawBoundaries(color?: string): void;
  clear(): void;
}

export interface IObjectPool<T> {
  acquire(...args: ConstructorParameters<T>): InstanceType<T>;
  release(obj: InstanceType<T>): void;
  clear(): void;
}

export interface IObjectPoolManager {
  get<T) => any>(name: string): IObjectPool<T> | undefined;
  has(name: string): boolean;
  create<T>(
    name: string,
    createFn: (...args: ConstructorParameters<T>) => T,
    size?: number
  ): IObjectPool<T>;
  clear(name: string): void;
  clearAll(): void;
}

export interface IQuadtreeNode {
  id: number;
  position: Vector2D;
  size: Vector2D;

  children: IQuadtreeNode[];
  overlappingChildren: IQuadtreeNode[];

  insert(node: IQuadtreeNode | IQuadtreeNode[]): void;
  retrieve(node: IQuadtreeNode): IQuadtreeNode[];
  subdivide(): void;
  findQuadrant(node: IQuadtreeNode): Quadrant;
  clear(): void;
}
