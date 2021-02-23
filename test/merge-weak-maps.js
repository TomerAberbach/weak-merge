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

import { testProp, fc } from 'ava-fast-check'
import isWeakMap from 'is-weakmap'
import test from 'ava'
import { mergeWeakMaps } from '../src/merge-weak-maps.js'
import toCommands from './helpers/to-commands.js'

const entryArb = fc.tuple(fc.object(), fc.anything())
const arraysOfEntriesArb = fc.array(fc.array(entryArb))

testProp(
  `mergeWeakMaps returns a WeakMap`,
  [arraysOfEntriesArb],
  (t, arrays) => {
    const weakMap = mergeWeakMaps(
      ...arrays.map(entries => new WeakMap(entries))
    )

    t.true(isWeakMap(weakMap))
  }
)

testProp(
  `mergeWeakMaps throws a type error when passed a non-WeakMap`,
  [
    fc
      .array(
        fc.oneof(
          fc.array(entryArb).map(entries => new WeakMap(entries)),
          fc.anything()
        )
      )
      .filter(array => array.some(value => !isWeakMap(value)))
  ],
  (t, values) => {
    t.throws(
      () => {
        mergeWeakMaps(...values)
      },
      {
        instanceOf: TypeError,
        message: `mergeWeakMaps expects WeakMaps`
      }
    )
  }
)

testProp(
  `mergeWeakMaps returns a WeakMap with a set method that returns the same WeakMap`,
  [arraysOfEntriesArb, fc.array(entryArb, { minLength: 1 })],
  (t, arrays, entries) => {
    const weakMap = mergeWeakMaps(
      ...arrays.map(entries => new WeakMap(entries))
    )

    for (const [key, value] of entries) {
      t.is(weakMap.set(key, value), weakMap)
    }
  }
)

const { deleteCommand, getCommand, hasCommand, setCommand } = toCommands({
  delete(t, model, real, key) {
    t.is(real.delete(key), model.delete(key))
  },
  get(t, model, real, key) {
    t.is(real.get(key), model.get(key))
  },
  has(t, model, real, key) {
    t.is(real.has(key), model.has(key))
  },
  set(t, model, real, [key, value]) {
    real.set(key, value)
    model.set(key, value)
  }
})

testProp(
  `mergeWeakMaps returns a WeakMap that behaves like a non-merged WeakMap containing the same values as the merged WeakMaps`,
  [
    arraysOfEntriesArb
      .filter(
        arrays =>
          arrays.length > 0 && arrays.some(entries => entries.length > 0)
      )
      .chain(arrays => {
        const keyArb = fc.oneof(
          fc.object(),
          fc.constantFrom(
            ...arrays.flatMap(entries => entries.map(([key]) => key))
          )
        )

        return fc.tuple(
          fc.constant(arrays),
          fc.commands(
            [
              keyArb.map(deleteCommand),
              keyArb.map(getCommand),
              keyArb.map(hasCommand),
              fc
                .oneof(entryArb, fc.tuple(keyArb, fc.anything()))
                .map(setCommand)
            ],
            { maxCommands: 1000 }
          )
        )
      })
  ],
  (t, [arrays, commands]) => {
    fc.modelRun(
      () => ({
        model: { t, model: new WeakMap(arrays.flat()) },
        real: mergeWeakMaps(...arrays.map(entries => new WeakMap(entries)))
      }),
      commands
    )

    // When we only have `set` commands no assertions are run
    t.pass()
  }
)

test(`mergeWeakMaps concrete example`, t => {
  const [a, b, c, d] = [[], {}, new Set(), new Map()]

  const weakMap1 = new WeakMap([
    [a, 1],
    [b, 2]
  ])
  const weakMap2 = new WeakMap([[c, 3]])

  const mergedWeakMap = mergeWeakMaps(weakMap1, weakMap2)

  t.true(mergedWeakMap.has(a))
  t.true(mergedWeakMap.has(b))
  t.true(mergedWeakMap.has(c))

  mergedWeakMap.delete(a)

  t.true(weakMap1.has(a))
  t.false(mergedWeakMap.has(a))

  mergedWeakMap.set(d, 5)

  t.false(weakMap1.has(d))
  t.false(weakMap2.has(d))
  t.is(mergedWeakMap.get(d), 5)
})
