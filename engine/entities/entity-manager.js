import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Guard } from "../utils/guard.js";

export class EntityManager {
  /** @type {EventSystem} */
  eventSystem;
  /** @type {Set<number>} */
  entities;
  /** @type {Map<string, any>} */
  components;
  /** @type {Map<number, Set<string>} */
  entityMasks;
  /** @type {number} */
  nextEntityId;

  constructor(eventSystem) {
    Guard.againstNull({ eventSystem }).isInstanceOf(EventSystem);
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

  /** Add a component to an entity */
  addComponent(entityId, component) {
    const componentType = component.constructor.name;
    this.components.set(entityId + componentType, component);
    if (!this.entityMasks.has(entityId)) {
      this.entityMasks.set(entityId, new Set());
    }
    this.entityMasks.get(entityId).add(componentType);
  }

  /** Remove a component from an entity */
  removeComponent(entity, componentType) {
    this.components.delete(entity + componentType);
    this.entityMasks.get(entity).delete(componentType);
  }

  /**
   * Get a component of a given type for an entity.
   * @param {number} entity
   * @param {string} componentName
   */
  getComponent(entity, componentType) {
    return this.components.get(entity + componentType);
  }

  /**
   * Check if an entity has a specific component.
   * @param {number} entity
   * @param {string} componentName
   */
  hasComponent(entity, componentType) {
    if (!this.entityMasks.has(entity)) {
      return false;
    }
    return this.entityMasks.get(entity).has(componentType);
  }

  /** Check if any entity has the specified component type. */
  hasComponentType(componentType) {
    for (const key of this.components.keys()) {
      if (key.endsWith(componentType)) {
        return true;
      }
    }
    return false;
  }

  /** Get all entities that have a set of components. */
  getEntitiesWithComponents(...componentTypes) {
    const entities = [];
    for (const entity of this.entities) {
      if (componentTypes.every((componentType) => this.hasComponent(entity, componentType))) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /** Destroy an entity and remove all of its components */
  destroyEntity(entity) {
    for (const componentType of this.entityMasks.get(entity)) {
      this.components.delete(entity + componentType);
    }
    this.entityMasks.delete(entity);
    this.entities.delete(entity);
    this.eventSystem.dispatch(GameEvents.Entity_Destroyed, entity);
  }
}
