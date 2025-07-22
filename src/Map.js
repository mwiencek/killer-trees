// @flow strict

import {
  equals,
  exists,
  filter,
  find,
  fromDistinctAscArray,
  iterate,
  remove,
  union,
  update,
  /*:: type ImmutableTree, */
} from 'weight-balanced-tree';
import {
  DO_NOTHING,
  REMOVE_VALUE,
  onConflictKeepTreeValue,
  onConflictUseGivenValue,
  onNotFoundDoNothing,
  onNotFoundUseGivenValue,
  /*::
  DoNothing,
  RemoveValue,
  type InsertConflictHandler,
  type InsertNotFoundHandler,
  */
} from 'weight-balanced-tree/update';

/*::
import invariant from './invariant.js';
*/
import KtCollection from './Collection.js';
import compareValues from './utility/compareValues.js';

/*::
export type MapEntry<+K, +V> = {
  +key: K,
  +value: V,
};

export type MapUpdateOptions<K, V> = {
  +onConflict?: InsertConflictHandler<V, K>,
  +onNotFound?: InsertNotFoundHandler<V, K>,
};
*/

function areMapValuesEqual/*:: <K, V> */(
  a/*: MapEntry<K, V> */,
  b/*: MapEntry<K, V> */,
)/*: boolean */ {
  return Object.is(a.value, b.value);
}

function areMapEntriesEqual/*:: <K, V> */(
  a/*: MapEntry<K, V> */,
  b/*: MapEntry<K, V> */,
)/*: boolean */ {
  return Object.is(a.key, b.key) && areMapValuesEqual(a, b);
}

function compareMapEntries/*:: <K, V> */(
  a/*: MapEntry<K, V> */,
  b/*: MapEntry<K, V> */,
)/*: number */ {
  return compareValues(a.key, b.key);
}

function compareKeyWithMapEntry/*:: <K, V> */(
  key/*: K */,
  entry/*: MapEntry<K, V> */,
)/*: number */ {
  return compareValues(key, entry.key);
}

function mergeCombiner/*:: <K, V> */(
  entry1/*: MapEntry<K, V> */,
  entry2/*: MapEntry<K, V> */,
)/*: MapEntry<K, V> */ {
  /*
   * In `x.merge(y)`, preserve entries in `x` where the values are already
   * equal. Otherwise, values in `y` take precedence.
   */
  if (Object.is(entry1.value, entry2.value)) {
    return entry1;
  }
  return entry2;
}

function wrapUpdateOnConflict/*:: <K, V> */(
  onConflict/*: InsertConflictHandler<V, K> */,
)/*: InsertConflictHandler<MapEntry<K, V>, K> */ {
  return (existingEntry, key) => {
    const valueToInsert = onConflict(existingEntry.value, key);
    if (valueToInsert === REMOVE_VALUE) {
      return REMOVE_VALUE;
    }
    /*:: invariant(!(valueToInsert instanceof RemoveValue)); */
    if (Object.is(valueToInsert, existingEntry.value)) {
      return existingEntry;
    }
    return {key, value: valueToInsert};
  };
}

function wrapUpdateOnNotFound/*:: <K, V> */(
  onNotFound/*: InsertNotFoundHandler<V, K> */,
)/*: InsertNotFoundHandler<MapEntry<K, V>, K> */ {
  return (key) => {
    const valueToInsert = onNotFound(key);
    if (valueToInsert === DO_NOTHING) {
      return DO_NOTHING;
    }
    /*:: invariant(!(valueToInsert instanceof DoNothing)); */
    return {key, value: valueToInsert};
  };
}

export default class KtMap/*:: <K, V> */
  extends KtCollection/*:: <MapEntry<K, V>> */ {

  constructor(iterable/*: Iterable<[K, V]> */ = []) {
    super();
    const entries = [];
    for (const [key, value] of iterable) {
      entries.push({key, value});
    }
    entries.sort(compareMapEntries);
    this._tree = fromDistinctAscArray(entries);
  }

  _findEntry(key/*: K */)/*: MapEntry<K, V> | null */ {
    return find(
      this._tree,
      key,
      compareKeyWithMapEntry,
      null,
    );
  }

  *entries()/*: Generator<[K, V], void, void> */ {
    for (const entry of iterate(this._tree)) {
      yield [entry.key, entry.value];
    }
  }

  /*::
  *@@iterator(): Generator<[K, V], void, void> {
    for (const entry of iterate(this._tree)) {
      yield [entry.key, entry.value];
    }
  }
  */

  // $FlowIssue[unsupported-syntax]
  [Symbol.iterator]()/*: Generator<[K, V], void, void> */ {
    return this.entries();
  }

  *keys()/*: Generator<K, void, void> */ {
    for (const entry of iterate(this._tree)) {
      yield entry.key;
    }
  }

  *values()/*: Generator<V, void, void> */ {
    for (const entry of iterate(this._tree)) {
      yield entry.value;
    }
  }

  equals(
    map/*: KtMap<K, V> */,
    isEqual/*:: ?: (
      a: MapEntry<K, V>,
      b: MapEntry<K, V>,
    ) => boolean */ = areMapEntriesEqual,
  )/*: boolean */ {
    return equals(this._tree, map._tree, isEqual);
  }

  filter(predicate/*: (entry: MapEntry<K, V>) => boolean */)/*: this */ {
    return this._newIfChanged(filter(this._tree, predicate));
  }

  get/*:: <D> */(key/*: K */, defaultValue/*: D */)/*: V | D */ {
    const entry = this._findEntry(key);
    if (entry !== null) {
      return entry.value;
    }
    return defaultValue;
  }

  has(key/*: K */)/*: boolean */ {
    return exists(this._tree, key, compareKeyWithMapEntry);
  }

  set(key/*: K */, value/*: V */)/*: this */ {
    return this._newIfChanged(
      update(this._tree, {
        key: {key, value},
        cmp: compareMapEntries,
        onConflict: onConflictUseGivenValue,
        onNotFound: onNotFoundUseGivenValue,
        isEqual: areMapValuesEqual,
      }),
    );
  }

  merge(
    map/*: KtMap<K, V> */,
    combiner/*: (
      entry1: MapEntry<K, V>,
      entry2: MapEntry<K, V>,
    ) => MapEntry<K, V> */ = mergeCombiner,
  )/*: this */ {
    return this._newIfChanged(
      union(
        this._tree,
        map._tree,
        compareMapEntries,
        combiner,
      ),
    );
  }

  update(key/*: K */, {
    onConflict = onConflictKeepTreeValue,
    onNotFound = onNotFoundDoNothing,
  }/*: MapUpdateOptions<K, V> */)/*: this */ {
    return this._newIfChanged(
      update(this._tree, {
        key,
        cmp: compareKeyWithMapEntry,
        isEqual: areMapValuesEqual,
        onConflict: wrapUpdateOnConflict(onConflict),
        onNotFound: wrapUpdateOnNotFound(onNotFound),
      }),
    );
  }

  remove(key/*: K */)/*: this */ {
    return this._newIfChanged(
      remove(
        this._tree,
        key,
        compareKeyWithMapEntry,
      ),
    );
  }
}
