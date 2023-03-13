export class ComponentContainer {
  constructor(components) {
    this.components = new Map(components);
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
