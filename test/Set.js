// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';
import {EmptyTreeError} from 'weight-balanced-tree/errors';
import {
  REMOVE_VALUE,
  onConflictKeepTreeValue,
  onConflictRemoveValue,
  onConflictUseGivenValue,
  onNotFoundUseGivenValue,
} from 'weight-balanced-tree/update';

import {EXOTIC_VALUES} from './constants.js';
import * as kt from '../src/index.js';
import {compareStrings} from '../src/utility/compareValues.js';

const set = new kt.Set([1, 2, 3]);

test('constructor', function () {
  const emptySet = new kt.Set/*:: <number> */();
  assert.deepEqual(Array.from(emptySet), []);
  assert.deepEqual(Array.from(new kt.Set([3, 1, 2])), [1, 2, 3]);

  function* numberFactory() {
    for (let i = 1; i <= 3; i++) {
      yield i;
    }
  }

  assert.deepEqual(
    Array.from(new kt.Set(numberFactory())),
    [1, 2, 3],
  );
});

test('size', function () {
  assert.equal(new kt.Set/*:: <empty> */().size, 0);
  assert.equal(new kt.Set([1, 2, 3]).size, 3);
});

test('iterator', function () {
  assert.deepEqual(Array.from(set), [1, 2, 3]);
  assert.deepEqual(Array.from(set.values()), [1, 2, 3]);
});

test('add', function () {
  const newSet = set.add(4);
  assert.deepEqual(Array.from(newSet), [1, 2, 3, 4]);
  assert.notEqual(newSet, set);

  const sameSet = set.add(2);
  assert.equal(sameSet, set);
});

test('findAllBy', function () {
  const s1 = new kt.Set([1, 2, 3, 4, 5, 6]);
  assert.deepEqual(
    Array.from(s1.findAllBy(value => {
      if (value < 2) return 1;
      if (value > 4) return -1;
      return 0;
    })),
    [2, 3, 4],
  );
  assert.deepEqual(
    Array.from(s1.findAllBy(value => value - 4)),
    [4],
  );
  assert.deepEqual(
    Array.from(s1.findAllBy(value => value - 7)),
    [],
  );
});

test('findBy', function () {
  const s1 = new kt.Set([1, 2, 3, 4, 5, 6]);
  assert.equal(s1.findBy(value => value - 4), 4);
  assert.equal(s1.findBy(value => value - 7), undefined);
  assert.equal(s1.findBy(value => value - 7, null), null);
});

test('has', function () {
  assert.ok(set.has(1));
  assert.ok(set.has(2));
  assert.ok(set.has(3));
  assert.ok(!set.has(4));

  const weirdSet = new kt.Set(EXOTIC_VALUES);
  for (const value of EXOTIC_VALUES) {
    assert.ok(weirdSet.has(value));
  }
});

test('minValue', function () {
  assert.equal(set.minValue(), 1);

  const emptySet = new kt.Set/*:: <number> */();
  assert.throws(() => emptySet.minValue(), EmptyTreeError);
});

test('maxValue', function () {
  assert.equal(set.maxValue(), 3);

  const emptySet = new kt.Set/*:: <number> */();
  assert.throws(() => emptySet.maxValue(), EmptyTreeError);
});

test('equals', function () {
  const set1 = new kt.Set([1, 2]);
  const set2 = new kt.Set([1, 2]);
  const set3 = new kt.Set([2, 3]);
  assert.ok(set1.equals(set2));
  assert.ok(!set1.equals(set3));
});

test('remove', function () {
  const newSet = set.remove(2);
  assert.deepEqual(Array.from(newSet), [1, 3]);
  assert.notEqual(newSet, set);

  const sameSet = set.remove(4);
  assert.equal(sameSet, set);
});

test('union', function () {
  const otherSet = new kt.Set([3, 4, 5]);
  const unionSet = set.union(otherSet);
  assert.deepEqual(Array.from(unionSet), [1, 2, 3, 4, 5]);

  assert.deepEqual(
    Array.from(set.union(otherSet, {
      cmp: (a, b) => a - b,
      combiner: (v1, v2) => (v1 + v2) / 2 + 0.5,
    })),
    [1, 2, 3.5, 4, 5],
  );
});

test('intersection', function () {
  const otherSet = new kt.Set([2, 3, 4]);
  const intersectionSet = set.intersection(otherSet);
  assert.deepEqual(Array.from(intersectionSet), [2, 3]);
});

test('difference', function () {
  const otherSet = new kt.Set([2, 3, 4]);
  const differenceSet = set.difference(otherSet);
  assert.deepEqual(Array.from(differenceSet), [1]);
});

test('symmetricDifference', function () {
  const otherSet = new kt.Set([2, 3, 4]);
  const symmetricDifferenceSet = set.symmetricDifference(otherSet);
  assert.deepEqual(Array.from(symmetricDifferenceSet), [1, 4]);
});

test('isSubsetOf', function () {
  const s1 = new kt.Set([1, 2]);
  const s2 = new kt.Set([1, 2, 3]);
  assert.ok(s1.isSubsetOf(s2));
  assert.ok(!s2.isSubsetOf(s1));
  assert.ok(s1.isSubsetOf(s1));
});

test('isSupersetOf', function () {
  const s1 = new kt.Set([1, 2, 3]);
  const s2 = new kt.Set([1, 2]);
  assert.ok(s1.isSupersetOf(s2));
  assert.ok(!s2.isSupersetOf(s1));
  assert.ok(s1.isSupersetOf(s1));
});

