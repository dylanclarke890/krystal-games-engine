export const CollisionResponseFlags = {
  Ignore: 1,
  Repel: 2,
  Bounce: 4,
  Stick: 8,
  Destroy: 16,
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
