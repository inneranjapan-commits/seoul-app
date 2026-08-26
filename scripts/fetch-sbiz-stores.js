// 소상공인시장진흥공단_상가(상권)정보 API에서 올리브영·편의점 매장을 받아, 우리 앱의
// 14개 지역마다 도보 거리 안에 있는 매장을 찾아 data/oliveyoung.json, data/convenience.json
// 으로 저장하는 스크립트.
//
// - 로컬에서 수동 실행: node scripts/fetch-sbiz-stores.js
// - 이 API는 공공데이터포털에서 별도로 "활용신청"을 해서 받은 인증키(SBIZ_API_KEY)가
//   있어야 한다 (자동승인이라 신청하면 바로 쓸 수 있음). .env에 다음처럼 추가:
//     SBIZ_API_KEY=발급받은_인증키
//
// 다이소도 같은 방식으로 시도해봤지만, 다이소는 가맹점주 개인/법인 명의로 사업자등록이
// 되는 경우가 많아 상호명에 "다이소"가 아예 안 들어간 매장이 대부분이라(명동 반경
// 800m 안 8,393개 상가업소를 전수 조사해도 "다이소"가 0건) 이 데이터로는 찾을 수
// 없었다. 그래서 이 스크립트는 올리브영·편의점만 다룬다.
//
// 반경 안의 모든 업종을 한 번만 받아서(지역당 1번) 여러 브랜드를 동시에 걸러내는
// 방식을 쓴다 — 브랜드마다 API를 따로 부르면 지역 수만큼 중복 호출이 생기기 때문.
const fs = require('fs');
const path = require('path');
const { AREA_CENTERS, distanceMeters } = require('../lib/area-centers');
const { romanizeBranchName } = require('../lib/korean-romanize');
const stationNamesEn = require('../lib/station-names-en');

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

// 브랜드마다 실제 등록된 상호명 표기가 제각각이다 (CU는 "씨유"로 등록된 경우가
// "CU"보다 훨씬 많고, 세븐일레븐도 한글 표기가 압도적으로 많음 — 명동 반경 800m
// 전수조사로 확인함). matchKeywords에 있는 것 중 하나라도 포함되면 그 브랜드로 잡고,
// 화면에는 실제 매장 간판과 같은 canonicalLabel로 통일해서 보여준다.
// canonicalLabel은 한글 화면(원문)에, canonicalLabelRoman은 외국어 화면 로마자 줄에
// 쓴다. 편의점은 실제 간판 자체가 로마자라 둘이 같다.
const OLIVEYOUNG_BRAND = { key: 'oliveyoung', canonicalLabel: '올리브영', canonicalLabelRoman: 'OLIVE YOUNG', matchKeywords: ['올리브영'] };
const CONVENIENCE_BRANDS = [
  { canonicalLabel: 'CU', canonicalLabelRoman: 'CU', matchKeywords: ['씨유', 'CU'] },
  { canonicalLabel: 'GS25', canonicalLabelRoman: 'GS25', matchKeywords: ['GS25'] },
  { canonicalLabel: '7-ELEVEN', canonicalLabelRoman: '7-ELEVEN', matchKeywords: ['세븐일레븐', '7-ELEVEN'] },
  { canonicalLabel: 'emart24', canonicalLabelRoman: 'emart24', matchKeywords: ['이마트24'] },
];

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

// rawName에서 브랜드가 매칭된 지점을 찾아 { canonicalLabel, canonicalLabelRoman, branchSuffix }를 돌려준다
function matchBrand(rawName, brands) {
  for (const brand of brands) {
    for (const kw of brand.matchKeywords) {
      const idx = rawName.indexOf(kw);
      if (idx !== -1) {
        return {
          canonicalLabel: brand.canonicalLabel,
          canonicalLabelRoman: brand.canonicalLabelRoman,
          branchSuffix: rawName.slice(idx + kw.length).trim(),
        };
      }
    }
  }
  return null;
}

