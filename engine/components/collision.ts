import { BitwiseFlags } from "../utils/bitwise-flags.js";
import { CollisionSettings, EntityCollisionTypes, ViewportCollisionTypes } from "../utils/types.js";

export class Collision {
  viewportFlags: BitwiseFlags<typeof ViewportCollisionTypes>;
  entityFlags: BitwiseFlags<typeof EntityCollisionTypes>;

  constructor(settings?: CollisionSettings) {
    this.viewportFlags = new BitwiseFlags();
    this.entityFlags = new BitwiseFlags();

    this.#assignSettings(settings);
  }

  hasViewportCollisionType(type: Key<typeof ViewportCollisionTypes>): boolean {
    return this.viewportFlags.has(ViewportCollisionTypes[type]);
  }

  hasEntityCollisionType(type: Key<typeof EntityCollisionTypes>): boolean {
    return this.entityFlags.has(EntityCollisionTypes[type]);
  }

  #assignSettings(settings?: CollisionSettings) {
    if (typeof settings?.viewportCollision === "object") {
      this.viewportFlags.clear();
      Object.keys(settings.viewportCollision).forEach((v) => {
        const value = ViewportCollisionTypes[v as Key<typeof ViewportCollisionTypes>];
        if (typeof value === "undefined") {
          return;
        }
        this.viewportFlags.add(value);
      });
    }

    if (typeof settings?.entityCollision === "object") {
      this.entityFlags.clear();
      Object.keys(settings.entityCollision).forEach((v) => {
        const value = EntityCollisionTypes[v as Key<typeof EntityCollisionTypes>];
        if (typeof value === "undefined") {
          return;
        }
        this.entityFlags.add(value);
      });
    }

    if (!this.viewportFlags.isSet()) {
      this.viewportFlags.add(ViewportCollisionTypes.IGNORE);
    }

    if (!this.entityFlags.isSet()) {
      this.entityFlags.add(EntityCollisionTypes.IGNORE);
    }
  }
}

export class Collision2 {
  viewportCollisionTypes: BitwiseFlags<typeof ViewportCollisionTypes>;

  constructor(viewportCollisionTypes?: Key<typeof ViewportCollisionTypes>[]) {
    this.viewportCollisionTypes = new BitwiseFlags();
    if (typeof viewportCollisionTypes === "undefined") {
      this.viewportCollisionTypes.add(ViewportCollisionTypes.ALL);
    } else {
      viewportCollisionTypes.forEach((v) => this.viewportCollisionTypes.add(ViewportCollisionTypes[v]));
    }
  }

  onViewportCollision() {}

  onEntityCollision() {}
}
