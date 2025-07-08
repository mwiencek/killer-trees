import {Bench} from 'tinybench';
import * as Immutable from 'immutable';
import mori from 'mori';

import KtList from '../src/List.js';
import shuffle from '../test/shuffle.js';

import {runSuites} from './utility.js';

const listData = [];
for (let i = 0; i < 2048; i++) {
  listData.push(i);
}
const listDataHalf1 = listData.slice(0, listData.length / 2);
const listDataHalf2 = listData.slice(listData.length / 2, listData.length);
const shuffledListData = listData.slice();
shuffle(shuffledListData);

function buildWeightBalancedList(data) {
  return new KtList(data);
}

function buildImmutableJsList(data) {
  return Immutable.List(data);
}

function buildMoriVector(data) {
  return mori.vector(...data);
}

const prebuiltKtList = buildWeightBalancedList(listData);
const prebuiltImmutableList = buildImmutableJsList(listData);
const prebuiltMoriVector = buildMoriVector(listData);

const createSuite = new Bench({name: 'List create'})
  .add('KtList (constructor)', function () {
    buildWeightBalancedList(listData);
  })
  .add('Immutable.List (constructor)', function () {
    buildImmutableJsList(listData);
  })
  .add('mori.vector', function () {
    mori.vector(...listData);
  });

const getSuite = new Bench({name: 'List get'})
  .add('KtList (at)', function () {
    for (const i of listData) {
      prebuiltKtList.at(i);
    }
  })
  .add('Immutable.List (get)', function () {
    for (const i of listData) {
      prebuiltImmutableList.get(i);
    }
  })
  .add('mori.vector (nth)', function () {
    for (const i of listData) {
      mori.nth(prebuiltMoriVector, i);
    }
  });

const setSuite = new Bench({name: 'List set'})
  .add('KtList (set)', function () {
    let list = prebuiltKtList;
    for (const i of shuffledListData) {
      list = list.set(i, i * 7);
    }
  })
  .add('Immutable.List (set)', function () {
    let list = prebuiltImmutableList;
    for (const i of shuffledListData) {
      list = list.set(i, i * 7);
    }
  })
  .add('mori.vector (into + map)', function () {
    let vector = prebuiltMoriVector;
    for (const i of shuffledListData) {
      let j = 0;
      vector = mori.into(
        mori.vector(),
        mori.map((x) => (j++) === i ? (x * 7) : x, vector),
      );
    }
  });

const pushSuite = new Bench({name: 'List push'})
  .add('KtList (push)', function () {
    let list = new KtList();
    for (const i of listData) {
      list = list.push(i);
    }
  })
  .add('Immutable.List (push)', function () {
    let list = Immutable.List();
    for (const i of listData) {
      list = list.push(i);
    }
  })
  .add('mori.vector (conj)', function () {
    let vector = mori.vector();
    for (const i of listData) {
      vector = mori.conj(vector, i);
    }
  });

const popSuite = new Bench({name: 'List pop'})
  .add('KtList (pop)', function () {
    let list = prebuiltKtList;
    // eslint-disable-next-line no-unused-vars
    for (const _ of listData) {
      ({list} = list.pop());
    }
  })
  .add('Immutable.List (pop)', function () {
    let list = prebuiltImmutableList;
    // eslint-disable-next-line no-unused-vars
    for (const _ of listData) {
      list = list.pop();
    }
  })
  .add('mori.vector (pop)', function () {
    let vector = prebuiltMoriVector
    // eslint-disable-next-line no-unused-vars
    for (const _ of listData) {
      vector = mori.pop(vector);
    }
  });

const unshiftSuite = new Bench({name: 'List unshift'})
  .add('KtList (unshift)', function () {
    let list = new KtList();
    for (const i of listData) {
      list = list.unshift(i);
    }
  })
  .add('Immutable.List (unshift)', function () {
    let list = Immutable.List();
    for (const i of listData) {
      list = list.unshift(i);
    }
  })
  .add('mori.vector (into + cons)', function () {
    let vector = mori.vector();
    for (const i of listData) {
      vector = mori.into(mori.vector(), mori.cons(i, vector));
    }
  });

