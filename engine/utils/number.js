export function safeParseInt(value) {
  const parsed = parseInt(value);
  return isNaN(parsed) ? 0 : parsed;
}
