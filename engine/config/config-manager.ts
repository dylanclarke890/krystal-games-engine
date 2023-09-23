export class ConfigManager<T> {
  config: T;

  constructor(config: T) {
    this.config = config;
  }

  getValue<TValue>(key: keyof T): TValue | undefined {
    return (this.config as any)[key];
  }

  getString(key: keyof T): string | undefined {
    const value = this.getValue<any>(key);
    return typeof value === "string" ? value : undefined;
  }

  getInt(key: keyof T): number | undefined {
    const value = this.getValue<any>(key);
    return typeof value === "number" ? value : undefined;
  }

  getBool(key: keyof T): boolean | undefined {
    const value = this.getValue<any>(key);
    return typeof value === "boolean" ? value : undefined;
  }

  getDate(key: keyof T): Date | undefined {
    const value = this.getValue<any>(key);
    return value instanceof Date ? value : undefined;
  }

  getArray<TItem>(key: keyof T): TItem[] | undefined {
    const value = this.getValue<any>(key);
    return Array.isArray(value) ? value : undefined;
  }

  getObject<TObj>(key: keyof T): TObj | undefined {
    const value = this.getValue<any>(key);
    return value && typeof value === "object" ? value : undefined;
  }
}
