// 한국관광공사 TourAPI에서 외국어 모드용 서울 문화행사 목록을 가져오는 공통 로직.
// 한국어 모드는 여전히 서울시 실시간 도시데이터의 EVENT_STTS를 그대로 쓰고,
// 외국어(en/ja/zh) 모드일 때만 이 파일을 사용한다.
//
// TourAPI는 "서울시" 단위까지만 지역을 구분할 수 있고(광화문/명동 같은 세부 장소 구분은
// 지원하지 않음), 그래서 선택한 지역과 상관없이 서울 전체 행사 목록을 돌려준다.

const EVENTS_CACHE_TTL_MS = 30 * 60 * 1000; // 축제 목록은 자주 안 바뀌므로 넉넉하게 30분 캐시
const API_TIMEOUT_MS = 10000;
const SEOUL_AREA_CODE = '1';

const SERVICE_BY_LANG = {
  en: 'EngService2',
  ja: 'JpnService2',
  zh: 'ChsService2',
};

const HANGUL_RE = /[가-힣]/;
// TourAPI 영문/일문/중문 제목은 "번역된 제목 (한국어 원제)" 형태로 원제를 괄호에 함께
// 붙여주는 경우가 많다. 괄호 안 내용은 빼고, 나머지 부분에 한글이 남아있으면
// "번역이 안 된 제목"으로 간주해 제외한다.
function isTranslatedTitle(title) {
  var withoutParens = String(title).replace(/[\(（][^)）]*[\)）]/g, '');
  return !HANGUL_RE.test(withoutParens);
}

const eventsCache = new Map(); // lang -> { body, expiresAt }

function parseYYYYMMDD(str) {
  if (!str || String(str).length !== 8) return null;
  const s = String(str);
  const date = new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)));
  return isNaN(date.getTime()) ? null : date;
}

// "20251024" -> "2025-10-24" (클라이언트가 기대하는 EVENT_PERIOD 형식과 맞춘다)
function toIsoDate(str) {
  const s = String(str || '');
  if (s.length !== 8) return '';
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

async function fetchForeignEvents(lang) {
  const service = SERVICE_BY_LANG[lang];
  if (!service) {
    return { status: 400, body: { error: '지원하지 않는 언어입니다: ' + lang, code: 'UNSUPPORTED_LANG' } };
  }

  const cached = eventsCache.get(lang);
  if (cached && cached.expiresAt > Date.now()) {
    return { status: 200, body: cached.body };
  }

  const apiKey = process.env.TOUR_API_KEY;
  if (!apiKey) {
    return { status: 500, body: { error: '서버에 TOUR_API_KEY가 설정되어 있지 않습니다.', code: 'MISSING_TOUR_API_KEY' } };
  }

  // 오늘 날짜로 조회하면 TourAPI 데이터가 그만큼 갱신되어 있지 않아 0건이 나올 수 있어서,
  // 1년 전부터 넉넉히 가져온 뒤 "아직 끝나지 않은 행사"만 우리 쪽에서 걸러낸다.
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const eventStartDate =
    oneYearAgo.getFullYear() +
    String(oneYearAgo.getMonth() + 1).padStart(2, '0') +
    String(oneYearAgo.getDate()).padStart(2, '0');

  const params = new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: 'ETC',
    MobileApp: 'SeoulApp',
    _type: 'json',
    numOfRows: '100',
    pageNo: '1',
    areaCode: SEOUL_AREA_CODE,
    eventStartDate: eventStartDate,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let apiRes;
  try {
    apiRes = await fetch(`https://apis.data.go.kr/B551011/${service}/searchFestival2?${params.toString()}`, {
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return { status: 504, body: { error: 'TourAPI 응답이 너무 느립니다.', code: 'TOUR_API_TIMEOUT' } };
    }
    return { status: 502, body: { error: 'TourAPI 호출에 실패했습니다: ' + err.message, code: 'TOUR_API_FETCH_FAILED', detail: err.message } };
  } finally {
    clearTimeout(timer);
  }

  if (!apiRes.ok) {
    return { status: 502, body: { error: `TourAPI 오류 (상태 코드 ${apiRes.status})`, code: 'TOUR_API_HTTP_ERROR', status: apiRes.status } };
  }

  let data;
  try {
    data = await apiRes.json();
  } catch (err) {
    return { status: 502, body: { error: 'TourAPI 응답을 해석하지 못했습니다.', code: 'TOUR_API_PARSE_ERROR' } };
  }

  const header = data.response && data.response.header;
  if (header && header.resultCode !== '0000') {
    return { status: 502, body: { error: header.resultMsg || 'TourAPI가 오류를 반환했습니다.', code: 'TOUR_API_RESULT_ERROR' } };
  }

  const body = data.response && data.response.body;
  const rawItems = (body && body.items && body.items.item) || [];
  const list = Array.isArray(rawItems) ? rawItems : [rawItems];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const events = list
    .filter((it) => it && it.title && isTranslatedTitle(it.title)) // 번역 안 된(한글만 있는) 제목 제외
    .map((it) => ({
      EVENT_NM: it.title,
      _endDate: parseYYYYMMDD(it.eventenddate),
      EVENT_PERIOD: `${toIsoDate(it.eventstartdate)}~${toIsoDate(it.eventenddate)}`,
    }))
    .filter((ev) => ev._endDate && ev._endDate >= todayStart) // 이미 끝난 행사는 제외
    .sort((a, b) => a._endDate - b._endDate) // 종료일이 빠른 순
    .map((ev) => ({ EVENT_NM: ev.EVENT_NM, EVENT_PERIOD: ev.EVENT_PERIOD }));

  const resultBody = { events: events };
  eventsCache.set(lang, { body: resultBody, expiresAt: Date.now() + EVENTS_CACHE_TTL_MS });
  return { status: 200, body: resultBody };
}

module.exports = { fetchForeignEvents };
