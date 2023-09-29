import { GameEvents } from "../engine/constants/enums.js";
import { pointVsRect } from "../engine/physics/collision/detection/detection-strategies.js";
import { Position, Shape, Size } from "../engine/components/2d/index.js";
import { KrystalGameEngine } from "../engine/engine.js";

export class PointVsRectTest extends KrystalGameEngine {
  rectId: number;

  constructor() {
    super("canvas1", 500, 500);
    this.eventSystem.on(GameEvents.Loop_NextFrame, () => this.update());
    this.inputManager.enableMouse();

    this.rectId = this.entityManager.createEntity();
    this.entityManager.addComponent(this.rectId, new Position(200, 200));
    this.entityManager.addComponent(this.rectId, new Size(50, 200));
    this.entityManager.addComponent(this.rectId, new Shape("rectangle", "purple", { width: 50, height: 200 }));

    this.start();
  }

  update() {
    const rectComponents = this.entityManager.getComponents(this.rectId, ["Position", "Size", "Shape"]);
    if (pointVsRect(this.inputManager.mouse, rectComponents.Position!, rectComponents.Size!)) {
      rectComponents.Shape!.color = "green";
    } else {
      rectComponents.Shape!.color = "purple";
    }
  }
}

new PointVsRectTest();
