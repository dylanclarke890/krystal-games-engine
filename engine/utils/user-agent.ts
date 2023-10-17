import { Vector2 } from "../maths/vector2.js";

export class UserAgent {
  deviceInfo: {
    iPhone: boolean;
    iPhone4: boolean;
    iPad: boolean;
    android: boolean;
    winPhone: boolean;
    iOS: boolean;
    isMobile: boolean;
    isTouchDevice: boolean;
  };
  isCachingDisabled: boolean;
  pixelRatio: number;
  screen: Vector2;
  viewport: Vector2;

  constructor() {
    const iPhone = /iPhone|iPod/i.test(navigator.userAgent);
    const iPad = /iPad/i.test(navigator.userAgent);
    const iOS = iPhone || iPad;
    const android = /android/i.test(navigator.userAgent);
    const winPhone = /Windows Phone/i.test(navigator.userAgent);
    const pixelRatio = window.devicePixelRatio || 1;

    this.deviceInfo = {
      iPhone,
      iPhone4: iPhone && pixelRatio === 2,
      iPad,
      android,
      winPhone,
      iOS,
      isMobile: iOS || android || winPhone || /mobile/i.test(navigator.userAgent),
      isTouchDevice: "ontouchstart" in window || !!window.navigator.maxTouchPoints,
    };
    this.screen = new Vector2(window.screen.availWidth * pixelRatio, window.screen.availHeight * pixelRatio);
    this.viewport = new Vector2(window.innerWidth, window.innerHeight);
    this.isCachingDisabled = /\?nocache/.test(document.location.href);
    this.pixelRatio = pixelRatio;
  }
}
