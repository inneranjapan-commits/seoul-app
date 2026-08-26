// Vercel이 이 파일을 자동으로 /api/geocode 주소로 배포한다.
// SOS 화면의 "내 위치 확인" 기능이 위도/경도를 한국어 주소로 바꿀 때 호출한다.
const { reverseGeocode } = require('../lib/geocode');

module.exports = async function handler(req, res) {
  const lat = (req.query && req.query.lat) || '';
  const lon = (req.query && req.query.lon) || '';
  try {
    const result = await reverseGeocode(lat, lon);
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({ error: '알 수 없는 오류가 발생했습니다: ' + err.message, code: 'UNCAUGHT_ERROR', detail: err.message });
  }
};