test('isDisjointFrom', function () {
  const s1 = new kt.Set([1, 2]);
  const s2 = new kt.Set([3, 4]);
  const s3 = new kt.Set([2, 3]);
  assert.ok(s1.isDisjointFrom(s2));
  assert.ok(!s1.isDisjointFrom(s3));
  assert.ok(s1.isDisjointFrom(new kt.Set()));
});

test('toJSON', () => {
  assert.deepEqual(set.toJSON(), [1, 2, 3]);
});

test('updateByKey', function () {
  /*::
  type KV = {+key: number, +value: string};
  */
  class KVSet extends kt.Set/*:: <KV> */ {
    static compareValues = (a/*: KV */, b/*: KV */)/*: number */ => {
      return a.key - b.key;
    };
  }

  const compareKeyWithObjectKey = (
    key/*: number */,
    object/*: KV */,
  )/*: number */ => {
    return key - object.key;
  };

  const objectSet = new KVSet([
    {key: 1, value: 'a'},
    {key: 2, value: 'b'},
    {key: 3, value: 'c'},
  ]);
  // Keep existing value (custom key type)
  let objectSet2 = objectSet.updateByKey({
    key: 2,
    cmp: compareKeyWithObjectKey,
    onConflict: onConflictKeepTreeValue,
  });
  assert.equal(objectSet2, objectSet);

  // Keep existing value (custom key type, custom isEqual)
  objectSet2 = objectSet.updateByKey({
    key: 2,
    cmp: compareKeyWithObjectKey,
    isEqual: (a, b) => a.value === b.value,
    onConflict: () => ({key: 2, value: 'b'}),
  });
  assert.equal(objectSet2, objectSet);

  // Update existing value (custom key type, custom isEqual)
  objectSet2 = objectSet.updateByKey({
    key: 2,
    cmp: compareKeyWithObjectKey,
    isEqual: (a, b) => a.value === b.value,
    onConflict: () => ({key: 2, value: 'd'}),
  });
  assert.notEqual(objectSet2, objectSet);
  assert.deepEqual(Array.from(objectSet2), [
    {key: 1, value: 'a'},
    {key: 2, value: 'd'},
    {key: 3, value: 'c'},
  ]);

  // Replace existing value (custom key type, different key)
  objectSet2 = objectSet.updateByKey({
    key: 2,
    cmp: compareKeyWithObjectKey,
    isEqual: (a, b) => a.value === b.value,
    onConflict: (existingTreeValue) => ({
      key: 4,
      value: existingTreeValue.value,
    }),
  });
  assert.notEqual(objectSet2, objectSet);
  assert.deepEqual(Array.from(objectSet2), [
    {key: 1, value: 'a'},
    {key: 3, value: 'c'},
    {key: 4, value: 'b'},
  ]);

  // Update non-existing value
  objectSet2 = objectSet.updateByKey({
    key: {key: 4, value: 'd'},
    cmp: KVSet.compareValues,
    onNotFound: onNotFoundUseGivenValue,
  });
  assert.deepEqual(
    Array.from(objectSet2),
    [
      {key: 1, value: 'a'},
      {key: 2, value: 'b'},
      {key: 3, value: 'c'},
      {key: 4, value: 'd'},
    ],
  );

  // No change
  objectSet2 = objectSet.updateByKey({
    key: {key: 2, value: 'b'},
    cmp: KVSet.compareValues,
    isEqual: (a, b) => a.value === b.value,
    onConflict: onConflictUseGivenValue,
  });
  assert.equal(objectSet2, objectSet);

  // Removal
  objectSet2 = objectSet.updateByKey({
    key: {key: 2, value: 'b'},
    cmp: KVSet.compareValues,
    onConflict: onConflictRemoveValue,
  });
  assert.deepEqual(
    Array.from(objectSet2),
    [
      {key: 1, value: 'a'},
      {key: 3, value: 'c'},
    ],
  );
});

test('replace', function () {
  const s1 = set.replace(2, (oldValue) => oldValue * 2);
  assert.deepEqual(Array.from(s1), [1, 3, 4]);
  assert.notEqual(s1, set);

  const s2 = set.replace(4, () => 8);
  assert.equal(s2, set);

  const s3 = set.replace(2, () => 2);
  assert.equal(s3, set);

  const s4 = set.replace(2, () => REMOVE_VALUE);
  assert.notEqual(s4, set);
  assert.deepEqual(Array.from(s4), [1, 3]);
});

test('custom comparator', function () {
  class CaseInsensitiveSet extends kt.Set/*:: <string> */ {
    static compareValues = (a/*: string */, b/*: string */)/*: number */ => {
      return compareStrings(a.toLowerCase(), b.toLowerCase());
    };
  }

  const s1 = new CaseInsensitiveSet(['a', 'B']);
  assert.ok(s1.has('A'));
  assert.ok(s1.has('b'));
  assert.ok(!s1.has('c'));

  const s2 = s1.add('c');
  assert.deepEqual(Array.from(s2), ['a', 'B', 'c']);

  const s3 = s2.add('C');
  assert.equal(s3, s2);

  const s4 = s1.replace('a', () => 'A');
  assert.deepEqual(Array.from(s4), ['A', 'B']);

  const s5 = s1.replace('a', () => 'd');
  assert.deepEqual(Array.from(s5), ['B', 'd']);
});
