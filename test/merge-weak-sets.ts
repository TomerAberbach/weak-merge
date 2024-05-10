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

import { fc, test } from 'tomer'
import isWeakSet from 'is-weakset'
import { mergeWeakSets } from '../src/merge-weak-sets.ts'

const arraysArb = fc.array(fc.array(fc.object()))

test.prop([arraysArb])(`mergeWeakSets returns a WeakSet`, arrays => {
  const weakSet = mergeWeakSets(...arrays.map(array => new WeakSet(array)))

  expect(isWeakSet(weakSet)).toBeTrue()
})

test.prop([arraysArb, fc.array(fc.object(), { minLength: 1 })])(
  `mergeWeakSets returns a WeakSet with an add method that returns the same WeakSet`,
  (arrays, array) => {
    const weakSet = mergeWeakSets(...arrays.map(array => new WeakSet(array)))

    for (const value of array) {
      expect(weakSet.add(value)).toBe(weakSet)
    }
  },
)

test.prop(
  [
    arraysArb
      .filter(arrays => arrays.some(array => array.length > 0))
      .chain(arrays => {
        const valueArb = fc.oneof(
          fc.object(),
          fc.constantFrom(...arrays.flat()),
        )

        return fc.tuple(
          fc.constant(arrays),
          fc.commands(
            [
              valueArb.map(value => ({
                check: () => true,
                run: (model: WeakSet<WeakKey>, real: WeakSet<WeakKey>) => {
                  model.add(value)
                  real.add(value)
                },
                toString: () => `add(${fc.stringify(value)})`,
              })),
              valueArb.map(value => ({
                check: () => true,
                run: (model: WeakSet<WeakKey>, real: WeakSet<WeakKey>) =>
                  expect(real.delete(value)).toBe(model.delete(value)),
                toString: () => `delete(${fc.stringify(value)})`,
              })),
              valueArb.map(value => ({
                check: () => true,
                run: (model: WeakSet<WeakKey>, real: WeakSet<WeakKey>) =>
                  expect(real.has(value)).toBe(model.has(value)),
                toString: () => `has(${fc.stringify(value)})`,
              })),
            ],
            { maxCommands: 1000 },
          ),
        )
      }),
  ],
  { numRuns: 500 },
)(
  `mergeWeakSets returns a WeakSet that behaves like a non-merged WeakSet containing the same values as the merged WeakSets`,
  ([arrays, commands]) => {
    fc.modelRun(
      () => ({
        model: new WeakSet(arrays.flat()),
        real: mergeWeakSets(...arrays.map(array => new WeakSet(array))),
      }),
      commands,
    )
  },
)

test(`mergeWeakSets concrete example`, () => {
  const [a, b, c, d] = [[], {}, new Set(), new Map()]

  const weakSet1 = new WeakSet<object>([a, b])
  const weakSet2 = new WeakSet<object>([c])

  const mergedWeakSet = mergeWeakSets(weakSet1, weakSet2)

  expect(mergedWeakSet.has(a)).toBeTrue()
  expect(mergedWeakSet.has(b)).toBeTrue()
  expect(mergedWeakSet.has(c)).toBeTrue()

  mergedWeakSet.delete(a)

  expect(weakSet1.has(a)).toBeTrue()
  expect(mergedWeakSet.has(a)).toBeFalse()

  mergedWeakSet.add(d)

  expect(weakSet1.has(d)).toBeFalse()
  expect(weakSet2.has(d)).toBeFalse()
  expect(mergedWeakSet.has(d)).toBeTrue()
})
