// 비짓서울(서울관광재단) API에서 외국어 모드용 문화행사 데이터를 미리 받아
// data/events/<lang>.json 파일로 저장하는 스크립트.
//
// - 로컬에서 수동 실행: node scripts/fetch-visitseoul-events.js
// - GitHub Actions가 하루 한 번 자동 실행 (.github/workflows/refresh-events.yml)
//
// 이 스크립트가 만든 파일을 lib/visitseoul-events.js가 읽어서 즉시 응답하므로,
// 실제 사용자 요청 시점에는 비짓서울 API를 전혀 호출하지 않는다.
//
// 비짓서울 API는 실제 호출해보면 약 50% 확률로 500 오류가 나는 등 불안정해서,
// 이 스크립트는 실패를 "여유롭게"(점점 길게 기다리며) 여러 번 재시도한다.
// 하루에 한 번만 도는 백그라운드 작업이라 시간이 좀 걸려도 문제없다.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'events');

// 로컬 실행 시 .env에서 키를 읽어온다 (GitHub Actions에서는 이미 환경변수로 들어와 있음)
function loadEnvIfNeeded() {
  if (process.env.VISITSEOUL_API_KEY) return;
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

const API_KEY = process.env.VISITSEOUL_API_KEY;
const BASE = 'https://api-call.visitseoul.net/api/v1';
const FESTIVAL_CATEGORY = 'Cv7s8m5'; // 축제/공연/행사
const LANGS = ['en', 'ja', 'zh-CN']; // 한국어는 서울시 데이터를 그대로 쓰므로 대상 아님
const ITEMS_PER_LANG = 120; // 언어별로 상세까지 확인할 최신 콘텐츠 수
const PAGE_SIZE = 50;

// 14개 지역 기준 좌표(대표 지점, 위경도 소수점 4자리 수준의 대략적인 값)
const AREA_COORDS = {
  gwanghwamun: { lat: 37.5759, lng: 126.9769 },
  hongdae: { lat: 37.5563, lng: 126.9237 },
  gangnam: { lat: 37.4979, lng: 127.0276 },
  yeouido: { lat: 37.5285, lng: 126.9335 },
  seongsu: { lat: 37.5445, lng: 127.0559 },
  myeongdong: { lat: 37.5636, lng: 126.985 },
  dongdaemun: { lat: 37.5701, lng: 127.0094 },
  itaewon: { lat: 37.5347, lng: 126.9947 },
  gyeongbokgung: { lat: 37.5796, lng: 126.977 },
  bukchon: { lat: 37.5826, lng: 126.9838 },
  insadong: { lat: 37.574, lng: 126.985 },
  jamsil: { lat: 37.5133, lng: 127.1 },
  namsan: { lat: 37.5512, lng: 126.9882 },
  ddp: { lat: 37.5665, lng: 127.0092 },
};
const MATCH_RADIUS_KM = 2; // 이 반경 안에서 가장 가까운 지역에 연결, 넘으면 어디에도 연결하지 않음

// 서울 대략적 범위(여유 있게 잡은 사각형) — 이 밖 좌표는 제외
const SEOUL_BOUNDS = { minLat: 37.4, maxLat: 37.72, minLng: 126.73, maxLng: 127.27 };

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestArea(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const code of Object.keys(AREA_COORDS)) {
    const c = AREA_COORDS[code];
    const dist = haversineKm(lat, lng, c.lat, c.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = code;
    }
  }
  return bestDist <= MATCH_RADIUS_KM ? best : null;
}

