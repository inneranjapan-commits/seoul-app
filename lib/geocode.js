// 위도/경도를 한국어 주소로 바꿔주는 공용 로직 (역지오코딩).
// 로컬 개발용 server.js와 Vercel용 api/geocode.js가 이 파일을 함께 가져다 쓴다.
//
// OpenStreetMap Nominatim의 무료 공개 API를 쓴다 (별도 인증키 필요 없음).
// Nominatim 사용 정책상 요청을 보낸 앱을 식별할 수 있는 User-Agent가 필요해서
// 프로젝트 이름만 담아 보낸다 (개인정보 아님, 개인 이용자 요청 빈도도 낮아 정책 범위 안).
const API_TIMEOUT_MS = 8000;
const USER_AGENT = 'seoul-realtime-app/1.0 (+https://github.com/inneranjapan-commits/seoul-app)';

async function reverseGeocode(lat, lon) {
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!isFinite(latNum) || !isFinite(lonNum)) {
    return { status: 400, body: { error: '위도/경도 값이 올바르지 않습니다.', code: 'INVALID_COORDS' } };
  }

  const url = 'https://nominatim.openstreetmap.org/reverse'
    + '?format=jsonv2&addressdetails=1&zoom=18&accept-language=ko'
    + '&lat=' + encodeURIComponent(latNum)
    + '&lon=' + encodeURIComponent(lonNum);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let apiRes;
  try {
    apiRes = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { status: 504, body: { error: '주소 조회 응답이 너무 느립니다.', code: 'GEOCODE_TIMEOUT' } };
    }
    return { status: 502, body: { error: '주소 조회에 실패했습니다: ' + err.message, code: 'GEOCODE_FETCH_FAILED', detail: err.message } };
  }
  clearTimeout(timer);

  if (!apiRes.ok) {
    return { status: 502, body: { error: `주소 조회 오류 (상태 코드 ${apiRes.status})`, code: 'GEOCODE_HTTP_ERROR' } };
  }

  let data;
  try {
    data = await apiRes.json();
  } catch (err) {
    return { status: 502, body: { error: '주소 조회 응답을 해석하지 못했습니다.', code: 'GEOCODE_PARSE_ERROR' } };
  }

  const address = (data && data.display_name) ? data.display_name : null;
  return { status: 200, body: { address: address } };
}

module.exports = { reverseGeocode };
