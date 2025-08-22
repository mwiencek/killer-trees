declare class KtRecord<T extends object> {
  readonly size: number;

  constructor(object?: Partial<T>);

  static define<T extends object>(defaults: T): new (object?: Partial<T>) => KtRecord<T>;

  equals<U extends object = T>(other: KtRecord<U>): boolean;
  get<K extends keyof T>(key: K): T[K];
  merge(object: Partial<T>): this;
  set<K extends keyof T>(key: K, value: T[K]): this;
  update<K extends keyof T>(
    key: K,
    updater: (existingValue: T[K]) => T[K],
  ): this;
  toJSON(): T;
  remove(key: keyof T): this;
}

export default KtRecord;
