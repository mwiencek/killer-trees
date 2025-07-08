import {Bench} from 'tinybench';
import Immutable from 'immutable';

import KtRecord from '../src/Record.js';

import {runSuites} from './utility.js';

const defaults = {
  motivation: 0,
  curriculum: 0,
  notebook: 0,
  judgment: 0,
  lack: 0,
  beautiful: 0,
  prize: 0,
  snatch: 0,
  overall: 0,
  wardrobe: 0,
  debt: 0,
  south: 0,
  cycle: 0,
  breast: 0,
  understanding: 0,
  monopoly: 0,
  push: 0,
  secretion: 0,
  ton: 0,
  experience: 0,
  nominate: 0,
  nose: 0,
  instinct: 0,
  immune: 0,
  virtue: 0,
  hill: 0,
  head: 0,
  collect: 0,
  influence: 0,
  estimate: 0,
  advance: 0,
  convenience: 0,
  fibre: 0,
  torch: 0,
  genetic: 0,
  belong: 0,
  rung: 0,
  theory: 0,
  secular: 0,
  gaffe: 0,
};
const defaultKeys = Object.keys(defaults);

const ImmutableJsRecord = Immutable.Record(defaults);
const KtTestRecord = KtRecord.define(defaults);

const customProperties = {};
for (const key of defaultKeys) {
  if (key.length > 5) {
    customProperties[key] = 1;
  }
}

const prebuiltKtRecord = new KtTestRecord(customProperties);
const prebuiltImmutableJsRecord = new ImmutableJsRecord(customProperties);
const prebuiltPlainObject = {...defaults, ...customProperties};

const createSuite = new Bench({name: 'Record create'})
  .add('KtRecord (constructor)', function () {
    new KtTestRecord(customProperties);
  })
  .add('Immutable.Record (constructor)', function () {
    new ImmutableJsRecord(customProperties);
  })
  .add('plain object (spread)', function () {
    ({...defaults, ...customProperties});
  });

const getSuite = new Bench({name: 'Record get'})
  .add('KtRecord (getter)', function () {
    for (const key of defaultKeys) {
      prebuiltKtRecord[key];
    }
  })
  .add('Immutable.Record (getter)', function () {
    for (const key of defaultKeys) {
      prebuiltImmutableJsRecord[key];
    }
  })
  .add('plain object (property access)', function () {
    for (const key of defaultKeys) {
      prebuiltPlainObject[key];
    }
  });

const setSuite = new Bench({name: 'Record set'})
  .add('KtRecord (set)', function () {
    let record = prebuiltKtRecord;
    for (const key of defaultKeys) {
      record = record.set(key, 2);
    }
  })
  .add('Immutable.Record (set)', function () {
    let record = prebuiltImmutableJsRecord;
    for (const key of defaultKeys) {
      record = record.set(key, 2);
    }
  })
  .add('plain object (spread)', function () {
    let record = prebuiltPlainObject;
    for (const key of defaultKeys) {
      record = {...record, [key]: 2};
    }
  });

const removeSuite = new Bench({name: 'Record remove'})
  .add('KtRecord (remove)', function () {
    let record = prebuiltKtRecord;
    for (const key of defaultKeys) {
      record = record.remove(key);
    }
  })
  .add('Immutable.Record (delete)', function () {
    let record = prebuiltImmutableJsRecord;
    for (const key of defaultKeys) {
      record = record.delete(key);
    }
  })
  .add('plain object (spread)', function () {
    let record = prebuiltPlainObject;
    for (const key of defaultKeys) {
      record = {...record, [key]: defaults[key]};
    }
  });

runSuites([
  createSuite,
  getSuite,
  setSuite,
  removeSuite,
]);