function inSeoul(lat, lng) {
  return (
    lat >= SEOUL_BOUNDS.minLat &&
    lat <= SEOUL_BOUNDS.maxLat &&
    lng >= SEOUL_BOUNDS.minLng &&
    lng <= SEOUL_BOUNDS.maxLng
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const CALL_TIMEOUT_MS = 15000; // 응답이 아예 안 오는 요청 때문에 무한정 멈추지 않도록

async function callRaw(method, urlPath, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  try {
    const res = await fetch(BASE + urlPath, {
      method,
      headers: {
        'VISITSEOUL-API-KEY': API_KEY,
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json;charset=UTF-8',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    try {
      return { httpStatus: res.status, json: JSON.parse(text) };
    } catch (e) {
      return { httpStatus: res.status, parseError: true };
    }
  } catch (err) {
    return { httpStatus: 0, networkError: true, message: err.message };
  } finally {
    clearTimeout(timer);
  }
}

// 실패해도 서두르지 않고 점점 길게 기다리며 재시도한다 (최대 6번)
async function callWithRetry(method, urlPath, body, maxAttempts) {
  maxAttempts = maxAttempts || 6;
  let last;
  for (let i = 0; i < maxAttempts; i++) {
    last = await callRaw(method, urlPath, body);
    if (last.httpStatus === 200 && last.json && last.json.result_code === 200) return last;
    const delay = Math.min(1000 * Math.pow(1.6, i), 8000);
    await sleep(delay);
  }
  return last;
}

function toIsoFromDot(dotStr) {
  // "2026.10.24" -> "2026-10-24"
  if (!dotStr) return '';
  const parts = String(dotStr).split('.');
  if (parts.length !== 3) return '';
  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
}

async function fetchListPages(lang) {
  const items = [];
  let pageNo = 1;
  while (items.length < ITEMS_PER_LANG) {
    const listResult = await callWithRetry('POST', '/contents/list', {
      com_ctgry_sn: FESTIVAL_CATEGORY,
      lang_code_id: lang,
      sort_type: 'latest',
      page_no: pageNo,
    });
    const pageItems = listResult.json && listResult.json.data;
    if (!pageItems || pageItems.length === 0) break;
    items.push(...pageItems);
    if (pageItems.length < PAGE_SIZE) break; // 마지막 페이지
    pageNo++;
    await sleep(300);
  }
  return items.slice(0, ITEMS_PER_LANG);
}

async function fetchLang(lang) {
  console.log(`\n[${lang}] 목록 조회 중...`);
  const candidates = await fetchListPages(lang);
  console.log(`[${lang}] 상세 조회 대상 ${candidates.length}건`);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const events = [];
  let failCount = 0;
  let outsideSeoulCount = 0;
  let noAreaMatchCount = 0;
  let alreadyEndedCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    const infoResult = await callWithRetry('POST', '/contents/info', { cid: item.cid });
    const d = infoResult.json && infoResult.json.data;
    if (!d) {
      failCount++;
      continue;
    }

    const lng = d.traffic && parseFloat(d.traffic.map_position_x);
    const lat = d.traffic && parseFloat(d.traffic.map_position_y);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      failCount++;
      continue;
    }
    if (!inSeoul(lat, lng)) {
      outsideSeoulCount++;
      continue;
    }

    const areaCode = nearestArea(lat, lng);
    if (!areaCode) {
      noAreaMatchCount++;
      continue;
    }

    const endIso = toIsoFromDot(d.schdul_info_endde);
    const startIso = toIsoFromDot(d.schdul_info_bgnde);
    if (!endIso) {
      failCount++;
      continue;
    }
    const endDate = new Date(endIso);
    if (isNaN(endDate.getTime()) || endDate < todayStart) {
      alreadyEndedCount++;
      continue;
    }

    events.push({
      EVENT_NM: d.post_sj || '',
      EVENT_PERIOD: `${startIso}~${endIso}`,
      areaCode: areaCode,
    });

    if ((i + 1) % 20 === 0) console.log(`[${lang}] ${i + 1}/${candidates.length} 처리 중...`);
    await sleep(200);
  }

  console.log(
    `[${lang}] 완료: 저장 ${events.length}건 | 이미종료 ${alreadyEndedCount} | 지역매칭안됨 ${noAreaMatchCount} | 서울아님 ${outsideSeoulCount} | 조회실패 ${failCount}`
  );
  return events;
}

(async () => {
  if (!API_KEY) {
    console.error('VISITSEOUL_API_KEY가 없습니다. .env 파일이나 환경변수를 확인해주세요.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const lang of LANGS) {
    const events = await fetchLang(lang);
    const outPath = path.join(OUT_DIR, `${lang}.json`);
    fs.writeFileSync(
      outPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), events }, null, 2),
      'utf-8'
    );
    console.log(`[${lang}] 저장 완료: ${outPath}`);
  }

  console.log('\n모든 언어 처리 완료.');
})();
