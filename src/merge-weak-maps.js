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

import isWeakMap from 'is-weakmap'

class MergedWeakMap extends WeakMap {
  constructor(weakMaps) {
    super()

    this.deletedKeys = new WeakSet()
    this.weakMaps = weakMaps.reverse()
  }

  delete(key) {
    const isDeleting = this.has(key)

    super.delete(key)
    this.deletedKeys.add(key)

    return isDeleting
  }

  get(key) {
    if (this.deletedKeys.has(key)) {
      return undefined
    }

    if (super.has(key)) {
      return super.get(key)
    }

    const index = this.weakMaps.findIndex(weakMap => weakMap.has(key))
    return index === -1 ? undefined : this.weakMaps[index].get(key)
  }

  has(key) {
    return (
      !this.deletedKeys.has(key) &&
      (super.has(key) || this.weakMaps.some(weakMap => weakMap.has(key)))
    )
  }

  set(key, value) {
    this.deletedKeys.delete(key)
    return super.set(key, value)
  }
}

export const mergeWeakMaps = (...weakMaps) => {
  for (const weakMap of weakMaps) {
    if (!isWeakMap(weakMap)) {
      throw new TypeError(`mergeWeakMaps expects WeakMaps`)
    }
  }

  return new MergedWeakMap(weakMaps)
}
