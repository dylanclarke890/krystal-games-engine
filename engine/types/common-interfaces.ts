import { BaseComponent } from "../components/index.js";
import { PriorityLevel } from "../constants/enums.js";
import { AABB } from "../maths/aabb.js";
import { Vector2 } from "../maths/vector2.js";
import { ColliderEntity } from "../physics/collision/data.js";
import { BaseSystem } from "../systems/base-system.js";
import { ComponentMap, ComponentType, EntityTemplate, ObjectPoolSettings } from "./common-types.js";
import { GameEventHandler, GameEventMap } from "../constants/events.js";

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
  on<T extends Key<GameEventMap>>(event: T, listener: GameEventHandler<T>, priority?: number | PriorityLevel): void;

  /** Unsubscribe from an event. */
  off<T extends Key<GameEventMap>>(event: T, listener: GameEventHandler<T>): void;

  /** Trigger an event. */
  trigger<T extends Key<GameEventMap>>(event: T, data: GameEventMap[T]): void;
}

export interface IEntityManager {
  entities: Set<number>;

  /** Create a new entity */
  createEntity(): number;

  /** Destroy an entity and remove all of its components. */
  destroyEntity(id: number): void;

  /** Register a template to use instead of creating entities and manually assigning components. */
  registerEntityTemplate(name: string, template: EntityTemplate): void;

  /** Creates an entity with components from a pre-defined template. Throws an `EntityCreationError` if the template does not exist. */
  createEntityFromTemplate(templateName: string): number;

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
  removeComponent(id: number, type: ComponentType): void;

  getComponent<T extends ComponentType>(entity: number, type: T): ComponentMap[T] | undefined;
  getComponents(entity: number, types: ComponentType[]): { [x: string]: BaseComponent | undefined };

  /** Get all entities that have a set of components. */
  getEntitiesWithComponents(types: ComponentType[]): Set<number>;

  /**
   * Check if any entity has a specific component.
   * @param type the component type to check.
   */
  hasComponentType(type: ComponentType): boolean;

  /**
   * Check if an entity has a particular component type.
   * @param type the type to check.
   */
  hasComponent(entity: number, type: ComponentType): boolean;

  /**
   * Check if an entity has a range of component types.
   * @param types the component types to check.
   */
  hasComponents(entity: number, types: ComponentType[]): boolean;
}

export interface IObjectPoolManager {
  get<T extends new () => InstanceType<T>>(name: string): IObjectPool<T> | undefined;
  has(name: string): boolean;
  create<T extends new (...args: any[]) => InstanceType<T>>(
    name: string,
    settings: ObjectPoolSettings<T>
  ): IObjectPool<T>;
  clear(name: string): void;
  clearAll(): void;
}

export interface IObjectPool<TConstructor extends new () => InstanceType<TConstructor>> {
  initialiseReserve(size: number): void;
  acquire(): InstanceType<TConstructor>;
  release(obj: InstanceType<TConstructor>): void;
  clear(): void;
}

export interface ISystemManager {
  /**
   * Update all registered systems in the order of their priority.
   * @param dt Time since the last frame.
   */
  update(dt: number): void;

  /**
   * Register a system for updates.
   * @param system The system to register.
   */
  addSystem(system: BaseSystem): void;

  /**
   * Unregister a system.
   * @param name The name of the system to unregister.
   */
  removeSystem(name: string): void;

  /**
   * Fetch a system by it's name.
   * @param name The name of the system.
   */
  getSystem<T extends BaseSystem>(name: string): T | undefined;

  /**
   * Enable or disable a system.
   * @param name The name of the system.
   * @param enabled Whether the system should be enabled or disabled.
   */
  setSystemEnabled(name: string, enabled: boolean): void;
}

export interface ILoop {
  start(): void;
  main(timestamp: number): void;
  stop(unloadAssets?: boolean): void;
}

export interface IObjectFactory<T, Args extends any[] = any[]> {
  ClassConstructor: ClassConstructor<T, Args>;
  totalCreated: number;
  create(...args: Args): T;
}

export interface IBroadphase {
  /** For debugging. */
  totalPotential: number;
  collisionPairs: Pair<ColliderEntity>[];

  add(entity: ColliderEntity): void;
  computePairs(): void;
  pick(point: Vector2): ColliderEntity | undefined;
  query(aabb: AABB, output: ColliderEntity[]): void;
  draw(color?: string): void;
  clear(): void;
}
