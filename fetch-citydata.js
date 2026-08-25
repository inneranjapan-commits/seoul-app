// 서울시 실시간 도시데이터 API를 호출해서 citydata.json으로 저장하는 스크립트
const fs = require('fs');
const path = require('path');

// .env 파일을 읽어서 { SEOUL_API_KEY: '...' } 형태로 만드는 간단한 함수
function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
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

const env = loadEnv(path.join(__dirname, '.env'));
const apiKey = env.SEOUL_API_KEY;

if (!apiKey || apiKey === '여기에_인증키_입력') {
  console.error('오류: .env 파일을 열어서 SEOUL_API_KEY=발급받은키 형태로 입력해주세요.');
  process.exit(1);
}

// 가운뎃점(·)이 포함된 장소명은 URL에 그대로 쓰면 안 되므로 인코딩합니다.
const place = encodeURIComponent('광화문·덕수궁');
const url = `http://openapi.seoul.go.kr:8088/${apiKey}/json/citydata/1/5/${place}`;

async function main() {
  console.log('API 호출 중...');
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP 오류: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const outPath = path.join(__dirname, 'citydata.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`저장 완료: ${outPath}`);
}

main().catch((err) => {
  console.error('오류 발생:', err.message);
  process.exit(1);
});
