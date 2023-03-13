export class EntityManager {
  constructor() {
    this.nextEntityId = 1;
    /** @type {Map<int, Set<string>>} */
    this.entities = new Map();
    /** @type {Map<string, Map<int, Component>>} */
    this.components = new Map();
  }

  createEntity() {
    const entityId = this.nextEntityId++;
    this.entities.set(entityId, new Set());
    return entityId;
  }

  destroyEntity(entityId) {
    const componentTypes = this.entities.get(entityId);
    if (!componentTypes) {
      return;
    }
    for (const componentType of componentTypes) {
      const componentList = this.components.get(componentType);
      componentList.delete(entityId);
    }
    this.entities.delete(entityId);
  }

  hasComponent(entityId, componentType) {
    const componentList = this.components.get(componentType);
    return !!componentList && componentList.has(entityId);
  }

  addComponent(entityId, componentType, componentData) {
    let componentList = this.components.get(componentType);
    if (!componentList) {
      componentList = new Map();
      this.components.set(componentType, componentList);
    }
    componentList.set(entityId, componentData);
    const componentTypes = this.entities.get(entityId);
    componentTypes.add(componentType);
  }

  removeComponent(entityId, componentType) {
    const componentList = this.components.get(componentType);
    if (componentList) {
      componentList.delete(entityId);
    }
    const componentTypes = this.entities.get(entityId);
    componentTypes.delete(componentType);
  }

  getComponent(entityId, componentType) {
    const componentList = this.components.get(componentType);
    return componentList ? componentList.get(entityId) : null;
  }

  getEntitiesWithComponent(componentType) {
    const entityIds = this.components.get(componentType);
    return entityIds ? [...entityIds.keys()] : [];
  }
}
