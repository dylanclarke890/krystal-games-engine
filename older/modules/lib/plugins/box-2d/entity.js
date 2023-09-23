import { Entity } from "../../../core/entity.js";
import { Box2D } from "./lib.js";

export class Box2DEntity extends Entity {
  static _levelEditorMode = false;

  angle = 0;
  body = null;

  constructor(opts) {
    super(opts);
    // Only create a box2d body when we are not in LevelEditor
    if (!Box2DEntity._levelEditorMode) this.createBody();
  }

  createBody() {
    const bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.position = new Box2D.Common.Math.b2Vec2(
      (this.pos.x + this.size.x / 2) * Box2D.SCALE,
      (this.pos.y + this.size.y / 2) * Box2D.SCALE
    );
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    this.body = this.game.world.CreateBody(bodyDef);

    const fixture = new Box2D.Dynamics.b2FixtureDef();
    fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixture.shape.SetAsBox((this.size.x / 2) * Box2D.SCALE, (this.size.y / 2) * Box2D.SCALE);

    fixture.density = 1.0;
    // fixture.friction = 0.5;
    // fixture.restitution = 0.3;
    this.body.CreateFixture(fixture);
  }

  update() {
    const p = this.body.GetPosition();
    this.pos = {
      x: p.x / Box2D.SCALE - this.size.x / 2,
      y: p.y / Box2D.SCALE - this.size.y / 2,
    };
    this.angle = this.body.GetAngle().round(2);

    if (this.currentAnim) {
      this.currentAnim.update();
      this.currentAnim.angle = this.angle;
    }
  }

  kill() {
    this.game.world.DestroyBody(this.body);
    this.parent();
  }
}
