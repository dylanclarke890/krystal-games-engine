import { PairedSet } from "../utils/paired-set.js";

export class CollisionResolver {
  resolve(collided: PairedSet<number>) {
    if (collided.length) console.log(collided);
  }
}
