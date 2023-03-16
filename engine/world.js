export class World {
  constructor(game) {
    this.game = game;
    this.entityManager = game.entityManager;
    this.systemManager = game.systemManager;
  }

  createEntity() {
    return this.entityManager.createEntity();
  }

  addComponent(entityId, component) {
    return this.entityManager.addComponent(entityId, component);
  }

  removeComponent(entityId, componentType) {
    return this.entityManager.removeComponent(entityId, componentType);
  }

  registerSystem(system) {
    return this.systemManager.registerSystem(system);
  }

  unregisterSystem(system) {
    return this.systemManager.unregisterSystem(system);
  }
}
