import { PairedSet } from "../utils/paired-set";

export class CollisionResolver {
  resolve(collided: PairedSet) {
    if (collided.length) console.log(collided);
  }
}
