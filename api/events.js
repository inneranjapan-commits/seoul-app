// Vercel이 이 파일을 자동으로 /api/events 주소로 배포한다.
// 외국어(en/ja/zh) 모드일 때만 클라이언트가 이 엔드포인트를 호출한다.
//
// 미리 만들어둔 파일(data/events/*.json)만 읽으므로 즉시 응답한다 — 이 요청 안에서
// 비짓서울 API를 호출하지 않는다. (TourAPI 관련 코드는 정리 전이라 lib/tourapi.js에 그대로 남아있음)
const { getEvents } = require('../lib/visitseoul-events');

module.exports = function handler(req, res) {
  const lang = (req.query && req.query.lang) || '';
  const area = (req.query && req.query.area) || '';
  res.status(200).json({ events: getEvents(area, lang) });
};
