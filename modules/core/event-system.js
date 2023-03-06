class EventSystemClass {
  constructor() {
    this.listeners = new Map();
  }

  on(event, listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(listener);
  }

  off(event, listener) {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  }

  dispatch(event, data) {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    for (let i = 0; i < listeners.length; i++) listeners[i](data);
  }
}

export const EventSystem = new EventSystemClass();
