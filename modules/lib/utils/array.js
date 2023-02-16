export function removeItem(array, item) {
  for (let i = array.length; i >= 0; i--) {
    if (array[i] === item) {
      array.splice(i, 1);
      break;
    }
  }
  return array;
}

export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array.
 * @param {Array} array
 */
export function shuffle(array) {
  const copy = array.slice();
  let iCurrent = copy.length;

  // While there are elements to shuffle.
  while (iCurrent) {
    const iSwap = Math.floor(Math.random() * iCurrent--); // Pick a remaining element.
    const tmp = array[iCurrent]; // And swap it with the current element.
    copy[iCurrent] = copy[iSwap];
    copy[iSwap] = tmp;
  }

  return array;
}

function setErrorAndType(res, error) {
  res.success = false;
  res.error = error;
  return res;
}

// (a,b)⇒{a<x<b}
// [a,b]⇒{a..b}⇒{a≤x≤b}

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
  const split = inner.split(usesCommaDelimiter ? "," : "..");

  if (!split || split.length !== 2)
    return setErrorAndType(res, "Either a start or an end character wasn't provided.");

  res.from = parseInt(split[0]);
  res.to = parseInt(split[1]);

  if (res.from > res.to) res.reverse = true;

  return res;
}

export function arrayFromInterval(interval) {
  const { success, from, to, includeEnd, includeStart, reverse } = getIntervalInfo(interval);
  if (!success) return [];

  let start = includeStart ? from : from + 1;
  let end = includeEnd ? to + 1 : to;
  let array = [];
  for (let i = start; i < end; i++) array.push(i);
  return reverse ? array.reverse() : array;
}
