const listeners = new Map();

export function subscribe(key, firestoreQuery, callback) {
  if (listeners.has(key)) {
    listeners.get(key)();
  }
  listeners.set(key, firestoreQuery(callback));
}

export function unsubscribe(key) {
  if (listeners.has(key)) {
    listeners.get(key)();
    listeners.delete(key);
  }
}

export function unsubscribeAll() {
  listeners.forEach(unsub => unsub());
  listeners.clear();
}
