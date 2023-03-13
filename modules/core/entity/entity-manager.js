export class EntityManager {
  constructor() {
    this.entities = new Map();
    this.nextEntityId = 1;
  }

  // create a new entity with a given set of components
  createEntity(components = {}) {
    const id = this.nextEntityId++;
    this.entities.set(id, components);
    return id;
  }

  // destroy an entity
  destroyEntity(entityId) {
    this.entities.delete(entityId);
  }

  // get the components of an entity
  getComponents(entityId) {
    return this.entities.get(entityId);
  }

  // update the components of an entity
  updateComponents(entityId, newComponents) {
    const components = this.entities.get(entityId);
    this.entities.set(entityId, Object.assign({}, components, newComponents));
  }

  // get an array of all entity IDs
  getAllEntityIds() {
    return Array.from(this.entities.keys());
  }

  // get an array of all entities
  getAllEntities() {
    return Array.from(this.entities.values());
  }
}
