import { BitwiseFlags } from "../utils/bitwise-flags.js";
import {
  CollisionSettings,
  EntityCollisionTypes,
  ViewportCollisionTypes,
  Key,
} from "../utils/types.js";

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

  hasViewportCollisionType(type: Key<typeof ViewportCollisionTypes>): boolean {
    return this.viewportFlags.hasFlag(ViewportCollisionTypes[type]);
  }

  hasEntityCollisionType(type: Key<typeof EntityCollisionTypes>): boolean {
    return this.entityFlags.hasFlag(EntityCollisionTypes[type]);
  }

  #assignSettings(settings: CollisionSettings) {
    if (settings.viewportCollision) {
      Object.keys(settings.viewportCollision).forEach((v) => {
        const value = ViewportCollisionTypes[v as Key<typeof ViewportCollisionTypes>];
        if (!value) return;
        this.viewportFlags.addFlag(value);
      });
    }
    if (!this.viewportFlags.hasFlagSet()) this.viewportFlags.addFlag(ViewportCollisionTypes.IGNORE);

    if (settings.entityCollision) {
      Object.keys(settings.entityCollision).forEach((v) => {
        const value = EntityCollisionTypes[v as Key<typeof EntityCollisionTypes>];
        if (!value) return;
        this.entityFlags.addFlag(value);
      });
    }
    if (!this.entityFlags.hasFlagSet()) this.entityFlags.addFlag(EntityCollisionTypes.IGNORE);
  }
}
