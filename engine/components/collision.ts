import { BitwiseFlags } from "../utils/bitwise-flags.js";

export class Collision {
  viewportFlags: BitwiseFlags<typeof ViewportCollisionTypes>;
  entityFlags: BitwiseFlags<typeof EntityCollisionTypes>;

  constructor(settings?: CollisionSettings) {
    this.viewportFlags = new BitwiseFlags();
    this.entityFlags = new BitwiseFlags();

    if (settings) {
      this.#assignSettings(settings);
    }
  }

  hasViewportCollisionType(type: keyof typeof ViewportCollisionTypes): boolean {
    return this.viewportFlags.hasFlag(ViewportCollisionTypes[type]);
  }

  hasEntityCollisionType(type: keyof typeof EntityCollisionTypes): boolean {
    return this.entityFlags.hasFlag(EntityCollisionTypes[type]);
  }

  #assignSettings(settings: CollisionSettings) {
    const vpc = settings.viewportCollision;
    if (vpc?.left) this.viewportFlags.addFlag(ViewportCollisionTypes.LEFT);
    if (vpc?.top) this.viewportFlags.addFlag(ViewportCollisionTypes.TOP);
    if (vpc?.right) this.viewportFlags.addFlag(ViewportCollisionTypes.RIGHT);
    if (vpc?.bottom) this.viewportFlags.addFlag(ViewportCollisionTypes.BOTTOM);
    if (!this.viewportFlags.hasFlagSet()) this.viewportFlags.addFlag(ViewportCollisionTypes.IGNORE);

    const ec = settings.entityCollision;
    if (ec?.bounce) this.entityFlags.addFlag(EntityCollisionTypes.BOUNCE);
    if (ec?.stick) this.entityFlags.addFlag(EntityCollisionTypes.STICK);
    if (!this.entityFlags.hasFlagSet()) this.entityFlags.addFlag(EntityCollisionTypes.IGNORE);
  }
}

const ViewportCollisionTypes = {
  IGNORE: 1,
  LEFT: 2,
  TOP: 4,
  RIGHT: 8,
  BOTTOM: 16,
} as const;

const EntityCollisionTypes = {
  IGNORE: 1,
  STICK: 2,
  BOUNCE: 4,
} as const;

type ViewportCollisionSettings = {
  left: 1;
  top: 2;
  right: 4;
  bottom: 8;
};

type EntityCollisionSettings = {
  stick: 2;
  bounce: 4;
};

type CollisionSettings = {
  viewportCollision?: {
    [P in keyof ViewportCollisionSettings]?: boolean;
  };
  entityCollision?: {
    [P in keyof EntityCollisionSettings]?: boolean;
  };
};
