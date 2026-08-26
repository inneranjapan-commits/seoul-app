// Vercel이 이 파일을 자동으로 /api/events 주소로 배포한다.
// 외국어(en/ja/zh) 모드일 때만 클라이언트가 이 엔드포인트를 호출한다.
const { fetchForeignEvents } = require('../lib/tourapi');

module.exports = async function handler(req, res) {
  const lang = (req.query && req.query.lang) || '';
  try {
    const result = await fetchForeignEvents(lang);
    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({ error: '알 수 없는 오류가 발생했습니다: ' + err.message, code: 'UNCAUGHT_ERROR', detail: err.message });
  }
};
