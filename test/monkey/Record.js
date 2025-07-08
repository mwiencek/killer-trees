import assert from 'node:assert/strict';
import test from 'node:test';

import fc from 'fast-check';

import KtRecord from '../../src/Record.js';

const compareModelToReal = (model, real) => {
  assert.deepEqual(real.toJSON(), model);
};

class GetCmd {
  constructor(key) {
    this.key = key;
  }

  toString() {
    return `get(${this.key})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const modelResult = model[this.key];
    const realResult = real.record[this.key];
    assert.equal(modelResult, realResult);
  }
}

class SetCmd {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }

  toString() {
    return `set(${this.key}, ${this.value})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    model[this.key] = this.value;
    real.record = real.record.set(this.key, this.value);
    compareModelToReal(model, real.record);
  }
}

class RemoveCmd {
  constructor(key) {
    this.key = key;
  }

  toString() {
    return `remove(${this.key})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    model[this.key] = recordDefaults[this.key];
    real.record = real.record.remove(this.key);
    compareModelToReal(model, real.record);
  }
}

const valueArb = fc.oneof(fc.string(), fc.boolean(), fc.integer());

const recordDefaults = {
  a: false,
  b: 'foo',
  c: 123,
};
const TestRecord = KtRecord.define(recordDefaults);

const keyArb = fc.constantFrom(...Object.keys(recordDefaults));
const recordEntryArb = fc.tuple(keyArb, valueArb);

const commandArb = [
  keyArb.map(key => new GetCmd(key)),
  recordEntryArb.map(([key, value]) => new SetCmd(key, value)),
  keyArb.map(key => new RemoveCmd(key)),
];

test('KtRecord', () => {
  fc.assert(
    fc.property(
      fc.commands(commandArb, {maxCommands: 5_000, size: 'max'}),
      function (cmds) {
        const initial = {
          model: {...recordDefaults},
          real: {record: new TestRecord()},
        };
        fc.modelRun(() => ({...initial}), cmds);
      },
    ),
    {numRuns: 10, endOnFailure: true, verbose: true},
  );
});
