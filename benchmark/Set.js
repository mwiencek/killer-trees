import {Bench} from 'tinybench';
import * as Immutable from 'immutable';

import KtSet from '../src/Set.js';
import {EXOTIC_VALUES} from '../test/constants.js';
import shuffle from '../test/shuffle.js';

import {runSuites} from './utility.js';

function buildKtSet(data) {
  return new KtSet(data);
}

function buildImmutableJsSet(data) {
  return Immutable.Set(data);
}

function buildJsSet(data) {
  return new Set(data);
}

const prebuiltKtSet = buildKtSet(EXOTIC_VALUES);
const prebuiltImmutableSet = buildImmutableJsSet(EXOTIC_VALUES);
const prebuiltJsSet = buildJsSet(EXOTIC_VALUES);

const exoticValuesSubsets = [];
for (let i = 0; i < 32; i++) {
  const shuffledValues = EXOTIC_VALUES.slice();
  shuffle(shuffledValues);
  const subsetSize = Math.floor(Math.random() * shuffledValues.length);
  const subsetStart = Math.floor(Math.random() * (shuffledValues.length - subsetSize));
  exoticValuesSubsets.push(shuffledValues.slice(subsetStart, subsetStart + subsetSize));
}

const prebuiltKtSubsets = exoticValuesSubsets.map(buildKtSet);
const prebuiltImmutableSubsets = exoticValuesSubsets.map(buildImmutableJsSet);
const prebuiltJsSubsets = exoticValuesSubsets.map(buildJsSet);

function runMethodOnSubsets(prebuiltSubsets, methodParam) {
  let method = methodParam;
  if (typeof methodParam === 'string') {
    method = (a, b) => a[methodParam](b);
  }
  for (let i = 0; i < prebuiltSubsets.length; i++) {
    for (let j = 0; j < prebuiltSubsets.length; j++) {
      method(prebuiltSubsets[i], prebuiltSubsets[j]);
    }
  }
}

const createSuite = new Bench({name: 'Set create'})
  .add('KtSet (constructor)', function () {
    buildKtSet(EXOTIC_VALUES);
  })
  .add('Immutable.Set (constructor)', function () {
    buildImmutableJsSet(EXOTIC_VALUES);
  })
  .add('JavaScript Set (constructor)', function () {
    buildJsSet(EXOTIC_VALUES);
  });

const hasSuite = new Bench({name: 'Set has'})
  .add('KtSet (has)', function () {
    for (const value of EXOTIC_VALUES) {
      prebuiltKtSet.has(value);
    }
  })
  .add('Immutable.Set (has)', function () {
    for (const value of EXOTIC_VALUES) {
      prebuiltImmutableSet.has(value);
    }
  })
  .add('JavaScript Set (has)', function () {
    for (const value of EXOTIC_VALUES) {
      prebuiltJsSet.has(value);
    }
  });

const addSuite = new Bench({name: 'Set add'})
  .add('KtSet (add)', function () {
    let set = prebuiltKtSet;
    for (const value of EXOTIC_VALUES) {
      set = set.add(value);
    }
  })
  .add('Immutable.Set (add)', function () {
    let set = prebuiltImmutableSet;
    for (const value of EXOTIC_VALUES) {
      set = set.add(value);
    }
  })
  .add('JavaScript Set (add)', function () {
    let set = prebuiltJsSet;
    for (const value of EXOTIC_VALUES) {
      set = new Set(set);
      set.add(value);
    }
  });

const removeSuite = new Bench({name: 'Set remove'})
  .add('KtSet (remove)', function () {
    let set = prebuiltKtSet;
    for (const value of EXOTIC_VALUES) {
      set = set.remove(value);
    }
  })
  .add('Immutable.Set (delete)', function () {
    let set = prebuiltImmutableSet;
    for (const value of EXOTIC_VALUES) {
      set = set.delete(value);
    }
  })
  .add('JavaScript Set (delete)', function () {
    let set = prebuiltJsSet;
    for (const value of EXOTIC_VALUES) {
      set = new Set(set);
      set.delete(value);
    }
  });

const unionSuite = new Bench({name: 'Set union'})
  .add('KtSet (union)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'union');
  })
  .add('Immutable.Set (union)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, 'union');
  })
  .add('JavaScript Set (union)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'union');
  });

const intersectionSuite = new Bench({name: 'Set intersection'})
  .add('KtSet (intersection)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'intersection');
  })
  .add('Immutable.Set (intersect)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, 'intersect');
  })
  .add('JavaScript Set (intersection)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'intersection');
  });

const differenceSuite = new Bench({name: 'Set difference'})
  .add('KtSet (difference)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'difference');
  })
  .add('Immutable.Set (subtract)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, 'subtract');
  })
  .add('JavaScript Set (difference)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'difference');
  });

const symmetricDifferenceSuite = new Bench({name: 'Set symmetric difference'})
  .add('KtSet (symmetricDifference)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'symmetricDifference');
  })
  .add('Immutable.Set (subtract, union)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, (a, b) => {
      a.subtract(b).union(b.subtract(a));
    });
  })
  .add('JavaScript Set (symmetricDifference)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'symmetricDifference');
  });

const isSubsetOfSuite = new Bench({name: 'Set subset check'})
  .add('KtSet (isSubsetOf)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'isSubsetOf');
  })
  .add('Immutable.Set (isSubset)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, 'isSubset');
  })
  .add('JavaScript Set (isSubsetOf)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'isSubsetOf');
  });

const isSupersetOfSuite = new Bench({name: 'Set superset check'})
  .add('KtSet (isSupersetOf)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'isSupersetOf');
  })
  .add('Immutable.Set (isSuperset)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, 'isSuperset');
  })
  .add('JavaScript Set (isSupersetOf)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'isSupersetOf');
  });

const isDisjointFromSuite = new Bench({name: 'Set disjoint check'})
  .add('KtSet (isDisjointFrom)', function () {
    runMethodOnSubsets(prebuiltKtSubsets, 'isDisjointFrom');
  })
  .add('Immutable.Set (intersect.isEmpty)', function () {
    runMethodOnSubsets(prebuiltImmutableSubsets, (a, b) => a.intersect(b).isEmpty());
  })
  .add('JavaScript Set (isDisjointFrom)', function () {
    runMethodOnSubsets(prebuiltJsSubsets, 'isDisjointFrom');
  });

runSuites([
  createSuite,
  hasSuite,
  addSuite,
  removeSuite,
  unionSuite,
  intersectionSuite,
  differenceSuite,
  symmetricDifferenceSuite,
  isSubsetOfSuite,
  isSupersetOfSuite,
  isDisjointFromSuite,
]);
