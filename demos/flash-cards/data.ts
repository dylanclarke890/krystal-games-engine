import { BaseComponent } from "../../engine/components/base.js";
import { RectCollider } from "../../engine/components/collider.js";
import { PhysicsMaterial } from "../../engine/components/physics-material.js";
import { Transform } from "../../engine/components/transform.js";
import { Vector2 } from "../../engine/maths/vector2.js";

export class FlashCard extends BaseComponent {
  name = "flash-card";

  transform: Transform;
  collider: RectCollider;
  question: string;
  answer: string;
  showAnswer: boolean;

  constructor(transform: Transform, question: string, answer: string) {
    super();
    this.transform = transform;
    this.collider = new RectCollider(transform, new PhysicsMaterial(), new Vector2(50, 50));
    this.question = question;
    this.answer = answer;
    this.showAnswer = false;
  }

  get content(): string {
    return this.showAnswer ? this.answer : this.question;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.showAnswer ? "orange" : "green";
    ctx.strokeRect(this.transform.position.x, this.transform.position.y, this.collider.size.x, this.collider.size.y);
  }
}
