import { Assert } from "../sanity/assert.js";

export const noop = () => {};
/** Returns 'fn' if it is a function, else a 'noop' function. */
export const bind = (fn) => (Assert.isType(fn, "function") ? fn : noop);
