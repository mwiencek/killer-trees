import KtCollection from './Collection';

export type MapEntry<K, V> = {
  readonly key: K,
  readonly value: V,
};

export type MapUpdateOptions<K, V> = {
  onConflict?: (existingValue: V, key: K) => V | symbol;
  onNotFound?: (key: K) => V | symbol;
};

declare class KtMap<K, V> extends KtCollection<MapEntry<K, V>> {
  constructor(iterable?: Iterable<[K, V]>);

  [Symbol.iterator](): Generator<[K, V], void, void>;
  entries(): Generator<[K, V], void, void>;
  keys(): Generator<K, void, void>;
  values(): Generator<V, void, void>;

  equals(
    map: KtMap<K, V>,
    isEqual?: (a: MapEntry<K, V>, b: MapEntry<K, V>) => boolean
  ): boolean;
  get<D>(key: K, defaultValue: D): V | D;
  has(key: K): boolean;
  set(key: K, value: V): this;
  merge(
    map: KtMap<K, V>,
    combiner?: (entry1: MapEntry<K, V>, entry2: MapEntry<K, V>) => MapEntry<K, V>
  ): this;
  update(key: K, options: MapUpdateOptions<K, V>): this;
  remove(key: K): this;
}

export default KtMap;
