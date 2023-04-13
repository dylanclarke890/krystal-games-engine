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
type FlagsKey = keyof typeof CollisionResponseFlags;

const LAST_RESPONSE_VALUE = CollisionResponseFlags.Destroy_Other;
const ReverseCollisionFlags = new Map<number, FlagsKey>(
  Object.entries(CollisionResponseFlags).map(([k, v]) => [v, k as FlagsKey])
);

export class Collision {
  responseFlags: number;

  constructor(responseFlags?: number) {
    this.responseFlags = responseFlags ?? 0;
  }

  /** Add a response to the component. */
  addResponse(response: FlagsKey) {
    this.responseFlags |= CollisionResponseFlags[response];
  }

  /** Remove a response from the component. */
  removeResponse(response: FlagsKey) {
    this.responseFlags &= ~CollisionResponseFlags[response];
  }

  /** Check if the component has a particular response. */
  hasResponse(response: FlagsKey): boolean {
    return !!(this.responseFlags & CollisionResponseFlags[response]);
  }

  /** Get a list of responses currently set. */
  getResponses(): string[] {
    const responses: string[] = [];
    let flag = 1;
    while (flag <= this.responseFlags && flag <= LAST_RESPONSE_VALUE) {
      if (flag & this.responseFlags) {
        responses.push(ReverseCollisionFlags.get(flag)!);
      }
      flag <<= 1;
    }
    return responses;
  }
}

type CollisionSettings = {
  viewportCollision?: { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean };
};

// type CollisionTypes = {}

export class Collide {
  entityCollisionFlags: number;

  constructor(settings?: CollisionSettings) {
    this.entityCollisionFlags = 0;
    if (settings) {
      this.#assignSettings(settings);
    }
  }

  #assignSettings(settings: CollisionSettings) {
    if (settings.viewportCollision) {
    }
  }
}