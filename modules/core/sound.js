import { VendorAttributes } from "../lib/utils/vendor-attributes.js";
import { constrain, map } from "../lib/utils/number.js";
import { removeItem } from "../lib/utils/array.js";
import { UserAgent } from "../lib/utils/user-agent.js";
import { Guard } from "../lib/sanity/guard.js";

import { Timer } from "./timer.js";
import { EventSystem } from "./event-system.js";
import { Register } from "./register.js";
import { noop } from "../lib/utils/func.js";
import { GameEvents } from "./events.js";

const SoundFormats = {
  M4A: { ext: "m4a", mime: "audio/mp4; codecs=mp4a.40.2" },
  MP3: { ext: "mp3", mime: "audio/mpeg" },
  OGG: { ext: "ogg", mime: "audio/ogg; codecs=vorbis" },
  WEBM: { ext: "webm", mime: "audio/webm; codecs=vorbis" },
  CAF: { ext: "caf", mime: "audio/x-caf" },
};

export class SoundManager {
  /** @type {{[x: string]: HTMLAudioElement[] | WebAudioSource}} */
  #clips = {};
  /** @type {UserAgent} */
  #userAgent;
  volume = 1;

  static isSoundEnabled = !!window.Audio;
  static useWebAudio = !!window.AudioContext;

  constructor() {
    VendorAttributes.normalize(window, "AudioContext");
    this.#userAgent = UserAgent.info;

    if (!SoundManager.isSoundEnabled) return;
    // Probe sound formats and determine the file extension to load
    const probe = new Audio();
    // Disable sound if no compatible format found
    SoundManager.isSoundEnabled = Object.entries(SoundFormats).some(([, { mime }]) =>
      probe.canPlayType(mime)
    );
    this.#bindEvents();
  }

