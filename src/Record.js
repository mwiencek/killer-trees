// @flow strict

import {
  at,
  equals,
  fromDistinctAscArray,
  setIndex,
  toArray,
  updateIndex,
  /*:: type ImmutableTree, */
} from 'weight-balanced-tree';

import KtCollection from './Collection.js';
import {compareStrings} from './utility/compareValues.js';

/*::
export type RecordFields<T> = T extends KtRecord<infer U> ? U : empty;
*/

const RECORD_SYMBOL = Symbol.for('KtRecord');

export default class KtRecord/*:: <+T: interface {}> */
  extends KtCollection/*:: <mixed> */ {
  /*::
  static defaults: $ReadOnly<T>;
  static defaultKeys: $ReadOnlyArray<$Keys<T>>;
  static defaultValues: ImmutableTree<$Values<T>>;
  static keyIndex: {__proto__: null, +[key: string]: number};
  */

  constructor(object/*:: ?: Partial<T> */) {
    super();
    // $FlowIgnore[invalid-computed-prop]
    if (!this.constructor[RECORD_SYMBOL]) {
      throw new Error(
        'Can only construct records created via `KtRecord.define`.',
      );
    }
    const {defaults, defaultKeys} = this.constructor;
    const valuesArray/*: Array<mixed> */ = new Array(defaultKeys.length);
    for (let index = 0; index < defaultKeys.length; index++) {
      const key = defaultKeys[index];
      valuesArray[index] = (object != null && Object.hasOwn(object, key))
          ? object[key]
          : defaults[key];
    }
    this._tree = fromDistinctAscArray(valuesArray);
  }

  static define/*:: <T: interface {}> */(
    defaults/*: Required<T> */,
  )/*: Class<KtRecord<T>> */ {
    if (this !== KtRecord) {
      throw new Error(
        'Can only define new records using the base class, `KtRecord`.',
      );
    }
    Object.freeze(defaults);

    const defaultKeys = Object.keys(defaults).sort(compareStrings);

    // $FlowIssue[invalid-extends]
    class Record extends this {
      static defaults/*: T */ = defaults;
      static defaultKeys/*: $ReadOnlyArray<$Keys<T>> */ = defaultKeys;
      static defaultValues/*: ImmutableTree<$Values<T>> */ = fromDistinctAscArray(
        new Array(defaultKeys.length),
      );
      static keyIndex/*: typeof KtRecord.keyIndex */ = Object.create(null);
    }

    for (let index = 0; index < defaultKeys.length; index++) {
      const key = defaultKeys[index];
      Record.defaultValues = setIndex(Record.defaultValues, index, defaults[key]);
      Record.keyIndex[key] = index;
    }

    Object.freeze(Record.defaultKeys);
    Object.freeze(Record.defaultValues);
    Object.freeze(Record.keyIndex);
    Object.defineProperty(Record, RECORD_SYMBOL, {value: true});

    return Record;
  }

  equals/*:: <U: interface {}> */(other/*: KtRecord<U> */)/*: boolean */ {
    return equals(this._tree, other._tree);
  }

  get/*:: <K: $Keys<T>> */(key/*: K */)/*: T[K] */ {
    const index = this.constructor.keyIndex[key];
    if (index === undefined) {
      throw new Error(`Undefined record key ${JSON.stringify(key)}.`);
    }
    // $FlowIgnore[incompatible-return]
    return at(this._tree, index);
  }

  merge(object/*: Partial<T> */)/*: this */ {
    let values = this._tree;
    for (const key in object) {
      const index = this.constructor.keyIndex[key];
      if (index === undefined) {
        continue;
      }
      values = setIndex(
        values,
        index,
        // $FlowIssue[prop-missing]
        object[key],
      );
    }
    return this._newIfChanged(values);
  }

  remove(key/*: $Keys<T> */)/*: this */ {
    return this.set(key, this.constructor.defaults[key]);
  }

  set/*:: <K: $Keys<T>> */(
    key/*: K */,
    value/*: T[K] */,
  )/*: this */ {
    const index = this.constructor.keyIndex[key];
    if (index === undefined) {
      return this;
    }
    return this._newIfChanged(setIndex(this._tree, index, value));
  }

  toJSON()/*: T */ {
    const defaults = this.constructor.defaults;
    const keyIndex = this.constructor.keyIndex;
    const values = toArray(this._tree);
    // $FlowIgnore[cannot-spread-interface]
    const object = {...defaults};
    for (const key in keyIndex) {
      object[key] = values[keyIndex[key]];
    }
    return object;
  }

  update/*:: <K: $Keys<T>> */(
    key/*: K */,
    updater/*: (existingValue: T[K]) => T[K] */,
  )/*: this */ {
    const index = this.constructor.keyIndex[key];
    if (index === undefined) {
      return this;
    }
    return this._newIfChanged(
      updateIndex(
        this._tree,
        index,
        // $FlowIgnore[incompatible-call]
        updater,
      ),
    );
  }
}
