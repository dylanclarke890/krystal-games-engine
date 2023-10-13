import { BaseComponent } from "../components/base.js";
import { CollisionInfo } from "../physics/collision/data.js";
import { BaseSystem } from "../systems/base-system.js";

export enum GameEventType {
  // #region Loop
  LOOP_BEFORE_START,
  LOOP_STARTED,
  LOOP_PAUSED,
  LOOP_UNPAUSED,
  LOOP_STOPPED,
  LOOP_RESTARTED,
  // #endregion Loop
  // #region System
  SYSTEM_ADDED,
  SYSTEM_ENABLED,
  SYSTEM_DISABLED,
  SYSTEM_REMOVED,
  // #endregion System
  // #region Entity
  ENTITY_CREATED,
  ENTITY_DESTROYED,
  ENTITY_COLLIDED,
  // #endregion Entity
  // #region Component
  COMPONENT_ADDED,
  COMPONENT_REMOVED,
  // #endregion Component
}

export type ComponentEvent = {
  entity: number;
  component: BaseComponent;
};

export type GameEventHandler<T extends keyof GameEventMap> = (data: GameEventMap[T]) => void;

export type GameEventMap = {
  [GameEventType.LOOP_STARTED]: number;
  [GameEventType.LOOP_STOPPED]: boolean;

  [GameEventType.ENTITY_CREATED]: number;
  [GameEventType.ENTITY_COLLIDED]: CollisionInfo;
  [GameEventType.ENTITY_DESTROYED]: number;

  [GameEventType.COMPONENT_ADDED]: ComponentEvent;
  [GameEventType.COMPONENT_REMOVED]: ComponentEvent;

  [GameEventType.SYSTEM_ADDED]: BaseSystem;
  [GameEventType.SYSTEM_REMOVED]: BaseSystem;
};
