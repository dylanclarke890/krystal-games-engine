import { ShapeVsShape } from "./ball-vs-ball/demo.js";
import { FlashCardDemo } from "./flash-cards/demo.js";

const AVAILABLE_DEMOS = {
  shapeVsShape: ShapeVsShape,
  flashCards: FlashCardDemo,
};

new AVAILABLE_DEMOS.flashCards();
