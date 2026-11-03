/**
 * The test runner can inherit a non-functional `localStorage` from the host
 * Node process (for example with `--localstorage-file`). The store persists to
 * localStorage, so provide a small in-memory Storage implementation instead.
 */
function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return [...values.keys()][index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, String(value))
    },
  }
}

const storage = createMemoryStorage()

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: storage,
})

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: storage,
})
