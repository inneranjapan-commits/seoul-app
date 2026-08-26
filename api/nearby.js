// Vercel이 이 파일을 자동으로 /api/nearby 주소로 배포한다.
// 지역 화면의 "이 근처" 섹션(올리브영, 짐 보관함)이 호출한다.
const { getNearby } = require('../lib/nearby-places');

module.exports = function handler(req, res) {
  const area = (req.query && req.query.area) || '';
  res.status(200).json(getNearby(area));
};
