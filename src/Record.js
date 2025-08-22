// @flow strict

import {compareStrings} from './utility/compareValues.js';

/*::
export type RecordFields<T> = T extends KtRecord<infer U> ? U : empty;
*/

const RECORD_SYMBOL = Symbol.for('KtRecord');

export default class KtRecord/*:: <+T: interface {}> */ {
  /*::
  static defaults: {__proto__: null, +[key: string]: mixed};
  static defaultKeys: $ReadOnlyArray<string>;
  static keyIndex: {__proto__: null, +[key: string]: number};

  +_values: $ReadOnlyArray<mixed>;
  */

  constructor(object/*:: ?: Partial<T> */) {
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
          // $FlowIgnore[prop-missing]
          ? object[key]
          : defaults[key];
    }
    this._values = valuesArray;
  }

  static _new(values/*: $ReadOnlyArray<mixed> */)/*: this */ {
    // $FlowIssue[not-an-object]
    const instance = Object.create(this.prototype);
    // $FlowIgnore[prop-missing]
    instance._values = values;
    // $FlowIgnore[incompatible-return]
    return instance;
  }

  static define/*:: <T: interface {}> */(
    passedDefaults/*: Required<T> */,
  )/*: Class<KtRecord<T>> */ {
    if (this !== KtRecord) {
      throw new Error(
        'Can only define new records using the base class, `KtRecord`.',
      );
    }

    const defaults/*: typeof KtRecord.defaults */ = Object.freeze(
      // $FlowIgnore[unsafe-object-assign]
      Object.assign(Object.create(null), passedDefaults),
    );

    const defaultKeys = Object.keys(defaults).sort(compareStrings);

    // $FlowIssue[invalid-extends]
    class Record extends this {
      static defaults/*: typeof KtRecord.defaults */ = defaults;
      static defaultKeys/*: $ReadOnlyArray<string> */ = defaultKeys;
      static keyIndex/*: typeof KtRecord.keyIndex */ = Object.create(null);
    }

    for (let index = 0; index < defaultKeys.length; index++) {
      const key = defaultKeys[index];
      // $FlowIgnore[cannot-write]
      Record.keyIndex[key] = index;
    }

    Object.freeze(Record.defaultKeys);
    Object.freeze(Record.keyIndex);
    Object.defineProperty(Record, RECORD_SYMBOL, {value: true});

    return Record;
  }

    // $FlowIgnore[unsafe-getters-setters]
  get size()/*: number */ {
    return this._values.length;
  }

  equals/*:: <U: interface {}> */(other/*: KtRecord<U> */)/*: boolean */ {
    if (this === other) {
      return true;
    }
    const thisValues = this._values;
    const otherValues = other._values;
    if (thisValues.length !== otherValues.length) {
      return false;
    }
    for (let index = 0; index < thisValues.length; index++) {
      if (!Object.is(thisValues[index], otherValues[index])) {
        return false;
      }
    }
    return true;
  }

  get/*:: <K: $Keys<T>> */(key/*: K */)/*: T[K] */ {
    const index = this.constructor.keyIndex[key];
    if (index === undefined) {
      throw new Error(`Undefined record key ${JSON.stringify(key)}.`);
    }
    // $FlowIgnore[incompatible-return]
    return this._values[index];
  }

  merge(object/*: Partial<T> */)/*: this */ {
    const existingValues = this._values;
    let newValues/*: Array<mixed> | null */ = null;
    for (const key in object) {
      const index = this.constructor.keyIndex[key];
      if (index === undefined) {
        continue;
      }
      // $FlowIgnore[prop-missing]
      const newValue = object[key];
      if (!Object.is(newValue, existingValues[index])) {
        if (newValues === null) {
          newValues = existingValues.slice();
        }
        newValues[index] = newValue;
      }
    }
    if (newValues === null) {
      return this;
    }
    return this.constructor._new(newValues);
  }

  set/*:: <K: $Keys<T>> */(
    key/*: K */,
    value/*: T[K] */,
  )/*: this */ {
    const index = this.constructor.keyIndex[key];
    if (index === undefined) {
      return this;
    }
    const existingValues = this._values;
    if (!Object.is(existingValues[index], value)) {
      const newValues = existingValues.slice();
      newValues[index] = value;
      return this.constructor._new(newValues);
    }
    return this;
  }

  toJSON()/*: T */ {
    const defaults = this.constructor.defaults;
    const keyIndex = this.constructor.keyIndex;
    const values = this._values;
    const object = {...defaults};
    for (const key in keyIndex) {
      object[key] = values[keyIndex[key]];
    }
    // $FlowIgnore[incompatible-return]
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
    const existingValues = this._values;
    const existingValue = existingValues[index];
    const newValue = updater(existingValue);
    if (!Object.is(existingValue, newValue)) {
      const newValues = existingValues.slice();
      newValues[index] = newValue;
      return this.constructor._new(newValues);
    }
    return this;
  }

  remove(key/*: $Keys<T> */)/*: this */ {
    return this.set(key, this.constructor.defaults[key]);
  }
}
