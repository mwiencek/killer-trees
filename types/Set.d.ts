import KtCollection from './Collection';

export type SetUpdateOptions<T, K> = {
  key: K;
  cmp: (key: K, treeValue: T) => number;
  isEqual?: (a: T, b: T) => boolean;
  onConflict?: (existingValue: T, key: K) => T | symbol;
  onNotFound?: (key: K) => T | symbol;
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
  add(value: T): KtSet<T>;
  update<K>(options: SetUpdateOptions<T, K>): KtSet<T>;
  remove(value: T): KtSet<T>;
  minValue(): T;
  maxValue(): T;
  toArray(): Array<T>;
  toJSON(): Array<T>;
  union(set: KtSet<T>, options?: SetUnionOptions<T>): KtSet<T>;
  intersection(set: KtSet<T>): KtSet<T>;
  difference(set: KtSet<T>): KtSet<T>;
  symmetricDifference(set: KtSet<T>): KtSet<T>;
  isDisjointFrom(set: KtSet<T>): boolean;
  isSubsetOf(set: KtSet<T>): boolean;
  isSupersetOf(set: KtSet<T>): boolean;
}

export default KtSet;
