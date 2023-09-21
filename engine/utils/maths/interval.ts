import { IntervalParsingFailedError } from "../errors.js";
import { safeParseInt } from "./number.js";

function getIntervalInfo(interval: string) {
  interval = interval.trim();
  const first = interval[0];
  const last = interval[interval.length - 1];
  const range = interval.slice(1, interval.length - 1);
  const commaDelimiter = range.indexOf(",");
  const periodDelimiter = range.indexOf("..");
  const fromToArray = range.split(commaDelimiter !== -1 ? "," : "..");
  let from = safeParseInt(fromToArray[0]);
  let to = safeParseInt(fromToArray[1]);

  if (first !== "(" && first !== "[") {
    throw new IntervalParsingFailedError("Invalid start character. Allowed characters are '(' and '['.", interval);
  }
  if (last !== ")" && last !== "]") {
    throw new IntervalParsingFailedError("Invalid end character. Allowed characters are ')' and ']'.", interval);
  }
  if (commaDelimiter === -1 && periodDelimiter === -1) {
    throw new IntervalParsingFailedError("Invalid range delimiter. Allowed characters are ',' and '..'.", interval);
  }
  if (fromToArray.length !== 2) {
    throw new IntervalParsingFailedError("Requires a from and to value.", interval);
  }
  if (from === to) {
    throw new IntervalParsingFailedError("From cannot be the same as to", interval);
  }

  return { includeStart: first === "[", includeEnd: last === "]", from, to, reverse: from > to };
}

/**
 * Return a range of integers as specified in interval notation.
 * @see https://en.wikipedia.org/wiki/Interval_(mathematics)
 * @param {string} interval
 * @returns
 */
export function arrayFromInterval(interval: string): number[] {
  const { from, to, includeEnd, includeStart, reverse } = getIntervalInfo(interval);

  let start = includeStart ? from : reverse ? from - 1 : from + 1;
  let end = includeEnd ? to : reverse ? to + 1 : to - 1;

  const array = [];
  for (let i = start; reverse ? i >= end : i <= end; reverse ? i-- : i++) {
    array.push(i);
  }

  return array;
}
