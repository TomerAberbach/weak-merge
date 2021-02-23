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

/**
 * Returns a {@link WeakSet} that has the values of each {@link WeakSet} in
 * `weakSets`.
 *
 * The returned {@link WeakSet} acts as a one-way view of `weakSets`.
 * Modifications to the returned {@link WeakSet} do not affect the
 * {@link WeakSet}s in `weakSets`. However, modifications to any {@link WeakSet}
 * in `weakSets` do affect the returned {@link WeakSet}.
 *
 * @example
 * ```js
 * const [a, b, c, d] = [{}, {}, {}, {}]
 *
 * const weakSet1 = new WeakSet([a, b])
 * const weakSet2 = new WeakSet([c])
 *
 * const mergedWeakSet = mergeWeakSets(weakSet1, weakSet2)
 *
 * console.log([a, b, c].map(key => mergedWeakSet.has(key)).join(`, `))
 * //=> true, true, true
 *
 * mergedWeakSet.delete(a)
 * console.log(mergedWeakSet.has(a))
 * //=> false
 *
 * console.log(weakSet1.has(a))
 * //=> true
 *
 * mergedWeakSet.add(d)
 * console.log(mergedWeakSet.had(d))
 * //=> true
 *
 * console.log(weakSet1.has(d))
 * //=> false
 * ```
 */
declare function mergeWeakSets<Value extends {}>(
  ...weakSets: ReadonlyArray<WeakSet<Value>>
): WeakSet<Value>

/**
 * Returns a {@link WeakMap} that has the entries of each {@link WeakMap} in
 * `weakMaps`.
 *
 * If any two {@link WeakMap}s in `weakMaps` have an entry with the same key,
 * then the entry of the one later in `weakMaps` (i.e. at a higher index) will
 * be in the returned {@link WeakMap}.
 *
 * The returned {@link WeakMap} acts as a one-way view of `weakMaps`.
 * Modifications to the returned {@link WeakMap} do not affect the
 * {@link WeakMap}s in `weakMaps`. However, modifications to any {@link WeakMap}
 * in `weakMaps` do affect the returned {@link WeakMap}.
 *
 * @example
 * ```js
 * const [a, b, c] = [{}, {}, {}]
 *
 * const weakMap1 = new WeakMap([[a, 1], [b, 2]])
 * const weakMap2 = new WeakMap([[c, 3]])
 *
 * const mergedWeakMap = mergeWeakMaps(weakMap1, weakMap2)
 *
 * console.log([a, b, c].map(key => mergedWeakMap.get(key)).join(`, `))
 * //=> 1, 2, 3
 *
 * mergedWeakMap.delete(a)
 * console.log(mergedWeakMap.has(a))
 * //=> false
 *
 * console.log(weakMap1.has(a))
 * //=> true
 *
 * mergedWeakMap.set(a, 5)
 * console.log(mergedWeakMap.get(a))
 * //=> 5
 *
 * console.log(weakMap1.get(a))
 * //=> 1
 * ```
 */
declare function mergeWeakMaps<Key extends {}, Value>(
  ...weakMaps: ReadonlyArray<WeakMap<Key, Value>>
): WeakMap<Key, Value>
