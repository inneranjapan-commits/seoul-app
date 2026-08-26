// 비짓서울(서울관광재단) API에서 외국어 모드용 문화행사 데이터를 미리 받아
// data/events/<lang>.json 파일로 저장하는 스크립트.
//
// - 로컬에서 수동 실행: node scripts/fetch-visitseoul-events.js
// - GitHub Actions가 하루 한 번 자동 실행 (.github/workflows/refresh-events.yml)
//
// 지역(14곳)별로 나누지 않고, "지금 서울에서 열리는 행사" 전체를 하나의 목록으로 저장한다.
// 이 스크립트가 만든 파일을 lib/visitseoul-events.js가 읽어서 즉시 응답하므로,
// 실제 사용자 요청 시점에는 비짓서울 API를 전혀 호출하지 않는다.
//
// 비짓서울 API는 실제 호출해보면 약 50% 확률로 500 오류가 나는 등 불안정해서,
// 이 스크립트는 실패를 "여유롭게"(점점 길게 기다리며) 여러 번 재시도한다.
// 하루에 한 번만 도는 백그라운드 작업이라 시간이 좀 걸려도 문제없다.
//
// "축제/공연/행사" 카테고리 전체(1,000건 이상)를 언어마다 훑으므로 시간이 꽤 걸린다.
// scripts/.fetch-progress.json에 진행 상황을 계속 기록하니, 실행 중 그 파일을 보면
// 콘솔 로그가 버퍼링되어 안 보이는 동안에도 어디까지 됐는지 확인할 수 있다.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'events');
const PROGRESS_FILE = path.join(__dirname, '.fetch-progress.json');

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
const PAGE_SIZE = 50;

// 서울 대략적 범위(여유 있게 잡은 사각형) — 이 밖 좌표는 제외
const SEOUL_BOUNDS = { minLat: 37.4, maxLat: 37.72, minLng: 126.73, maxLng: 127.27 };

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

function writeProgress(state) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), ...state }, null, 2), 'utf-8');
  } catch (e) {
    // 진행 상황 기록 실패는 전체 작업을 막을 이유가 없으므로 무시
  }
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

// 비짓서울 homepage 필드는 순수 URL이 아니라 '<a href="...">...</a>' HTML 조각으로 온다.
// href 속성값만 뽑아내고, 그런 형태가 아니면(이미 순수 URL이거나 값이 없으면) 그대로/빈 문자열 처리.
function extractUrl(homepageHtml) {
  if (!homepageHtml) return '';
  const match = String(homepageHtml).match(/href="([^"]+)"/);
  if (match) return match[1];
  const trimmed = String(homepageHtml).trim();
  return /^https?:\/\//.test(trimmed) ? trimmed : '';
}

function toIsoFromDot(dotStr) {
  // "2026.10.24" -> "2026-10-24"
  if (!dotStr) return '';
  const parts = String(dotStr).split('.');
  if (parts.length !== 3) return '';
  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
}

// 축제/공연/행사 카테고리 전체를 페이지 끝까지 훑는다 (더 이상 안 나올 때까지)
async function fetchAllListPages(lang, onPage) {
  const items = [];
  let pageNo = 1;
  let totalCount = null;
  while (true) {
    const listResult = await callWithRetry('POST', '/contents/list', {
      com_ctgry_sn: FESTIVAL_CATEGORY,
      lang_code_id: lang,
      sort_type: 'latest',
      page_no: pageNo,
    });
    const pageItems = listResult.json && listResult.json.data;
    if (totalCount === null && listResult.json && listResult.json.paging) {
      totalCount = listResult.json.paging.total_count;
    }
    if (!pageItems || pageItems.length === 0) break;
    items.push(...pageItems);
    if (onPage) onPage(items.length, totalCount);
    if (pageItems.length < PAGE_SIZE) break; // 마지막 페이지
    pageNo++;
    await sleep(300);
  }
  return items;
}

