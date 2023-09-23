import { PriorityLevel } from "../constants/enums.js";
import { Enum } from "../utils/enum.js";
import { Component, ComponentMap, ComponentType } from "./common-types.js";

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
