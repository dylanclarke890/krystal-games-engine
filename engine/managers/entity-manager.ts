import { GameEvents } from "../constants/enums.js";
import { Component, ComponentMap, ComponentType } from "../types/common-types.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";

export class EntityManager implements IEntityManager {
  static #emptySet: Set<number> = new Set();

  eventSystem: IEventManager;
  entities: Set<number>;

  #nextEntityId: number;
  #entityMasks: Map<number, Set<ComponentType>>;
  #componentTypeToEntities: Map<ComponentType, Set<number>>;
  #components: Map<string, Component<ComponentType>>;

  constructor(eventSystem: IEventManager) {
    this.eventSystem = eventSystem;

    this.entities = new Set();
    this.#entityMasks = new Map();
    this.#componentTypeToEntities = new Map();
    this.#components = new Map();

    this.#nextEntityId = 1;
  }

  createEntity() {
    const entity = this.#nextEntityId++;

    this.entities.add(entity);
    this.eventSystem.trigger(GameEvents.Entity_Created, entity);

    return entity;
  }

  destroyEntity(id: number): void {
    const masks = this.#entityMasks.get(id);
    if (typeof masks === "undefined") {
      return;
    }

    masks.forEach((componentType) => {
      this.#components.delete(id + componentType);
      this.#componentTypeToEntities.get(componentType)?.delete(id);
    });

    this.#entityMasks.delete(id);
    this.entities.delete(id);

    this.eventSystem.trigger(GameEvents.Entity_Destroyed, id);
  }

  addComponent(entity: number, component: Component<ComponentType>): void {
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

  removeComponent(entity: number, componentType: ComponentType): void {
    this.#components.delete(entity + componentType);
    this.#entityMasks.get(entity)!.delete(componentType);
  }

  getComponents<T extends ComponentType>(entity: number, componentTypes: T[]): ComponentMap<T> {
    const components: ComponentMap<T> = {} as ComponentMap<T>;

    componentTypes.forEach((componentType) => {
      components[componentType] = this.#components.get(entity + componentType) as Nullable<Component<T>>;
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

  hasComponentType(componentType: ComponentType) {
    return this.#componentTypeToEntities.has(componentType);
  }

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
}
