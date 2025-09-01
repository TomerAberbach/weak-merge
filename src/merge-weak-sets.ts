class MergedWeakSet<Value extends WeakKey> extends WeakSet<Value> {
  readonly #deletedValues: WeakSet<Value>
  readonly #weakSets: WeakSet<Value>[]

  public constructor(weakSets: WeakSet<Value>[]) {
    super()
    this.#deletedValues = new WeakSet()
    this.#weakSets = weakSets
  }

  public override add(value: Value): this {
    this.#deletedValues.delete(value)
    return super.add(value)
  }

  public override delete(value: Value): boolean {
    const isDeleting = this.has(value)

    super.delete(value)
    this.#deletedValues.add(value)

    return isDeleting
  }

  public override has(value: Value): boolean {
    return (
      !this.#deletedValues.has(value) &&
      (super.has(value) || this.#weakSets.some(weakSet => weakSet.has(value)))
    )
  }
}

export const mergeWeakSets = <Value extends WeakKey>(
  ...weakSets: WeakSet<Value>[]
): WeakSet<Value> => new MergedWeakSet(weakSets)
