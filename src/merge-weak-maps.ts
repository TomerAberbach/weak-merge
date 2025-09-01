class MergedWeakMap<Key extends WeakKey, Value> extends WeakMap<Key, Value> {
  readonly #deletedKeys: WeakSet<WeakKey>
  readonly #weakMaps: WeakMap<Key, Value>[]

  public constructor(weakMaps: WeakMap<Key, Value>[]) {
    super()
    this.#deletedKeys = new WeakSet()
    this.#weakMaps = weakMaps.reverse()
  }

  public override delete(key: Key): boolean {
    const isDeleting = this.has(key)

    super.delete(key)
    this.#deletedKeys.add(key)

    return isDeleting
  }

  public override get(key: Key): Value | undefined {
    if (this.#deletedKeys.has(key)) {
      return undefined
    }

    if (super.has(key)) {
      return super.get(key)
    }

    const index = this.#weakMaps.findIndex(weakMap => weakMap.has(key))
    return index === -1 ? undefined : this.#weakMaps[index]!.get(key)
  }

  public override has(key: Key): boolean {
    return (
      !this.#deletedKeys.has(key) &&
      (super.has(key) || this.#weakMaps.some(weakMap => weakMap.has(key)))
    )
  }

  public override set(key: Key, value: Value): this {
    this.#deletedKeys.delete(key)
    return super.set(key, value)
  }
}

export const mergeWeakMaps = <Key extends WeakKey, Value>(
  ...weakMaps: WeakMap<Key, Value>[]
): WeakMap<Key, Value> => new MergedWeakMap(weakMaps)
