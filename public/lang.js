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
      ]
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
      ]
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
      ]
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
      ]
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
