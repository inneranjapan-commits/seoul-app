// scripts/fetch-lockers.js와 scripts/fetch-sbiz-stores.js가 미리 만들어둔
// data/lockers.json, data/oliveyoung.json을 읽어서, 지역 코드 하나에 해당하는
// 부분만 돌려준다. 여기서는 외부 API를 전혀 호출하지 않는다 (분기에 한 번 미리
// 받아둔 파일만 읽음 — data/visitseoul-events.js와 같은 방식).
let oliveyoung = { areas: {} };
let convenience = { areas: {} };
let lockers = { areas: {} };

try {
  oliveyoung = require('../data/oliveyoung.json');
} catch (e) {
  oliveyoung = { areas: {} };
}
try {
  convenience = require('../data/convenience.json');
} catch (e) {
  convenience = { areas: {} };
}
try {
  lockers = require('../data/lockers.json');
} catch (e) {
  lockers = { areas: {} };
}

const EMPTY_STORES = { count: 0, stores: [] };
const EMPTY_LOCKERS = { count: 0, lockers: [] };

function getNearby(areaCode) {
  return {
    oliveyoung: (oliveyoung.areas && oliveyoung.areas[areaCode]) || EMPTY_STORES,
    convenience: (convenience.areas && convenience.areas[areaCode]) || EMPTY_STORES,
    lockers: (lockers.areas && lockers.areas[areaCode]) || EMPTY_LOCKERS,
  };
}

module.exports = { getNearby };
