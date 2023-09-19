import {
  CollisionLayer,
  CollisionSettings,
  EntityCollisionCallback,
  ViewportCollisionCallback,
} from "../utils/types.js";

export class Collision {
  collisionLayer: CollisionLayer;
  onEntityCollisionCallbacks: EntityCollisionCallback[];
  onViewportCollisionCallbacks: ViewportCollisionCallback[];

  constructor(collisionLayer: CollisionLayer = "DEFAULT", settings?: CollisionSettings) {
    this.collisionLayer = collisionLayer;
    this.onEntityCollisionCallbacks = [];
    this.onViewportCollisionCallbacks = [];

    if (typeof settings?.onEntityCollision === "function") {
      this.onEntityCollisionCallbacks.push(settings.onEntityCollision);
    }
    if (typeof settings?.onViewportCollision === "function") {
      this.onViewportCollisionCallbacks.push(settings.onViewportCollision);
    }
  }
}
