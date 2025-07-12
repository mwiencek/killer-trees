// @flow strict

import {
  at,
  equals,
  fromDistinctAscArray,
  setIndex,
  toArray,
  /*:: type ImmutableTree, */
} from 'weight-balanced-tree';

import KtCollection from './Collection.js';
import {compareStrings} from './utility/compareValues.js';

/*::
export type KtRecordInstance<T: {...}> = KtRecord<T> & $ReadOnly<T>;
*/

const RECORD_SYMBOL = Symbol.for('KtRecord');

function defineGetter/*:: <T: {...}> */(
  index/*: number */
)/*: (this: KtRecord<T>) => mixed */ {
  return function (/*:: this: KtRecord<T> */)/*: mixed */ {
    return at(this._tree, index);
  };
}

export default class KtRecord/*:: <T: {...}> */
  extends KtCollection/*:: <mixed> */ {
  /*::
  static defaults: Required<T>;
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

  static define/*:: <T: {...}> */(
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
      if (Object.hasOwn(this.prototype, key)) {
        throw new Error(`Can't define the reserved property ${JSON.stringify(key)} on records.`);
      }
      Object.defineProperty(Record.prototype, key, {
        enumerable: true,
        get: defineGetter/*:: <T> */(index),
      });
      Record.defaultValues = setIndex(Record.defaultValues, index, defaults[key]);
      Record.keyIndex[key] = index;
    }

    Object.freeze(Record.defaultKeys);
    Object.freeze(Record.defaultValues);
    Object.freeze(Record.keyIndex);
    Object.defineProperty(Record, RECORD_SYMBOL, {value: true});

    return Record;
  }

  static instance(object/*:: ?: Partial<T> */)/*: KtRecordInstance<T> */ {
    // $FlowIgnore[incompatible-return]
    return new this(object);
  }

  static _getIndexForKey/*:: <T: {...}> */(key/*: $Keys<T> */)/*: number */ {
    const index = this.keyIndex[key];
    if (index === undefined) {
      throw new Error(`Undefined record key ${JSON.stringify(key)}.`);
    }
    return index;
  }

  equals/*:: <U: {...} = T> */(other/*: KtRecord<U> */)/*: boolean */ {
    return equals(this._tree, other._tree);
  }

  get/*:: <K: $Keys<T>> */(key/*: K */)/*: T[K] */ {
    // $FlowIgnore[incompatible-return]
    return at(this._tree, this.constructor._getIndexForKey(key));
  }

  merge(object/*: Partial<T> */)/*: this & $ReadOnly<T> */ {
    let values = this._tree;
    for (const key in object) {
      values = setIndex(
        values,
        // $FlowIgnore[prop-missing]
        this.constructor._getIndexForKey(key),
        // $FlowIssue[invalid-computed-prop]
        object[key],
      );
    }
    // $FlowIgnore[incompatible-return]
    return this._newIfChanged(values);
  }

  set/*:: <K: $Keys<T>> */(
    key/*: K */,
    value/*: T[K] */,
  )/*: this & $ReadOnly<T> */ {
    // $FlowIgnore[incompatible-return]
    return this._newIfChanged(
      setIndex(this._tree, this.constructor._getIndexForKey(key), value),
    );
  }

  toJSON()/*: T */ {
    const defaults = this.constructor.defaults;
    const keyIndex = this.constructor.keyIndex;
    const values = toArray(this._tree);
    const object/*: T */ = {...defaults};
    for (const key in keyIndex) {
      // $FlowIgnore[prop-missing]
      object[key] = values[keyIndex[key]];
    }
    return object;
  }

  remove(key/*: $Keys<T> */)/*: this & $ReadOnly<T> */ {
    return this.set(key, this.constructor.defaults[key]);
  }
}
