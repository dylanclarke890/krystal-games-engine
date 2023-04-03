export function safeParseInt(value) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function constrain(num, min, max) {
  return num < min ? min : num > max ? max : num;
}