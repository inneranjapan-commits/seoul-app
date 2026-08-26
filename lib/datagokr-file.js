// 공공데이터포털(data.go.kr)의 "파일" 형식 데이터셋을 인증키 없이 내려받는 공용 로직.
//
// 이런 데이터셋은 내려받기 주소가 고정돼 있지 않다 — 분기마다 새 파일이 올라오면
// atchFileId가 바뀐다. 그래서 매번 데이터셋 페이지(fileData.do)를 먼저 읽어서
// "지금 시점의" 다운로드 주소를 알아낸 다음 그 주소로 실제 파일을 받는다.
//
// 원본 파일은 대부분 EUC-KR/CP949(옛 한글 인코딩)라서, 시스템에 이미 있는 iconv
// 명령으로 UTF-8로 바꾼다 (GitHub Actions의 ubuntu-latest에는 기본 설치돼 있다).
// 새 npm 패키지를 추가하지 않기 위한 선택이다.
const { execFileSync } = require('child_process');

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} 요청 실패 (상태 코드 ${res.status})`);
  return res.text();
}

// 데이터셋 페이지(예: https://www.data.go.kr/data/15044234/fileData.do)에서
// 지금 시점의 다운로드 주소(atchFileId, fileDetailSn)를 찾아낸다.
async function findCurrentDownloadUrl(datasetPageUrl) {
  const html = await fetchText(datasetPageUrl);
  const match = html.match(/fileDownload\.do\?atchFileId=([^&"]+)&fileDetailSn=([^&"]+)/);
  if (!match) {
    throw new Error(`${datasetPageUrl} 페이지에서 다운로드 주소를 찾지 못했습니다. 데이터셋 페이지 구조가 바뀌었을 수 있습니다.`);
  }
  return `https://www.data.go.kr/cmm/cmm/fileDownload.do?atchFileId=${match[1]}&fileDetailSn=${match[2]}&insertDataPrcus=N`;
}

// EUC-KR/CP949로 인코딩된 바이트를 UTF-8 문자열로 바꾼다
function decodeKoreanLegacy(buffer) {
  return execFileSync('iconv', ['-f', 'CP949', '-t', 'UTF-8'], { input: buffer, maxBuffer: 1024 * 1024 * 64 }).toString('utf-8');
}

// 데이터셋 페이지 주소를 넣으면, 지금 시점의 최신 CSV를 UTF-8 문자열로 돌려준다
async function downloadDataGoKrCsv(datasetPageUrl) {
  const downloadUrl = await findCurrentDownloadUrl(datasetPageUrl);
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`${downloadUrl} 다운로드 실패 (상태 코드 ${res.status})`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return decodeKoreanLegacy(buffer);
}

// 아주 단순한 CSV 파서. 큰따옴표로 감싼 칸 안의 쉼표/줄바꿈을 처리한다.
// (이 프로젝트가 외부 라이브러리를 쓰지 않는 방침이라 직접 구현)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // 무시 (\r\n의 \r)
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

// parseCsv 결과(2차원 배열, 첫 줄이 헤더)를 { 헤더명: 값 } 객체 배열로 바꾼다
function csvToObjects(rows) {
  const header = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    header.forEach((key, i) => { obj[key] = row[i]; });
    return obj;
  });
}

module.exports = { downloadDataGoKrCsv, parseCsv, csvToObjects };
