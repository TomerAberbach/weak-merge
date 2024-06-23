<h1 align="center">
  weak-merge
</h1>

<div align="center">
  <a href="https://npmjs.org/package/weak-merge">
    <img src="https://badgen.net/npm/v/weak-merge" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/weak-merge/actions">
    <img src="https://github.com/TomerAberbach/weak-merge/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://unpkg.com/weak-merge/dist/index.min.js">
    <img src="https://deno.bundlejs.com/?q=weak-merge&badge" alt="gzip size" />
  </a>
  <a href="https://unpkg.com/weak-merge/dist/index.min.js">
    <img src="https://deno.bundlejs.com/?q=weak-merge&config={%22compression%22:{%22type%22:%22brotli%22}}&badge" alt="brotli size" />
  </a>
  <a href="https://github.com/sponsors/TomerAberbach">
    <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor">
  </a>
</div>

<div align="center">
  A module for merging WeakSets and WeakMaps.
</div>

## Install

```sh
$ npm i weak-merge
```

## Usage

```js
import { mergeWeakMaps, mergeWeakSets } from 'weak-merge'

const [a, b, c, d] = [{}, {}, {}, {}]

const weakSet1 = new WeakSet([a, b])
const weakSet2 = new WeakSet([c])

const mergedWeakSet = mergeWeakSets(weakSet1, weakSet2)

console.log([a, b, c].map(key => mergedWeakSet.has(key)))
//=> [ true, true, true ]

mergedWeakSet.delete(a)
console.log(mergedWeakSet.has(a))
//=> false

console.log(weakSet1.has(a))
//=> true

mergedWeakSet.add(d)
console.log(mergedWeakSet.has(d))
//=> true

console.log(weakSet1.has(d))
//=> false

const weakMap1 = new WeakMap([
  [a, 1],
  [b, 2],
])
const weakMap2 = new WeakMap([[c, 3]])

const mergedWeakMap = mergeWeakMaps(weakMap1, weakMap2)

console.log([a, b, c].map(key => mergedWeakMap.get(key)))
//=> [ 1, 2, 3 ]

mergedWeakMap.delete(a)
console.log(mergedWeakMap.has(a))
//=> false

console.log(weakMap1.has(a))
//=> true

mergedWeakMap.set(a, 5)
console.log(mergedWeakMap.get(a))
//=> 5

console.log(weakMap1.get(a))
//=> 1
```

See the
[TypeScript types](https://github.com/TomerAberbach/weak-merge/blob/main/src/index.d.ts)
for more documentation.

## Why?

Merging `WeakSet` or `WeakMap` instances is not trivial because they
[are not enumerable](https://javascript.info/weakmap-weakset).

## Performance

`WeakSet` instances returned from `mergeWeakSets` and `WeakMap` instances
returned from `mergeWeakMaps` are not as performant as native `WeakSet` and
`WeakMap` instances (due to the lack of a native way to merge or copy `WeakSet`
and `WeakMap` instances):

### `WeakSet` Time Complexity

| Operation | Native `WeakSet` | Merge of `n` native `WeakSet` instances |
| --------- | ---------------- | --------------------------------------- |
| `add`     | `O(1)`           | `O(1)`                                  |
| `delete`  | `O(1)`           | `O(1)`                                  |
| `has`     | `O(1)`           | `O(n)`                                  |

### `WeakMap` Time Complexity

| Operation | Native `WeakMap` | Merge of `n` native `WeakMap` instances |
| --------- | ---------------- | --------------------------------------- |
| `delete`  | `O(1)`           | `O(1)`                                  |
| `get`     | `O(1)`           | `O(n)`                                  |
| `has`     | `O(1)`           | `O(n)`                                  |
| `set`     | `O(1)`           | `O(1)`                                  |

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/weak-merge/issues/new).

For pull requests, please read the
[contributing guidelines](https://github.com/TomerAberbach/weak-merge/blob/main/contributing.md).

## License

[Apache License 2.0](https://github.com/TomerAberbach/weak-merge/blob/main/license)

This is not an official Google product.
