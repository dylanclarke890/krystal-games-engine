export class PhysicsMaterial {
  bounciness: number;
  friction: number;

  constructor(bounciness?: number, friction?: number) {
    this.bounciness = bounciness ?? 1;
    this.friction = friction ?? 0;
  }
}
