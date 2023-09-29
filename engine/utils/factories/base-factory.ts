export class BaseFactory<T, Args extends any[] = any[]> {
  ClassConstructor: ClassConstructor<T, Args>;
  totalCreated: number;

  constructor(ClassConstructor: ClassConstructor<T, Args>) {
    this.ClassConstructor = ClassConstructor;
    this.totalCreated = 0;
  }
}
