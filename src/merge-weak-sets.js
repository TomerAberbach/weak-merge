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

import isWeakSet from 'is-weakset'

class MergedWeakSet extends WeakSet {
  constructor(weakSets) {
    super()

    this.deletedValues = new WeakSet()
    this.weakSets = weakSets
  }

  add(value) {
    this.deletedValues.delete(value)
    return super.add(value)
  }

  delete(value) {
    const isDeleting = this.has(value)

    super.delete(value)
    this.deletedValues.add(value)

    return isDeleting
  }

  has(value) {
    return (
      !this.deletedValues.has(value) &&
      (super.has(value) || this.weakSets.some(weakSet => weakSet.has(value)))
    )
  }
}

export const mergeWeakSets = (...weakSets) => {
  for (const weakSet of weakSets) {
    if (!isWeakSet(weakSet)) {
      throw new TypeError(`mergeWeakSets expects WeakSets`)
    }
  }

  return new MergedWeakSet(weakSets)
}
