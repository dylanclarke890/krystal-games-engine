import { Game } from "../../../core/game.js";
import { Box2D } from "./lib.js";

export class Box2DGame extends Game {
  collisionRects = [];
  debugCollisionRects = false;

  worldVelocityIterations = 6;
  worldPositionIterations = 6;

  loadLevel(data) {
    // Find the collision layer and create the box2d world from it
    for (let i = 0; i < data.layer.length; i++) {
      const ld = data.layer[i];
      if (ld.name === "collision") {
        this.world = this.createWorldFromMap(ld.data, ld.width, ld.height, ld.tilesize);
        break;
      }
    }
    super.loadLevel(data);
  }

  createWorldFromMap(origData, width, height, tilesize) {
    const worldBoundingBox = new Box2D.Collision.b2AABB();
    worldBoundingBox.lowerBound.Set(0, 0);
    worldBoundingBox.upperBound.Set(
      (width + 1) * tilesize * Box2D.SCALE,
      (height + 1) * tilesize * Box2D.SCALE
    );

    const gravity = new Box2D.Common.Math.b2Vec2(0, this.gravity * Box2D.SCALE);
    const world = new Box2D.Dynamics.b2World(gravity, true);

    // We need to delete those tiles that we already processed. The original
    // map data is copied, so we don't destroy the original.
    const data = Object.assign({}, origData);

    // Get all the Collision Rects from the map
    this.collisionRects = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // If this tile is solid, find the rect of solid tiles starting
        // with this one
        if (data[y][x])
          this.collisionRects.push(this._extractRectFromMap(data, width, height, x, y));
      }
    }

    // Go through all rects we gathered and create Box2D objects from them
    for (let i = 0; i < this.collisionRects.length; i++) {
      const rect = this.collisionRects[i];

      const bodyDef = new Box2D.Dynamics.b2BodyDef();
      bodyDef.position.Set(
        rect.x * tilesize * Box2D.SCALE + ((rect.width * tilesize) / 2) * Box2D.SCALE,
        rect.y * tilesize * Box2D.SCALE + ((rect.height * tilesize) / 2) * Box2D.SCALE
      );

      const body = world.CreateBody(bodyDef);
      const shape = new Box2D.Collision.Shapes.b2PolygonShape();
      shape.SetAsBox(
        ((rect.width * tilesize) / 2) * Box2D.SCALE,
        ((rect.height * tilesize) / 2) * Box2D.SCALE
      );
      body.CreateFixture2(shape);
    }

    return world;
  }

  _extractRectFromMap(data, width, height, x, y) {
    const rect = { x: x, y: y, width: 1, height: 1 };

    // Find the width of this rect
    for (let wx = x + 1; wx < width && data[y][wx]; wx++) {
      rect.width++;
      data[y][wx] = 0; // unset tile
    }

    // Check if the next row with the same width is also completely solid
    for (let wy = y + 1; wy < height; wy++) {
      let rowWidth = 0;
      for (let wx = x; wx < x + rect.width && data[wy][wx]; wx++) rowWidth++;

      // Same width as the rect? -> All tiles are solid; increase height of this rect
      if (rowWidth === rect.width) {
        rect.height++;

        // Unset tile row from the map
        for (let wx = x; wx < x + rect.width; wx++) data[wy][wx] = 0;
      } else return rect;
    }
    return rect;
  }

  update() {
    this.world.Step(this.system.tick, this.worldVelocityIterations, this.worldPositionIterations);
    this.world.ClearForces();
    super.update();
  }

  draw() {
    super.draw();
    if (!this.debugCollisionRects) return;

    // Draw outlines of all collision rects
    const ts = this.collisionMap.tilesize;
    const { ctx, drawPosition } = this.system;
    for (let i = 0; i < this.collisionRects.length; i++) {
      const rect = this.collisionRects[i];
      ctx.strokeStyle = "#00ff00";
      ctx.strokeRect(
        drawPosition(rect.x * ts - this.screen.actual.x),
        drawPosition(rect.y * ts - this.screen.actual.y),
        drawPosition(rect.width * ts),
        drawPosition(rect.height * ts)
      );
    }
  }
}
