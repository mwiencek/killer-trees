import {Bench} from 'tinybench';
import * as Immutable from 'immutable';

import KtMap from '../src/Map.js';
import {EXOTIC_VALUES} from '../test/constants.js';

import {runSuites} from './utility.js';

const mapData = [];
for (let i = 0; i < EXOTIC_VALUES.length; i++) {
  mapData.push([EXOTIC_VALUES[i], i]);
}

const mapData2 = [];
for (let i = 0; i < 1024; i++) {
  mapData2.push([String.fromCharCode(i), i]);
}

function buildKtMap(data) {
  return new KtMap(data);
}

function buildImmutableJsMap(data) {
  return Immutable.Map(data);
}

function buildJsMap(data) {
  return new Map(data);
}

const prebuiltKtMap = buildKtMap(mapData);
const prebuiltImmutableMap = buildImmutableJsMap(mapData);
const prebuiltJsMap = buildJsMap(mapData);

const prebuiltKtMap2 = buildKtMap(mapData2);
const prebuiltImmutableMap2 = buildImmutableJsMap(mapData2);
const prebuiltJsMap2 = buildJsMap(mapData2);

const createSuite = new Bench({name: 'Map create'})
  .add('KtMap (constructor)', function () {
    buildKtMap(mapData);
  })
  .add('Immutable.Map (constructor)', function () {
    buildImmutableJsMap(mapData);
  })
  .add('JavaScript Map (constructor)', function () {
    buildJsMap(mapData);
  });

const getSuite = new Bench({name: 'Map get'})
  .add('KtMap (get)', function () {
    for (const key of EXOTIC_VALUES) {
      prebuiltKtMap.get(key);
    }
  })
  .add('Immutable.Map (get)', function () {
    for (const key of EXOTIC_VALUES) {
      prebuiltImmutableMap.get(key);
    }
  })
  .add('JavaScript Map (get)', function () {
    for (const key of EXOTIC_VALUES) {
      prebuiltJsMap.get(key);
    }
  });

const setSuite = new Bench({name: 'Map set'})
  .add('KtMap (set)', function () {
    let map = prebuiltKtMap;
    for (const [key, value] of mapData) {
      map = map.set(key, value * 7);
    }
  })
  .add('Immutable.Map (set)', function () {
    let map = prebuiltImmutableMap;
    for (const [key, value] of mapData) {
      map = map.set(key, value * 7);
    }
  })
  .add('JavaScript Map (set)', function () {
    let map = prebuiltJsMap;
    for (const [key, value] of mapData) {
      map = new Map(map);
      map.set(key, value * 7);
    }
  });

const removeSuite = new Bench({name: 'Map remove'})
  .add('KtMap (remove)', function () {
    let map = prebuiltKtMap;
    for (const key of EXOTIC_VALUES) {
      map = map.remove(key);
    }
  })
  .add('Immutable.Map (delete)', function () {
    let map = prebuiltImmutableMap;
    for (const key of EXOTIC_VALUES) {
      map = map.delete(key);
    }
  })
  .add('JavaScript Map (delete)', function () {
    let map = prebuiltJsMap;
    for (const key of EXOTIC_VALUES) {
      map = new Map(map);
      map.delete(key);
    }
  });

const mergeSuite = new Bench({name: 'Map merge'})
  .add('KtMap (merge)', function () {
    prebuiltKtMap
      .merge(prebuiltKtMap2)
      .merge(prebuiltKtMap);
  })
  .add('Immutable.Map (merge)', function () {
    prebuiltImmutableMap
      .merge(prebuiltImmutableMap2)
      .merge(prebuiltImmutableMap);
  })
  .add('JavaScript Map (constructor, spreads)', function () {
    new Map([
      ...prebuiltJsMap,
      ...prebuiltJsMap2,
      ...prebuiltJsMap,
    ]);
  });

runSuites([
  createSuite,
  getSuite,
  setSuite,
  removeSuite,
  mergeSuite,
]);
