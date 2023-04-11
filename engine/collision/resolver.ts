import { PairedSet } from "../utils/paired-set.js";

export class CollisionResolver {
  resolve(collided: PairedSet) {
    if (collided.length) console.log(collided);
  }
}
