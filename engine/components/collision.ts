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
    if (vpc && !vpc.IGNORE) {
      if (vpc.LEFT) this.viewportFlags.addFlag(ViewportCollisionTypes.LEFT);
      if (vpc.TOP) this.viewportFlags.addFlag(ViewportCollisionTypes.TOP);
      if (vpc.RIGHT) this.viewportFlags.addFlag(ViewportCollisionTypes.RIGHT);
      if (vpc.BOTTOM) this.viewportFlags.addFlag(ViewportCollisionTypes.BOTTOM);
    }
    if (!this.viewportFlags.hasFlagSet()) this.viewportFlags.addFlag(ViewportCollisionTypes.IGNORE);

    const ec = settings.entityCollision;
    if (ec && !ec.IGNORE) {
      if (ec.BOUNCE) this.entityFlags.addFlag(EntityCollisionTypes.BOUNCE);
      if (ec.STICK) this.entityFlags.addFlag(EntityCollisionTypes.STICK);
    }
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

type CollisionSettings = {
  viewportCollision?: {
    [P in keyof typeof ViewportCollisionTypes]?: boolean;
  };
  entityCollision?: {
    [P in keyof typeof EntityCollisionTypes]?: boolean;
  };
};