  #bindEvents() {
    EventSystem.on(GameEvents.System_Ready, () => (this.ready = true));
    EventSystem.on(GameEvents.Sound_UnlockWebAudio, () => {
      if (SoundManager.isSoundEnabled && SoundManager.useWebAudio) this.unlockWebAudio();
    });
  }

  /** Initialises the WebAudio Context */
  unlockWebAudio() {
    this.audioContext = new AudioContext();
    const emptyBuffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = emptyBuffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  load(path, multiChannel, loadCallback) {
    return multiChannel && SoundManager.useWebAudio
      ? this.loadWebAudio(path, multiChannel, loadCallback) // Requested as MultiChannel and we're using WebAudio.
      : this.loadHTML5Audio(path, multiChannel, loadCallback); // HTML5 Audio - always used for Music.
  }

  loadWebAudio(path, _multiChannel, loadCallback) {
    if (this.#clips[path]) return this.#clips[path];
    loadCallback = loadCallback || (() => {});
    const audioSource = new WebAudioSource();
    this.#clips[path] = audioSource;

    const request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    request.onload = (event) => {
      this.audioContext.decodeAudioData(
        request.response,
        (buffer) => {
          audioSource.buffer = buffer;
          loadCallback(path, true, event);
        },
        (event) => loadCallback(path, false, event)
      );
    };
    request.onerror = (event) => loadCallback(path, false, event);
    request.send();

    return audioSource;
  }

  loadHTML5Audio(path, multiChannel, loadCallback) {
    // Sound file already loaded?
    if (this.#clips[path]) {
      // Loaded as WebAudio, but now requested as HTML5 Audio? Probably Music?
      if (this.#clips[path] instanceof WebAudioSource) return this.#clips[path];

      // Only loaded as single channel and now requested as multichannel?
      if (multiChannel && this.#clips[path].length < Sound.channels) {
        for (let i = this.#clips[path].length; i < Sound.channels; i++) {
          const a = new Audio(path);
          a.load();
          this.#clips[path].push(a);
        }
      }
      return this.#clips[path][0];
    }

    const clip = new Audio(path);
    if (loadCallback) {
      // The canplaythrough event is dispatched when the browser determines
      // that the sound can be played without interuption, provided the
      // download rate doesn't change.
      // Mobile browsers stubbornly refuse to preload HTML5, so we simply
      // ignore the canplaythrough event and immediately "fake" a successful
      // load callback
      if (this.#userAgent.device.mobile) setTimeout(() => loadCallback(path, true, null), 0);
      else {
        clip.addEventListener("canplaythrough", (ev) => loadCallback(path, true, ev), {
          once: true,
        });
        clip.addEventListener("error", (ev) => loadCallback(path, false, ev), false);
      }
    }
    clip.preload = "auto";
    clip.load();

    this.#clips[path] = [clip];
    if (multiChannel)
      for (let i = 1; i < Sound.channels; i++) {
        const a = new Audio(path);
        a.load();
        this.#clips[path].push(a);
      }

    return clip;
  }

  get(path) {
    // Find and return a channel that is not currently playing
    const channels = this.#clips[path];
    // Is this a WebAudio source? We only ever have one for each Sound
    if (channels && channels instanceof WebAudioSource) return channels;
    // HTML5 Audio - find a channel that's not currently
    // playing or, if all are playing, rewind one
    for (let i = 0, clip; (clip = channels[i++]); ) {
      if (!clip.paused && !clip.ended) continue;
      if (clip.ended) clip.currentTime = 0;
      return clip;
    }

    // No free channels, pause and rewind the first.
    const firstChannel = channels[0];
    firstChannel.pause();
    firstChannel.currentTime = 0;
    return firstChannel;
  }
}

export class GameAudio {
  /** @type {SoundManager} */
  soundManager;

  constructor({ soundManager }) {
    Guard.againstNull({ soundManager });
    this.soundManager = soundManager;
  }
}

export class Music extends GameAudio {
  #currentIndex = 0;
  #currentTrack = null;
  #tracks = [];
  #fadeInterval = 0;
  #fadeTimer = null;
  #loop = false;
  #namedTracks = {};
  #random = false;
  #volume = 1;

  get loop() {
    return {
      get: () => this.#loop,
      set: (value) => {
        this.#loop = value;
        for (let i in this.#tracks) this.#tracks[i].loop = this.#loop;
      },
    };
  }

  get volume() {
    return {
      get: () => this.#volume,
      set: (value) => {
        this.#volume = constrain(value, 0, 1);
        for (let i in this.#tracks) this.#tracks[i].volume = this.#volume;
      },
    };
  }

  add(music, name) {
    if (!SoundManager.isSoundEnabled) return;
    const path = music instanceof Sound ? music.path : music;
    const track = this.soundManager.load(path, false);

    // Loading music as WebAudioSource is suboptimal, should be loaded as HTML5Audio.
    // Probably happened on game start. Throw now to avoid further errors.
    if (track instanceof WebAudioSource)
      throw new Error(
        `Sound '${path}' loaded as MultiChannel but used for music. Set the multiChannel param to false when loading.`
      );

    track.loop = this.#loop;
    track.volume = this.#volume;
    track.addEventListener("ended", () => this.#endedCallback, false);
    this.#tracks.push(track);

    if (name) this.#namedTracks[name] = track;
    if (!this.#currentTrack) this.#currentTrack = track;
  }

  next() {
    if (!this.#tracks.length) return;
    this.stop();
    this.#currentIndex = this.#random
      ? Math.floor(Math.random() * this.#tracks.length)
      : (this.#currentIndex + 1) % this.#tracks.length;
    this.#currentTrack = this.#tracks[this.#currentIndex];
    this.play();
  }

  pause() {
    if (!this.#currentTrack) return;
    this.#currentTrack.pause();
  }

  stop() {
    if (!this.#currentTrack) return;
    this.#currentTrack.pause();
    this.#currentTrack.currentTime = 0;
  }

  play(name) {
    if (!SoundManager.isSoundEnabled) return;
    // If a name was provided, stop playing the current track (if any)
    // and play the named track
    if (name && this.#namedTracks[name]) {
      const newTrack = this.#namedTracks[name];
      if (newTrack !== this.#currentTrack) {
        this.stop();
        this.#currentTrack = newTrack;
      }
    } else if (!this.#currentTrack) return;
    this.#currentTrack.play();
  }

  fadeOut(time) {
    if (!this.#currentTrack) return;
    clearInterval(this.#fadeInterval);
    this.#fadeTimer = new Timer(time);
    this.#fadeInterval = setInterval(() => this.#fadeStep(), 50);
  }

  #fadeStep() {
    const v =
      constrain(map(this.#fadeTimer.delta(), -this.#fadeTimer.target, 0, 1, 0), 0, 1) *
      this.#volume;

    if (v <= 0.01) {
      this.stop();
      this.#currentTrack.volume = this.#volume;
      clearInterval(this.#fadeInterval);
    } else this.#currentTrack.volume = v;
  }

  #endedCallback() {
    if (this.#loop) this.play();
    else this.next();
  }
}

export class Sound extends GameAudio {
  static channels = 4;

  /** @type {boolean} */
  #loop;
  /** @type {boolean} */
  #multiChannel;
  /** @type {string} */
  path;
  /** @type {number} */
  volume;
  /** @type {HTMLAudioElement} */
  #currentClip;

  get loop() {
    return {
      get: () => this.#loop,
      set: (value) => {
        this.#loop = value;
        if (this.#currentClip) this.#currentClip.loop = this.#loop;
      },
    };
  }

  constructor({ path, multiChannel, soundManager }) {
    super({ soundManager });
    Guard.againstNull({ path });

    this.path = path;
    this.volume = 1;
    this.#loop = false;
    this.#multiChannel = multiChannel ?? true;

    this.load();
  }

  load(onResultCallback) {
    onResultCallback ??= noop;
    if (!SoundManager.isSoundEnabled)
      onResultCallback(this.path, true); // Probably mobile, no need to load.
    else if (!this.soundManager.ready) Register.preloadSound(this);
    else this.soundManager.load(this.path, this.#multiChannel, onResultCallback);
  }

  play() {
    if (!SoundManager.isSoundEnabled) return;
    this.#currentClip = this.soundManager.get(this.path);
    this.#currentClip.loop = this.#loop;
    this.#currentClip.volume = this.soundManager.volume * this.volume;
    this.#currentClip.play();
  }

  stop() {
    if (!this.#currentClip) return;
    this.#currentClip.pause();
    this.#currentClip.currentTime = 0;
  }
}

export class WebAudioSource extends GameAudio {
  /** @type {GainNode} */
  #gainNode;
  /** @type {AudioBufferSourceNode[]} */
  #bufferSources;
  /** @type {boolean} */
  #loop;

  /** @type {AudioBufferSourceNode} */
  buffer;

  get loop() {
    return {
      get: () => this.#loop,
      set: (value) => {
        this.#loop = value;
        for (let i = 0; i < this.#bufferSources.length; i++)
          this.#bufferSources[i].loop = this.#loop;
      },
    };
  }

  get volume() {
    return {
      get: () => this.#gainNode.gain.value,
      set: (value) => (this.#gainNode.gain.value = constrain(value, 0, 1)),
    };
  }

  constructor(opts) {
    super(opts);
    this.#bufferSources = [];
    this.#gainNode = this.soundManager.audioContext.createGain();
    this.#gainNode.connect(this.soundManager.audioContext.destination);
  }

  play() {
    if (!this.buffer) return;
    const source = this.soundManager.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.#gainNode);
    source.loop = this.#loop;
    this.#bufferSources.push(source);
    source.onended = () => removeItem(this.#bufferSources, source);
    source.start(0);
  }

  pause() {
    this.#bufferSources.forEach((src) => {
      try {
        src.stop();
      } catch (err) {
        /* empty */
      }
    });
  }
}
