import assert from 'node:assert/strict';
import test from 'node:test';

import fc from 'fast-check';

import KtList from '../../src/List.js';

const compareModelToReal = (model, real) => {
  assert.deepEqual(real.toJSON(), model);
};

class PushCmd {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `push(${this.value})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    model.push(this.value);
    real.list = real.list.push(this.value);
    compareModelToReal(model, real.list);
  }
}

class PopCmd {
  toString() {
    return `pop()`;
  }

  check(model) {
    return model.length > 0;
  }

  run(model, real) {
    const poppedModelValue = model.pop();

    const {list: realList, value: poppedRealValue} = real.list.pop();
    real.list = realList;

    assert.equal(poppedModelValue, poppedRealValue);
    compareModelToReal(model, real.list);
  }
}

class ShiftCmd {
  toString() {
    return `shift()`;
  }

  check(model) {
    return model.length > 0;
  }

  run(model, real) {
    const shiftedModelValue = model.shift();

    const {list: realList, value: shiftedRealValue} = real.list.shift();
    real.list = realList;

    assert.equal(shiftedModelValue, shiftedRealValue);
    compareModelToReal(model, real.list);
  }
}

class UnshiftCmd {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `unshift(${this.value})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    model.unshift(this.value);
    real.list = real.list.unshift(this.value);
    compareModelToReal(model, real.list);
  }
}

class SetCmd {
  constructor(index, value) {
    this.index = index;
    this.value = value;
  }

  toString() {
    return `set(${this.index}, ${this.value})`;
  }

  check(model) {
    return this.index >= 0 && this.index < model.length;
  }

  run(model, real) {
    model[this.index] = this.value;
    real.list = real.list.set(this.index, this.value);
    compareModelToReal(model, real.list);
  }
}

class SpliceCmd {
  constructor(index, removeCount, values) {
    this.index = index;
    this.removeCount = removeCount;
    this.values = values;
  }

  toString() {
    return `splice(${this.index}, ${this.removeCount}, [${this.values}])`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const deletedFromModel = model.splice(
      this.index,
      this.removeCount,
      ...this.values,
    );
    const {list: realList, deleted: deletedFromReal} = real.list.splice(
      this.index,
      this.removeCount,
      ...this.values,
    );
    real.list = realList;

    assert.deepEqual(deletedFromReal.toJSON(), deletedFromModel);
    compareModelToReal(model, real.list);
  }
}

class SliceCmd {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  toString() {
    return `slice(${this.start}, ${this.end})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const modelSliced = model.slice(this.start, this.end);
    const realSliced = real.list.slice(this.start, this.end);
    compareModelToReal(modelSliced, realSliced);
  }
}

class RemoveCmd {
  constructor(index) {
    this.index = index;
  }

  toString() {
    return `remove(${this.index})`;
  }

  check(model) {
    return this.index >= 0 && this.index < model.length;
  }

  run(model, real) {
    model.splice(this.index, 1);
    real.list = real.list.remove(this.index);
    compareModelToReal(model, real.list);
  }
}

const valueArb = fc.oneof(fc.string(), fc.boolean(), fc.integer());
const indexArb = fc.nat();
const sliceIndexArb = fc.integer();

const commandArb = [
  valueArb.map(v => new PushCmd(v)),
  fc.constant(new PopCmd()),
  fc.constant(new ShiftCmd()),
  valueArb.map(v => new UnshiftCmd(v)),
  fc.tuple(indexArb, valueArb).map(([i, v]) => new SetCmd(i, v)),
  fc.tuple(sliceIndexArb, fc.nat(), fc.array(valueArb)).map(
    ([i, r, v]) => new SpliceCmd(i, r, v),
  ),
  fc.tuple(sliceIndexArb, sliceIndexArb).map(([s, e]) => new SliceCmd(s, e)),
  indexArb.map(i => new RemoveCmd(i)),
];

test('KtList', () => {
  fc.assert(
    fc.property(
      fc.commands(commandArb, {maxCommands: 5_000, size: 'max'}),
      function (cmds) {
        const initial = {
          model: [],
          real: {list: new KtList()},
        };
        fc.modelRun(() => ({...initial}), cmds);
      },
    ),
    {numRuns: 10, endOnFailure: true, verbose: true},
  );
});
