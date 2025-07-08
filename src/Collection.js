// @flow strict

/*::
import type {ImmutableTree} from 'weight-balanced-tree';
*/

export default class KtCollection/*:: <T> */ {
  /*::
  +_tree: ImmutableTree<T>;
  */

  _newIfChanged(tree/*: ImmutableTree<T> */)/*: this */ {
    if (tree !== this._tree) {
      return this.constructor._new(tree);
    }
    return this;
  }

  static _new/*:: <T> */(tree/*: ImmutableTree<T> */)/*: this */ {
    // $FlowIssue[not-an-object]
    const instance = Object.create(this.prototype);
    // $FlowIgnore[prop-missing]
    instance._tree = tree;
    // $FlowIgnore[incompatible-return]
    return instance;
  }

  // $FlowIgnore[unsafe-getters-setters]
  get size()/*: number */ {
    return this._tree.size;
  }
}
