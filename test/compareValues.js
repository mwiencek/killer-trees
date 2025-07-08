// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';

import compareValues from '../src/utility/compareValues.js';

import {EXOTIC_VALUES} from './constants.js';
import shuffle from './shuffle.js';

test('compareValues', () => {
  const primitives = EXOTIC_VALUES.filter(
    value => (
      typeof value !== 'function' &&
      (typeof value !== 'object' || value === null) &&
      typeof value !== 'symbol'
    ),
  );
  const primitivesCopy = primitives.slice();
  shuffle(primitivesCopy);
  primitivesCopy.sort(compareValues);
  assert.deepEqual(primitives, primitivesCopy);

  const exoticValuesCopy1 = EXOTIC_VALUES.slice();
  shuffle(exoticValuesCopy1);
  exoticValuesCopy1.sort(compareValues);

  const exoticValuesCopy2 = EXOTIC_VALUES.slice();
  shuffle(exoticValuesCopy2);
  exoticValuesCopy2.sort(compareValues);

  assert.deepEqual(exoticValuesCopy1, exoticValuesCopy2);
});
