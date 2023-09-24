export function isFunction<O extends object, K extends keyof O>(
  obj: O,
  key: K
): obj is O & Record<K, (...args: any[]) => any> {
  return typeof obj[key] === "function";
}
