export class World {
  constructor(systems) {
    this.systems = systems;
  }

  update(tick) {
    this.tick = tick;
    this.systems.forEach((s) => s.update());
  }
}
