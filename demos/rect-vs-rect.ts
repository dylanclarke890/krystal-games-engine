import { GameEvents } from "../engine/constants/enums.js";
import { rectVsRect } from "../engine/collision/detection-strategies.js";
import { Position, Shape, Size } from "../engine/components/2d/index.js";
import { Game } from "../engine/main/game.js";

export class RectVsRectTest extends Game {
  mouseRectId: number;
  staticRectId: number;
  constructor() {
    super("canvas1", 500, 500);
    this.eventSystem.on(GameEvents.Loop_NextFrame, () => this.update());
    this.inputManager.enableMouse();

    this.staticRectId = this.entityManager.createEntity();
    this.mouseRectId = this.entityManager.createEntity();

    this.entityManager.addComponent(this.staticRectId, new Position(250, 150));
    this.entityManager.addComponent(this.staticRectId, new Size(50, 200));
    this.entityManager.addComponent(this.staticRectId, new Shape("rectangle", "purple", { width: 50, height: 200 }));

    this.entityManager.addComponent(this.mouseRectId, new Position(0, 0));
    this.entityManager.addComponent(this.mouseRectId, new Size(25, 150));
    this.entityManager.addComponent(this.mouseRectId, new Shape("rectangle", "orange", { width: 25, height: 150 }));

    this.start();
  }

  update() {
    const rectComponents = this.entityManager.getComponents(this.staticRectId, ["Position", "Size", "Shape"]);
    const mouseComponents = this.entityManager.getComponents(this.mouseRectId, ["Position", "Size"]);
    const newPos = this.inputManager.mouse.clone().sub(mouseComponents.Size!.clone().div(2));
    mouseComponents.Position!.assign(newPos);

    if (rectVsRect(mouseComponents.Position!, mouseComponents.Size!, rectComponents.Position!, rectComponents.Size!)) {
      rectComponents.Shape!.color = "green";
    } else {
      rectComponents.Shape!.color = "purple";
    }
  }
}

new RectVsRectTest();
