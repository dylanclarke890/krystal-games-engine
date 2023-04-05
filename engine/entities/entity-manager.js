import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Guard } from "../utils/guard.js";

/**
 * @typedef ComponentMap
 * @property {import("../components/acceleration.js").Acceleration} Acceleration
 * @property {import("../components/ai.js").AI} AI
 * @property {import("../components/animation.js").Animation} Animation
 * @property {import("../components/bounciness.js").Bounciness} Bounciness
 * @property {import("../components/collision.js").Collision} Collision
 * @property {import("../components/damage.js").Damage} Damage
 * @property {import("../components/friction.js").Friction} Friction
 * @property {import("../components/gravity-factor.js").GravityFactor} GravityFactor
 * @property {import("../components/health.js").Health} Health
 * @property {import("../components/input.js").Input} Input
 * @property {import("../components/offset.js").Offset} Offset
 * @property {import("../components/position.js").Position} Position
 * @property {import("../components/size.js").Size} Size
 * @property {import("../components/sprite.js").Sprite} Sprite
 * @property {import("../components/velocity.js").Velocity} Velocity
 */

/**
 * @typedef {keyof ComponentMap} ComponentType
 */

export class EntityManager {
  /** @type {EventSystem} */
  eventSystem;
  /** @type {Set<number>} */
  entities;
  /** @type {Map<`${number}${ComponentType}`, ComponentMap[ComponentType]>} */
  components;
  /** @type {Map<number, Set<ComponentType>} */
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

  /**
   * Add a component to an entity.
   * @param {number} entity entity identifier
   * @param {ComponentMap[ComponentType]} component component to add
   */
  addComponent(entity, component) {
    const componentType = component.constructor.name;
    this.components.set(entity + componentType, component);
    if (!this.entityMasks.has(entity)) {
      this.entityMasks.set(entity, new Set());
    }
    this.entityMasks.get(entity).add(componentType);
  }

  /**
   * Remove a component from an entity.
   * @param {number} entity entity identifier
   * @param {ComponentType} componentType component to remove
   */
  removeComponent(entity, componentType) {
    this.components.delete(entity + componentType);
    this.entityMasks.get(entity).delete(componentType);
  }

  /**
   * Get a specific component from an entity.
   * @template {ComponentType} T
   * @param {number} entity entity identifier
   * @param {T} componentType the name of the component.
   * @returns {ComponentMap[T]?} the component type, if found.
   */
  getComponent(entity, componentType) {
    return this.components.get(entity + componentType);
  }

  /**
   * Check if an entity has a specific component.
   * @param {number} entity
   * @param {ComponentType} componentType the name of the component.
   */
  hasComponent(entity, componentType) {
    if (!this.entityMasks.has(entity)) {
      return false;
    }
    return this.entityMasks.get(entity).has(componentType);
  }

  /**
   * Check if any entity has the specified component type.
   * @param {ComponentType} componentType
   */
  hasComponentType(componentType) {
    for (const key of this.components.keys()) {
      if (key.endsWith(componentType)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all entities that have a set of components.
   * @param {ComponentType[]} componentTypes
   */
  getEntitiesWithComponents(...componentTypes) {
    const entities = [];
    for (const entity of this.entities) {
      if (componentTypes.every((componentType) => this.hasComponent(entity, componentType))) {
        entities.push(entity);
      }
    }
    return entities;
  }

  /**
   * Destroy an entity and remove all of its components.
   * @param {number} entity
   */
  destroyEntity(entity) {
    this.entityMasks
      .get(entity)
      .forEach((componentType) => this.components.delete(entity + componentType));
    console.log(...this.components.entries());
    this.entityMasks.delete(entity);
    this.entities.delete(entity);
    this.eventSystem.dispatch(GameEvents.Entity_Destroyed, entity);
  }
}
