// 서울시 실시간 도시데이터 API를 호출하는 공통 로직.
// 로컬 개발용 server.js와 Vercel용 api/*.js가 이 파일을 함께 가져다 쓴다.
// (하나만 고치면 로컬/배포 양쪽에 똑같이 반영되게 하기 위함)

const API_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 5 * 60 * 1000;

// 서울시 실시간 도시데이터 120개 장소 목록 기준 공식 명칭 (엑셀 "서울시 주요 121장소 목록" 대조 완료)
const AREAS = [
  { code: 'gwanghwamun', name: '광화문·덕수궁' },
  { code: 'hongdae', name: '홍대 관광특구' },
  { code: 'gangnam', name: '강남역' },
  { code: 'yeouido', name: '여의도한강공원' },
  { code: 'seongsu', name: '성수카페거리' },
  { code: 'myeongdong', name: '명동 관광특구' },
  { code: 'dongdaemun', name: '동대문 관광특구' },
  { code: 'itaewon', name: '이태원 관광특구' },
  { code: 'gyeongbokgung', name: '경복궁' },
  { code: 'bukchon', name: '북촌한옥마을' },
  { code: 'insadong', name: '인사동' },
  { code: 'jamsil', name: '잠실 관광특구' },
  { code: 'namsan', name: '남산공원' },
  { code: 'ddp', name: 'DDP(동대문디자인플라자)' },
];
const AREA_NAME_BY_CODE = {};
AREAS.forEach(function (a) { AREA_NAME_BY_CODE[a.code] = a.name; });

// area 코드 -> { body, expiresAt } (5분간 재호출 없이 재사용)
// 주의: Vercel에서는 이 캐시가 함수 인스턴스 하나에서만 유지된다 (요청이 많아 새 인스턴스가
// 뜨면 캐시가 없을 수 있음). 그래도 같은 인스턴스가 재사용되는 동안은 호출 수를 줄여준다.
const cityDataCache = new Map();

// { status, body } 형태로 결과를 돌려준다. res에 직접 쓰지 않는 이유는
// server.js(로컬)와 api/*.js(Vercel) 양쪽에서 각자 다른 방식으로 응답을 보내야 하기 때문.
async function fetchCityData(areaCode) {
  const areaName = AREA_NAME_BY_CODE[areaCode];
  if (!areaName) {
    return { status: 400, body: { error: '알 수 없는 지역입니다: ' + areaCode, code: 'UNKNOWN_AREA', area: areaCode } };
  }

  const cached = cityDataCache.get(areaCode);
  if (cached && cached.expiresAt > Date.now()) {
    return { status: 200, body: cached.body };
  }

  const apiKey = process.env.SEOUL_API_KEY;
  if (!apiKey || apiKey === '여기에_인증키_입력') {
    return { status: 500, body: { error: '서버에 SEOUL_API_KEY가 설정되어 있지 않습니다.', code: 'MISSING_API_KEY' } };
  }

  const place = encodeURIComponent(areaName);
  const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata/1/5/${place}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let apiRes;
  try {
    apiRes = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      return { status: 504, body: { error: '서울시 API 응답이 너무 느립니다. 잠시 후 다시 시도해주세요.', code: 'API_TIMEOUT' } };
    }
    return { status: 502, body: { error: '서울시 API 호출에 실패했습니다: ' + err.message, code: 'API_FETCH_FAILED', detail: err.message } };
  } finally {
    clearTimeout(timer);
  }

  if (!apiRes.ok) {
    return { status: 502, body: { error: `서울시 API 오류 (상태 코드 ${apiRes.status})`, code: 'API_HTTP_ERROR', status: apiRes.status } };
  }

  let data;
  try {
    data = await apiRes.json();
  } catch (err) {
    return { status: 502, body: { error: '서울시 API 응답을 해석하지 못했습니다.', code: 'API_PARSE_ERROR' } };
  }

  const resultCode = data.RESULT && data.RESULT['RESULT.CODE'];
  if (resultCode && resultCode !== 'INFO-000') {
    return { status: 502, body: { error: (data.RESULT && data.RESULT['RESULT.MESSAGE']) || '서울시 API가 오류를 반환했습니다.', code: 'API_RESULT_ERROR' } };
  }

  if (!data.CITYDATA) {
    return { status: 502, body: { error: '서울시 API 응답에 CITYDATA가 없습니다.', code: 'MISSING_CITYDATA' } };
  }

  const body = { CITYDATA: data.CITYDATA };
  cityDataCache.set(areaCode, { body: body, expiresAt: Date.now() + CACHE_TTL_MS });
  return { status: 200, body: body };
}

module.exports = { AREAS, AREA_NAME_BY_CODE, fetchCityData };
