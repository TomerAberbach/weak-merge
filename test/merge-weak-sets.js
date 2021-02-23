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
import isWeakSet from 'is-weakset'
import test from 'ava'
import { mergeWeakSets } from '../src/merge-weak-sets.js'
import toCommands from './helpers/to-commands.js'

const arraysArb = fc.array(fc.array(fc.object()))

testProp(`mergeWeakSets returns a WeakSet`, [arraysArb], (t, arrays) => {
  const weakSet = mergeWeakSets(...arrays.map(array => new WeakSet(array)))

  t.true(isWeakSet(weakSet))
})

testProp(
  `mergeWeakSets throws a type error when passed a non-WeakSet`,
  [
    fc
      .array(
        fc.oneof(
          fc.array(fc.object()).map(array => new WeakSet(array)),
          fc.anything()
        )
      )
      .filter(array => array.some(value => !isWeakSet(value)))
  ],
  (t, values) => {
    t.throws(
      () => {
        mergeWeakSets(...values)
      },
      {
        instanceOf: TypeError,
        message: `mergeWeakSets expects WeakSets`
      }
    )
  }
)

testProp(
  `mergeWeakSets returns a WeakSet with an add method that returns the same WeakSet`,
  [arraysArb, fc.array(fc.object(), { minLength: 1 })],
  (t, arrays, array) => {
    const weakSet = mergeWeakSets(...arrays.map(array => new WeakSet(array)))

    for (const value of array) {
      t.is(weakSet.add(value), weakSet)
    }
  }
)

const { addCommand, deleteCommand, hasCommand } = toCommands({
  add(t, model, real, value) {
    real.add(value)
    model.add(value)
  },
  delete(t, model, real, value) {
    t.is(real.delete(value), model.delete(value))
  },
  has(t, model, real, value) {
    t.is(real.has(value), model.has(value))
  }
})

testProp(
  `mergeWeakSets returns a WeakSet that behaves like a non-merged WeakSet containing the same values as the merged WeakSets`,
  [
    arraysArb
      .filter(
        arrays => arrays.length > 0 && arrays.some(array => array.length > 0)
      )
      .chain(arrays => {
        const valueArb = fc.oneof(
          fc.object(),
          fc.constantFrom(...arrays.flat())
        )

        return fc.tuple(
          fc.constant(arrays),
          fc.commands(
            [
              valueArb.map(addCommand),
              valueArb.map(deleteCommand),
              valueArb.map(hasCommand)
            ],
            { maxCommands: 1000 }
          )
        )
      })
  ],
  (t, [arrays, commands]) => {
    fc.modelRun(
      () => ({
        model: { t, model: new WeakSet(arrays.flat()) },
        real: mergeWeakSets(...arrays.map(array => new WeakSet(array)))
      }),
      commands
    )

    // When we only have `add` commands no assertions are run
    t.pass()
  }
)

test(`mergeWeakSets concrete example`, t => {
  const [a, b, c, d] = [[], {}, new Set(), new Map()]

  const weakSet1 = new WeakSet([a, b])
  const weakSet2 = new WeakSet([c])

  const mergedWeakSet = mergeWeakSets(weakSet1, weakSet2)

  t.true(mergedWeakSet.has(a))
  t.true(mergedWeakSet.has(b))
  t.true(mergedWeakSet.has(c))

  mergedWeakSet.delete(a)

  t.true(weakSet1.has(a))
  t.false(mergedWeakSet.has(a))

  mergedWeakSet.add(d)

  t.false(weakSet1.has(d))
  t.false(weakSet2.has(d))
  t.true(mergedWeakSet.has(d))
})
