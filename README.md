# killer-trees

A collection of immutable data structures, providing a thin wrapper around
the [weight-balanced-tree](https://www.npmjs.com/package/weight-balanced-tree)
package. These offer a more JavaScript-y, class-based API.

Gets/sets/deletes are `O(log n)` for all structures.

## List

```javascript
import List from 'killer-trees/List';

let l = new List([1, 2, 3]);
l.at(1); // 2
l = l.push(4, 5);
```

Insertions and deletions at any index are also `O(log n)`; no re-indexing
needed!

[List API](https://github.com/mwiencek/killer-trees/blob/master/types/List.d.ts).

## Map

Map keys can be of any type.

```javascript
// Import as `KtMap` to avoid conflicting with the `Map` built-in if needed.
import KtMap from 'killer-trees/Map';

let m = new KtMap([['a', 1], [{}, 2], [Symbol(), 3]]);
m.get('a'); // 1
m = m.set('a', 2);
```

[Map API](https://github.com/mwiencek/killer-trees/blob/master/types/Map.d.ts).

## Record

Records have a fixed set of properties, defined with `Record.define`.
They're stored more efficiently than maps and provide getters to read
properties easily.

```TypeScript
import Record from 'killer-trees/Record';

interface IPoint {
  x: number;
  y: number;
}

const Point = Record.define<IPoint>({x: 0, y: 0});
let p = new Point({x: 10});
p.x; // 10
p = p.set('x', 20);
```

Note: The type parameter passed to `define` should be an `interface`, not an
object type, otherwise Flow will behave weirdly if you do
`new Point({x: 'oops'})`; unknown or mistyped properties would cause the
instance type to be `empty`. A downside to this is that interfaces can't be
exact, so calling the constructor with unknown properties won't trigger an
error.

[Record API](https://github.com/mwiencek/killer-trees/blob/master/types/Record.d.ts).

## Set

Unlike the JavaScript `Set` built-in or `Immutable.Set`, `killer-trees/Set`
stores values in a defined order. The order is determined by the
`compareValues` static method, which can be overridden by subclassing
`Set`. Sets can store values of any type.

```javascript
// Import as `KtSet` to avoid conflicting with the `Set` built-in if needed.
import KtSet from 'killer-trees/Set';

new KtSet([1, {}, Symbol()]);
```

Note: `killer-trees/Set`'s default `compareValues` method will sort
most primitives (other than symbols) in a consistent order across realms and
execution environments. Objects and symbols, however, will only be sorted
consistently *within* the current realm and execution environment, and the
order is not meaningful.

[Set API](https://github.com/mwiencek/killer-trees/blob/master/types/Set.d.ts).

## Comparison with Immutable.js

### Technical differences

- `killer-trees` is based on weight-balanced trees. `Immutable.js` is based
  on hash array mapped tries. These have different performance trade-offs.
  For example, HAMTs have better lookup performance, but trees perform better
  at concatenation, splicing, and order-preserving set operations. See the
  results under [benchmark/](https://github.com/mwiencek/killer-trees/tree/master/benchmark).
- `killer-trees`'s `Set` is explicitly ordered, and the value comparison
  logic can be customized by subclassing and overriding the `compareValues`
  method.

### Superficial differences

- While TypeScript definitions are also provided and maintained, Flow support
  is prioritized here.
- `killer-trees` provides a class-based API (`new List()`), whereas
  `Immutable.js` uses factory functions (`Immutable.List()`).
- `killer-trees` is a lightweight wrapper around `weight-balanced-tree`.
  `Immutable.js` is a larger and more feature-rich library.

## License

MIT
