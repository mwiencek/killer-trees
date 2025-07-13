declare class KtRecord<T extends object> {
  constructor(object?: Partial<T>);

  static define<T extends object>(defaults: T): new (object?: Partial<T>) => KtRecord<T> & Readonly<T>;
  static instance<T extends object>(object?: Partial<T>): KtRecord<T> & Readonly<T>;

  readonly size: number;

  equals<U extends object = T>(other: KtRecord<U>): boolean;
  get<K extends keyof T>(key: K): T[K];
  merge(object: Partial<T>): this & Readonly<T>;
  set<K extends keyof T>(key: K, value: T[K]): this & Readonly<T>;
  update<K extends keyof T>(
    key: K,
    updater: (existingValue: T[K]) => T[K],
  ): this & Readonly<T>;
  toJSON(): T;
  remove(key: keyof T): this & Readonly<T>;
}

export default KtRecord;
