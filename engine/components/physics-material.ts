export class PhysicsMaterial {
  restitution: number;
  friction: number;

  constructor(bounciness?: number, friction?: number) {
    this.restitution = bounciness ?? 1;
    this.friction = friction ?? 0;
  }
}
