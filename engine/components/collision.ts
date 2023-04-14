import { BitwiseFlags } from "../utils/bitwise-flags.js";

export class Collision {
  collisionFlags: BitwiseFlags<typeof CollisionTypes>;

  constructor(settings?: CollisionSettings) {
    this.collisionFlags = new BitwiseFlags();
    if (settings) {
      this.#assignSettings(settings);
    }
  }

  #assignSettings(settings: CollisionSettings) {
    const vpc = settings.viewportCollision;
    if (vpc?.left) this.collisionFlags.addFlag(CollisionTypes.VP_LEFT);
    if (vpc?.top) this.collisionFlags.addFlag(CollisionTypes.VP_TOP);
    if (vpc?.right) this.collisionFlags.addFlag(CollisionTypes.VP_RIGHT);
    if (vpc?.bottom) this.collisionFlags.addFlag(CollisionTypes.VP_BOTTOM);
  }
}

const CollisionTypes = {
  VP_LEFT: 1,
  VP_TOP: 2,
  VP_RIGHT: 4,
  VP_BOTTOM: 8,
  E_STICK: 16,
  E_WALL: 32,
} as const;

type ViewportCollisionSettings = {
  left: 1;
  top: 2;
  right: 4;
  bottom: 8;
};

type EntityCollisionSettings = {
  stick: 16;
  wall: 32;
};

type CollisionSettings = {
  viewportCollision?: {
    [P in keyof ViewportCollisionSettings]?: boolean;
  };
  entityCollision?: {
    [P in keyof EntityCollisionSettings]?: boolean;
  };
};
