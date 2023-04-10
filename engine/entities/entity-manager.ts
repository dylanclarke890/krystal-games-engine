import { Acceleration } from "../components/acceleration";
import { AI } from "../components/ai";
import { Animation } from "../components/animation";
import { Bounciness } from "../components/bounciness.js";
import { Collision } from "../components/collision";
import { Damage } from "../components/damage";
import { Friction } from "../components/friction";
import { GravityFactor } from "../components/gravity-factor";
import { Health } from "../components/health";
import { Input } from "../components/input";
import { Offset } from "../components/offset";
import { Position } from "../components/position";
import { Size } from "../components/size";
import { Sprite } from "../components/sprite";
import { Velocity } from "../components/velocity.js";
import { EventSystem } from "../events/event-system";
import { GameEvents } from "../events/events";
import { Guard } from "../utils/guard";

type ComponentMap = {
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

type ComponentType =
  | "Acceleration"
  | "AI"
  | "Animation"
  | "Bounciness"
  | "Collision"
  | "Damage"
  | "Friction"
  | "GravityFactor"
  | "Health"
  | "Input"
  | "Offset"
  | "Position"
  | "Size"
  | "Sprite"
  | "Velocity";

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
  getComponent(
    entity: number,
    componentType: ComponentType
  ): ComponentMap[ComponentType] | undefined {
    return this.components.get(entity + componentType);
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
  getEntitiesWithComponents(...componentTypes: ComponentType[]) {
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
