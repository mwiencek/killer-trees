// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';

import * as kt from '../src/index.js';

test('constructor', function () {
  assert.deepEqual(new kt.List/*:: <number> */().toArray(), []);

  function* numberFactory() {
    for (let i = 1; i <= 3; i++) {
      yield i;
    }
  }

  assert.deepEqual(
    Array.from(new kt.List(numberFactory())),
    [1, 2, 3],
  );
});

test('size', function () {
  assert.equal(new kt.List/*:: <empty> */().size, 0);
  assert.equal(new kt.List([1, 2, 3]).size, 3);
});

test('iterator', function () {
  assert.deepEqual(Array.from(new kt.List([1, 2, 3])), [1, 2, 3]);
});

test('enumerate', function () {
  assert.deepEqual(Array.from(new kt.List([10, 20]).enumerate()), [[0, 10], [1, 20]]);
});

test('at', function () {
  const list = new kt.List([5, 6]);
  assert.equal(list.at(0), 5);
  assert.equal(list.at(1), 6);
  assert.equal(list.at(2), undefined);
  assert.equal(list.at(2, 'x'), 'x');
  assert.equal(list.at(-1), 6);
  assert.equal(list.at(-2), 5);
  assert.equal(list.at(-3), undefined);
  assert.equal(list.at(-3, 'x'), 'x');
});

test('concat', function () {
  const a = new kt.List([1, 2]);
  const b = new kt.List([3, 4]);
  assert.deepEqual(a.concat(b).toArray(), [1, 2, 3, 4]);
});

test('equals', function () {
  const a = new kt.List([1, 2]);
  const b = new kt.List([1, 2]);
  const c = new kt.List([2, 1]);
  assert.ok(a.equals(b));
  assert.ok(!a.equals(c));
});

test('filter', function () {
  const list = new kt.List([1, 2, 3, 4]);
  assert.deepEqual(list.filter(x => x % 2 === 0).toArray(), [2, 4]);
});

test('map', function () {
  const list = new kt.List([1, 2, 3]);
  assert.deepEqual(list.map(x => x * 2).toArray(), [2, 4, 6]);
});

test('pop', function () {
  const list = new kt.List([1, 2]);
  let {list: newList, value: removedValue} = list.pop();
  assert.deepEqual(newList.toArray(), [1]);
  assert.equal(removedValue, 2);
  assert.notEqual(newList, list);

  const empty = new kt.List/*:: <number> */();
  ({list: newList, value: removedValue} = empty.pop());
  assert.deepEqual(newList.toArray(), []);
  assert.equal(removedValue, undefined);
  assert.equal(newList, empty);
});

test('push', function () {
  const list = new kt.List([1]);
  const newList = list.push(2, 3);
  assert.deepEqual(newList.toArray(), [1, 2, 3]);
  assert.notEqual(newList, list);

  const sameList = list.push();
  assert.deepEqual(sameList.toArray(), [1]);
  assert.equal(sameList, list);
});

test('set', function () {
  const list = new kt.List([1, 2]);
  const newList = list.set(1, 9);
  assert.deepEqual(newList.toArray(), [1, 9]);
  assert.notEqual(newList, list);

  const sameList = list.set(1, 2);
  assert.deepEqual(sameList.toArray(), [1, 2]);
  assert.equal(sameList, list);
});

test('shift', function () {
  const list = new kt.List([1, 2]);
  let {list: newList, value: removedValue} = list.shift();
  assert.deepEqual(newList.toArray(), [2]);
  assert.equal(removedValue, 1);
  assert.notEqual(newList, list);

  const empty = new kt.List/*:: <number> */();
  ({list: newList, value: removedValue} = empty.shift());
  assert.deepEqual(newList.toArray(), []);
  assert.equal(removedValue, undefined);
  assert.equal(newList, empty);
});

test('slice', function () {
  const list = new kt.List([1, 2, 3, 4]);
  assert.deepEqual(list.slice(1, 3).toArray(), [2, 3]);
  assert.deepEqual(list.slice(1).toArray(), [2, 3, 4]);
  assert.deepEqual(list.slice(0, -1).toArray(), [1, 2, 3]);
  assert.deepEqual(list.slice(-2).toArray(), [3, 4]);
  assert.deepEqual(list.slice(-2, -1).toArray(), [3]);
  assert.deepEqual(list.slice().toArray(), [1, 2, 3, 4]);
  assert.equal(list.slice(), list);
});

test('splice', function () {
  // Insert and delete
  const list = new kt.List([1, 2, 3]);
  let {list: newList, deleted} = list.splice(1, 1, 9, 8);
  assert.deepEqual(newList.toArray(), [1, 9, 8, 3]);
  assert.deepEqual(deleted.toArray(), [2]);
  assert.notEqual(newList, list);

  // Insert without deleting
  ({list: newList, deleted} = list.splice(1, 0, 7, 8));
  assert.deepEqual(newList.toArray(), [1, 7, 8, 2, 3]);
  assert.deepEqual(deleted.toArray(), []);
  assert.notEqual(newList, list);

  // Replace all
  ({list: newList, deleted} = list.splice(0, 3, 4, 5));
  assert.deepEqual(newList.toArray(), [4, 5]);
  assert.deepEqual(deleted.toArray(), [1, 2, 3]);
  assert.notEqual(newList, list);

  // No change
  ({list: newList, deleted} = list.splice(10, 0));
  assert.deepEqual(newList.toArray(), [1, 2, 3]);
  assert.deepEqual(deleted.toArray(), []);
  assert.equal(newList, list);
});

test('unshift', function () {
  const list = new kt.List([3]);
  const newList = list.unshift(1, 2);
  assert.deepEqual(newList.toArray(), [1, 2, 3]);
  assert.notEqual(newList, list);

  const sameList = list.unshift();
  assert.deepEqual(sameList.toArray(), [3]);
  assert.equal(sameList, list);
});

test('remove', function () {
  const list = new kt.List([1, 2, 3]);
  let newList = list.remove(1);
  assert.deepEqual(newList.toArray(), [1, 3]);
  assert.notEqual(newList, list);

  // Remove non-existent index
  const sameList = list.remove(10);
  assert.deepEqual(sameList.toArray(), [1, 2, 3]);
  assert.equal(sameList, list);
});
