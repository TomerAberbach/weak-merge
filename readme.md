<h1 align="center">
  weak-merge
</h1>

<div align="center">
  <a href="https://npmjs.org/package/weak-merge">
    <img src="https://badgen.now.sh/npm/v/weak-merge" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/weak-merge/actions">
    <img src="https://github.com/TomerAberbach/weak-merge/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://bundlephobia.com/result?p=weak-merge">
    <img src="https://badgen.net/bundlephobia/minzip/weak-merge" alt="minzip size" />
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
import { mergeWeakSets, mergeWeakMaps } from 'weak-merge'

const [a, b, c, d] = [{}, {}, {}, {}]

const weakSet1 = new WeakSet([a, b])
const weakSet2 = new WeakSet([c])

const mergedWeakSet = mergeWeakSets(weakSet1, weakSet2)

console.log([a, b, c].map(key => mergedWeakSet.has(key)).join(`, `))
//=> true, true, true

mergedWeakSet.delete(a)
console.log(mergedWeakSet.has(a))
//=> false

console.log(weakSet1.has(a))
//=> true

mergedWeakSet.add(d)
console.log(mergedWeakSet.had(d))
//=> true

console.log(weakSet1.has(d))
//=> false

const weakMap1 = new WeakMap([
  [a, 1],
  [b, 2]
])
const weakMap2 = new WeakMap([[c, 3]])

const mergedWeakMap = mergeWeakMaps(weakMap1, weakMap2)

console.log([a, b, c].map(key => mergedWeakMap.get(key)).join(`, `))
//=> 1, 2, 3

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

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/weak-merge/issues/new).

For pull requests, please read the
[contributing guidelines](https://github.com/TomerAberbach/lfi/blob/master/contributing.md).

## License

[Apache 2.0](https://github.com/TomerAberbach/weak-merge/blob/main/license)

This is not an official Google product.
