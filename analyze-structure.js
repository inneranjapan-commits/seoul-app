// citydata.json의 구조(어떤 항목이 어떤 깊이에 있는지)만 출력하는 스크립트
// 값 전체를 다 보여주지 않고, 키 이름 / 타입 / (배열이면 개수)만 보여줍니다.
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'citydata.json'), 'utf-8'));

const seenArrayKeys = new Set();

function describe(value) {
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value === null) return 'null';
  return typeof value;
}

function walk(obj, prefix = '', depth = 0) {
  if (depth > 6) return;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return;
    // 배열은 첫 번째 요소만 대표로 펼쳐서 보여줌 (중복 방지)
    const key = prefix + '[0]';
    if (seenArrayKeys.has(prefix)) return;
    seenArrayKeys.add(prefix);
    walk(obj[0], key, depth + 1);
    return;
  }
  if (obj !== null && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      const line = `${'  '.repeat(depth)}${prefix ? prefix + '.' : ''}${k}: ${describe(v)}`;
      console.log(line);
      if (typeof v === 'object' && v !== null) {
        walk(v, `${prefix ? prefix + '.' : ''}${k}`, depth + 1);
      }
    }
  }
}

walk(data);
