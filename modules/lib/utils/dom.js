/**
 * @returns {HTMLElement}
 */
export function $el(selector) {
  if (selector instanceof HTMLElement) return selector;
  return document.querySelector(selector);
}

/**
 * @returns {HTMLElement}
 */
export function $new(tagname, opts = null) {
  return document.createElement(tagname, opts);
}

export function getInnerHeight(element) {
  const computed = getComputedStyle(element),
    padding = parseInt(computed.paddingTop) + parseInt(computed.paddingBottom);
  return element.clientHeight - padding;
}

export function getInnerWidth(element) {
  const computed = getComputedStyle(element),
    padding = parseInt(computed.paddingLeft) + parseInt(computed.paddingRight);
  return element.clientWidth - padding;
}

/**
 * @param {Object} opts 
 * @param {string} opts.src The path to the script. Can be relative or absolute.
 * @param {[string]} opts.type Defaults to 'module'
 * @param {[() => void]} opts.cb Optional callback to invoke once loaded.
 */
export function loadScript({ src, type, cb } = {}) {
  const script = document.createElement("script");
  type ??= "module";
  script.type = type;
  cb ??= () => { };
  script.addEventListener("load", (e) => cb(e, src));
  script.addEventListener("error", (e) => cb(e, src));
  script.src = src;
  document.body.appendChild(script);
}

export function screenshotCanvas(canvas) {
  const image = new Image();
  image.src = canvas.toDataURL();
  document.body.appendChild(image);
}
