export class LogicGates {
  static and(a: Bit, b: Bit): Bit {
    return a && b;
  }

  static or(a: Bit, b: Bit): Bit {
    return a || b;
  }

  static not(a: Bit): Bit {
    return (-a & 1) as Bit;
  }

  static xor(a: Bit, b: Bit): Bit {
    return (a ^ b) as Bit;
  }

  static nand(a: Bit, b: Bit): Bit {
    return this.not(this.and(a, b));
  }

  static nor(a: Bit, b: Bit): Bit {
    return this.not(this.or(a, b));
  }

  static xnor(a: Bit, b: Bit): Bit {
    return this.not(this.xor(a, b));
  }
}
