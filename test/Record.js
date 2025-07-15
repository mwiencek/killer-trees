// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';

import * as kt from '../src/index.js';

/*::
type RecordType = {
  +foo: string;
  +bar: number;
  +baz: boolean;
};
*/

const TestRecord = kt.Record.define/*:: <RecordType> */({
  foo: '',
  bar: 123,
  baz: true,
});

test('define', () => {
  assert.throws(() => {
    // $FlowIgnore[incompatible-call]
    TestRecord.define({});
  }, {
    name: 'Error',
    message: 'Can only define new records using the base class, `KtRecord`.',
  });
});

test('constructor', () => {
  const r1 = new TestRecord();
  assert.equal(r1.get('foo'), '');
  assert.equal(r1.get('bar'), 123);
  assert.equal(r1.get('baz'), true);

  const r2 = new TestRecord({foo: 'hello', bar: 456});
  assert.equal(r2.get('foo'), 'hello');
  assert.equal(r2.get('bar'), 456);
  assert.equal(r2.get('baz'), true);

  // $FlowIgnore[prop-missing]
  const r3 = new TestRecord({unknown: 'value'});

  assert.throws(() => {
    // $FlowIgnore[prop-missing]
    r3.get('unknown');
  }, {
    name: 'Error',
    message: 'Undefined record key "unknown".',
  });

  assert.throws(() => {
    new kt.Record/*:: <{}> */();
  }, {
    name: 'Error',
    message: 'Can only construct records created via `KtRecord.define`.',
  });
});

test('size', () => {
  assert.equal(new TestRecord().size, 3);
});

test('set', () => {
  const r1 = new TestRecord();
  const r2 = r1.set('foo', 'bar');
  assert.equal(r1.get('foo'), '');
  assert.equal(r2.get('foo'), 'bar');
  assert.notEqual(r1, r2);

  const r3 = r2.set('foo', 'bar');
  assert.equal(r2, r3);

  // $FlowIgnore[prop-missing]
  const r4 = r1.set('unknown', 'value');
  assert.equal(r4, r1);
});

test('update', () => {
  const r1 = new TestRecord();
  const updater = (defaultValue/*: string */) => defaultValue + 'bar';
  const r2 = r1.update('foo', updater);
  assert.equal(r1.get('foo'), '');
  assert.equal(r2.get('foo'), 'bar');
  assert.notEqual(r1, r2);

  const r3 = r2.update('foo', () => 'bar');
  assert.equal(r2, r3);

  const r4 = r2.update('foo', updater);
  assert.equal(r4.get('foo'), 'barbar');
  assert.notEqual(r2, r4);

  // $FlowIgnore[prop-missing]
  const r5 = r1.update('unknown', () => 'value');
  assert.equal(r5, r1);
});

test('equals', () => {
  const r1 = new TestRecord({foo: 'bar'});
  const r2 = new TestRecord({foo: 'bar'});
  const r3 = new TestRecord({foo: 'baz'});

  assert.ok(r1.equals(r2));
  assert.ok(!r1.equals(r3));
});

test('merge', () => {
  const r1 = new TestRecord();
  const r2 = r1.merge({foo: 'baz', bar: 999});
  assert.equal(r1.get('foo'), '');
  assert.equal(r1.get('bar'), 123);
  assert.equal(r2.get('foo'), 'baz');
  assert.equal(r2.get('bar'), 999);

  // $FlowIgnore[prop-missing]
  const r3 = r2.merge({foo: 'baz', unknown: 'value'});
  assert.equal(r2, r3);

  assert.throws(() => {
    // $FlowIgnore[prop-missing]
    r3.get('unknown');
  }, {
    name: 'Error',
    message: 'Undefined record key "unknown".',
  });

  const r4 = r2.merge({});
  assert.equal(r2, r4);
});

test('remove', () => {
  const r1 = new TestRecord({foo: 'bar'});
  const r2 = r1.remove('foo');
  assert.equal(r1.get('foo'), 'bar');
  assert.equal(r2.get('foo'), '');

  const r3 = r2.remove('foo');
  assert.equal(r2, r3);

  // $FlowIgnore[prop-missing]
  const r4 = r1.remove('unknown');
  assert.equal(r4, r1);
});

test('toJSON', () => {
  const r1 = new TestRecord({foo: 'hello', baz: false});
  assert.deepEqual(r1.toJSON(), {
    foo: 'hello',
    bar: 123,
    baz: false,
  });
});
