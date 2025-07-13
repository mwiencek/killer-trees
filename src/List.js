// @flow strict

import {
  at,
  empty,
  equals,
  filter,
  fromDistinctAscArray,
  iterate,
  join,
  join2,
  map,
  setIndex,
  slice,
  splice,
  splitFirst,
  splitLast,
  toArray,
  /*:: type ImmutableTree, */
} from 'weight-balanced-tree';
/*::
*/

import KtCollection from './Collection.js';

export default class KtList/*:: <T> */ extends KtCollection/*:: <T> */ {

  constructor(values/*: Iterable<T> */ = []) {
    super();
    let valuesArray = values;
    if (Array.isArray(valuesArray)) {
      this._tree = fromDistinctAscArray(valuesArray);
    } else {
      let tree/*: ImmutableTree<T> */ = empty;
      for (const value of values) {
        tree = join(tree, value, empty);
      }
      this._tree = tree;
    }
  }

  /*::
  @@iterator(): Generator<T, void, void> {
    return iterate(this._tree);
  }
  */

  // $FlowIssue[unsupported-syntax]
  [Symbol.iterator]()/*: Generator<T, void, void> */ {
    return iterate(this._tree);
  }

  *enumerate()/*: Generator<[number, T], void, void> */ {
    let i = 0;
    for (const value of iterate(this._tree)) {
      yield [i++, value];
    }
  }

  at/*:: <D = T> */(index/*: number */, defaultValue/*: D */)/*: T | D */ {
    return at(this._tree, index, defaultValue);
  }

  concat(list/*: KtList<T> */)/*: this */ {
    return this._newIfChanged(join2(this._tree, list._tree));
  }

  equals/*:: <U = T> */(
    list/*: KtList<U> */,
    // $FlowIssue[method-unbinding]
    isEqual/*:: ?: (a: T, b: U) => boolean */ = Object.is,
  )/*: boolean */ {
    return equals(this._tree, list._tree, isEqual);
  }

  filter(predicate/*: (value: T) => boolean */)/*: this */ {
    return this._newIfChanged(filter(this._tree, predicate));
  }

  map/*:: <U> */(mapper/*: (value: T) => U */)/*: KtList<U> */ {
    // $FlowIgnore[incompatible-return]
    return this.constructor._new(map(this._tree, mapper));
  }

  pop()/*: {+list: this, +value: T | void} */ {
    if (this._tree.size === 0) {
      return {list: this, value: undefined};
    }
    const {tree: items, value} = splitLast(this._tree);
    return {list: this._newIfChanged(items), value};
  }

  push(...values/*: $ReadOnlyArray<T> */)/*: this */ {
    let items = this._tree;
    if (values.length === 1) {
      items = join(items, values[0], empty);
    } else {
      items = join2(items, fromDistinctAscArray(values));
    }
    return this._newIfChanged(items);
  }

  set(index/*: number */, value/*: T */)/*: this */ {
    return this._newIfChanged(setIndex(this._tree, index, value));
  }

  shift()/*: {+list: this, +value: T | void} */ {
    if (this._tree.size === 0) {
      return {list: this, value: undefined};
    }
    const {tree: items, value} = splitFirst(this._tree);
    return {list: this._newIfChanged(items), value};
  }

  slice(start/*:: ?: number */, end/*:: ?: number */)/*: this */ {
    return this._newIfChanged(slice(this._tree, start, end));
  }

  splice(
    start/*: number */,
    deleteCount/*: number */,
    ...values/*: $ReadOnlyArray<T> */
  )/*: {+list: this, +deleted: this} */ {
    const {tree: items, deleted} = splice(
      this._tree,
      start,
      deleteCount,
      fromDistinctAscArray(values),
    );
    return {
      list: this._newIfChanged(items),
      deleted: this.constructor._new(deleted),
    };
  }

  toArray()/*: Array<T> */ {
    return toArray(this._tree);
  }

  toJSON()/*: Array<T> */ {
    return this.toArray();
  }

  unshift(...values/*: $ReadOnlyArray<T> */)/*: this */ {
    return this._newIfChanged(join2(fromDistinctAscArray(values), this._tree));
  }

  remove(index/*: number */)/*: this */ {
    return this._newIfChanged(splice(this._tree, index, 1, empty).tree);
  }
}
