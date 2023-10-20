import { BaseComponent } from "../components/base.js";
import { GameEventType } from "../constants/events.js";
import { IEntityManager, IEventManager } from "../types/common-interfaces.js";
import { EntityTemplate } from "../types/common-types.js";
import { EntityCreationError } from "../types/errors.js";

export class EntityManager implements IEntityManager {
  static #emptySet: Set<number> = new Set();

  eventManager: IEventManager;
  entities: Set<number>;

  #nextEntityId: number;
  #entityMasks: Map<number, Set<string>>;
  #componentTypeToEntities: Map<string, Set<number>>;
  #components: Map<string, BaseComponent>;

  #entityTemplates: Map<string, EntityTemplate>;

  constructor(eventManager: IEventManager) {
    this.eventManager = eventManager;

    this.entities = new Set();
    this.#entityMasks = new Map();
    this.#componentTypeToEntities = new Map();
    this.#components = new Map();
    this.#entityTemplates = new Map();

    this.#nextEntityId = 1;
  }

  createEntity() {
    const entity = this.#nextEntityId++;

    this.entities.add(entity);
    this.eventManager.trigger(GameEventType.ENTITY_CREATED, entity);

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

    this.eventManager.trigger(GameEventType.ENTITY_DESTROYED, id);
  }

  registerEntityTemplate(name: string, template: EntityTemplate): void {
    this.#entityTemplates.set(name, template);
  }

  createEntityFromTemplate(templateName: string): number {
    const template = this.#entityTemplates.get(templateName);
    if (!template) {
      throw new EntityCreationError(`Template was not found`, template);
    }

    const entity = this.createEntity();
    for (const componentType in template) {
      const component = Object.assign(
        Object.create(Object.getPrototypeOf(template[componentType])),
        template[componentType]
      );
      this.addComponent(entity, component);
    }

    return entity;
  }

  addComponent(entity: number, component: BaseComponent): void {
    const componentType = component.name;
    this.#components.set(entity + componentType, component);

    if (!this.#componentTypeToEntities.has(componentType)) {
      this.#componentTypeToEntities.set(componentType, new Set());
    }
    this.#componentTypeToEntities.get(componentType)!.add(entity);

    if (!this.#entityMasks.has(entity)) {
      this.#entityMasks.set(entity, new Set());
    }
    this.#entityMasks.get(entity)!.add(componentType);

    this.eventManager.trigger(GameEventType.COMPONENT_ADDED, { entity, component });
  }

  removeComponent(entity: number, type: string): void {
    const componentMapKey = entity + type;
    const component = this.#components.get(componentMapKey);
    if (typeof component === "undefined") {
      return;
    }

    this.#components.delete(componentMapKey);
    this.#entityMasks.get(entity)!.delete(type);
    this.eventManager.trigger(GameEventType.COMPONENT_REMOVED, { entity, component });
  }

  getComponent<T extends BaseComponent>(entity: number, type: string): T | undefined {
    return this.#components.get(entity + type) as T | undefined;
  }

  getComponents(entity: number, types: string[]): { [x: string]: BaseComponent | undefined } {
    const components: { [x: string]: BaseComponent | undefined } = {};

    types.forEach((componentType) => {
      components[componentType] = this.#components.get(entity + componentType);
    });

    return components;
  }

  hasComponent(entity: number, type: string): boolean {
    const mask = this.#entityMasks.get(entity);
    if (typeof mask === "undefined") {
      return false;
    }
    return mask.has(type);
  }

  hasComponents(entity: number, types: string[]) {
    const mask = this.#entityMasks.get(entity);
    if (typeof mask === "undefined") {
      return false;
    }
    return types.every((componentType) => mask.has(componentType));
  }

  hasComponentType(type: string) {
    return this.#componentTypeToEntities.has(type);
  }

  getEntitiesWithComponents(types: string[]): Set<number> {
    const entities = new Set<number>();
    const firstComponentType = types[0];

    if (!this.#componentTypeToEntities.has(firstComponentType)) {
      return EntityManager.#emptySet;
    }

    // Initialize entities with entities having the first component type.
    const firstTypeEntities = this.#componentTypeToEntities.get(firstComponentType)!;
    firstTypeEntities.forEach((entity) => entities.add(entity));

    // Iterate through the other component types and retain only entities that have all specified component types.
    for (let i = 1; i < types.length; i++) {
      const componentType = types[i];
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
