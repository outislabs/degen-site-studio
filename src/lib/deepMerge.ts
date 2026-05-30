// Lightweight deep merge for plain objects, used to apply Copilot patches
// without wiping out sibling fields the AI didn't mention.
// - Plain objects are merged recursively.
// - Arrays and primitives from `source` replace the target value.
// - `undefined` values in source are ignored (do not wipe target).
const isPlainObject = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v) &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Array<Partial<T> | undefined | null>): T {
  const out: any = { ...(target ?? {}) };
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source)) {
      const sv = (source as any)[key];
      if (sv === undefined) continue;
      const tv = out[key];
      if (isPlainObject(sv) && isPlainObject(tv)) {
        out[key] = deepMerge(tv, sv);
      } else {
        out[key] = sv;
      }
    }
  }
  return out as T;
}