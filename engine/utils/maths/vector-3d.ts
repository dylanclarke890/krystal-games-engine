export class Vector3D {
  z: number | undefined;
  y: number | undefined;
  x: number | undefined;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
