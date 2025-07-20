import type {
  DoNothing,
  RemoveValue,
  InsertConflictHandler,
  InsertNotFoundHandler,
} from 'weight-balanced-tree/update';

import KtCollection from './Collection';
import type KtRecord from './Record';

export type SetUpdateOptions<T, K> = {
  key: K;
  cmp: (key: K, treeValue: T) => number;
  isEqual?: (a: T, b: T) => boolean;
  onConflict?: (existingValue: T, key: K) => T | RemoveValue;
  onNotFound?: (key: K) => T | DoNothing;
};

export type SetUnionOptions<T> = {
  cmp?: (a: T, b: T) => number,
  combiner?: (v1: T, v2: T) => T,
};

declare class KtSet<T> extends KtCollection<T> {
  constructor(values?: Iterable<T>);

  [Symbol.iterator](): Generator<T, void, void>;
  values(): Generator<T, void, void>;
  equals(set: KtSet<T>, isEqual?: (a: T, b: T) => boolean): boolean;
  has(value: T): boolean;
  add(value: T): this;
  updateByKey<K>(options: SetUpdateOptions<T, K>): this;
  update(
    value: T,
    onConflict: InsertConflictHandler<T, T>,
    onNotFound: InsertNotFoundHandler<T, T>,
  ): this;
  replace(
    value: T,
    callback: InsertConflictHandler<T, T>,
  ): this;
  remove(value: T): this;
  minValue(): T;
  maxValue(): T;
  toArray(): Array<T>;
  toJSON(): Array<T>;
  union(set: KtSet<T>, options?: SetUnionOptions<T>): this;
  intersection(set: KtSet<T>): this;
  difference(set: KtSet<T>): this;
  symmetricDifference(set: KtSet<T>): this;
  isDisjointFrom(set: KtSet<T>): boolean;
  isSubsetOf(set: KtSet<T>): boolean;
  isSupersetOf(set: KtSet<T>): boolean;
}

export default KtSet;
