// 서울교통공사 물품보관함 위치정보 + 역사 좌표(위경도) 정보를 받아서, 우리 앱의 14개
// 지역마다 도보 거리 안에 있는 보관함을 찾아 data/lockers.json으로 저장하는 스크립트.
//
// - 로컬에서 수동 실행: node scripts/fetch-lockers.js
// - 두 데이터셋 모두 공공데이터포털에서 인증키 없이 받을 수 있는 "파일" 형식이라
//   fetch-visitseoul-events.js와 달리 API 키가 필요 없다.
// - 갱신 주기가 분기라 자주 돌릴 필요 없음 (GitHub Actions 스케줄에는 아직 안 넣었음 —
//   화면에 실제로 붙이기로 정한 뒤에 붙일 예정)
const fs = require('fs');
const path = require('path');
const { downloadDataGoKrCsv, parseCsv, csvToObjects } = require('../lib/datagokr-file');
const { AREA_CENTERS, distanceMeters } = require('../lib/area-centers');

const ROOT = path.join(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'data', 'lockers.json');

const LOCKER_DATASET_PAGE = 'https://www.data.go.kr/data/15044234/fileData.do'; // 서울교통공사_물품보관함 위치정보
const STATION_DATASET_PAGE = 'https://www.data.go.kr/data/15099316/fileData.do'; // 서울교통공사_1-8호선 역사 좌표(위경도) 정보

// 도보 500m~1km 사이에서 중간값인 800m를 기본으로 잡았다 (성인 평균 보행속도 기준
// 약 10분 거리). 지역별 결과 개수를 보고 필요하면 조정한다.
const RADIUS_METERS = 800;

// "서울역1~22", "종로3가1~25", "충정로(1~15)", "언주역" 같은 보관함명에서 역명만 뽑아낸다.
// - 끝에 붙은 "(숫자~숫자)"나 "숫자~숫자"만 잘라내므로, 역명 자체에 숫자가 들어있는
//   "종로3가" 같은 경우는 끝자리가 아니라서 안전하게 남는다.
// - 좌표 데이터셋의 역명에는 "역"이 안 붙어 있어서("서울역"이 아니라 "서울") 끝의
//   "역" 한 글자도 함께 없앤다.
function extractStationName(lockerLabel) {
  let s = lockerLabel.trim();
  s = s.replace(/\([^)]*\)$/, ''); // "충정로(1~15)" -> "충정로"
  s = s.replace(/[A-Za-z]$/, ''); // "충정로B" -> "충정로"
  s = s.replace(/\d+(~\d+)?$/, ''); // "서울역1~22" -> "서울역"
  s = s.replace(/역$/, ''); // "서울역" -> "서울"
  return s.trim();
}

// 좌표 데이터셋 자체에 있는 오류. "용답"역 좌표가 실제 위치(성동구, 광화문에서 8km
// 이상 떨어짐)가 아니라 광화문 근처 좌표로 잘못 등록돼 있어서, 그대로 쓰면 광화문·
// 남산 근처에 있지도 않은 보관함이 있는 것처럼 나온다. 잘못된 값을 쓰느니 이 역만
// 제외한다 (이 프로젝트가 다루는 14개 지역 중 용답역 자체는 어디에도 해당 없음).
const KNOWN_BAD_STATION_NAMES = new Set(['용답']);

async function main() {
  console.log('물품보관함 데이터 내려받는 중...');
  const lockerCsv = await downloadDataGoKrCsv(LOCKER_DATASET_PAGE);
  const lockerRows = csvToObjects(parseCsv(lockerCsv));
  console.log(`물품보관함 ${lockerRows.length}건 확인`);

  console.log('지하철역 좌표 데이터 내려받는 중...');
  const stationCsv = await downloadDataGoKrCsv(STATION_DATASET_PAGE);
  const stationRows = csvToObjects(parseCsv(stationCsv));
  console.log(`지하철역 좌표 ${stationRows.length}건 확인`);

  // 역명 -> {lat, lon}. 같은 역이 호선마다 중복으로 나오는데, 위치 차이가 몇십 미터
  // 수준이라 거리 계산에 영향이 없으므로 처음 나온 값만 쓴다.
  const stationCoords = {};
  stationRows.forEach((row) => {
    const name = (row['역명'] || '').trim();
    if (!name || stationCoords[name]) return;
    const lat = parseFloat(row['위도']);
    const lon = parseFloat(row['경도']);
    if (isFinite(lat) && isFinite(lon)) stationCoords[name] = { lat, lon };
  });

  const unmatchedStationNames = new Set();
  const lockers = [];
  lockerRows.forEach((row) => {
    const label = (row['보관함명'] || '').trim();
    const stationName = extractStationName(label);
    if (KNOWN_BAD_STATION_NAMES.has(stationName)) return;
    const coords = stationCoords[stationName];
    if (!coords) {
      unmatchedStationNames.add(stationName);
      return;
    }
    // 일부 상세위치는 앞에 역명을 다시 적어둬서("광화문역 B1층 2번 출구 방면") 화면에서
    // 역명을 한 번 더 붙이면 "광화문역 광화문역 B1층..."처럼 중복된다. 화면 쪽에서
    // 항상 역명을 앞에 붙이는 방식이라, 저장 시점에 미리 겹치는 부분을 없애둔다.
    let detail = (row['상세위치'] || '').trim();
    detail = detail.replace(new RegExp('^' + stationName + '역?\\s*'), '');

    lockers.push({
      stationName,
      line: (row['호선'] || '').trim(),
      detail,
      lat: coords.lat,
      lon: coords.lon,
    });
  });

  if (unmatchedStationNames.size > 0) {
    console.log(`\n주의: 역 좌표를 못 찾아서 제외된 역명 (${unmatchedStationNames.size}개): ${[...unmatchedStationNames].join(', ')}`);
  }

  const areas = {};
  Object.keys(AREA_CENTERS).forEach((areaCode) => {
    const center = AREA_CENTERS[areaCode];
    const nearby = lockers
      .map((l) => ({ ...l, distanceMeters: Math.round(distanceMeters(center.lat, center.lon, l.lat, l.lon)) }))
      .filter((l) => l.distanceMeters <= RADIUS_METERS)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    areas[areaCode] = {
      centerStationName: center.stationName,
      count: nearby.length,
      lockers: nearby,
    };
  });

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), radiusMeters: RADIUS_METERS, areas }, null, 2),
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
