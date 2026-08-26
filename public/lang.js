// 화면에 보이는 고정 문구를 모아둔 번역 파일입니다.
// 언어를 추가하려면 LANG 객체에 새 언어 키(예: 'fr')를 하나 더 추가하고,
// LANGUAGE_LABELS와 LOCALE_BY_LANG에도 같은 키를 추가해주세요.

var SUPPORTED_LANGS = ['ko', 'en', 'ja', 'zh'];
var DEFAULT_LANG = 'en'; // 브라우저 언어를 모를 때 사용할 기본값

// 우측 상단 언어 선택 버튼에 표시할 짧은 라벨
var LANGUAGE_LABELS = {
  ko: 'KO',
  en: 'EN',
  ja: 'JP',
  zh: 'CN'
};

// 숫자 포맷(1,234 형식의 자릿수 구분)에 사용할 로케일
var LOCALE_BY_LANG = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN'
};

// navigator.language(브라우저 언어) 값을 우리 언어 코드로 매핑
function detectBrowserLang() {
  var candidates = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
  for (var i = 0; i < candidates.length; i++) {
    var prefix = String(candidates[i] || '').toLowerCase().split('-')[0];
    if (prefix === 'ko') return 'ko';
    if (prefix === 'en') return 'en';
    if (prefix === 'ja') return 'ja';
    if (prefix === 'zh') return 'zh';
  }
  return DEFAULT_LANG;
}

