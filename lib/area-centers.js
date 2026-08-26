// 우리 앱의 14개 지역은 서울시 실시간 도시데이터 API가 쓰는 "장소명"으로만 정의돼 있고
// 위도/경도가 따로 없다. 짐 보관함·매장처럼 "이 지역 근처에 뭐가 있는지"를 계산하려면
// 지역마다 기준이 될 좌표가 하나 필요해서, 각 지역을 대표하는 지하철역을 사람이 직접 골라
// 그 역의 좌표를 기준점으로 쓴다 (이 파일이 그 판단을 기록해둔 곳).
//
// 좌표 출처: 서울교통공사_1-8호선 역사 좌표(위경도) 정보 (data.go.kr/data/15099316)
//
// 판단 기준: 각 지역명이 가리키는 실제 장소에서 도보로 가장 먼저 닿는(관광객이 실제로
// 내리는) 역을 골랐다. 북촌한옥마을·인사동은 실제로 같은 안국역이 가장 가깝고,
// 동대문 관광특구·DDP도 같은 동대문역사문화공원역이 가장 가까워서 두 쌍이 기준점을
// 공유한다 — 실제 지리가 그렇게 붙어 있어서 생기는 자연스러운 결과다.
const AREA_CENTERS = {
  gwanghwamun: { stationName: '광화문', lat: 37.570545, lon: 126.976568 },
  hongdae: { stationName: '홍대입구', lat: 37.556748, lon: 126.923643 },
  gangnam: { stationName: '강남', lat: 37.497958, lon: 127.027539 },
  // 여의도한강공원의 실제 입구는 여의도역(업무지구 쪽)보다 여의나루역이 훨씬 가깝다
  yeouido: { stationName: '여의나루', lat: 37.527145, lon: 126.932807 },
  seongsu: { stationName: '성수', lat: 37.544628, lon: 127.055983 },
  myeongdong: { stationName: '명동', lat: 37.561055, lon: 126.988271 },
  dongdaemun: { stationName: '동대문역사문화공원', lat: 37.565597, lon: 127.009113 },
  itaewon: { stationName: '이태원', lat: 37.534485, lon: 126.994369 },
  gyeongbokgung: { stationName: '경복궁', lat: 37.575844, lon: 126.973576 },
  bukchon: { stationName: '안국', lat: 37.576562, lon: 126.98547 },
  insadong: { stationName: '안국', lat: 37.576562, lon: 126.98547 },
  jamsil: { stationName: '잠실', lat: 37.513305, lon: 127.100129 },
  namsan: { stationName: '회현', lat: 37.559698, lon: 126.979565 },
  ddp: { stationName: '동대문역사문화공원', lat: 37.565597, lon: 127.009113 },
};

// 두 좌표 사이의 실제 거리(미터) — Haversine 공식
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { AREA_CENTERS, distanceMeters };
