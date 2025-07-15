// @flow strict

/*::
import type KtRecord from './Record.js';
*/
import KtSet from './Set.js';

export default class KtRecordSet/*:: <T: interface {}> */
  extends KtSet/*:: <KtRecord<T>> */ {

  updateRecordField/*:: <K: $Keys<T>> */(
    record/*: KtRecord<T> */,
    fieldKey/*: K */,
    updater/*: (existingValue: T[K]) => T[K] */,
  )/*: this */ {
    return this.replace(
      record,
      (existingRecord/*: KtRecord<T> */)/*: KtRecord<T> */ => (
        existingRecord.update(fieldKey, updater)
      )
    );
  }
}