const shiftSuite = new Bench({name: 'List shift'})
  .add('KtList (shift)', function () {
    let list = prebuiltKtList;
    // eslint-disable-next-line no-unused-vars
    for (const _ of listData) {
      ({list} = list.shift());
    }
  })
  .add('Immutable.List (shift)', function () {
    let list = prebuiltImmutableList;
    // eslint-disable-next-line no-unused-vars
    for (const _ of listData) {
      list = list.shift();
    }
  })
  .add('mori.vector (subvec)', function () {
    let vector = prebuiltMoriVector;
    // eslint-disable-next-line no-unused-vars
    for (const _ of listData) {
      vector = mori.subvec(vector, 1);
    }
  });

const sliceSuite = new Bench({name: 'List slice'})
  .add('KtList (slice)', function () {
    prebuiltKtList.slice(0, listData.length / 2);
  })
  .add('Immutable.List (slice)', function () {
    prebuiltImmutableList.slice(0, listData.length / 2);
  })
  .add('mori.vector (subvec)', function () {
    mori.subvec(prebuiltMoriVector, 0, listData.length / 2);
  });

const spliceSuite = new Bench({name: 'List splice'})
  .add('KtList (splice)', function () {
    let list = prebuiltKtList;
    for (const i of shuffledListData) {
      ({list} = list.splice(i, 1, i * 7));
    }
  })
  .add('Immutable.List (splice)', function () {
    let list = prebuiltImmutableList;
    for (const i of shuffledListData) {
      list = list.splice(i, 1, i * 7);
    }
  })
  .add('mori.vector (into + concat + subvec)', function () {
    let vector = prebuiltMoriVector;
    for (const i of shuffledListData) {
      vector = mori.into(
        mori.vector(),
        mori.concat(
          mori.subvec(vector, 0, i),
          mori.vector(i * 7),
          mori.subvec(vector, i + 1),
        )
      );
    }
  });

const removeSuite = new Bench({name: 'List remove'})
  .add('KtList (remove)', function () {
    let list = prebuiltKtList;
    for (const i of shuffledListData) {
      list = list.remove(i);
    }
  })
  .add('Immutable.List (delete)', function () {
    let list = prebuiltImmutableList;
    for (const i of shuffledListData) {
      list = list.delete(i);
    }
  })
  .add('mori.vector (into + filter)', function () {
    let vector = prebuiltMoriVector;
    for (const i of shuffledListData) {
      let j = 0;
      vector = mori.into(
        mori.vector(),
        mori.filter(() => (j++) !== i, vector),
      );
    }
  });

const ktListHalf1 = buildWeightBalancedList(listDataHalf1);
const ktListHalf2 = buildWeightBalancedList(listDataHalf2);
const immutableJsListHalf1 = buildImmutableJsList(listDataHalf1);
const immutableJsListHalf2 = buildImmutableJsList(listDataHalf2);
const moriListHalf1 = buildMoriVector(listDataHalf1);
const moriListHalf2 = buildMoriVector(listDataHalf2);

const concatSuite = new Bench({name: 'List concat'})
  .add('KtList (concat)', function () {
    ktListHalf1.concat(ktListHalf2);
  })
  .add('Immutable.List (concat)', function () {
    immutableJsListHalf1.concat(immutableJsListHalf2);
  })
  .add('mori.vector (into + concat)', function () {
    mori.into(mori.vector(), mori.concat(moriListHalf1, moriListHalf2));
  });

runSuites([
  createSuite,
  getSuite,
  setSuite,
  pushSuite,
  popSuite,
  unshiftSuite,
  shiftSuite,
  sliceSuite,
  spliceSuite,
  removeSuite,
  concatSuite,
]);
