import { IConfigManager } from "../types/common-interfaces.js";

export class ConfigManager<T> implements IConfigManager<T> {
  static ISO8601_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  config: T;

  constructor(config: T | string) {
    this.config = typeof config === "string" ? this.#parseConfig(config) : config;
  }

  #parseConfig(jsonString: string): T {
    return JSON.parse(jsonString, (_key, value) => {
      if (typeof value === "string" && ConfigManager.ISO8601_DATE_REGEX.test(value)) {
        return new Date(value);
      }
      return value;
    });
  }

  #navigateConfig(keys: string[], config: any): any {
    if (!keys.length || !config) {
      return config;
    }
    const keySegment = keys.shift()!;

    // Handle dot notation first
    if (typeof config[keySegment] !== "undefined") {
      return this.#navigateConfig(keys, config[keySegment]);
    }

    // Handle array notation (e.g., arr[0])
    const arrayMatch = keySegment.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, arrayIndex] = arrayMatch;
      if (typeof config[arrayKey] !== "undefined" && typeof config[arrayKey][arrayIndex] !== "undefined") {
        return this.#navigateConfig(keys, config[arrayKey][arrayIndex]);
      }
    }

    // Key does not exist in the config
    return undefined;
  }

  getValue<TValue>(key: string): Nullable<TValue> {
    const keys = key.split(/\.|\[(?=\d+\])/).map((segment) => segment.replace(/\]$/, ""));
    return this.#navigateConfig(keys, this.config);
  }

  getString(key: string): Nullable<string> {
    const value = this.getValue<unknown>(key);
    return typeof value === "string" ? value : undefined;
  }

  getInt(key: string): Nullable<number> {
    const value = this.getValue<unknown>(key);
    return typeof value === "number" ? value : undefined;
  }

  getBool(key: string): Nullable<boolean> {
    const value = this.getValue<unknown>(key);
    return typeof value === "boolean" ? value : undefined;
  }

  getDate(key: string): Nullable<Date> {
    const value = this.getValue<unknown>(key);
    return value instanceof Date ? value : undefined;
  }

  getObject<TObj>(key: string): Nullable<TObj> {
    const value = this.getValue<unknown>(key);
    return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as TObj) : undefined;
  }

  getArray<TItem>(key: string): Nullable<TItem[]> {
    const value = this.getValue<unknown>(key);
    return Array.isArray(value) ? value : undefined;
  }
}
