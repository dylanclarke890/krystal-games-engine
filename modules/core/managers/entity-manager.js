export class EntityManager {
  constructor() {
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

  /** Get a component from an entity */
  getComponent(entity, componentType) {
    return this.components.get(entity + componentType);
  }

  /** Check if an entity has a specific component */
  hasComponent(entity, componentType) {
    if (!this.entityMasks.has(entity)) {
      return false;
    }
    return this.entityMasks.get(entity).has(componentType);
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
  }
}
