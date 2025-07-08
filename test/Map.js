// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';
import {REMOVE_VALUE, DO_NOTHING} from 'weight-balanced-tree/update';

import * as kt from '../src/index.js';
import {EXOTIC_VALUES} from '../test/constants.js';

const map = new kt.Map([
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);

test('constructor', function () {
  const emptyMap = new kt.Map/*:: <string, number> */();
  assert.deepEqual(Array.from(emptyMap), []);

  function* objectEntries(object/*: {+[key: string]: number} */) {
    for (const key in object) {
      yield [key, object[key]];
    }
  }

  assert.deepEqual(
    Array.from(new kt.Map(objectEntries({a: 1, b: 2, c: 3}))),
    [['a', 1], ['b', 2], ['c', 3]],
  );
});

test('size', function () {
  assert.equal(new kt.Map/*:: <empty, empty> */().size, 0);
  assert.equal(map.size, 3);
});

test('iterator', function () {
  assert.deepEqual(Array.from(map), [['a', 1], ['b', 2], ['c', 3]]);
  assert.deepEqual(Array.from(map.entries()), [['a', 1], ['b', 2], ['c', 3]]);
});

test('set', function () {
  let m = new kt.Map/*:: <string, number> */();
  m = m.set('a', 1);
  m = m.set('b', 2);
  m = m.set('c', 3);
  assert.deepEqual(Array.from(m), [['a', 1], ['b', 2], ['c', 3]]);

  const sameMap = m.set('b', 2);
  assert.equal(sameMap, m);
});

test('get', function () {
  assert.equal(map.get('a'), 1);
  assert.equal(map.get('b'), 2);
  assert.equal(map.get('c'), 3);
  assert.equal(map.get('d', 'default'), 'default');
  assert.equal((new Map([[0, 'a']]).get(-0)), 'a');
  assert.equal((new Map([[-0, 'a']]).get(0)), 'a');
});

test('has', function () {
  assert.ok(map.has('a'));
  assert.ok(map.has('b'));
  assert.ok(map.has('c'));
  assert.ok(!map.has('d'));
});

test('keys', function () {
  assert.deepEqual(Array.from(map.keys()), ['a', 'b', 'c']);
});

test('values', function () {
  assert.deepEqual(Array.from(map.values()), [1, 2, 3]);
});

test('equals', function () {
  const map1 = new kt.Map([
    ['a', 1],
    ['b', 2],
  ]);
  const map2 = new kt.Map([
    ['a', 1],
    ['b', 2],
  ]);
  const map3 = new kt.Map([
    ['a', 1],
    ['b', 3],
  ]);
  assert.ok(map1.equals(map2));
  assert.ok(!map1.equals(map3));
});

test('merge', function () {
  const sameMap = map.merge(new kt.Map([['b', 2]]));
  assert.equal(sameMap, map);

  const newMap = map.merge(
    new kt.Map([
      ['d', 4],
      ['b', 5],
    ]),
  );
  assert.notEqual(newMap, map);
  assert.deepEqual(
    Array.from(newMap),
    [['a', 1], ['b', 5], ['c', 3], ['d', 4]],
  );
});

test('remove', function () {
  const aRemoved = map.remove('a');
  assert.deepEqual(
    Array.from(aRemoved),
    [['b', 2], ['c', 3]],
  );
  assert.deepEqual(
    Array.from(map),
    [['a', 1], ['b', 2], ['c', 3]],
  );

  const bRemoved = aRemoved.remove('b');
  assert.deepEqual(
    Array.from(bRemoved),
    [['c', 3]],
  );
  assert.deepEqual(
    Array.from(aRemoved),
    [['b', 2], ['c', 3]],
  );

  const sameMap = map.remove('missing');
  assert.equal(sameMap, map);
  assert.deepEqual(
    Array.from(map),
    [['a', 1], ['b', 2], ['c', 3]],
  );
});

test('update', function () {
  // Existing key
  let newMap = map.update('b', {
    onConflict: () => 20,
  });
  assert.equal(newMap.get('b'), 20);
  assert.equal(map.get('b'), 2);

  // New key
  newMap = map.update('d', {
    onNotFound: () => 4,
  });
  assert.equal(newMap.get('d'), 4);
  assert.equal(map.get('d'), undefined);

  // Same value
  newMap = map.update('b', {
    onConflict: () => 2,
  });
  assert.equal(newMap, map);

  // Remove on conflict
  newMap = map.update('b', {
    onConflict: () => REMOVE_VALUE,
  });
  assert.ok(!newMap.has('b'));
  assert.ok(map.has('b'));

  // Do nothing on not found
  newMap = map.update('d', {
    onNotFound: () => DO_NOTHING,
  });
  assert.equal(newMap, map);
});

test('exotic keys', function () {
  const exoticMap = new kt.Map/*:: <mixed, mixed> */(
    EXOTIC_VALUES.map((value) => [value, typeof value]),
  );
  for (const value of EXOTIC_VALUES) {
    assert.equal(exoticMap.get(value), typeof value);
  }
});
