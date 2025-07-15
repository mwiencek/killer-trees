import type {ImmutableTree} from 'weight-balanced-tree';

declare class KtCollection<T> {
  readonly _tree: ImmutableTree<T>;
  readonly size: number;
}

export default KtCollection;
