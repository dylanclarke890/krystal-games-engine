import { GameEvents } from "../constants/enums.js";
import { EventSystem } from "../events/event-system.js";
import { Assert } from "../utils/assert.js";
import { Component, ComponentMap, ComponentType } from "../utils/types.js";

export class EntityManager {
  static #emptySet: Set<number> = new Set();

  eventSystem: EventSystem;
  entities: Set<number>;

  #nextEntityId: number;
  #entityMasks: Map<number, Set<ComponentType>>;
  #componentTypeToEntities: Map<ComponentType, Set<number>>;
  #components: Map<string, Component<ComponentType>>;

  constructor(eventSystem: EventSystem) {
    Assert.instanceOf("eventSystem", eventSystem, EventSystem);
    this.eventSystem = eventSystem;

    this.entities = new Set();
    this.#entityMasks = new Map();
    this.#componentTypeToEntities = new Map();
    this.#components = new Map();

    this.#nextEntityId = 1;
  }

  /** Create a new entity */
  createEntity() {
    const entity = this.#nextEntityId++;

    this.entities.add(entity);
    this.eventSystem.trigger(GameEvents.Entity_Created, entity);

    return entity;
  }

  /**
   * Add a component to an entity.
   * @param {number} entity entity identifier
   * @param {Component} component component to add
   */
  addComponent(entity: number, component: Component<ComponentType>) {
    const componentType = component.constructor.name as ComponentType;
    this.#components.set(entity + componentType, component);

    if (!this.#componentTypeToEntities.has(componentType)) {
      this.#componentTypeToEntities.set(componentType, new Set());
    }
    this.#componentTypeToEntities.get(componentType)!.add(entity);

    if (!this.#entityMasks.has(entity)) {
      this.#entityMasks.set(entity, new Set());
    }
    this.#entityMasks.get(entity)!.add(componentType);
  }

  /**
   * Remove a component from an entity.
   * @param {number} entity entity identifier
   * @param {ComponentType} componentType component to remove
   */
  removeComponent(entity: number, componentType: ComponentType) {
    this.#components.delete(entity + componentType);
    this.#entityMasks.get(entity)!.delete(componentType);
  }

  getComponents<T extends ComponentType>(entity: number, componentTypes: T[]) {
    const components: ComponentMap<T> = {} as ComponentMap<T>;

    componentTypes.forEach((componentType) => {
      components[componentType] = this.#components.get(entity + componentType) as Component<T> | undefined;
    });

    return components;
  }

  /**
   * Check if an entity has specific components.
   * @param {ComponentType} componentTypes the names of the components.
   */
  hasComponents(entity: number, componentTypes: ComponentType[]) {
    const mask = this.#entityMasks.get(entity);
    if (typeof mask === "undefined") {
      return false;
    }
    return componentTypes.every((componentType) => mask.has(componentType));
  }

  /** Check if any entity has the specified component type. */
  hasComponentType(componentType: ComponentType) {
    return this.#componentTypeToEntities.has(componentType);
  }

  /** Get all entities that have a set of components. */
  getEntitiesWithComponents<T extends ComponentType>(componentTypes: T[]): Set<number> {
    const entities = new Set<number>();
    const firstComponentType = componentTypes[0];

    if (!this.#componentTypeToEntities.has(firstComponentType)) {
      return EntityManager.#emptySet;
    }

    // Initialize entities with entities having the first component type.
    const firstTypeEntities = this.#componentTypeToEntities.get(firstComponentType)!;
    firstTypeEntities.forEach((entity) => entities.add(entity));

    // Iterate through the other component types and retain only entities that have all specified component types.
    for (let i = 1; i < componentTypes.length; i++) {
      const componentType = componentTypes[i];
      if (!this.#componentTypeToEntities.has(componentType)) {
        return EntityManager.#emptySet;
      }

      const typeEntities = this.#componentTypeToEntities.get(componentType)!;

      entities.forEach((entity) => {
        if (!typeEntities.has(entity)) {
          entities.delete(entity);
        }
      });
    }

    return entities;
  }

  /** Destroy an entity and remove all of its components. */
  destroyEntity(entity: number) {
    const masks = this.#entityMasks.get(entity);
    if (typeof masks === "undefined") {
      return;
    }

    masks.forEach((componentType) => {
      this.#components.delete(entity + componentType);
      this.#componentTypeToEntities.get(componentType)?.delete(entity);
    });

    this.#entityMasks.delete(entity);
    this.entities.delete(entity);

    this.eventSystem.trigger(GameEvents.Entity_Destroyed, entity);
  }
}
