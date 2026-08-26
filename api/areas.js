// Vercel이 이 파일을 자동으로 /api/areas 주소로 배포한다.
const { AREAS } = require('../lib/citydata');

module.exports = function handler(req, res) {
  res.status(200).json({ areas: AREAS });
};
