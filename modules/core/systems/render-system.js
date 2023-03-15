import { SystemBase } from "./base-system.js";

export class RenderSystem extends SystemBase {
  constructor(entityManager) {
    super(entityManager);
  }

  update() {
    const entities = this.entityManager.getEntitiesWithComponents("sprite", "position");
    console.log(entities);
  }
}
