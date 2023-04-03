import { EntityCollisionBehaviour } from "../collision/behaviours.js";

export class Collision {
  /** @type {{start: boolean, end: boolean, top:boolean, bottom: boolean }} */
  viewportCollision;
  /** @type {EntityCollisionBehaviour} */
  entityCollision;

  /**
   * @param {{start: boolean, end: boolean, top:boolean, bottom: boolean }} viewportCollision
   * @param {EntityCollisionBehaviour} entityCollisionBehaviour
   */
  constructor(viewportCollision, entityCollisionBehaviour) {
    this.viewportCollision = viewportCollision ?? {
      left: false,
      right: false,
      top: false,
      bottom: false,
    };
    this.entityCollision = entityCollisionBehaviour ?? EntityCollisionBehaviour.None;
  }
}
