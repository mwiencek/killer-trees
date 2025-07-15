import KtRecord from './Record';
import KtSet from './Set';

declare class KtRecordSet<T extends object> extends KtSet<KtRecord<T>> {
  updateRecordField<K extends keyof T>(
    record: KtRecord<T>,
    fieldKey: K,
    updater: (existingValue: T[K]) => T[K],
  ): this;
}

export default KtRecordSet;
