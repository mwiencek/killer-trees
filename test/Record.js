// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';

import * as kt from '../src/index.js';

/*::
interface RecordType {
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
    kt.Record.define({equals: ''});
  }, {
    name: 'Error',
    message: 'Can\'t define the reserved property "equals" on records.',
  });

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
  assert.equal(r1.foo, '');
  assert.equal(r1.bar, 123);
  assert.equal(r1.baz, true);

  const r2 = new TestRecord({foo: 'hello', bar: 456});
  assert.equal(r2.foo, 'hello');
  assert.equal(r2.bar, 456);
  assert.equal(r2.baz, true);

  const r3 = new TestRecord({unknown: 'value'});
  // $FlowIgnore[incompatible-use]
  assert.equal(r3.unknown, undefined);

  assert.throws(() => {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    new kt.Record();
  }, {
    name: 'Error',
    message: 'Can only construct records created via `KtRecord.define`.',
  });
});

test('size', () => {
  assert.equal(new TestRecord().size, 3);
});

test('get', () => {
  const r1 = new TestRecord({foo: 'hello'});
  assert.equal(r1.get('foo'), 'hello');
  assert.equal(r1.get('bar'), 123);

  assert.throws(() => {
    // $FlowIgnore[incompatible-call]
    r1.get('unknown');
  }, {
    name: 'Error',
    message: 'Undefined record key "unknown".',
  });
});

test('set', () => {
  const r1 = new TestRecord();
  const r2 = r1.set('foo', 'bar');
  assert.equal(r1.foo, '');
  assert.equal(r2.foo, 'bar');
  assert.notEqual(r1, r2);

  const r3 = r2.set('foo', 'bar');
  assert.equal(r2, r3);

  assert.throws(() => {
    // $FlowIgnore[incompatible-call]
    r1.set('unknown', 'value');
  }, {
    name: 'Error',
    message: 'Undefined record key "unknown".',
  });
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
  assert.equal(r1.foo, '');
  assert.equal(r1.bar, 123);
  assert.equal(r2.foo, 'baz');
  assert.equal(r2.bar, 999);

  const r3 = r2.merge({foo: 'baz'});
  assert.equal(r2, r3);

  const r4 = r2.merge({});
  assert.equal(r2, r4);
});

test('remove', () => {
  const r1 = new TestRecord({foo: 'bar'});
  const r2 = r1.remove('foo');
  assert.equal(r1.foo, 'bar');
  assert.equal(r2.foo, '');

  const r3 = r2.remove('foo');
  assert.equal(r2, r3);

  assert.throws(() => {
    // $FlowIgnore[incompatible-call]
    r1.remove('unknown');
  }, {
    name: 'Error',
    message: 'Undefined record key "unknown".',
  });
});

test('toJSON', () => {
  const r1 = new TestRecord({foo: 'hello', baz: false});
  assert.deepEqual(r1.toJSON(), {
    foo: 'hello',
    bar: 123,
    baz: false,
  });
});
