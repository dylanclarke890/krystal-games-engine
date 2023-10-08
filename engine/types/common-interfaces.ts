import { Collider } from "../components/2d/collision.js";
import { RigidBody } from "../components/2d/rigid-body.js";
import { BaseComponent } from "../components/base.js";
import { PriorityLevel, Quadrant } from "../constants/enums.js";
import { Vector2 } from "../maths/vector2.js";
import { Enum } from "../utils/enum.js";

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

export interface IEventManager {
  /** Get the parent EventManager. */
  get parent(): Nullable<IEventManager>;

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
  addComponent(id: number, component: BaseComponent): void;

  /**
   * Remove a component from an entity.
   * @param id entity id.
   * @param type type of component to remove
   */
  removeComponent(id: number, type: string): void;

  getComponent<T extends BaseComponent>(entity: number, type: string): T | undefined;
  getComponents(entity: number, types: string[]): { [x: string]: BaseComponent | undefined };

  /** Get all entities that have a set of components. */
  getEntitiesWithComponents(types: string[]): Set<number>;

  /**
   * Check if any entity has a specific component.
   * @param type the component type to check.
   */
  hasComponentType(type: string): boolean;

  /**
   * Check if an entity has a particular component type.
   * @param type the type to check.
   */
  hasComponent(entity: number, type: string): boolean;

  /**
   * Check if an entity has a range of component types.
   * @param types the component types to check.
   */
  hasComponents(entity: number, types: string[]): boolean;
}

export interface ILoop {
  start(): void;
  main(timestamp: number): void;
  stop(unloadAssets?: boolean): void;
}

export interface IObjectPoolManager {
  get<T, Args extends any[] = any[]>(name: string): IObjectPool<T, Args> | undefined;
  has(name: string): boolean;
  create<T, Args extends any[] = any[]>(
    name: string,
    ClassConstructor: ClassConstructor<T, Args>,
    onReuse?: (obj: T, ...args: Args) => void,
    size?: number
  ): IObjectPool<T, Args>;
  clear(name: string): void;
  clearAll(): void;
}

export interface IObjectFactory<T, Args extends any[] = any[]> {
  ClassConstructor: ClassConstructor<T, Args>;
  totalCreated: number;
  create(...args: Args): T;
}

export interface IObjectPool<T, Args extends any[] = any[]> {
  acquire(...args: Args): T;
  release(obj: T): void;
  clear(): void;
}

export interface IQuadtree {
  insert(id: number, rigidBody: RigidBody, collider: Collider): void;
  retrieve(rigidBody: RigidBody, collider: Collider): IQuadtreeNode[];
  retrieveById(id: number, node?: IQuadtreeNode): Nullable<IQuadtreeNode>;
  removeById(id: number, node?: IQuadtreeNode): boolean;
  drawBoundaries(color?: string): void;
  clear(): void;
}

export interface IQuadtreeNode {
  id: number;
  position: Vector2;
  size: Vector2;
  children: IQuadtreeNode[];
  overlappingChildren: IQuadtreeNode[];
  rigidBody?: RigidBody;
  collider?: Collider;

  init(
    id: number,
    position: Vector2,
    size: Vector2,
    nodePool: IObjectPool<IQuadtreeNode>,
    depth: number,
    maxDepth: number,
    maxChildren: number
  ): void;
  insert(node: IQuadtreeNode | IQuadtreeNode[]): void;
  retrieve(node: IQuadtreeNode): IQuadtreeNode[];
  subdivide(): void;
  findQuadrant(node: IQuadtreeNode): Quadrant;
  clear(): void;
}

export interface IIntegrator {
  integrate(rigidBody: RigidBody, dt: number): void;
}
