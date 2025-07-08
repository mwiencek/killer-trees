import assert from 'node:assert/strict';
import test from 'node:test';

import fc from 'fast-check';

import KtMap from '../../src/Map.js';

const compareModelToReal = (model, real) => {
  assert.equal(real.size, model.size);
  for (const [key, modelValue] of model) {
    const realValue = real.get(key);
    assert.equal(realValue, modelValue);
  }
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
    const modelResult = model.get(this.key);
    const realResult = real.map.get(this.key);
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
    model.set(this.key, this.value);
    real.map = real.map.set(this.key, this.value);
    compareModelToReal(model, real.map);
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
    model.delete(this.key);
    real.map = real.map.remove(this.key);
    compareModelToReal(model, real.map);
  }
}

const keyArb = fc.oneof(
  fc.string(),
  fc.boolean(),
  fc.falsy({withBigInt: true}),
  fc.dictionary(fc.string(), fc.nat(), {maxKeys: 3}),
  fc.float(),
);
const valueArb = fc.integer();
const mapEntryArb = fc.tuple(keyArb, valueArb);

const commandArb = [
  keyArb.map(key => new GetCmd(key)),
  mapEntryArb.map(([key, value]) => new SetCmd(key, value)),
  keyArb.map(key => new RemoveCmd(key)),
];

test('KtMap', () => {
  fc.assert(
    fc.property(
      fc.commands(commandArb, {maxCommands: 5_000, size: 'max'}),
      function (cmds) {
        const initial = {
          model: new Map(),
          real: {map: new KtMap()},
        };
        fc.modelRun(() => ({...initial}), cmds);
      },
    ),
    {numRuns: 10, endOnFailure: true, verbose: true},
  );
});
