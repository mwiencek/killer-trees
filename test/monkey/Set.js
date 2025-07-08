import assert from 'node:assert/strict';
import test from 'node:test';

import fc from 'fast-check';

import KtSet from '../../src/Set.js';

const compareModelToReal = (model, real) => {
  assert.equal(real.size, model.size);
  for (const value of model) {
    assert.ok(real.has(value));
  }
};

class AddCmd {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `add(${JSON.stringify(this.value)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    model.set.add(this.value);
    real.set = real.set.add(this.value);
    compareModelToReal(model.set, real.set);
  }
}

class RemoveCmd {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `remove(${JSON.stringify(this.value)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    model.set.delete(this.value);
    real.set = real.set.remove(this.value);
    compareModelToReal(model.set, real.set);
  }
}

class IsSubsetOfCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `isSubsetOf(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    assert.equal(real.set.isSubsetOf(otherReal), model.set.isSubsetOf(otherModel));
  }
}

class IsSupersetOfCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `isSupersetOf(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    assert.equal(
      real.set.isSupersetOf(otherReal),
      model.set.isSupersetOf(otherModel),
    );
  }
}

class IsDisjointFromCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `isDisjointFrom(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    assert.equal(
      real.set.isDisjointFrom(otherReal),
      model.set.isDisjointFrom(otherModel),
    );
  }
}

class UnionCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `union(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    model.set = model.set.union(otherModel);
    real.set = real.set.union(otherReal);
    compareModelToReal(model.set, real.set);
  }
}

class IntersectionCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `intersection(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    model.set = model.set.intersection(otherModel);
    real.set = real.set.intersection(otherReal);
    compareModelToReal(model.set, real.set);
  }
}

class DifferenceCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `difference(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    model.set = model.set.difference(otherModel);
    real.set = real.set.difference(otherReal);
    compareModelToReal(model.set, real.set);
  }
}

class SymmetricDifferenceCmd {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return `symmetricDifference(${JSON.stringify(this.values)})`;
  }

  check() {
    return true;
  }

  run(model, real) {
    const otherModel = new Set(this.values);
    const otherReal = new KtSet(this.values);
    model.set = model.set.symmetricDifference(otherModel);
    real.set = real.set.symmetricDifference(otherReal);
    compareModelToReal(model.set, real.set);
  }
}

const valueArb = fc.oneof(
  fc.constantFrom('a', 'b', 'c', 1, 2, 3, true, false, null, undefined),
  fc.string(),
  fc.boolean(),
  fc.falsy({withBigInt: true}),
  fc.dictionary(fc.string(), fc.nat(), {maxKeys: 3}),
  fc.float(),
);

const commandArb = [
  valueArb.map(v => new AddCmd(v)),
  valueArb.map(v => new RemoveCmd(v)),
  fc.array(valueArb).map(v => new IsSubsetOfCmd(v)),
  fc.array(valueArb).map(v => new IsSupersetOfCmd(v)),
  fc.array(valueArb).map(v => new IsDisjointFromCmd(v)),
  fc.array(valueArb).map(v => new UnionCmd(v)),
  fc.array(valueArb).map(v => new IntersectionCmd(v)),
  fc.array(valueArb).map(v => new DifferenceCmd(v)),
  fc.array(valueArb).map(v => new SymmetricDifferenceCmd(v)),
];

test('KtSet', () => {
  fc.assert(
    fc.property(
      fc.commands(commandArb, {maxCommands: 5_000, size: 'max'}),
      function (cmds) {
        const initial = {
          model: {set: new Set()},
          real: {set: new KtSet()},
        };
        fc.modelRun(() => ({...initial}), cmds);
      },
    ),
    {numRuns: 10, endOnFailure: true, verbose: true},
  );
});
