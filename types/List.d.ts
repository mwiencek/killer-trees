import KtCollection from './Collection';

declare class KtList<T> extends KtCollection<T> {
  constructor(values?: Iterable<T>);

  [Symbol.iterator](): Generator<T, void, void>;
  enumerate(): Generator<[number, T], void, void>;

  at<D = T>(index: number, defaultValue: D): T | D;
  concat(list: KtList<T>): this;
  equals<U = T>(list: KtList<U>, isEqual?: (a: T, b: U) => boolean): boolean;
  filter(predicate: (value: T) => boolean): this;
  map<U>(mapper: (value: T) => U): KtList<U>;
  pop(): {list: KtList<T>, value: T | undefined};
  push(...values: ReadonlyArray<T>): this;
  set(index: number, value: T): this;
  shift(): {list: KtList<T>, value: T | undefined};
  slice(start?: number, end?: number): this;
  splice(
    start: number,
    deleteCount: number,
    ...values: ReadonlyArray<T>
  ): {list: KtList<T>, deleted: KtList<T>};
  toArray(): Array<T>;
  toJSON(): Array<T>;
  unshift(...values: ReadonlyArray<T>): this;
  remove(index: number): this;
}

export default KtList;