function buildEntry(match, s, center) {
  const lat = parseFloat(s.lat);
  const lon = parseFloat(s.lon);
  const branchSuffix = match.branchSuffix;
  const nameKo = branchSuffix ? `${match.canonicalLabel} ${branchSuffix}` : match.canonicalLabel;
  const romanizedBranch = branchSuffix ? romanizeBranchName(branchSuffix, stationNamesEn) : '';
  return {
    name: nameKo,
    nameRomanized: romanizedBranch ? `${match.canonicalLabelRoman} ${romanizedBranch}` : match.canonicalLabelRoman,
    address: s.rdnmAdr || s.lnoAdr || '',
    lat,
    lon,
    distanceMeters: Math.round(distanceMeters(center.lat, center.lon, lat, lon)),
  };
}

async function main() {
  if (!API_KEY) {
    console.error('SBIZ_API_KEY가 없습니다. 공공데이터포털에서 "소상공인시장진흥공단_상가(상권)정보_API"를 활용신청한 뒤, .env에 SBIZ_API_KEY=발급받은키 형태로 추가해주세요.');
    process.exit(1);
  }

  const oliveyoungAreas = {};
  const convenienceAreas = {};

  for (const areaCode of Object.keys(AREA_CENTERS)) {
    const center = AREA_CENTERS[areaCode];
    console.log(`[${areaCode}] (기준역: ${center.stationName}) 주변 상가업소 조회 중...`);
    const stores = await fetchAllStoresNear(center.lon, center.lat);
    console.log(`[${areaCode}] 반경 ${RADIUS_METERS}m 안 전체 상가업소 ${stores.length}건 확인`);

    const seenOliveyoungCoords = new Set();
    const oliveyoungMatched = [];
    const seenConvenienceCoords = new Set();
    const convenienceMatched = [];

    stores.forEach((s) => {
      const rawName = s.bizesNm || '';
      const lat = parseFloat(s.lat);
      const lon = parseFloat(s.lon);
      const coordKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;

      const oy = matchBrand(rawName, [OLIVEYOUNG_BRAND]);
      if (oy && !seenOliveyoungCoords.has(coordKey)) {
        seenOliveyoungCoords.add(coordKey);
        oliveyoungMatched.push(buildEntry(oy, s, center));
        return; // 한 상가업소가 두 카테고리에 동시에 걸릴 일은 없음
      }

      const cv = matchBrand(rawName, CONVENIENCE_BRANDS);
      if (cv && !seenConvenienceCoords.has(coordKey)) {
        seenConvenienceCoords.add(coordKey);
        convenienceMatched.push(buildEntry(cv, s, center));
      }
    });

    oliveyoungMatched.sort((a, b) => a.distanceMeters - b.distanceMeters);
    convenienceMatched.sort((a, b) => a.distanceMeters - b.distanceMeters);

    oliveyoungAreas[areaCode] = { centerStationName: center.stationName, count: oliveyoungMatched.length, stores: oliveyoungMatched };
    convenienceAreas[areaCode] = { centerStationName: center.stationName, count: convenienceMatched.length, stores: convenienceMatched };
  }

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });

  fs.writeFileSync(
    path.join(ROOT, 'data', 'oliveyoung.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), radiusMeters: RADIUS_METERS, englishLabel: 'OLIVE YOUNG', areas: oliveyoungAreas }, null, 2),
    'utf-8'
  );
  fs.writeFileSync(
    path.join(ROOT, 'data', 'convenience.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), radiusMeters: RADIUS_METERS, areas: convenienceAreas }, null, 2),
    'utf-8'
  );
  console.log('\n저장 완료: data/oliveyoung.json, data/convenience.json');

  console.log('\n===== 올리브영 지역별 개수 (반경 ' + RADIUS_METERS + 'm) =====');
  Object.keys(AREA_CENTERS).forEach((areaCode) => {
    console.log(`${areaCode}: ${oliveyoungAreas[areaCode].count}개`);
  });

  console.log('\n===== 편의점 지역별 개수 (반경 ' + RADIUS_METERS + 'm) =====');
  Object.keys(AREA_CENTERS).forEach((areaCode) => {
    console.log(`${areaCode}: ${convenienceAreas[areaCode].count}개`);
  });
}

main().catch((err) => {
  console.error('실패:', err.message);
  process.exit(1);
});
