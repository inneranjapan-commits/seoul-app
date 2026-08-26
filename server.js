// index.html을 서빙하고, 서울시 실시간 도시데이터 API를 서버 쪽에서 호출해
// 브라우저에는 결과만 넘겨주는 아주 간단한 로컬 서버 (인증키가 브라우저에 노출되지 않음)
// 실행: node server.js
// 종료: 터미널에서 Ctrl + C
//
// 이 파일은 컴퓨터에서 미리보기할 때만 쓰인다. 실제 인터넷 배포(Vercel)는
// api/areas.js, api/citydata.js가 담당하며, 둘 다 lib/citydata.js의 같은 로직을 사용한다.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { AREAS, fetchCityData } = require('./lib/citydata');
const { getEvents } = require('./lib/visitseoul-events');
const { reverseGeocode } = require('./lib/geocode');
const { getNearby } = require('./lib/nearby-places');

const PORT = 3000;
const ROOT = __dirname;
const STATIC_ROOT = path.join(ROOT, 'public'); // 정적 파일(index.html, lang.js 등)은 public/ 안에서만 찾는다

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

// .env 파일을 읽어서 { SEOUL_API_KEY: '...' } 형태로 만드는 간단한 함수
// (Vercel에서는 이 파일이 아니라 프로젝트 설정의 Environment Variables를 사용한다)
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

// .env에 있는 값을 process.env로 옮겨준다 (이미 process.env에 있으면 덮어쓰지 않음)
const envFromFile = loadEnv(path.join(ROOT, '.env'));
Object.keys(envFromFile).forEach((key) => {
  if (process.env[key] === undefined) process.env[key] = envFromFile[key];
});

function sendJson(res, statusCode, obj) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
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
    fetchCityData(areaCode)
      .then((result) => sendJson(res, result.status, result.body))
      .catch((err) => {
        sendJson(res, 500, { error: '알 수 없는 오류가 발생했습니다: ' + err.message, code: 'UNCAUGHT_ERROR', detail: err.message });
      });
    return;
  }

  if (urlPath === '/api/events') {
    const lang = requestUrl.searchParams.get('lang') || '';
    sendJson(res, 200, { events: getEvents(lang) });
    return;
  }

  if (urlPath === '/api/geocode') {
    const lat = requestUrl.searchParams.get('lat') || '';
    const lon = requestUrl.searchParams.get('lon') || '';
    reverseGeocode(lat, lon)
      .then((result) => sendJson(res, result.status, result.body))
      .catch((err) => {
        sendJson(res, 500, { error: '알 수 없는 오류가 발생했습니다: ' + err.message, code: 'UNCAUGHT_ERROR', detail: err.message });
      });
    return;
  }

  if (urlPath === '/api/nearby') {
    const area = requestUrl.searchParams.get('area') || '';
    sendJson(res, 200, getNearby(area));
    return;
  }

  let staticPath = urlPath;
  if (staticPath === '/') staticPath = '/index.html';

  const filePath = path.join(STATIC_ROOT, staticPath);

  // public 폴더 바깥의 파일에는 접근하지 못하게 막음
  if (!filePath.startsWith(STATIC_ROOT)) {
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
