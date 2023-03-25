import { safeParseInt } from "./number.js";

function setErrorAndType(res, error) {
  res.success = false;
  res.error = error;
  return res;
}

function getIntervalInfo(/** @type {string}*/ interval) {
  interval = interval.trim();
  const first = interval[0];
  const last = interval[interval.length - 1];
  const res = {
    from: 0,
    to: 0,
    includeStart: false,
    includeEnd: false,
    reverse: false,
    success: true,
    error: "",
  };

  if (first === "(") res.includeStart = false;
  else if (first === "[") res.includeStart = true;
  else return setErrorAndType(res, "Invalid start character. Allowed characters are '(' and '['.");

  if (last === ")") res.includeEnd = false;
  else if (last === "]") res.includeEnd = true;
  else return setErrorAndType(res, "Invalid end character. Allowed characters are ')' and ']'.");

  const usesCommaDelimiter = interval.indexOf(",") !== -1;
  if (!usesCommaDelimiter && interval.indexOf("..") === -1)
    return setErrorAndType(res, "Invalid delimeter. Allowed characters are ',' and '..'.");

  const inner = interval.slice(1, interval.length - 1);
  const fromToArray = inner.split(usesCommaDelimiter ? "," : "..");

  if (fromToArray.length !== 2)
    return setErrorAndType(
      res,
      "Wrong number of arguments provided. Interval requires a from and to value."
    );

  res.from = safeParseInt(fromToArray[0]);
  res.to = safeParseInt(fromToArray[1]);

  if (res.from > res.to) res.reverse = true;

  return res;
}

/**
 * Return a range of integers as specified in interval notation.
 * @see https://en.wikipedia.org/wiki/Interval_(mathematics)
 * @param {*} interval
 * @returns
 */
export function arrayFromInterval(interval) {
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
