type Entry = { count: number; windowStart: number };

const windowMs = 60_000;
const maxRequestsPerWindow = 8;
const memoryStore = new Map<string, Entry>();

export function isRateLimited(key: string) {
  const now = Date.now();
  const previous = memoryStore.get(key);
  if (!previous || now - previous.windowStart > windowMs) {
    memoryStore.set(key, { count: 1, windowStart: now });
    return false;
  }

  if (previous.count >= maxRequestsPerWindow) {
    return true;
  }

  previous.count += 1;
  memoryStore.set(key, previous);
  return false;
}
