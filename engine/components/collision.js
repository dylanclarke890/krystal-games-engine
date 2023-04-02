export class Collision {
  /** @type {{start: boolean, end: boolean, top:boolean, bottom: boolean }} */
  viewportCollision;
  /** @type {{enabled: boolean}} */
  entityCollision;

  /**
   * @param {{start: boolean, end: boolean, top:boolean, bottom: boolean }} viewportCollision
   * @param {{enabled: boolean}} entityCollision
   */
  constructor(viewportCollision, entityCollision) {
    this.viewportCollision = viewportCollision ?? {
      left: false,
      right: false,
      top: false,
      bottom: false,
    };
    this.entityCollision = entityCollision ?? {
      enabled: false,
    };
  }
}
