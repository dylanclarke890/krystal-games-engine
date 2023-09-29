import { Position, Size } from "../engine/components/2d/index.js";
import { GameEvents } from "../engine/constants/enums.js";
import { KrystalGameEngine } from "../engine/engine.js";

export class RadialTriggerDemo extends KrystalGameEngine {
  radialTriggerId: number;
  constructor() {
    super("canvas1", 500, 500);
    this.eventSystem.on(GameEvents.Loop_NextFrame, () => this.update());
    this.inputManager.enableMouse();

    this.radialTriggerId = this.entityManager.createEntity();
    this.entityManager.addComponent(this.radialTriggerId, new Position(225, 225));
    this.entityManager.addComponent(this.radialTriggerId, new Size(5));
  }

  update() {}
}
