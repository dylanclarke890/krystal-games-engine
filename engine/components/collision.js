export const CollisionResponseFlags = {
  Ignore: 1,
  Repel: 2,
  Bounce: 4,
  Stick: 8,
  Slide: 16,
  Push_Self: 32,
  Push_Other: 64,
  Damage_Self: 128,
  Damage_Other: 256,
  Destroy_Self: 512,
  Destroy_Other: 1024,
};

const ResponseFlagKeys = Object.keys(CollisionResponseFlags).reduce((obj, key) => {
  obj[CollisionResponseFlags[key]] = key;
  return obj;
}, {});

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

  /**
   * Get a list of responses currently set.
   * @returns {string[]}
   */
  getResponses() {
    const responses = [];
    let flag = 1;
    while (flag <= this.responseFlags) {
      if (flag & this.responseFlags) {
        responses.push(ResponseFlagKeys[flag]);
      }
      flag <<= 1;
    }
    return responses;
  }
}
