import { Acceleration } from "../components/acceleration.js";
import { AI } from "../components/ai.js";
import { Animation } from "../components/animation.js";
import { Bounciness } from "../components/bounciness.js";
import { Collision } from "../components/collision.js";
import { Damage } from "../components/damage.js";
import { Friction } from "../components/friction.js";
import { GravityFactor } from "../components/gravity-factor.js";
import { Health } from "../components/health.js";
import { Input } from "../components/input.js";
import { Offset } from "../components/offset.js";
import { Position } from "../components/position.js";
import { Size } from "../components/size.js";
import { Sprite } from "../components/sprite.js";
import { Velocity } from "../components/velocity.js";
import { EventSystem } from "../events/event-system.js";
import { GameEvents } from "../events/events.js";
import { Guard } from "../utils/guard.js";

export type ComponentType = keyof ComponentMap;
export type ComponentMap = {
  Acceleration: Acceleration;
  AI: AI;
  Animation: Animation;
  Bounciness: Bounciness;
  Collision: Collision;
  Damage: Damage;
  Friction: Friction;
  GravityFactor: GravityFactor;
  Health: Health;
  Input: Input;
  Offset: Offset;
  Position: Position;
  Size: Size;
  Sprite: Sprite;
  Velocity: Velocity;
};

export class EntityManager {
  eventSystem: EventSystem;
  entities: Set<number>;
  components: Map<string, ComponentMap[ComponentType]>;
  entityMasks: Map<number, Set<ComponentType>>;
  nextEntityId: number;

  constructor(eventSystem: EventSystem) {
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
  addComponent(entity: number, component: ComponentMap[ComponentType]) {
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
  getComponent<T extends ComponentType>(
    entity: number,
    componentType: T
  ): ComponentMap[T] | undefined {
    return this.components.get(entity + componentType) as ComponentMap[T] | undefined;
  }

  /**
   * Check if an entity has a specific component.
   * @param {ComponentType} componentType the name of the component.
   */
  hasComponent(entity: number, componentType: ComponentType) {
    if (!this.entityMasks.has(entity)) {
      return false;
    }
    return this.entityMasks.get(entity)!.has(componentType);
  }

  /**
   * Check if any entity has the specified component type.
   * @param {ComponentType} componentType
   */
  hasComponentType(componentType: ComponentType) {
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
  getEntitiesWithComponents<T extends ComponentType>(...componentTypes: T[]) {
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
  destroyEntity(entity: number) {
    const masks = this.entityMasks.get(entity);
    if (!masks) return;
    masks.forEach((componentType) => this.components.delete(entity + componentType));
    this.entityMasks.delete(entity);
    this.entities.delete(entity);
    this.eventSystem.dispatch(GameEvents.Entity_Destroyed, entity);
  }
}
