export class ComponentContainer {
  constructor() {
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.constructor, component);
  }

  removeComponent(componentClass) {
    this.components.delete(componentClass);
  }

  getComponent(componentClass) {
    return this.components.get(componentClass);
  }

  hasComponent(componentClass) {
    return this.components.has(componentClass);
  }
}