var LANG = {
  ko: {
    pageTitle: '서울 실시간 도시데이터',
    ytPromoTitle: '오늘 서울, 어땠나요?',
    ytPromoSubtitle: '하루 끝에 듣는 K-발라드 · FOXCREATIVE',

    // 지역 선택 상자 옆에 붙는 배지: 지역이 여러 곳이라는 걸 바로 알려준다
    areaCountBadge: '{n}개 지역',

    // 지역 이름 (지역 선택 버튼 + 상단 카드)
    areas: {
      gwanghwamun: '광화문·덕수궁',
      hongdae: '홍대 관광특구',
      gangnam: '강남역',
      yeouido: '여의도한강공원',
      seongsu: '성수카페거리',
      myeongdong: '명동 관광특구',
      dongdaemun: '동대문 관광특구',
      itaewon: '이태원 관광특구',
      gyeongbokgung: '경복궁',
      bukchon: '북촌한옥마을',
      insadong: '인사동',
      jamsil: '잠실 관광특구',
      namsan: '남산공원',
      ddp: 'DDP(동대문디자인플라자)'
    },

    // 긴급전화 기능: 하단 고정 SOS 버튼을 누르면 뜨는 목록에 쓰이는 문구.
    // 번호(domesticNumber/intlNumber)는 언어와 무관하게 항상 같은 값이라 각 언어 블록에
    // 그대로 반복해 둔다 (이 파일의 다른 항목들과 같은 방식).
    emergency: {
      fabAriaLabel: '긴급전화',
      modalTitle: '긴급 연락처',
      closeLabel: '닫기',
      domesticLabel: '국내용',
      intlLabel: '해외 로밍',
      // 내 위치 확인: '이 화면을 보여주세요' 문구는 언어와 무관하게 항상 한국어로 고정 표시하므로
      // (index.html의 LOCATION_SHOW_HINT_KO 상수) 여기 번역 목록에는 넣지 않는다.
      location: {
        title: '내 위치',
        idleDesc: '위급 상황에서 정확한 위치를 전달할 때 사용하세요',
        buttonIdle: '내 위치 확인하기',
        locating: '위치를 확인하는 중...',
        coordsLabel: '위도·경도',
        copyAddress: '주소 복사',
        copyCoords: '좌표 복사',
        copied: '복사했어요',
        addressUnavailableNote: '주소를 찾지 못했어요. 아래 좌표를 대신 보여주세요.',
        errorTitle: '위치를 확인할 수 없어요',
        errorReasons: {
          permissionDenied: '위치 권한이 거부됐어요. 브라우저 설정에서 위치 권한을 허용한 뒤 다시 시도해주세요.',
          unavailable: '위치를 확인할 수 없어요. GPS나 인터넷 연결을 확인해주세요.',
          timeout: '위치 확인이 시간 초과됐어요. 다시 시도해주세요.',
          unsupported: '이 기기(브라우저)는 위치 확인 기능을 지원하지 않아요.'
        },
        errorFallbackIntro: '대신 아래 1330 관광통역안내로 전화해서 도움을 요청하세요',
        refresh: '다시 확인',
        showToNearbyHint: '이 화면을 주변 사람에게 보여주세요'
      },
      sections: [
        {
          key: 'emergency',
          title: '긴급 (생명이 위급할 때)',
          contacts: [
            {
              id: 'police',
              name: '112 경찰',
              hours: '24시간',
              desc: '생명이 위급하거나 범죄가 발생했을 때',
              domesticNumber: '112',
              domesticDisplay: '112',
              note: '로밍 중에도 국가번호 없이 그대로 눌러도 연결돼요'
            },
            {
              id: 'fire',
              name: '119 화재·구급',
              hours: '24시간',
              desc: '화재, 사고, 응급환자가 발생했을 때',
              domesticNumber: '119',
              domesticDisplay: '119',
              note: '로밍 중에도 국가번호 없이 그대로 눌러도 연결돼요'
            }
          ]
        },
        {
          key: 'multilingual',
          title: '다국어 상담 (24시간)',
          contacts: [
            {
              id: 't1330',
              name: '1330 관광통역안내',
              hours: '24시간 · 8개 언어',
              desc: '어디에 전화해야 할지 모르겠다면 이 번호로 먼저 연락하세요',
              domesticNumber: '1330',
              domesticDisplay: '1330',
              intlNumber: '+82-2-1330',
              intlDisplay: '+82-2-1330'
            },
            {
              id: 'bbb',
              name: '1588-5644 BBB 통역봉사',
              hours: '24시간 · 20개 언어',
              desc: '1330 통역이 안 되는 언어라면 이 번호로',
              domesticNumber: '1588-5644',
              domesticDisplay: '1588-5644',
              intlNumber: '+82-1588-5644',
              intlDisplay: '+82-1588-5644',
              note: '통신사에 따라 국제전화 연결이 안 될 수 있어요'
            }
          ]
        },
        {
          key: 'weekday',
          title: '평일 상담',
          contacts: [
            {
              id: 'dasan120',
              name: '02-120 서울시 다산콜',
              hours: '평일 09:00~18:00',
              desc: '대중교통·생활 민원 등 서울시 문의 (9번 → 1 영어 · 2 중국어 · 3 일본어)',
              domesticNumber: '02-120',
              domesticDisplay: '02-120',
              intlNumber: '+82-2-731-2120',
              intlDisplay: '+82-2-731-2120'
            },
            {
              id: 'help1345',
              name: '1345 외국인종합안내센터',
              hours: '평일 09:00~22:00 · 20개 언어',
              desc: '체류·비자 등 출입국 관련 문의가 있을 때',
              domesticNumber: '1345',
              domesticDisplay: '1345',
              intlNumber: '+82-1345',
              intlDisplay: '+82-1345'
            }
          ]
        }
      ],

      // 상황별 안내: 버튼을 누르면 그 상황에 맞는 단계가 펼쳐진다.
      // 각 단계는 type으로 렌더링 방식이 갈린다 — 'contact'는 위 sections에 있는
      // 번호(contactRef)의 전화 버튼을 그대로 재사용하고, 'action'은 버튼을 눌렀을 때
      // 위치 확인을 실행하거나 대사관 섹션으로 스크롤한다 (index.html에서 처리).
      situations: {
        title: '상황별 안내',
        items: [
          {
            id: 'passport',
            label: '여권을 잃어버렸어요',
            steps: [
              { type: 'contact', contactRef: 'police', text: '112 또는 가까운 경찰서에서 분실 신고' },
              { type: 'text', text: '신고확인서(분실확인서) 받기' },
              { type: 'action', action: 'embassy', text: '자국 대사관에 연락하기' }
            ]
          },
          {
            id: 'sick',
            label: '아파요 / 다쳤어요',
            steps: [
              { type: 'contact', contactRef: 'fire', text: '생명이 위급하면' },
              { type: 'contact', contactRef: 't1330', text: '그 정도가 아니면 (통역 지원)' }
            ]
          },
          {
            id: 'theft',
            label: '소매치기 / 도난당했어요',
            steps: [
              { type: 'contact', contactRef: 'police', text: '112에 신고하세요 (통역 지원 요청 가능)' }
            ]
          },
          {
            id: 'lost',
            label: '길을 잃었어요',
            steps: [
              { type: 'action', action: 'location', text: '내 위치를 확인해서 보여주세요' },
              { type: 'contact', contactRef: 't1330', text: '1330에 전화해서 도움을 요청하세요' }
            ]
          },
          {
            id: 'unsure',
            label: '어디에 연락해야 할지 모르겠어요',
            steps: [
              { type: 'contact', contactRef: 't1330', text: '1330으로 전화하면 모든 상황을 24시간 다국어로 안내해줍니다' }
            ]
          }
        ]
      },

      // 대사관 연락처: 언어별로 해당 언어 사용자에게 맞는 대사관/영사 연락처만 넣는다.
      // 번호는 전부 각 대사관 공식 홈페이지에서 직접 확인한 값이다 (추측 금지).
      // 주소(addressKo)는 택시기사에게 보여줄 수 있도록 항상 한국어로 적는다.
      embassies: {
        sectionTitle: '대사관 연락처',
        toggleShow: '대사관 연락처 보기',
        toggleHide: '대사관 연락처 접기',
        contacts: [
          {
            id: 'callcenter',
            name: '외교부 영사콜센터',
            hours: '24시간',
            desc: '해외에서 사건사고, 통역, 영사 업무 등 도움이 필요할 때',
            numbers: [
              { label: '전화', tel: '+82-2-3210-0404', display: '+82-2-3210-0404' }
            ],
            note: '해외 로밍으로 걸면 유료예요. "영사안전콜센터 무료전화" 앱을 쓰면 무료예요.'
          }
        ]
      }
    },

    // 혼잡도 4단계 표시 텍스트 (키는 서울시 API가 내려주는 원래 값)
    congestLevels: {
      '여유': '여유',
      '보통': '보통',
      '약간 붐빔': '약간 붐빔',
      '붐빔': '붐빔'
    },
    noInfo: '정보 없음',

    // 혼잡도 설명 문구 (헤더 카드 안내문). '여유'는 서울시 API가 실제로 내려주는 문구,
    // 나머지 3단계는 같은 톤으로 자체 작성한 안내문입니다.
    congestMsg: {
      '여유': '사람이 몰려있을 가능성이 낮고 붐빔은 거의 느껴지지 않아요. 도보 이동이 자유로워요.',
      '보통': '사람이 어느 정도 있지만 크게 붐비지는 않아요. 도보 이동에 큰 불편은 없어요.',
      '약간 붐빔': '사람이 많아 붐빔이 느껴질 수 있어요. 도보 이동이 다소 불편할 수 있어요.',
      '붐빔': '사람이 많이 몰려 있어 붐빔이 뚜렷하게 느껴져요. 도보 이동이 불편할 수 있어요.'
    },

    forecastTitle: '12시간 인구 예측',
    eventsTitle: '문화행사',
    eventsTitleSeoul: '서울의 문화행사',
    endingSoon: '곧 종료',
    nowTag: '지금',
    nowWithTime: '지금 ({time})',
    asOf: '{time} 기준',
    countUnit: '{n}명',
    loading: '불러오는 중...',
    retry: '다시 시도',
    nearbyTitle: '이 근처',
    nearbyConvenienceTitle: '편의점',
    nearbyLockerTitle: '짐 보관함',
    nearbyCountUnit: '{n}곳',
    nearbyMoreLabel: '더보기 (+{n})',
    nearbyLessLabel: '접기',
    walkLabel: '도보 {min}분 · {distance}m',

    // 짐 보관함 데이터에 실제로 등장하는 역명(용답역 제외 — 좌표 데이터 자체 오류로
    // 제외함). 한국어 모드는 원본 역명을 그대로 쓰므로 이 표는 필요 없다.
    stationNames: {},

    noEvents: '현재 등록된 문화행사가 없습니다.',
    noTitle: '(제목 없음)',
    errorTitle: '데이터를 불러오지 못했습니다.',

    // 클라이언트에서 직접 만드는 에러 문구
    clientErrors: {
      abort: '요청 시간이 너무 오래 걸려 중단했습니다.',
      parseFailed: '서버 응답을 해석하지 못했습니다 (상태 코드 {status})',
      unknown: '알 수 없는 오류 (상태 코드 {status})',
      network: '서버에 연결하지 못했습니다. 인터넷 연결을 확인해주세요.'
    },

    // 서버(server.js)가 내려주는 에러 코드 -> 화면 문구
    serverErrors: {
      UNKNOWN_AREA: '알 수 없는 지역입니다: {area}',
      MISSING_API_KEY: '서버에 SEOUL_API_KEY가 설정되어 있지 않습니다. .env 파일을 확인해주세요.',
      API_TIMEOUT: '서울시 API 응답이 너무 느립니다. 잠시 후 다시 시도해주세요.',
      API_FETCH_FAILED: '서울시 API 호출에 실패했습니다: {detail}',
      API_HTTP_ERROR: '서울시 API 오류 (상태 코드 {status})',
      API_PARSE_ERROR: '서울시 API 응답을 해석하지 못했습니다.',
      API_RESULT_ERROR: '서울시 API가 오류를 반환했습니다.',
      MISSING_CITYDATA: '서울시 API 응답에 CITYDATA가 없습니다.',
      UNCAUGHT_ERROR: '알 수 없는 오류가 발생했습니다: {detail}'
    }
  },

  en: {
    pageTitle: 'Seoul Real-Time City Data',
    ytPromoTitle: 'How was Seoul today?',
    ytPromoSubtitle: 'K-Ballads to end your day · FOXCREATIVE',

    areaCountBadge: '{n} areas',

    areas: {
      gwanghwamun: 'Gwanghwamun · Deoksugung',
      hongdae: 'Hongdae Special Tourist Zone',
      gangnam: 'Gangnam Station',
      yeouido: 'Yeouido Hangang Park',
      seongsu: 'Seongsu Cafe Street',
      myeongdong: 'Myeongdong',
      dongdaemun: 'Dongdaemun Market',
      itaewon: 'Itaewon',
      gyeongbokgung: 'Gyeongbokgung Palace',
      bukchon: 'Bukchon Hanok Village',
      insadong: 'Insadong',
      jamsil: 'Jamsil',
      namsan: 'Namsan Park (N Seoul Tower)',
      ddp: 'DDP (Dongdaemun Design Plaza)'
    },

    emergency: {
      fabAriaLabel: 'Emergency call',
      modalTitle: 'Emergency Contacts',
      closeLabel: 'Close',
      domesticLabel: 'In Korea',
      intlLabel: 'From abroad',
      location: {
        title: 'My Location',
        idleDesc: 'Use this to share your exact location in an emergency',
        buttonIdle: 'Check My Location',
        locating: 'Getting your location...',
        coordsLabel: 'Lat, Lon',
        copyAddress: 'Copy Address',
        copyCoords: 'Copy Coordinates',
        copied: 'Copied',
        addressUnavailableNote: "Couldn't find an address — showing coordinates instead.",
        errorTitle: "Couldn't get your location",
        errorReasons: {
          permissionDenied: 'Location permission was denied. Please allow location access in your browser settings and try again.',
          unavailable: 'Your location could not be determined. Please check your GPS or internet connection.',
          timeout: 'The location request timed out. Please try again.',
          unsupported: "This device/browser doesn't support location services."
        },
        errorFallbackIntro: 'Call Tourist Info & Interpretation (1330) below for help instead',
        refresh: 'Check Again',
        showToNearbyHint: 'Show this screen to someone nearby'
      },
      sections: [
        {
          key: 'emergency',
          title: 'Emergency (life-threatening)',
          contacts: [
            {
              id: 'police',
              name: 'Police (112)',
              hours: '24/7',
              desc: 'Life-threatening danger or a crime in progress',
              domesticNumber: '112',
              domesticDisplay: '112',
              note: 'Works even while roaming — no country code needed'
            },
            {
              id: 'fire',
              name: 'Fire & Ambulance (119)',
              hours: '24/7',
              desc: 'Fire, accidents, or a medical emergency',
              domesticNumber: '119',
              domesticDisplay: '119',
              note: 'Works even while roaming — no country code needed'
            }
          ]
        },
        {
          key: 'multilingual',
          title: 'Multilingual Help (24/7)',
          contacts: [
            {
              id: 't1330',
              name: 'Tourist Info & Interpretation (1330)',
              hours: '24/7 · 8 languages',
              desc: 'Not sure who to call? Start here',
              domesticNumber: '1330',
              domesticDisplay: '1330',
              intlNumber: '+82-2-1330',
              intlDisplay: '+82-2-1330'
            },
            {
              id: 'bbb',
              name: 'BBB Interpretation Volunteers (1588-5644)',
              hours: '24/7 · 20 languages',
              desc: "For languages 1330 doesn't cover",
              domesticNumber: '1588-5644',
              domesticDisplay: '1588-5644',
              intlNumber: '+82-1588-5644',
              intlDisplay: '+82-1588-5644',
              note: 'May not connect on some carriers'
            }
          ]
        },
        {
          key: 'weekday',
          title: 'Weekday Help',
          contacts: [
            {
              id: 'dasan120',
              name: 'Seoul Dasan Call Center (120)',
              hours: 'Weekdays 09:00–18:00',
              desc: 'Seoul city services & daily-life questions (press 9, then 1 English / 2 Chinese / 3 Japanese)',
              domesticNumber: '02-120',
              domesticDisplay: '02-120',
              intlNumber: '+82-2-731-2120',
              intlDisplay: '+82-2-731-2120'
            },
            {
              id: 'help1345',
              name: 'Immigration Contact Center (1345)',
              hours: 'Weekdays 09:00–22:00 · 20 languages',
              desc: 'Visa & immigration questions',
              domesticNumber: '1345',
              domesticDisplay: '1345',
              intlNumber: '+82-1345',
              intlDisplay: '+82-1345'
            }
          ]
        }
      ],

      situations: {
        title: 'Guide by Situation',
        items: [
          {
            id: 'passport',
            label: 'I lost my passport',
            steps: [
              { type: 'contact', contactRef: 'police', text: 'Report the loss to 112 or the nearest police station' },
              { type: 'text', text: 'Get a police report (loss confirmation document)' },
              { type: 'action', action: 'embassy', text: 'Contact your embassy' }
            ]
          },
          {
            id: 'sick',
            label: "I'm sick / injured",
            steps: [
              { type: 'contact', contactRef: 'fire', text: "If it's life-threatening" },
              { type: 'contact', contactRef: 't1330', text: "If it's not that serious (interpretation available)" }
            ]
          },
          {
            id: 'theft',
            label: 'I was pickpocketed / robbed',
            steps: [
              { type: 'contact', contactRef: 'police', text: 'Report it to 112 (you can ask for interpretation)' }
            ]
          },
          {
            id: 'lost',
            label: "I'm lost",
            steps: [
              { type: 'action', action: 'location', text: 'Check and show your current location' },
              { type: 'contact', contactRef: 't1330', text: 'Call 1330 for help' }
            ]
          },
          {
            id: 'unsure',
            label: "I don't know who to call",
            steps: [
              { type: 'contact', contactRef: 't1330', text: 'Call 1330 — 24/7 multilingual guidance for any situation' }
            ]
          }
        ]
      },

      embassies: {
        sectionTitle: 'Embassy Contacts',
        toggleShow: 'Show embassy contacts',
        toggleHide: 'Hide embassy contacts',
        contacts: [
          {
            id: 'us',
            name: 'U.S. Embassy Seoul',
            hours: 'Mon–Fri (closed Wed afternoons & holidays)',
            desc: 'For U.S. citizens needing emergency consular help',
            numbers: [
              { label: 'Phone (24/7 emergency)', tel: '02-397-4114', display: '02-397-4114' }
            ],
            addressKo: '서울특별시 종로구 세종대로 188'
          },
          {
            id: 'uk',
            name: 'British Embassy Seoul',
            hours: 'Appointment only — no walk-in phone line',
            desc: 'For emergencies, call the UK 24/7 Consular Contact Centre and select "Consular services for British nationals"',
            numbers: [
              { label: 'UK 24/7 Consular Centre', tel: '+44-20-7008-5000', display: '+44 (0)20 7008 5000' }
            ],
            addressKo: '서울특별시 중구 세종대로19길 24'
          },
          {
            id: 'canada',
            name: 'Embassy of Canada Seoul',
            hours: 'Mon–Fri, business hours',
            desc: 'After hours, call the 24/7 centre in Ottawa (collect calls accepted where available)',
            numbers: [
              { label: 'Seoul office', tel: '02-3783-6000', display: '02-3783-6000' },
              { label: '24/7 Emergency (Ottawa)', tel: '+1-613-996-8885', display: '+1 613 996 8885' }
            ],
            addressKo: '서울특별시 중구 정동길 21'
          },
          {
            id: 'australia',
            name: 'Australian Embassy Seoul',
            hours: 'Mon–Fri 9:00–12:30, 13:30–17:00',
            desc: 'After hours, call the 24-hour consular emergency line in Canberra',
            numbers: [
              { label: 'Seoul office', tel: '02-2003-0100', display: '02-2003-0100' },
              { label: '24hr Emergency (Canberra)', tel: '+61-2-6261-3305', display: '+61 2 6261 3305' }
            ],
            addressKo: '서울특별시 종로구 종로 1, 교보빌딩 19층'
          }
        ]
      }
    },

    congestLevels: {
      '여유': 'Relaxed',
      '보통': 'Normal',
      '약간 붐빔': 'Slightly Crowded',
      '붐빔': 'Crowded'
    },
    noInfo: 'No information',

    congestMsg: {
      '여유': "It's unlikely to be crowded and congestion is barely noticeable. Walking around is easy.",
      '보통': "There are some people around, but it isn't very crowded. Walking around should be fairly comfortable.",
      '약간 붐빔': 'There are quite a few people, so you may notice some congestion. Walking around could be a bit inconvenient.',
      '붐빔': 'The area is crowded with many people, and congestion is clearly noticeable. Walking around may be inconvenient.'
    },

    forecastTitle: '12-Hour Population Forecast',
    eventsTitle: 'Cultural Events',
    eventsTitleSeoul: 'Cultural Events in Seoul',
    endingSoon: 'Ending Soon',
    nowTag: 'Now',
    nowWithTime: 'Now ({time})',
    asOf: 'As of {time}',
    countUnit: '{n} people',
    loading: 'Loading...',
    retry: 'Retry',
    nearbyTitle: 'Nearby',
    nearbyConvenienceTitle: 'Convenience Stores',
    nearbyLockerTitle: 'Luggage Storage',
    nearbyCountUnit: '{n} locations',
    nearbyMoreLabel: 'Show {n} more',
    nearbyLessLabel: 'Show less',
    walkLabel: '{min} min walk · {distance}m',

    stationNames: {
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
      '녹사평': 'Noksapyeong'
    },

    noEvents: 'There are no cultural events listed right now.',
    noTitle: '(Untitled)',
    errorTitle: 'Failed to load data.',

    clientErrors: {
      abort: 'The request took too long and was cancelled.',
      parseFailed: 'Could not parse the server response (status code {status})',
      unknown: 'Unknown error (status code {status})',
      network: 'Could not connect to the server. Please check your internet connection.'
    },

    serverErrors: {
      UNKNOWN_AREA: 'Unknown area: {area}',
      MISSING_API_KEY: 'SEOUL_API_KEY is not set on the server. Please check the .env file.',
      API_TIMEOUT: 'The Seoul API response is too slow. Please try again shortly.',
      API_FETCH_FAILED: 'Failed to call the Seoul API: {detail}',
      API_HTTP_ERROR: 'Seoul API error (status code {status})',
      API_PARSE_ERROR: 'Could not parse the Seoul API response.',
      API_RESULT_ERROR: 'The Seoul API returned an error.',
      MISSING_CITYDATA: 'The Seoul API response did not include CITYDATA.',
      UNCAUGHT_ERROR: 'An unknown error occurred: {detail}'
    }
  },

  ja: {
    pageTitle: 'ソウル リアルタイム都市データ',
    ytPromoTitle: '今日のソウル、どうでしたか？',
    ytPromoSubtitle: '一日の終わりにKバラード · FOXCREATIVE',

    areaCountBadge: '{n}エリア',

    areas: {
      gwanghwamun: '光化門・徳寿宮',
      hongdae: '弘大観光特区',
      gangnam: '江南駅',
      yeouido: '汝矣島漢江公園',
      seongsu: '聖水カフェ通り',
      myeongdong: '明洞',
      dongdaemun: '東大門市場',
      itaewon: '梨泰院',
      gyeongbokgung: '景福宮',
      bukchon: '北村韓屋村',
      insadong: '仁寺洞',
      jamsil: '蚕室',
      namsan: '南山公園(Nソウルタワー)',
      ddp: 'DDP(東大門デザインプラザ)'
    },

    emergency: {
      fabAriaLabel: '緊急電話',
      modalTitle: '緊急連絡先',
      closeLabel: '閉じる',
      domesticLabel: '韓国国内から',
      intlLabel: '海外ローミング',
      location: {
        title: '現在地',
        idleDesc: '緊急時に正確な位置を伝えるために使ってください',
        buttonIdle: '現在地を確認する',
        locating: '現在地を確認しています...',
        coordsLabel: '緯度・経度',
        copyAddress: '住所をコピー',
        copyCoords: '座標をコピー',
        copied: 'コピーしました',
        addressUnavailableNote: '住所が見つかりませんでした。代わりに座標を表示します。',
        errorTitle: '現在地を確認できません',
        errorReasons: {
          permissionDenied: '位置情報の権限が拒否されました。ブラウザの設定で位置情報を許可してから、もう一度お試しください。',
          unavailable: '現在地を確認できません。GPSやインターネット接続をご確認ください。',
          timeout: '現在地の確認がタイムアウトしました。もう一度お試しください。',
          unsupported: 'この端末・ブラウザは位置情報機能に対応していません。'
        },
        errorFallbackIntro: '代わりに下の観光通訳案内(1330)に電話して助けを求めてください',
        refresh: 'もう一度確認',
        showToNearbyHint: 'この画面を近くの人に見せてください'
      },
      sections: [
        {
          key: 'emergency',
          title: '緊急(命の危険があるとき)',
          contacts: [
            {
              id: 'police',
              name: '警察 (112)',
              hours: '24時間',
              desc: '生命の危険や犯罪が発生したとき',
              domesticNumber: '112',
              domesticDisplay: '112',
              note: 'ローミング中でも国番号なしでそのままかけられます'
            },
            {
              id: 'fire',
              name: '消防・救急 (119)',
              hours: '24時間',
              desc: '火災、事故、急病人が発生したとき',
              domesticNumber: '119',
              domesticDisplay: '119',
              note: 'ローミング中でも国番号なしでそのままかけられます'
            }
          ]
        },
        {
          key: 'multilingual',
          title: '多言語相談(24時間)',
          contacts: [
            {
              id: 't1330',
              name: '観光通訳案内 (1330)',
              hours: '24時間・8言語対応',
              desc: 'どこに電話すればいいか分からない時はまずこちら',
              domesticNumber: '1330',
              domesticDisplay: '1330',
              intlNumber: '+82-2-1330',
              intlDisplay: '+82-2-1330'
            },
            {
              id: 'bbb',
              name: 'BBB通訳ボランティア (1588-5644)',
              hours: '24時間・20言語対応',
              desc: '1330で対応していない言語はこちら',
              domesticNumber: '1588-5644',
              domesticDisplay: '1588-5644',
              intlNumber: '+82-1588-5644',
              intlDisplay: '+82-1588-5644',
              note: 'キャリアによっては繋がらないことがあります'
            }
          ]
        },
        {
          key: 'weekday',
          title: '平日相談',
          contacts: [
            {
              id: 'dasan120',
              name: 'ソウルダサンコールセンター (120)',
              hours: '平日9:00〜18:00',
              desc: '交通・生活に関するソウル市への問い合わせ(9→1英語・2中国語・3日本語)',
              domesticNumber: '02-120',
              domesticDisplay: '02-120',
              intlNumber: '+82-2-731-2120',
              intlDisplay: '+82-2-731-2120'
            },
            {
              id: 'help1345',
              name: '外国人総合案内センター (1345)',
              hours: '平日9:00〜22:00・20言語対応',
              desc: '在留・ビザなど出入国関連の問い合わせ',
              domesticNumber: '1345',
              domesticDisplay: '1345',
              intlNumber: '+82-1345',
              intlDisplay: '+82-1345'
            }
          ]
        }
      ],

      situations: {
        title: '状況別ガイド',
        items: [
          {
            id: 'passport',
            label: 'パスポートをなくしました',
            steps: [
              { type: 'contact', contactRef: 'police', text: '112または最寄りの警察署に紛失届を出す' },
              { type: 'text', text: '盗難・紛失証明書を受け取る' },
              { type: 'action', action: 'embassy', text: '自国の大使館に連絡する' }
            ]
          },
          {
            id: 'sick',
            label: '具合が悪い／けがをした',
            steps: [
              { type: 'contact', contactRef: 'fire', text: '命に関わる場合は' },
              { type: 'contact', contactRef: 't1330', text: 'そうでない場合は(通訳あり)' }
            ]
          },
          {
            id: 'theft',
            label: 'スリ・盗難に遭いました',
            steps: [
              { type: 'contact', contactRef: 'police', text: '112に通報する(通訳依頼可能)' }
            ]
          },
          {
            id: 'lost',
            label: '道に迷いました',
            steps: [
              { type: 'action', action: 'location', text: '現在地を確認して見せる' },
              { type: 'contact', contactRef: 't1330', text: '1330に電話して助けを求める' }
            ]
          },
          {
            id: 'unsure',
            label: 'どこに連絡すればいいか分かりません',
            steps: [
              { type: 'contact', contactRef: 't1330', text: '1330に電話すれば、24時間多言語であらゆる状況を案内してくれます' }
            ]
          }
        ]
      },

      embassies: {
        sectionTitle: '大使館連絡先',
        toggleShow: '大使館連絡先を表示',
        toggleHide: '大使館連絡先を閉じる',
        contacts: [
          {
            id: 'japan',
            name: '在大韓民国日本国大使館 領事部',
            hours: '平日 9:30〜12:15, 13:15〜18:00(昼休みは電話不可)',
            desc: '旅券(パスポート)紛失やビザに関するお問い合わせ',
            numbers: [
              { label: '領事部', tel: '02-739-7400', display: '02-739-7400' },
              { label: '代表', tel: '02-2170-5200', display: '02-2170-5200' }
            ],
            addressKo: '서울특별시 종로구 율곡로 6 트윈트리타워 A동'
          }
        ]
      }
    },

    congestLevels: {
      '여유': '空いている',
      '보통': '普通',
      '약간 붐빔': 'やや混雑',
      '붐빔': '混雑'
    },
    noInfo: '情報なし',

    congestMsg: {
      '여유': '人が集まっている可能性は低く、混雑はほとんど感じられません。徒歩での移動もスムーズです。',
      '보통': 'ある程度人はいますが、大きな混雑ではありません。徒歩移動に大きな支障はありません。',
      '약간 붐빔': '人が多く、混雑を感じることがあります。徒歩移動がやや不便に感じられることがあります。',
      '붐빔': '多くの人で混み合っており、混雑がはっきり感じられます。徒歩移動が不便に感じられることがあります。'
    },

    forecastTitle: '12時間人口予測',
    eventsTitle: '文化イベント',
    eventsTitleSeoul: 'ソウルの文化イベント',
    endingSoon: 'まもなく終了',
    nowTag: '現在',
    nowWithTime: '現在 ({time})',
    asOf: '{time} 時点',
    countUnit: '{n}人',
    loading: '読み込み中...',
    retry: '再試行',
    nearbyTitle: 'この近く',
    nearbyConvenienceTitle: 'コンビニ',
    nearbyLockerTitle: 'コインロッカー',
    nearbyCountUnit: '{n}件',
    nearbyMoreLabel: 'さらに{n}件表示',
    nearbyLessLabel: '閉じる',
    walkLabel: '徒歩{min}分 · {distance}m',

    stationNames: {
      '강남': 'カンナム',
      '경복궁': 'キョンボックン',
      '광화문': 'クァンファムン',
      '동대문': 'トンデムン',
      '동대문역사문화공원': 'トンデムン歴史文化公園',
      '명동': 'ミョンドン',
      '성수': 'ソンス',
      '시청': 'シチョン',
      '안국': 'アングク',
      '여의나루': 'ヨイナル',
      '이태원': 'イテウォン',
      '잠실': 'チャムシル',
      '을지로3가': 'ウルジロ3ガ',
      '을지로입구': 'ウルジロイック',
      '종각': 'チョンガク',
      '청구': 'チョング',
      '충무로': 'チュンムロ',
      '홍대입구': 'ホンデイック',
      '회현': 'フェヒョン',
      '녹사평': 'ノクサピョン'
    },

    noEvents: '現在登録されている文化イベントはありません。',
    noTitle: '(タイトルなし)',
    errorTitle: 'データを読み込めませんでした。',

    clientErrors: {
      abort: 'リクエストの時間がかかりすぎたため中断しました。',
      parseFailed: 'サーバーの応答を解析できませんでした(ステータスコード {status})',
      unknown: '不明なエラー(ステータスコード {status})',
      network: 'サーバーに接続できませんでした。インターネット接続を確認してください。'
    },

    serverErrors: {
      UNKNOWN_AREA: '不明な地域です: {area}',
      MISSING_API_KEY: 'サーバーにSEOUL_API_KEYが設定されていません。.envファイルを確認してください。',
      API_TIMEOUT: 'ソウル市APIの応答が遅すぎます。しばらくしてから再試行してください。',
      API_FETCH_FAILED: 'ソウル市APIの呼び出しに失敗しました: {detail}',
      API_HTTP_ERROR: 'ソウル市APIエラー(ステータスコード {status})',
      API_PARSE_ERROR: 'ソウル市APIの応答を解析できませんでした。',
      API_RESULT_ERROR: 'ソウル市APIがエラーを返しました。',
      MISSING_CITYDATA: 'ソウル市APIの応答にCITYDATAが含まれていません。',
      UNCAUGHT_ERROR: '不明なエラーが発生しました: {detail}'
    }
  },

  zh: {
    pageTitle: '首尔实时城市数据',
    ytPromoTitle: '今天的首尔怎么样？',
    ytPromoSubtitle: '一天结束时听韩式抒情歌 · FOXCREATIVE',

    areaCountBadge: '{n}个地区',

    areas: {
      gwanghwamun: '光化门·德寿宫',
      hongdae: '弘大观光特区',
      gangnam: '江南站',
      yeouido: '汝矣岛汉江公园',
      seongsu: '圣水咖啡街',
      myeongdong: '明洞',
      dongdaemun: '东大门市场',
      itaewon: '梨泰院',
      gyeongbokgung: '景福宫',
      bukchon: '北村韩屋村',
      insadong: '仁寺洞',
      jamsil: '蚕室',
      namsan: '南山公园(首尔塔)',
      ddp: 'DDP(东大门设计广场)'
    },

    emergency: {
      fabAriaLabel: '紧急电话',
      modalTitle: '紧急联系电话',
      closeLabel: '关闭',
      domesticLabel: '韩国境内拨打',
      intlLabel: '境外/漫游拨打',
      location: {
        title: '我的位置',
        idleDesc: '紧急情况下用于准确告知您所在的位置',
        buttonIdle: '查看我的位置',
        locating: '正在获取位置...',
        coordsLabel: '纬度·经度',
        copyAddress: '复制地址',
        copyCoords: '复制坐标',
        copied: '已复制',
        addressUnavailableNote: '未能找到地址,将改为显示坐标。',
        errorTitle: '无法获取您的位置',
        errorReasons: {
          permissionDenied: '定位权限被拒绝。请在浏览器设置中允许访问位置信息后重试。',
          unavailable: '无法确定您的位置,请检查GPS或网络连接。',
          timeout: '获取位置超时,请重试。',
          unsupported: '此设备/浏览器不支持定位功能。'
        },
        errorFallbackIntro: '请改为拨打下方的旅游咨询及翻译(1330)寻求帮助',
        refresh: '重新获取',
        showToNearbyHint: '请把这个画面给附近的人看'
      },
      sections: [
        {
          key: 'emergency',
          title: '紧急(生命危险时)',
          contacts: [
            {
              id: 'police',
              name: '警察 (112)',
              hours: '24小时',
              desc: '生命危险或发生犯罪时',
              domesticNumber: '112',
              domesticDisplay: '112',
              note: '漫游状态下无需加国家代码,直接拨打即可'
            },
            {
              id: 'fire',
              name: '消防·急救 (119)',
              hours: '24小时',
              desc: '发生火灾、事故或急症时',
              domesticNumber: '119',
              domesticDisplay: '119',
              note: '漫游状态下无需加国家代码,直接拨打即可'
            }
          ]
        },
        {
          key: 'multilingual',
          title: '多语言咨询(24小时)',
          contacts: [
            {
              id: 't1330',
              name: '旅游咨询及翻译 (1330)',
              hours: '24小时·提供8种语言',
              desc: '不知道该打给谁?先拨打这个号码',
              domesticNumber: '1330',
              domesticDisplay: '1330',
              intlNumber: '+82-2-1330',
              intlDisplay: '+82-2-1330'
            },
            {
              id: 'bbb',
              name: 'BBB义务翻译服务 (1588-5644)',
              hours: '24小时·提供20种语言',
              desc: '1330未提供的语言可拨打此号码',
              domesticNumber: '1588-5644',
              domesticDisplay: '1588-5644',
              intlNumber: '+82-1588-5644',
              intlDisplay: '+82-1588-5644',
              note: '视运营商而定,可能无法接通'
            }
          ]
        },
        {
          key: 'weekday',
          title: '工作日咨询',
          contacts: [
            {
              id: 'dasan120',
              name: '首尔市茶山呼叫中心 (120)',
              hours: '工作日 09:00–18:00',
              desc: '首尔市交通、生活相关咨询(按9,再按1英语/2中文/3日语)',
              domesticNumber: '02-120',
              domesticDisplay: '02-120',
              intlNumber: '+82-2-731-2120',
              intlDisplay: '+82-2-731-2120'
            },
            {
              id: 'help1345',
              name: '外国人综合咨询中心 (1345)',
              hours: '工作日 09:00–22:00·提供20种语言',
              desc: '签证及出入境相关咨询',
              domesticNumber: '1345',
              domesticDisplay: '1345',
              intlNumber: '+82-1345',
              intlDisplay: '+82-1345'
            }
          ]
        }
      ],

      situations: {
        title: '按情况指南',
        items: [
          {
            id: 'passport',
            label: '护照丢了',
            steps: [
              { type: 'contact', contactRef: 'police', text: '向112或最近的警察局申报遗失' },
              { type: 'text', text: '领取遗失/被盗证明' },
              { type: 'action', action: 'embassy', text: '联系本国大使馆' }
            ]
          },
          {
            id: 'sick',
            label: '生病了/受伤了',
            steps: [
              { type: 'contact', contactRef: 'fire', text: '如果有生命危险' },
              { type: 'contact', contactRef: 't1330', text: '如果情况不严重(可提供翻译)' }
            ]
          },
          {
            id: 'theft',
            label: '被扒窃/被盗',
            steps: [
              { type: 'contact', contactRef: 'police', text: '拨打112报警(可请求翻译协助)' }
            ]
          },
          {
            id: 'lost',
            label: '迷路了',
            steps: [
              { type: 'action', action: 'location', text: '查看并出示您的当前位置' },
              { type: 'contact', contactRef: 't1330', text: '拨打1330寻求帮助' }
            ]
          },
          {
            id: 'unsure',
            label: '不知道该联系谁',
            steps: [
              { type: 'contact', contactRef: 't1330', text: '拨打1330,24小时提供多语言的全方位指引' }
            ]
          }
        ]
      },

      embassies: {
        sectionTitle: '大使馆联系方式',
        toggleShow: '显示大使馆联系方式',
        toggleHide: '收起大使馆联系方式',
        contacts: [
          {
            id: 'china',
            name: '中国驻韩国大使馆 领事部',
            hours: '工作日 09:00-12:00, 13:30-17:00',
            desc: '护照遗失、签证等领事咨询',
            numbers: [
              { label: '领事证件咨询', tel: '02-755-0568', display: '02-755-0568' },
              { label: '领事保护(紧急)', tel: '02-755-0572', display: '02-755-0572' }
            ],
            note: '线路繁忙时可拨打中国外交部全球领事保护与服务应急热线 +86-10-12308(在韩国拨打)'
          }
        ]
      }
    },

    congestLevels: {
      '여유': '空闲',
      '보통': '普通',
      '약간 붐빔': '较拥挤',
      '붐빔': '拥挤'
    },
    noInfo: '暂无信息',

    congestMsg: {
      '여유': '人群聚集的可能性较低,几乎感觉不到拥挤,步行通行较为自由。',
      '보통': '有一定人流,但不会感到明显拥挤,步行通行基本不受影响。',
      '약간 붐빔': '人较多,可能会感到一定拥挤,步行通行可能会有些不便。',
      '붐빔': '人群密集,拥挤感明显,步行通行可能会不便。'
    },

    forecastTitle: '12小时人口预测',
    eventsTitle: '文化活动',
    eventsTitleSeoul: '首尔的文化活动',
    endingSoon: '即将结束',
    nowTag: '现在',
    nowWithTime: '现在 ({time})',
    asOf: '截至 {time}',
    countUnit: '{n}人',
    loading: '正在加载...',
    retry: '重试',
    nearbyTitle: '附近',
    nearbyConvenienceTitle: '便利店',
    nearbyLockerTitle: '行李寄存柜',
    nearbyCountUnit: '{n}处',
    nearbyMoreLabel: '显示更多{n}处',
    nearbyLessLabel: '收起',
    walkLabel: '步行{min}分钟 · {distance}m',

    stationNames: {
      '강남': '江南',
      '경복궁': '景福宫',
      '광화문': '光化门',
      '동대문': '东大门',
      '동대문역사문화공원': '东大门历史文化公园',
      '명동': '明洞',
      '성수': '圣水',
      '시청': '市厅',
      '안국': '安国',
      '여의나루': '汝矣渡口',
      '이태원': '梨泰院',
      '잠실': '蚕室',
      '을지로3가': '乙支路3街',
      '을지로입구': '乙支路入口',
      '종각': '钟阁',
      '청구': '青丘',
      '충무로': '忠武路',
      '홍대입구': '弘大入口',
      '회현': '会贤',
      '녹사평': '绿莎坪'
    },

    noEvents: '目前没有已登记的文化活动。',
    noTitle: '(无标题)',
    errorTitle: '未能加载数据。',

    clientErrors: {
      abort: '请求耗时过长,已中止。',
      parseFailed: '无法解析服务器响应(状态码 {status})',
      unknown: '未知错误(状态码 {status})',
      network: '无法连接到服务器,请检查网络连接。'
    },

    serverErrors: {
      UNKNOWN_AREA: '未知的地区: {area}',
      MISSING_API_KEY: '服务器未配置 SEOUL_API_KEY,请检查 .env 文件。',
      API_TIMEOUT: '首尔市 API 响应过慢,请稍后重试。',
      API_FETCH_FAILED: '调用首尔市 API 失败: {detail}',
      API_HTTP_ERROR: '首尔市 API 错误(状态码 {status})',
      API_PARSE_ERROR: '无法解析首尔市 API 的响应。',
      API_RESULT_ERROR: '首尔市 API 返回了错误。',
      MISSING_CITYDATA: '首尔市 API 响应中不包含 CITYDATA。',
      UNCAUGHT_ERROR: '发生未知错误: {detail}'
    }
  }
};

// "{name}" 형태의 자리표시자를 params 객체 값으로 치환
function formatTemplate(str, params) {
  if (!str) return '';
  return str.replace(/\{(\w+)\}/g, function (match, key) {
    return (params && params[key] !== undefined) ? params[key] : match;
  });
}
