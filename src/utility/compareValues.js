// @flow strict

// eslint-disable-next-line no-unused-vars
export function compareUndefineds(a/*: void */, b/*: void */)/*: number */ {
  return 0;
}

// eslint-disable-next-line no-unused-vars
export function compareNulls(a/*: null */, b/*: null */)/*: number */ {
  return 0;
}

export function compareBooleans(a/*: boolean */, b/*: boolean */)/*: number */ {
  return (a ? 1 : 0) - (b ? 1 : 0);
}

export function compareNumbers(a/*: number */, b/*: number */)/*: number */ {
  if (Object.is(a, b)) {
    // Handle NaN, Infinity, -Infinity.
    return 0;
  }
  return (
    ((Number.isNaN(a) ? 1 : 0) - (Number.isNaN(b) ? 1 : 0)) ||
    (a - b)
  );
}

export function compareBigInts(a/*: bigint */, b/*: bigint */)/*: number */ {
  return a < b ? -1 : (a > b ? 1 : 0);
}

export function compareStrings(a/*: string */, b/*: string */)/*: number */ {
  const aLength = a.length;
  const bLength = b.length;
  if (aLength !== bLength) {
    return aLength - bLength;
  }
  for (let i = 0; i < aLength; i++) {
    const diff = a.charCodeAt(i) - b.charCodeAt(i);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

/*::
type CacheInterface<K> = interface {
  get(K): number | void;
  set(K, number): CacheInterface<K>;
}
*/

function createIndexComparator/*:: <K> */(
  cache/*: CacheInterface<K> */,
)/*: (a: K, b: K) => number */ {
  let nextIndex = 0;
  function getIndex(value/*: K */)/*: number */ {
    let index = cache.get(value);
    if (index === undefined) {
      index = nextIndex++;
      cache.set(value, index);
    }
    return index;
  };
  return function compare(a/*: K */, b/*: K */)/*: number */ {
    return getIndex(a) - getIndex(b);
  };
}

const compareSymbols/*: (a: symbol, b: symbol) => number */ =
  // $FlowIssue[method-unbinding]
  createIndexComparator(new Map/*:: <symbol, number> */());

const compareFunctions/*: (a: () => mixed, b: () => mixed) => number */ =
  // $FlowIssue[method-unbinding]
  createIndexComparator(new WeakMap/*:: <() => mixed, number> */());

const compareObjects/*: (a: interface {}, b: interface {}) => number */ =
  // $FlowIssue[method-unbinding]
  createIndexComparator(new WeakMap/*:: <interface {}, number> */());

const typeComparisonFunctions = new Map([
  ['undefined', compareUndefineds],
  ['null', compareNulls],
  ['boolean', compareBooleans],
  ['number', compareNumbers],
  ['bigint', compareBigInts],
  ['string', compareStrings],
  ['symbol', compareSymbols],
  ['function', compareFunctions],
  ['object', compareObjects],
]);

const typeIndex = new Map([
  ['boolean', 0],
  ['number', 1],
  ['bigint', 2],
  ['string', 3],
  ['symbol', 4],
  ['function', 5],
  ['object', 6],
  ['null', 7],
  // Per the spec, `undefined` values are always sorted last
  // by `Array.prototype.sort`.
  // https://tc39.es/ecma262/#sec-array.prototype.sort
  ['undefined', 8],
]);

export default function compareValues/*:: <T> */(a/*: T */, b/*: T */) /*: number */ {
  const aType = a === null ? 'null' : typeof a;
  const bType = b === null ? 'null' : typeof b;
  return (
    // $FlowIgnore[unsafe-arithmetic]
    (typeIndex.get(aType) - typeIndex.get(bType)) ||
    // $FlowIgnore[incompatible-call]
    // $FlowIgnore[not-a-function]
    typeComparisonFunctions.get(aType)(a, b)
  );
}
