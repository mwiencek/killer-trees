// @flow strict

import {
  difference,
  empty,
  equals,
  exists,
  intersection,
  isDisjointFrom,
  isSubsetOf,
  isSupersetOf,
  iterate,
  maxValue,
  minValue,
  remove,
  symmetricDifference,
  toArray,
  union,
  update,
  /*:: type ImmutableTree, */
} from 'weight-balanced-tree';
import {
  REMOVE_VALUE,
  onConflictKeepTreeValue,
  onNotFoundDoNothing,
  onNotFoundUseGivenValue,
  /*::
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
export type SetUpdateOptions<T, K> = {
  +key: K,
  +cmp: (key: K, treeValue: T) => number,
  +isEqual?: (a: T, b: T) => boolean,
  +onConflict?: InsertConflictHandler<T, K>,
  +onNotFound?: InsertNotFoundHandler<T, K>,
};

export type SetUnionOptions<T> = {
  +cmp?: (a: T, b: T) => number,
  +combiner?: (v1: T, v2: T) => T,
};
*/

export default class KtSet/*:: <T> */ extends KtCollection/*:: <T> */ {

  constructor(values/*: Iterable<T> */ = []) {
    super();
    let tree/*: ImmutableTree<T> */ = empty;
    for (const value of values) {
      tree = this.constructor._add(tree, value);
    }
    this._tree = tree;
  }

  static _add(
    values/*: ImmutableTree<T> */,
    value/*: T */,
  )/*: ImmutableTree<T> */ {
    return update/*:: <T, T> */(values, {
      key: value,
      cmp: this.compareValues,
      onConflict: onConflictKeepTreeValue,
      onNotFound: onNotFoundUseGivenValue,
      // $FlowIssue[method-unbinding]
      isEqual: Object.is,
    });
  }

  static compareValues/*: (a: T, b: T) => number */ = compareValues;

  values()/*: Generator<T, void, void> */ {
    return iterate(this._tree);
  }

  /*::
  @@iterator(): Generator<T, void, void> {
    return iterate(this._tree);
  }
  */

  // $FlowIssue[unsupported-syntax]
  [Symbol.iterator]()/*: Generator<T, void, void> */ {
    return this.values();
  }

  equals(
    set/*: KtSet<T> */,
    // $FlowIssue[method-unbinding]
    isEqual/*:: ?: (a: T, b: T) => boolean */ = Object.is,
  )/*: boolean */ {
    return equals(this._tree, set._tree, isEqual);
  }

  has(value/*: T */)/*: boolean */ {
    return exists(
      this._tree,
      value,
      this.constructor.compareValues,
    );
  }

  minValue()/*: T */ {
    return minValue(this._tree);
  }

  maxValue()/*: T */ {
    return maxValue(this._tree);
  }

  add(value/*: T */)/*: this */ {
    return this._newIfChanged(this.constructor._add(this._tree, value));
  }

  update/*:: <K> */({
    key,
    cmp,
    // $FlowIssue[method-unbinding]
    isEqual = Object.is,
    onConflict = onConflictKeepTreeValue,
    onNotFound = onNotFoundDoNothing,
  }/*: SetUpdateOptions<T, K> */)/*: this */ {
    let replacement/*: {+valueToInsert: T} | null */ = null;
    let values = update/*:: <T, K> */(this._tree, {
      key,
      cmp,
      onConflict: (existingTreeValue, key) => {
        const valueToInsert = onConflict(existingTreeValue, key);
        if (valueToInsert === REMOVE_VALUE) {
          return REMOVE_VALUE;
        }
        /*:: invariant(!(valueToInsert instanceof RemoveValue)); */
        if (cmp(key, valueToInsert) !== 0) {
          replacement = {valueToInsert};
          return REMOVE_VALUE;
        }
        return valueToInsert;
      },
      onNotFound,
      isEqual,
    });
    if (replacement !== null) {
      values = this.constructor._add(values, replacement.valueToInsert);
    }
    return this._newIfChanged(values);
  }

  replace(
    value/*: T */,
    callback/*: InsertConflictHandler<T, T> */,
  )/*: this */ {
    return this.update({
      key: value,
      cmp: this.constructor.compareValues,
      onConflict: callback,
      onNotFound: onNotFoundDoNothing,
    });
  }

  remove(value/*: T */)/*: this */ {
    return this._newIfChanged(
      remove(
        this._tree,
        value,
        this.constructor.compareValues,
      ),
    );
  }

  toArray()/*: Array<T> */ {
    return toArray(this._tree);
  }

  toJSON()/*: Array<T> */ {
    return this.toArray();
  }

  union(
    set/*: KtSet<T> */,
    options/*: SetUnionOptions<T> */ = {},
  )/*: this */ {
    return this._newIfChanged(
      union(
        this._tree,
        set._tree,
        options.cmp ?? this.constructor.compareValues,
        options.combiner ?? onConflictKeepTreeValue,
      ),
    );
  }

  intersection(set/*: KtSet<T> */)/*: this */ {
    return this._newIfChanged(
      intersection(
        this._tree,
        set._tree,
        this.constructor.compareValues,
      ),
    );
  }

  difference(set/*: KtSet<T> */)/*: this */ {
    return this._newIfChanged(
      difference(
        this._tree,
        set._tree,
        this.constructor.compareValues,
      ),
    );
  }

  symmetricDifference(set/*: KtSet<T> */)/*: this */ {
    return this._newIfChanged(
      symmetricDifference(
        this._tree,
        set._tree,
        this.constructor.compareValues,
      ),
    );
  }

  isSubsetOf(set/*: KtSet<T> */)/*: boolean */ {
    return isSubsetOf(
      this._tree,
      set._tree,
      this.constructor.compareValues,
    );
  }

  isSupersetOf(set/*: KtSet<T> */)/*: boolean */ {
    return isSupersetOf(
      this._tree,
      set._tree,
      this.constructor.compareValues,
    );
  }

  isDisjointFrom(set/*: KtSet<T> */)/*: boolean */ {
    return isDisjointFrom(
      this._tree,
      set._tree,
      this.constructor.compareValues,
    );
  }
}
