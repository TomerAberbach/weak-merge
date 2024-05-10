/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
