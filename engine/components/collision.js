export class Collision {
  /** @type {{start: boolean, end: boolean, top:boolean, bottom: boolean }} */
  viewportCollision;
  /** @type {EntityCollisionTypes} */
  entityCollision;

  /**
   * @param {{start: boolean, end: boolean, top:boolean, bottom: boolean }} viewportCollision
   * @param {EntityCollisionTypes} entityCollision
   */
  constructor(viewportCollision, entityCollision = EntityCollisionTypes.None) {
    this.viewportCollision = viewportCollision ?? {
      left: false,
      right: false,
      top: false,
      bottom: false,
    };
    this.entityCollision = entityCollision;
  }
}

export class EntityCollisionTypes {
  static None = new EntityCollisionTypes();
}
