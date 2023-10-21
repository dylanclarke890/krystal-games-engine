import { Transform } from "../../engine/components/index.js";
import { KrystalGameEngine } from "../../engine/core/engine.js";
import { Vector2 } from "../../engine/maths/vector2.js";
import { FlashCard } from "./data.js";
import { FlashCardSystem } from "./system.js";

export class FlashCardDemo extends KrystalGameEngine {
  constructor() {
    super("canvas1", 500, 500);
    this.gameContext.systems.addSystem(new FlashCardSystem(this.gameContext));
    this.addFlashCard(50, 50, "Q1", "A1");
    this.addFlashCard(100, 100, "Q2", "A2");
    this.start();
  }

  addFlashCard(x: number, y: number, q: string, a: string) {
    const em = this.gameContext.entities;
    const id = em.createEntity();
    const tf = new Transform();
    tf.position = new Vector2(x, y);
    const flashCard = new FlashCard(tf, q, a);
    em.addComponent(id, flashCard);
  }
}
