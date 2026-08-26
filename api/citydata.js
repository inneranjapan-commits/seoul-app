// Vercel이 이 파일을 자동으로 /api/citydata 주소로 배포한다.
// 인증키(SEOUL_API_KEY)는 Vercel 프로젝트의 Environment Variables에 등록한 값을
// process.env로 자동으로 받아온다. .env 파일은 로컬 전용이라 여기선 읽지 않는다.
const { fetchCityData } = require('../lib/citydata');

module.exports = async function handler(req, res) {
  const areaCode = (req.query && req.query.area) || '';
  try {
    const result = await fetchCityData(areaCode);
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({ error: '알 수 없는 오류가 발생했습니다: ' + err.message, code: 'UNCAUGHT_ERROR', detail: err.message });
  }
};
