/** Resolver type - can be type T or a function that returns T to be loaded lazily */
export type Resolver<T> = T | (() => T)

export function resolver<T>(resolver: Resolver<T>): T {
  return typeof resolver === 'function' ? (resolver as () => T)() : resolver
}
