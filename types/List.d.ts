declare class KtList<T> {
  constructor(values?: Iterable<T>);

  [Symbol.iterator](): Generator<T, void, void>;
  enumerate(): Generator<[number, T], void, void>;

  readonly size: number;

  at<D = T>(index: number, defaultValue: D): T | D;
  concat(list: KtList<T>): KtList<T>;
  equals<U = T>(list: KtList<U>, isEqual?: (a: T, b: U) => boolean): boolean;
  filter(predicate: (value: T) => boolean): KtList<T>;
  map<U>(mapper: (value: T) => U): KtList<U>;
  pop(): {list: KtList<T>, value: T | undefined};
  push(...values: ReadonlyArray<T>): KtList<T>;
  set(index: number, value: T): KtList<T>;
  shift(): {list: KtList<T>, value: T | undefined};
  slice(start?: number, end?: number): KtList<T>;
  splice(
    start: number,
    deleteCount: number,
    ...values: ReadonlyArray<T>
  ): {list: KtList<T>, deleted: KtList<T>};
  toArray(): Array<T>;
  toJSON(): Array<T>;
  unshift(...values: ReadonlyArray<T>): KtList<T>;
  remove(index: number): KtList<T>;
}

export default KtList;
