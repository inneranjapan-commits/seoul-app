// 소상공인시장진흥공단_상가(상권)정보 API에서 올리브영 매장을 받아, 우리 앱의 14개
// 지역마다 도보 거리 안에 있는 매장을 찾아 data/oliveyoung.json으로 저장하는 스크립트.
//
// - 로컬에서 수동 실행: node scripts/fetch-sbiz-stores.js
// - 이 API는 공공데이터포털에서 별도로 "활용신청"을 해서 받은 인증키(SBIZ_API_KEY)가
//   있어야 한다 (자동승인이라 신청하면 바로 쓸 수 있음). .env에 다음처럼 추가:
//     SBIZ_API_KEY=발급받은_인증키
//
// 다이소도 같은 방식으로 시도해봤지만, 다이소는 가맹점주 개인/법인 명의로 사업자등록이
// 되는 경우가 많아 상호명에 "다이소"가 아예 안 들어간 매장이 대부분이라(명동 반경
// 800m 안 8,393개 상가업소를 전수 조사해도 "다이소"가 0건) 이 데이터로는 찾을 수
// 없었다. 그래서 이 스크립트는 올리브영만 다룬다.
//
// 반경 안의 모든 업종을 받아서 상호명으로 걸러내는 방식을 쓴다 (업종 대/중/소분류
// 코드로 먼저 좁힐 수도 있지만, 분기에 한 번 도는 배치 작업이라 속도보다는 정확성과
// 단순함을 우선했다 — 업종코드를 잘못 짚어서 매장을 놓치는 일이 없게).
const fs = require('fs');
const path = require('path');
const { AREA_CENTERS, distanceMeters } = require('../lib/area-centers');

const ROOT = path.join(__dirname, '..');

function loadEnvIfNeeded() {
  if (process.env.SBIZ_API_KEY) return;
  let content;
  try {
    content = fs.readFileSync(path.join(ROOT, '.env'), 'utf-8');
  } catch (e) {
    return;
  }
  content.split('\n').forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  });
}
loadEnvIfNeeded();

const API_KEY = process.env.SBIZ_API_KEY;
const BASE = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInRadius';
const RADIUS_METERS = 800; // 짐 보관함과 같은 기준(도보 500m~1km 중간값)을 그대로 씀
const PAGE_SIZE = 100;
const MATCH_KEYWORD = '올리브영';
const OUT_PATH = path.join(ROOT, 'data', 'oliveyoung.json');

async function fetchPage(cx, cy, pageNo) {
  const url = `${BASE}?ServiceKey=${encodeURIComponent(API_KEY)}&cx=${cx}&cy=${cy}&radius=${RADIUS_METERS}&type=json&pageNo=${pageNo}&numOfRows=${PAGE_SIZE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`상가업소정보 API 요청 실패 (상태 코드 ${res.status})`);
  return res.json();
}

// 한 지역(중심 좌표) 반경 안의 상가업소를 끝까지 페이지를 넘기며 전부 받아온다.
async function fetchAllStoresNear(cx, cy) {
  const items = [];
  let pageNo = 1;
  while (true) {
    const body = await fetchPage(cx, cy, pageNo);
    const pageItems = (body && body.body && body.body.items) || [];
    items.push(...pageItems);
    const totalCount = body && body.body && Number(body.body.totalCount);
    if (!pageItems.length || items.length >= totalCount) break;
    pageNo++;
    await new Promise((r) => setTimeout(r, 150));
  }
  return items;
}

// 원본 상호명이 "씨제이올리브영명동역점", "하파크리스틴올리브영센트럴명동타운점"처럼
// 운영법인 이름이 브랜드명 앞에 붙어 있거나 띄어쓰기가 없어서, "올리브영"부터 시작하는
// 부분만 남기고 그 뒤에 공백을 하나 넣어 "올리브영 명동역점"처럼 화면에 보여줄 수 있게 다듬는다.
function cleanStoreName(rawName) {
  const idx = rawName.indexOf(MATCH_KEYWORD);
  if (idx === -1) return rawName;
  const branch = rawName.slice(idx + MATCH_KEYWORD.length).trim();
  return branch ? `${MATCH_KEYWORD} ${branch}` : MATCH_KEYWORD;
}

async function main() {
  if (!API_KEY) {
    console.error('SBIZ_API_KEY가 없습니다. 공공데이터포털에서 "소상공인시장진흥공단_상가(상권)정보_API"를 활용신청한 뒤, .env에 SBIZ_API_KEY=발급받은키 형태로 추가해주세요.');
    process.exit(1);
  }

  const areas = {};

  for (const areaCode of Object.keys(AREA_CENTERS)) {
    const center = AREA_CENTERS[areaCode];
    console.log(`[${areaCode}] (기준역: ${center.stationName}) 주변 상가업소 조회 중...`);
    const stores = await fetchAllStoresNear(center.lon, center.lat);
    console.log(`[${areaCode}] 반경 ${RADIUS_METERS}m 안 전체 상가업소 ${stores.length}건 확인`);

    // 같은 매장이 운영법인이 바뀌면서(또는 다른 이유로) 두 개의 사업자번호로 중복
    // 등록된 경우가 있다 — 좌표가 완전히 같으면 같은 물리적 매장으로 보고 하나만 남긴다.
    const seenCoords = new Set();
    const matched = [];
    stores
      .filter((s) => (s.bizesNm || '').includes(MATCH_KEYWORD))
      .forEach((s) => {
        const lat = parseFloat(s.lat);
        const lon = parseFloat(s.lon);
        const coordKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
        if (seenCoords.has(coordKey)) return;
        seenCoords.add(coordKey);
        matched.push({
          name: cleanStoreName(s.bizesNm),
          address: s.rdnmAdr || s.lnoAdr || '',
          lat,
          lon,
          distanceMeters: Math.round(distanceMeters(center.lat, center.lon, lat, lon)),
        });
      });
    matched.sort((a, b) => a.distanceMeters - b.distanceMeters);

    areas[areaCode] = { centerStationName: center.stationName, count: matched.length, stores: matched };
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), radiusMeters: RADIUS_METERS, englishLabel: 'OLIVE YOUNG', areas }, null, 2),
    'utf-8'
  );
  console.log(`\n저장 완료: ${OUT_PATH}`);

  console.log('\n===== 지역별 개수 (반경 ' + RADIUS_METERS + 'm) =====');
  Object.keys(AREA_CENTERS).forEach((areaCode) => {
    const a = areas[areaCode];
    console.log(`${areaCode} (기준역: ${a.centerStationName}): ${a.count}개`);
  });
}

main().catch((err) => {
  console.error('실패:', err.message);
  process.exit(1);
});
