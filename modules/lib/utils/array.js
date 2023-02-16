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

// (a,b)⇒{a<x<b}
// [a,b]⇒{a..b}⇒{a≤x≤b}

function getIntervalInfo(/** @type {string}*/ interval) {
  interval = interval.trim();
  const first = interval[0];
  const last = interval[interval.length - 1];
  const res = { from: 0, to: 0, success: true, includeStart: false, includeEnd: false };

  if (first === "(") res.includeStart = false;
  else if (first === "[") res.includeStart = true;
  else {
    res.success = false;
    return res;
  }

  if (last === ")") res.includeEnd = false;
  else if (last === "]") res.includeEnd = true;
  else {
    res.success = false;
    return res;
  }

  const usesCommaDelimiter = interval.indexOf(",") !== -1;
  if (!usesCommaDelimiter && interval.indexOf("..") === -1) {
    res.success = false;
    return res;
  }

  const inner = interval.slice(1, interval.length - 1);
  const split = inner.split(usesCommaDelimiter ? "," : "..");

  if (!split || split.length !== 2) {
    res.success = false;
    return res;
  }

  res.from = parseInt(split[0]);
  res.to = parseInt(split[1]);

  if (res.from > res.to) {
    res.success = false;
    return res;
  }

  return res;
}

export function arrayFromInterval(interval) {
  const { success, from, to, includeEnd, includeStart } = getIntervalInfo(interval);
  if (!success) return [];

  let start = includeStart ? from : from + 1;
  let end = includeEnd ? to + 1 : to;
  let array = [];
  for (let i = start; i < end; i++) array.push(i);
  return array;
}
