// public/lang.js의 en.stationNames와 같은 내용. lang.js는 브라우저 <script>라 Node
// 스크립트(scripts/fetch-sbiz-stores.js)에서 require()할 수 없어서 여기 따로 둔다.
// 지점명 로마자 표기에서 "역명 부분은 정확한 번역을 쓰기 위한 용도"라, 둘 중 하나만
// 바뀌어도 화면이 깨지진 않지만 새 역이 추가되면 두 곳 다 챙겨야 한다.
module.exports = {
  '강남': 'Gangnam',
  '경복궁': 'Gyeongbokgung',
  '광화문': 'Gwanghwamun',
  '동대문': 'Dongdaemun',
  '동대문역사문화공원': 'Dongdaemun History & Culture Park',
  '명동': 'Myeongdong',
  '성수': 'Seongsu',
  '시청': 'City Hall',
  '안국': 'Anguk',
  '여의나루': 'Yeouinaru',
  '이태원': 'Itaewon',
  '잠실': 'Jamsil',
  '을지로3가': 'Euljiro 3-ga',
  '을지로입구': 'Euljiro Ipgu',
  '종각': 'Jonggak',
  '청구': 'Cheonggu',
  '충무로': 'Chungmuro',
  '홍대입구': 'Hongik Univ.',
  '회현': 'Hoehyeon',
  '녹사평': 'Noksapyeong',
};