async function fetchLang(lang, langIndex) {
  console.log(`\n[${lang}] 목록 조회 중...`);
  writeProgress({ phase: 'listing', lang, langIndex, langsTotal: LANGS.length });

  const candidates = await fetchAllListPages(lang, (fetched, totalCount) => {
    console.log(`[${lang}] 목록 ${fetched}${totalCount ? '/' + totalCount : ''}건 확보...`);
    writeProgress({ phase: 'listing', lang, langIndex, langsTotal: LANGS.length, listFetched: fetched, listTotal: totalCount });
  });
  console.log(`[${lang}] 상세 조회 대상 ${candidates.length}건`);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const events = [];
  let failCount = 0;
  let outsideSeoulCount = 0;
  let alreadyEndedCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const item = candidates[i];
    const infoResult = await callWithRetry('POST', '/contents/info', { cid: item.cid });
    const d = infoResult.json && infoResult.json.data;
    if (!d) {
      failCount++;
    } else {
      const lng = d.traffic && parseFloat(d.traffic.map_position_x);
      const lat = d.traffic && parseFloat(d.traffic.map_position_y);
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        failCount++;
      } else if (!inSeoul(lat, lng)) {
        outsideSeoulCount++;
      } else {
        const endIso = toIsoFromDot(d.schdul_info_endde);
        const startIso = toIsoFromDot(d.schdul_info_bgnde);
        if (!endIso) {
          failCount++;
        } else {
          const endDate = new Date(endIso);
          if (isNaN(endDate.getTime()) || endDate < todayStart) {
            alreadyEndedCount++;
          } else {
            events.push({ EVENT_NM: d.post_sj || '', EVENT_PERIOD: `${startIso}~${endIso}`, EVENT_URL: extractUrl(d.homepage) });
          }
        }
      }
    }

    if ((i + 1) % 20 === 0 || i === candidates.length - 1) {
      console.log(`[${lang}] ${i + 1}/${candidates.length} 처리 중... (저장 ${events.length}건)`);
    }
    writeProgress({
      phase: 'detail',
      lang,
      langIndex,
      langsTotal: LANGS.length,
      detailDone: i + 1,
      detailTotal: candidates.length,
      savedSoFar: events.length,
      alreadyEndedCount,
      outsideSeoulCount,
      failCount,
    });
    await sleep(200);
  }

  console.log(
    `[${lang}] 완료: 저장 ${events.length}건 | 이미종료 ${alreadyEndedCount} | 서울아님 ${outsideSeoulCount} | 조회실패 ${failCount}`
  );
  return { events, alreadyEndedCount, outsideSeoulCount, failCount, totalCandidates: candidates.length };
}

(async () => {
  if (!API_KEY) {
    console.error('VISITSEOUL_API_KEY가 없습니다. .env 파일이나 환경변수를 확인해주세요.');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const summaryByLang = {};

  for (let langIndex = 0; langIndex < LANGS.length; langIndex++) {
    const lang = LANGS[langIndex];
    const result = await fetchLang(lang, langIndex);
    summaryByLang[lang] = result;

    const outPath = path.join(OUT_DIR, `${lang}.json`);
    fs.writeFileSync(
      outPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), events: result.events }, null, 2),
      'utf-8'
    );
    console.log(`[${lang}] 저장 완료: ${outPath}`);
  }

  console.log('\n===== 전체 결과 =====');
  LANGS.forEach((lang) => {
    const s = summaryByLang[lang];
    console.log(`[${lang}] 진행중/예정 ${s.events.length}건 (전체 후보 ${s.totalCandidates}건 중) | 이미종료 ${s.alreadyEndedCount} | 서울아님 ${s.outsideSeoulCount} | 조회실패 ${s.failCount}`);
  });

  writeProgress({
    phase: 'done',
    summaryByLang: Object.fromEntries(
      LANGS.map((l) => [l, {
        saved: summaryByLang[l].events.length,
        totalCandidates: summaryByLang[l].totalCandidates,
        alreadyEndedCount: summaryByLang[l].alreadyEndedCount,
        outsideSeoulCount: summaryByLang[l].outsideSeoulCount,
        failCount: summaryByLang[l].failCount,
      }])
    ),
  });

  console.log('\n모든 언어 처리 완료.');
})();
