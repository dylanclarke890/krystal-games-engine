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

const ReverseCollisionResponseFlags: { [x: string]: string } = {
  1: "Ignore",
  2: "Repel",
  4: "Bounce",
  8: "Stick",
  16: "Slide",
  32: "Push_Self",
  64: "Push_Other",
  126: "Damage_Self",
  256: "Damage_Other",
  512: "Destroy_Self",
  1024: "Destroy_Other",
};

export class Collision {
  responseFlags: number;

  constructor(responseFlags?: number) {
    this.responseFlags = responseFlags ?? 0;
  }

  /**
   * Add a response to the component.
   */
  addResponse(response: keyof typeof CollisionResponseFlags) {
    this.responseFlags |= CollisionResponseFlags[response];
  }

  /**
   * Remove a response from the component.
   */
  removeResponse(response: keyof typeof CollisionResponseFlags) {
    this.responseFlags &= ~CollisionResponseFlags[response];
  }

  /**
   * Check if the component has a particular response.
   */
  hasResponse(response: keyof typeof CollisionResponseFlags): boolean {
    return !!(this.responseFlags & CollisionResponseFlags[response]);
  }

  /**
   * Get a list of responses currently set.
   */
  getResponses(): string[] {
    const responses: string[] = [];
    let flag = 1;
    while (flag <= this.responseFlags) {
      if (flag & this.responseFlags) {
        const key = flag.toString();
        responses.push(ReverseCollisionResponseFlags[key]);
      }
      flag <<= 1;
    }
    return responses;
  }
}
