const CollisionLayer = { DEFAULT: 1, PLAYER: 2, ENEMY: 4 } as const;

export class Collision {
  collisionLayer: ValueOfObj<typeof CollisionLayer>;
  constructor(collisionLayer: Key<typeof CollisionLayer>) {
    this.collisionLayer = CollisionLayer[collisionLayer];
  }

  onViewportCollision(func: Function) {
    func();
  }

  onEntityCollision(func: Function) {
    func();
  }
}
