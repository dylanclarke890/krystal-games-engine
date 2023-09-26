export class ObjectFactory<T, Args extends any[] = any[]> {
  createFn: (...args: Args) => T;
  constructor(ClassConstructor: ClassConstructor<T, Args>) {
    this.createFn = (...args) => new ClassConstructor(...args);
  }

  create(...args: Args): T {
    return this.createFn(...args);
  }
}
