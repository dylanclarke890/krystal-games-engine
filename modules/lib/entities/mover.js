import { Entity } from "../../core/entity.js";
import { Register } from "../../core/register.js";

/**
 * Simple Mover that visits all its targets in an ordered fashion. You can use
 * the void entities (or any other) as targets.
 *
 * Keys for LevelEditor:
 *
 * - speed:
 * Traveling speed of the mover in pixels per second.
 * Default: 20
 *
 * target.1, target.2 ... target.n
 * Names of the entities to visit.
 */
export class EntityMover extends Entity {
  size = { x: 24, y: 8 };
  maxVel = { x: 100, y: 100 };

  type = Entity.TYPE.NONE;
  checkAgainst = Entity.TYPE.NONE;
  collides = Entity.COLLIDES.FIXED;

  currentTarget = 0;
  speed = 20;
  gravityFactor = 0;

  constructor(opts) {
    super(opts);
  }

  update() {
    let oldDistance = 0;
    const target = this.targets[this.currentTarget];
    if (target) {
      oldDistance = this.distanceTo(target);
      const angle = this.angleTo(target);
      this.vel.x = Math.cos(angle) * this.speed;
      this.vel.y = Math.sin(angle) * this.speed;
    } else {
      this.vel.x = 0;
      this.vel.y = 0;
    }

    super.update();
    if (!target) return;

    // Are we close to the target or has the distance actually increased? -> Set new target
    const newDistance = this.distanceTo(target);
    if (newDistance > oldDistance || newDistance < 0.5) {
      this.pos.x = target.pos.x + target.size.x / 2 - this.size.x / 2;
      this.pos.y = target.pos.y + target.size.y / 2 - this.size.y / 2;
      this.currentTarget++;
      if (this.currentTarget >= this.targets.length)
        if (this.cbOnEndReached) this.onEndReached();
        else this.currentTarget = 0;
    }
  }

  onEndReached() {}
}

Register.entityType(EntityMover);
Register.preloadAsset("assets/entities/mover.png");
