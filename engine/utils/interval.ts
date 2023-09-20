import { safeParseInt } from "./maths/number.js";

type ParseResult = {
  success: boolean;
  error?: string;
  from: number;
  to: number;
  includeEnd: boolean;
  includeStart: boolean;
  reverse: boolean;
};

function setErrorAndType(result: ParseResult, error: string): ParseResult {
  result.success = false;
  result.error = error;
  return result;
}

function getIntervalInfo(interval: string): ParseResult {
  interval = interval.trim();
  const first = interval[0];
  const last = interval[interval.length - 1];
  const result: ParseResult = {
    from: 0,
    to: 0,
    includeStart: false,
    includeEnd: false,
    reverse: false,
    success: true,
    error: "",
  };

  if (first === "(") result.includeStart = false;
  else if (first === "[") result.includeStart = true;
  else return setErrorAndType(result, "Invalid start character. Allowed characters are '(' and '['.");

  if (last === ")") result.includeEnd = false;
  else if (last === "]") result.includeEnd = true;
  else return setErrorAndType(result, "Invalid end character. Allowed characters are ')' and ']'.");

  const usesCommaDelimiter = interval.indexOf(",") !== -1;
  if (!usesCommaDelimiter && interval.indexOf("..") === -1)
    return setErrorAndType(result, "Invalid delimeter. Allowed characters are ',' and '..'.");

  const range = interval.slice(1, interval.length - 1);
  const fromToArray = range.split(usesCommaDelimiter ? "," : "..");

  if (fromToArray.length !== 2)
    return setErrorAndType(result, "Wrong number of arguments provided. Interval requires a from and to value.");

  result.from = safeParseInt(fromToArray[0]);
  result.to = safeParseInt(fromToArray[1]);

  if (result.from > result.to) result.reverse = true;

  return result;
}

/**
 * Return a range of integers as specified in interval notation.
 * @see https://en.wikipedia.org/wiki/Interval_(mathematics)
 * @param {string} interval
 * @returns
 */
export function arrayFromInterval(interval: string): number[] {
  const { success, error, from, to, includeEnd, includeStart, reverse } = getIntervalInfo(interval);
  if (!success) {
    console.warn(error);
    return [];
  }

  let start = includeStart ? from : from + 1;
  let end = includeEnd ? to + 1 : to;
  const array = [];

  if (reverse) for (let i = start; i > end; i--) array.push(i);
  else for (let i = start; i < end; i++) array.push(i);

  return array;
}
