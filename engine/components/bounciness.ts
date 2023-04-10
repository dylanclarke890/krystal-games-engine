import { constrain } from "../utils/number";

export class Bounciness {
  value: number;

  constructor(value: number) {
    this.value = constrain(value, 0, 1);
  }
}
