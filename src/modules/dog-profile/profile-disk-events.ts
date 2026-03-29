type Listener = () => void;

const listeners = new Set<Listener>();

/** Subscribe to profile JSON / avatar file writes (e.g. refresh Home after Save on Start). */
export function subscribeProfileDiskChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyProfileDiskChanged(): void {
  for (const l of listeners) {
    l();
  }
}
