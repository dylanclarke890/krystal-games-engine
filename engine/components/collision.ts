import { CollisionLayer, CollisionSettings } from "../utils/types.js";

export class Collision {
  collisionLayer: CollisionLayer;
  onEntityCollisionCallbacks: Function[];
  onViewportCollisionCallbacks: Function[];

  constructor(collisionLayer: CollisionLayer = "DEFAULT", settings?: CollisionSettings) {
    this.collisionLayer = collisionLayer;
    this.onEntityCollisionCallbacks = [];
    this.onViewportCollisionCallbacks = [];

    if (typeof settings?.onEntityCollision === "function") {
      this.onEntityCollisionCallbacks.push(settings.onEntityCollision);
    }
    if (typeof settings?.onViewportCollision === "function") {
      this.onEntityCollisionCallbacks.push(settings.onViewportCollision);
    }
  }
}
