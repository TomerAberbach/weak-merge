import { fc, test } from '@fast-check/vitest'
import isWeakMap from 'is-weakmap'
import { expect } from 'vitest'
import { mergeWeakMaps } from './index.ts'

const entryArb = fc.tuple(fc.object(), fc.anything())
const arraysOfEntriesArb = fc.array(fc.array(entryArb))

test.prop([arraysOfEntriesArb])(`mergeWeakMaps returns a WeakMap`, arrays => {
  const weakMap = mergeWeakMaps(...arrays.map(entries => new WeakMap(entries)))

  expect(isWeakMap(weakMap)).toBeTrue()
})

test.prop([arraysOfEntriesArb, fc.array(entryArb, { minLength: 1 })])(
  `mergeWeakMaps returns a WeakMap with a set method that returns the same WeakMap`,
  (arrays, entries) => {
    const weakMap = mergeWeakMaps(
      ...arrays.map(entries => new WeakMap(entries)),
    )

    for (const [key, value] of entries) {
      expect(weakMap.set(key, value)).toBe(weakMap)
    }
  },
)

test.prop(
  [
    arraysOfEntriesArb
      .filter(arrays => arrays.some(entries => entries.length > 0))
      .chain(arrays => {
        const keyArb = fc.oneof(
          fc.object(),
          fc.constantFrom(
            ...arrays.flatMap(entries => entries.map(([key]) => key)),
          ),
        )

        return fc.tuple(
          fc.constant(arrays),
          fc.commands(
            [
              keyArb.map(key => ({
                check: () => true,
                run: (
                  model: WeakMap<WeakKey, unknown>,
                  real: WeakMap<WeakKey, unknown>,
                ) => expect(real.delete(key)).toBe(model.delete(key)),
                toString: () => `delete(${fc.stringify(key)})`,
              })),
              keyArb.map(key => ({
                check: () => true,
                run: (
                  model: WeakMap<WeakKey, unknown>,
                  real: WeakMap<WeakKey, unknown>,
                ) => expect(real.get(key)).toBe(model.get(key)),
                toString: () => `get(${fc.stringify(key)})`,
              })),
              keyArb.map(key => ({
                check: () => true,
                run: (
                  model: WeakMap<WeakKey, unknown>,
                  real: WeakMap<WeakKey, unknown>,
                ) => expect(real.has(key)).toBe(model.has(key)),
                toString: () => `has(${fc.stringify(key)})`,
              })),
              fc
                .oneof(entryArb, fc.tuple(keyArb, fc.anything()))
                .map(([key, value]) => ({
                  check: () => true,
                  run: (
                    model: WeakMap<WeakKey, unknown>,
                    real: WeakMap<WeakKey, unknown>,
                  ) => {
                    model.set(key, value)
                    real.set(key, value)
                  },
                  toString: () =>
                    `set(${fc.stringify(key)}, ${fc.stringify(value)})`,
                })),
            ],
            { maxCommands: 1000 },
          ),
        )
      }),
  ],
  { numRuns: 500 },
)(
  `mergeWeakMaps returns a WeakMap that behaves like a non-merged WeakMap containing the same values as the merged WeakMaps`,
  ([arrays, commands]) => {
    fc.modelRun(
      () => ({
        model: new WeakMap(arrays.flat()),
        real: mergeWeakMaps(...arrays.map(entries => new WeakMap(entries))),
      }),
      commands,
    )
  },
)

test(`mergeWeakMaps concrete example`, () => {
  const [a, b, c, d] = [[], {}, new Set(), new Map()]

  const weakMap1 = new WeakMap<WeakKey, unknown>([
    [a, 1],
    [b, 2],
  ])
  const weakMap2 = new WeakMap<WeakKey, unknown>([[c, 3]])

  const mergedWeakMap = mergeWeakMaps(weakMap1, weakMap2)

  expect(mergedWeakMap.has(a)).toBeTrue()
  expect(mergedWeakMap.has(b)).toBeTrue()
  expect(mergedWeakMap.has(c)).toBeTrue()

  mergedWeakMap.delete(a)

  expect(weakMap1.has(a)).toBeTrue()
  expect(mergedWeakMap.has(a)).toBeFalse()

  mergedWeakMap.set(d, 5)

  expect(weakMap1.has(d)).toBeFalse()
  expect(weakMap2.has(d)).toBeFalse()
  expect(mergedWeakMap.get(d)).toBe(5)
})
