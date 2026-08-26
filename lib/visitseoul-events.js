// scripts/fetch-visitseoul-events.js가 하루 한 번 미리 만들어둔 data/events/*.json을
// 읽어서, 요청 시점 기준으로 아직 끝나지 않은 행사만 종료일 순으로 정렬해 돌려준다.
//
// 여기서는 비짓서울 API를 전혀 호출하지 않는다 — 그래서 그 API가 불안정해도
// (약 50% 확률로 500 오류) 사용자 요청에는 전혀 영향이 없다.
//
// require()는 문자열이 고정되어 있어야 Vercel이 배포에 파일을 제대로 포함시킨다.
// (동적으로 만든 경로로 fs.readFile 하면 배포 시 파일이 빠지는 문제가 있었음 — lang.js 배포 때 겪었던 문제와 같은 원인)
let enEvents = [];
let jaEvents = [];
let zhCnEvents = [];
try {
  enEvents = require('../data/events/en.json').events || [];
} catch (e) {
  enEvents = [];
}
try {
  jaEvents = require('../data/events/ja.json').events || [];
} catch (e) {
  jaEvents = [];
}
try {
  zhCnEvents = require('../data/events/zh-CN.json').events || [];
} catch (e) {
  zhCnEvents = [];
}

// 클라이언트는 언어 코드로 'zh'를 쓰므로 파일명(zh-CN)과 이어준다
const EVENTS_BY_LANG = {
  en: enEvents,
  ja: jaEvents,
  zh: zhCnEvents,
  'zh-CN': zhCnEvents,
};

function parseEndDate(period) {
  if (!period) return null;
  const parts = String(period).split('~');
  const endStr = (parts[1] || parts[0] || '').trim();
  const d = new Date(endStr);
  return isNaN(d.getTime()) ? null : d;
}

// areaCode/lang에 맞는, 아직 끝나지 않은 행사를 종료일이 빠른 순으로 돌려준다
function getEvents(areaCode, lang) {
  const pool = EVENTS_BY_LANG[lang] || [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return pool
    .filter((ev) => ev.areaCode === areaCode)
    .map((ev) => ({ EVENT_NM: ev.EVENT_NM, EVENT_PERIOD: ev.EVENT_PERIOD, _end: parseEndDate(ev.EVENT_PERIOD) }))
    .filter((ev) => ev._end && ev._end >= todayStart)
    .sort((a, b) => a._end - b._end)
    .map((ev) => ({ EVENT_NM: ev.EVENT_NM, EVENT_PERIOD: ev.EVENT_PERIOD }));
}

module.exports = { getEvents };
