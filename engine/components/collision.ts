import { BitwiseFlags } from "../utils/bitwise-flags.js";

export class Collision {
  collisionFlags: BitwiseFlags<typeof CollisionTypes>;

  constructor(settings?: CollisionSettings) {
    this.collisionFlags = new BitwiseFlags();
    if (settings) {
      this.#assignSettings(settings);
    }
  }

  hasCollisionType(type: keyof typeof CollisionTypes): boolean {
    return this.collisionFlags.hasFlag(CollisionTypes[type]);
  }

  #assignSettings(settings: CollisionSettings) {
    const vpc = settings.viewportCollision;
    if (vpc?.left) this.collisionFlags.addFlag(CollisionTypes.VP_LEFT);
    if (vpc?.top) this.collisionFlags.addFlag(CollisionTypes.VP_TOP);
    if (vpc?.right) this.collisionFlags.addFlag(CollisionTypes.VP_RIGHT);
    if (vpc?.bottom) this.collisionFlags.addFlag(CollisionTypes.VP_BOTTOM);

    const ec = settings.entityCollision;
    if (ec?.bounce) this.collisionFlags.addFlag(CollisionTypes.E_BOUNCE);
    if (ec?.stick) this.collisionFlags.addFlag(CollisionTypes.E_STICK);
  }
}

const CollisionTypes = {
  IGNORE: 1,
  VP_LEFT: 2,
  VP_TOP: 4,
  VP_RIGHT: 8,
  VP_BOTTOM: 16,
  E_STICK: 32,
  E_BOUNCE: 64,
} as const;

type ViewportCollisionSettings = {
  left: 1;
  top: 2;
  right: 4;
  bottom: 8;
};

type EntityCollisionSettings = {
  stick: 16;
  bounce: 32;
};

type CollisionSettings = {
  viewportCollision?: {
    [P in keyof ViewportCollisionSettings]?: boolean;
  };
  entityCollision?: {
    [P in keyof EntityCollisionSettings]?: boolean;
  };
};
