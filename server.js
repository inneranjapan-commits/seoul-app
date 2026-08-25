// index.html을 서빙하고, 서울시 실시간 도시데이터 API를 서버 쪽에서 호출해
// 브라우저에는 결과만 넘겨주는 아주 간단한 로컬 서버 (인증키가 브라우저에 노출되지 않음)
// 실행: node server.js
// 종료: 터미널에서 Ctrl + C
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const API_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 5 * 60 * 1000;

// 서울시 실시간 도시데이터 120개 장소 목록 기준 공식 명칭
const AREAS = [
  { code: 'gwanghwamun', name: '광화문·덕수궁' },
  { code: 'hongdae', name: '홍대 관광특구' },
  { code: 'gangnam', name: '강남역' },
  { code: 'yeouido', name: '여의도한강공원' },
  { code: 'seongsu', name: '성수카페거리' },
];
const AREA_NAME_BY_CODE = {};
AREAS.forEach(function (a) { AREA_NAME_BY_CODE[a.code] = a.name; });

// area 코드 -> { data, expiresAt } (5분간 재호출 없이 재사용)
const cityDataCache = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

// .env 파일을 읽어서 { SEOUL_API_KEY: '...' } 형태로 만드는 간단한 함수
function loadEnv(filePath) {
  const env = {};
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return env;
  }
  content.split('\n').forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    env[key] = value;
  });
  return env;
}

const env = loadEnv(path.join(ROOT, '.env'));
const SEOUL_API_KEY = env.SEOUL_API_KEY;

function sendJson(res, statusCode, obj) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

async function handleCityData(res, areaCode) {
  const areaName = AREA_NAME_BY_CODE[areaCode];
  if (!areaName) {
    sendJson(res, 400, { error: '알 수 없는 지역입니다: ' + areaCode });
    return;
  }

  const cached = cityDataCache.get(areaCode);
  if (cached && cached.expiresAt > Date.now()) {
    sendJson(res, 200, cached.body);
    return;
  }

  if (!SEOUL_API_KEY || SEOUL_API_KEY === '여기에_인증키_입력') {
    sendJson(res, 500, { error: '서버에 SEOUL_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인해주세요.' });
    return;
  }

  const place = encodeURIComponent(areaName);
  const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/citydata/1/5/${place}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let apiRes;
  try {
    apiRes = await fetch(url, { signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      sendJson(res, 504, { error: '서울시 API 응답이 너무 느립니다. 잠시 후 다시 시도해주세요.' });
    } else {
      sendJson(res, 502, { error: '서울시 API 호출에 실패했습니다: ' + err.message });
    }
    return;
  } finally {
    clearTimeout(timer);
  }

  if (!apiRes.ok) {
    sendJson(res, 502, { error: `서울시 API 오류 (상태 코드 ${apiRes.status})` });
    return;
  }

  let data;
  try {
    data = await apiRes.json();
  } catch (err) {
    sendJson(res, 502, { error: '서울시 API 응답을 해석하지 못했습니다.' });
    return;
  }

  const resultCode = data.RESULT && data.RESULT['RESULT.CODE'];
  if (resultCode && resultCode !== 'INFO-000') {
    sendJson(res, 502, { error: (data.RESULT && data.RESULT['RESULT.MESSAGE']) || '서울시 API가 오류를 반환했습니다.' });
    return;
  }

  if (!data.CITYDATA) {
    sendJson(res, 502, { error: '서울시 API 응답에 CITYDATA가 없습니다.' });
    return;
  }

  const body = { CITYDATA: data.CITYDATA };
  cityDataCache.set(areaCode, { body: body, expiresAt: Date.now() + CACHE_TTL_MS });
  sendJson(res, 200, body);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  const urlPath = decodeURIComponent(requestUrl.pathname);

  if (urlPath === '/api/areas') {
    sendJson(res, 200, { areas: AREAS });
    return;
  }

  if (urlPath === '/api/citydata') {
    const areaCode = requestUrl.searchParams.get('area') || '';
    handleCityData(res, areaCode).catch((err) => {
      sendJson(res, 500, { error: '알 수 없는 오류가 발생했습니다: ' + err.message });
    });
    return;
  }

  let staticPath = urlPath;
  if (staticPath === '/') staticPath = '/index.html';

  const filePath = path.join(ROOT, staticPath);

  // 이 폴더 바깥의 파일에는 접근하지 못하게 막음
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('접근이 거부되었습니다.');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('파일을 찾을 수 없습니다: ' + urlPath);
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`서버가 실행되었습니다: http://localhost:${PORT}`);
  console.log('브라우저에서 위 주소를 열어보세요. 종료하려면 Ctrl + C 를 누르세요.');
});
