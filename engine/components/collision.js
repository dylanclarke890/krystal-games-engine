export const CollisionResponseFlags = {
  Ignore: 1,
  Repel: 2,
  Bounce: 4,
  Stick: 8,
  Slide: 16,
  Push_EntityA: 32,
  Push_EntityB: 64,
  Damage_EntityA: 128,
  Damage_EntityB: 256,
  Destroy_EntityA: 512,
  Destroy_EntityB: 1024,
};

export class Collision {
  constructor(responseFlags) {
    this.responseFlags = responseFlags ?? 0;
  }

  /**
   * Add a response to the component.
   * @param {keyof typeof CollisionResponseFlags} response - The response to add.
   */
  addResponse(response) {
    this.responseFlags |= CollisionResponseFlags[response];
  }

  /**
   * Remove a response from the component.
   * @param {keyof typeof CollisionResponseFlags} response - The response to remove.
   */
  removeResponse(response) {
    this.responseFlags &= ~CollisionResponseFlags[response];
  }

  /**
   * Check if the component has a particular response.
   * @param {keyof typeof CollisionResponseFlags} response - The response to check for.
   * @returns {boolean} - True if the component has the response, false otherwise.
   */
  hasResponse(response) {
    return !!(this.responseFlags & CollisionResponseFlags[response]);
  }
}
