export function formatAsJSON(
  json: string,
  opts: { indentWithTabs: boolean } = { indentWithTabs: false }
): string {
  const push = (m: string) => "\\" + p.push(m) + "\\",
    pop = (_m: any, i: number) => p[i - 1],
    tabs = (count: number) =>
      Array.from({ length: count + 1 }).join(opts.indentWithTabs ? "\t" : "  ");

  const p: string[] = [];
  let out = "",
    indent = 0;

  // Extract backslashes and strings
  json = json
    .replace(/\\./g, push)
    .replace(/(".*?"|'.*?')/g, push)
    .replace(/\s+/, "");

  // Indent and insert newlines
  for (let i = 0; i < json.length; i++) {
    const c = json.charAt(i);
    switch (c) {
      case "{":
      case "[":
        out += c + "\n" + tabs(++indent);
        break;
      case "}":
      case "]":
        out += "\n" + tabs(--indent) + c;
        break;
      case ",":
        out += ",\n" + tabs(indent);
        break;
      case ":":
        out += ": ";
        break;
      default:
        out += c;
        break;
    }
  }

  // Strip whitespace from numeric arrays and put backslashes
  // and strings back in
  out = out.replace(/\[[\d,\s]+?\]/g, (m) => m.replace(/\s/g, "")).replace(/\\(\d+)\\/g, pop);
  return out;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export function uniqueId(prefix?: string) {
  const id = Array.from({ length: 10 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join(
    ""
  );
  return prefix ? `${prefix}${id}` : id;
}

/**
 * @param str hyphenated-string
 * @returns camelCased string
 */
export function hyphenToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace("-", "");
}

export function parseJSON<T>(dataString: string): T {
  if (typeof dataString !== "string" || dataString === "") {
    return {} as T;
  }

  return JSON.parse(dataString) as T;
}
