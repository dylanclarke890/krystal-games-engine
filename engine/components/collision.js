export class Collision {
  /** @type {boolean} */
  constrainWithinViewport;
  /** @type {boolean} */
  entityCollisionType;

  /**
   * @param {boolean} constrainWithinViewport
   * @param {CollisionTypes} entityCollisionType
   */
  constructor(constrainWithinViewport, entityCollisionType = CollisionTypes.None) {
    this.constrainWithinViewport = !!constrainWithinViewport;
    this.entityCollisionType = entityCollisionType;
  }
}

export class CollisionTypes {
  static None = new CollisionTypes();
}
