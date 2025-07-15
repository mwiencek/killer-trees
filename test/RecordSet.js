// @flow strict

// $FlowIssue[cannot-resolve-module]
import assert from 'node:assert/strict';
// $FlowIssue[cannot-resolve-module]
import test from 'node:test';

import * as kt from '../src/index.js';
import {compareStrings} from '../src/utility/compareValues.js';

test('updateRecordField', function () {
  /*::
  type RecordType = {+foo: string};
  */

  const TestRecord = kt.Record.define/*:: <RecordType> */({
    foo: '',
  });

  class TestRecordSet extends kt.RecordSet/*:: <RecordType> */ {
    static compareValues = (a/*: TestRecord */, b/*: TestRecord */)/*: number */ => {
      return compareStrings(a.get('foo'), b.get('foo'));
    };
  }

  const r1 = new TestRecord({foo: 'a'});
  const r2 = new TestRecord({foo: 'b'});

  const s1 = new TestRecordSet([r1, r2]);
  const s2 = s1.updateRecordField(
    r1,
    'foo',
    (existingValue) => existingValue.replace('a', 'c'),
  );

  assert.deepEqual(
    Array.from(s2).map((r) => r.toJSON()),
    [
      {foo: 'b'},
      {foo: 'c'},
    ],
  );
});
