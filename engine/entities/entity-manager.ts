import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Assert } from "../utils/assert.js";
import { Component, ComponentMap, ComponentType } from "../utils/types.js";

export class EntityManager {
  eventSystem: EventSystem;
  entities: Set<number>;
  components: Map<string, Component<ComponentType>>;
  entityMasks: Map<number, Set<ComponentType>>;
  nextEntityId: number;

  constructor(eventSystem: EventSystem) {
    Assert.instanceOf("eventSystem", eventSystem, EventSystem);
    this.eventSystem = eventSystem;
    this.entities = new Set();
    this.components = new Map();
    this.entityMasks = new Map();
    this.nextEntityId = 1;
  }

  /** Create a new entity */
  createEntity() {
    const entity = this.nextEntityId;
    this.entities.add(entity);
    this.nextEntityId++;
    this.eventSystem.dispatch(GameEvents.Entity_Created, entity);
    return entity;
  }

  /**
   * Add a component to an entity.
   * @param {number} entity entity identifier
   * @param {Component} component component to add
   */
  addComponent(entity: number, component: Component<ComponentType>) {
    const componentType = component.constructor.name as ComponentType;
    this.components.set(entity + componentType, component);
    if (!this.entityMasks.has(entity)) {
      this.entityMasks.set(entity, new Set());
    }
    this.entityMasks.get(entity)!.add(componentType);
  }

  /**
   * Remove a component from an entity.
   * @param {number} entity entity identifier
   * @param {ComponentType} componentType component to remove
   */
  removeComponent(entity: number, componentType: ComponentType) {
    this.components.delete(entity + componentType);
    this.entityMasks.get(entity)!.delete(componentType);
  }

  /**
   * Get a specific component from an entity.
   * @param entity entity identifier
   * @param componentType the name of the component.
   * @returns the component type, if found.
   */
  getComponent<T extends ComponentType>(entity: number, componentType: T): Component<T> | undefined {
    return this.components.get(entity + componentType) as Component<T> | undefined;
  }

  getComponents<T extends ComponentType>(entity: number, ...componentTypes: T[]) {
    return componentTypes.reduce((components, currentComponentType) => {
      components[currentComponentType] = this.components.get(entity + currentComponentType) as Component<T> | undefined;
      return components;
    }, {} as ComponentMap<T>);
  }

  /**
   * Check if an entity has a specific component.
   * @param {ComponentType} componentType the name of the component.
   */
  hasComponent(entity: number, componentType: ComponentType) {
    const mask = this.entityMasks.get(entity);
    if (typeof mask === "undefined") return false;
    return mask.has(componentType);
  }

  /** Check if any entity has the specified component type. */
  hasComponentType(componentType: ComponentType) {
    for (const key of this.components.keys()) {
      if (key.endsWith(componentType)) {
        return true;
      }
    }
    return false;
  }

  /** Get all entities that have a set of components. */
  getEntitiesWithComponents<T extends ComponentType>(...componentTypes: T[]) {
    const entities = [];
    for (const entity of this.entities) {
      if (componentTypes.every((componentType) => this.hasComponent(entity, componentType))) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /** Destroy an entity and remove all of its components. */
  destroyEntity(entity: number) {
    const masks = this.entityMasks.get(entity);
    if (typeof masks === "undefined") return;
    masks.forEach((componentType) => this.components.delete(entity + componentType));
    this.entityMasks.delete(entity);
    this.entities.delete(entity);
    this.eventSystem.dispatch(GameEvents.Entity_Destroyed, entity);
  }
}
