// ══ 샘플 데이터 ══
// ══════════════════════════════
// 샘플 데이터
// ══════════════════════════════
const SAMPLE_JOBS = [
  { id:'j001', company:'삼성전자', title:'반도체 생산기술', location:'수원', salary:'월 280만원~', headcount:5, deadline:'2025-05-31', status:'open', recommendation:true, recCount:3, tags:['대기업','기숙사','식대제공'], detail:'반도체 생산라인 기술직 모집. 4대보험, 기숙사, 식대 제공. 2교대 근무.', views:124, applyCount:8, interestCount:12, createdAt:'2025-04-20' },
  { id:'j002', company:'LG에너지솔루션', title:'배터리 품질관리', location:'오창', salary:'월 260만원~', headcount:3, deadline:'2025-05-15', status:'open', recommendation:false, recCount:0, tags:['대기업','통근버스','성과급'], detail:'배터리 셀 품질검사 및 공정관리. 주간근무, 통근버스, 중식 제공.', views:98, applyCount:5, interestCount:9, createdAt:'2025-04-18' },
  { id:'j003', company:'현대자동차', title:'설비보전', location:'울산', salary:'월 300만원~', headcount:4, deadline:'2025-06-10', status:'open', recommendation:true, recCount:4, tags:['대기업','기숙사','학자금'], detail:'자동차 생산설비 유지보수. 3교대, 기숙사, 학자금 지원.', views:187, applyCount:12, interestCount:21, createdAt:'2025-04-15' },
  { id:'j004', company:'포스코', title:'제철설비 운전', location:'포항', salary:'월 270만원~', headcount:6, deadline:'2025-05-20', status:'open', recommendation:false, recCount:0, tags:['대기업','기숙사','교대근무'], detail:'제철설비 운전 및 관리. 기숙사 제공, 4조 3교대.', views:76, applyCount:3, interestCount:7, createdAt:'2025-04-17' },
  { id:'j005', company:'KCC글라스', title:'유리 생산관리', location:'수원', salary:'월 240만원~', headcount:2, deadline:'2025-05-05', status:'closed', recommendation:false, recCount:0, tags:['중견기업','4대보험'], detail:'유리 생산라인 관리 및 품질검사.', views:54, applyCount:2, interestCount:4, createdAt:'2025-04-10' },
  { id:'j006', company:'SK하이닉스', title:'반도체 공정', location:'이천', salary:'월 290만원~', headcount:8, deadline:'2025-06-30', status:'open', recommendation:true, recCount:5, tags:['대기업','기숙사','학자금','복지우수'], detail:'반도체 제조공정 운영 및 관리. 탁월한 복지 제공.', views:203, applyCount:15, interestCount:28, createdAt:'2025-04-12' },
];

const SAMPLE_STATS = [
  { dept:'화학공업과',     graduates:20, hope:18, employed:17, rate:94 },
  { dept:'사물인터넷과',   graduates:22, hope:20, employed:18, rate:90 },
  { dept:'로봇설계과',     graduates:18, hope:16, employed:15, rate:94 },
  { dept:'3D융합콘텐츠과', graduates:20, hope:17, employed:14, rate:82 },
  { dept:'전자과',         graduates:24, hope:22, employed:20, rate:91 },
  { dept:'소방전기과',     graduates:22, hope:19, employed:18, rate:95 },
  { dept:'환경과',         graduates:18, hope:15, employed:13, rate:87 },
  { dept:'레저스포츠과',   graduates:16, hope:14, employed:12, rate:86 },
  { dept:'반도체계약학과', graduates:20, hope:19, employed:19, rate:95 },
  { dept:'경찰사무행정과', graduates:18, hope:12, employed:10, rate:83 },
];

const SAMPLE_COMPANIES = [
  { company:'삼성전자', count:8, year:2025, employees:[
    { name:'김민준', dept:'반도체계약학과',
      attend:[ {grade:'1학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:1,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ],
      grades:[ {category:'보통교과',subject:'수학',unit:4,score:88,achieve:'B',rank:2}, {category:'전문교과',subject:'반도체공정',unit:6,score:92,achieve:'A',rank:1} ],
      certs:['산업기사(전기)','기능사(반도체)'],
      clubs:[ {grade:'1학년',name:'로봇제작반',activity:'아두이노 기반 라인트레이서 제작'}, {grade:'2학년',name:'반도체연구반',activity:'반도체 공정 실습 및 견학'}, {grade:'3학년',name:'반도체연구반',activity:'FAB 공정 모의실험'} ],
      leader:[ {grade:'1학년',semester:'1학기',role:'반장'}, {grade:'2학년',semester:'1학기',role:'부반장'} ]
    },
    { name:'이서연', dept:'반도체계약학과',
      attend:[ {grade:'1학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:2,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ],
      grades:[ {category:'보통교과',subject:'국어',unit:4,score:82,achieve:'B',rank:3}, {category:'전문교과',subject:'반도체설계',unit:6,score:89,achieve:'A',rank:2} ],
      certs:['기능사(전자)'],
      clubs:[ {grade:'1학년',name:'코딩반',activity:'파이썬 기초 프로그래밍'}, {grade:'2학년',name:'반도체연구반',activity:'공정 시뮬레이션 실습'}, {grade:'3학년',name:'반도체연구반',activity:'취업 포트폴리오 제작'} ],
      leader:[]
    },
    { name:'박지훈', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자회로',unit:6,score:90,achieve:'A',rank:1} ], certs:['기능사(전자기기)'], clubs:[ {grade:'1학년',name:'전자공작반',activity:'LED 회로 설계'}, {grade:'2학년',name:'전자공작반',activity:'PCB 설계'}, {grade:'3학년',name:'전자공작반',activity:'IoT 프로젝트'} ], leader:[ {grade:'3학년',semester:'1학기',role:'반장'} ] },
    { name:'최예린', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:1,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자회로',unit:6,score:85,achieve:'B',rank:3} ], certs:['기능사(전자)','기능사(전기)'], clubs:[ {grade:'1학년',name:'과학탐구반',activity:'기초 물리 실험'}, {grade:'2학년',name:'전자공작반',activity:'회로 설계 실습'}, {grade:'3학년',name:'전자공작반',activity:'IoT 센서 프로젝트'} ], leader:[] },
    { name:'정우성', dept:'반도체계약학과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'반도체공정',unit:6,score:94,achieve:'A',rank:1} ], certs:['산업기사(반도체)'], clubs:[ {grade:'1학년',name:'수학경시반',activity:'올림피아드 준비'}, {grade:'2학년',name:'반도체연구반',activity:'공정 실습'}, {grade:'3학년',name:'반도체연구반',activity:'현장실습 연계 프로젝트'} ], leader:[ {grade:'1학년',semester:'2학기',role:'부반장'}, {grade:'2학년',semester:'1학기',role:'반장'}, {grade:'2학년',semester:'2학기',role:'반장'} ] },
    { name:'한소희', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자기기',unit:4,score:88,achieve:'B',rank:2} ], certs:['기능사(전자기기)'], clubs:[ {grade:'1학년',name:'환경봉사반',activity:'교내 환경 캠페인'}, {grade:'2학년',name:'전자공작반',activity:'전자 회로 실습'}, {grade:'3학년',name:'전자공작반',activity:'졸업작품 제작'} ], leader:[] },
    { name:'오태양', dept:'반도체계약학과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'반도체설계',unit:6,score:91,achieve:'A',rank:2} ], certs:['기능사(반도체)','기능사(전기)'], clubs:[ {grade:'1학년',name:'로봇제작반',activity:'기초 로봇 제작'}, {grade:'2학년',name:'반도체연구반',activity:'공정 시뮬레이션'}, {grade:'3학년',name:'반도체연구반',activity:'FAB 공정 심화'} ], leader:[ {grade:'3학년',semester:'2학기',role:'부반장'} ] },
    { name:'임나은', dept:'반도체계약학과', attend:[ {grade:'1학년',days:190,absent:1,late:1,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'반도체공정',unit:6,score:86,achieve:'B',rank:4} ], certs:['기능사(반도체)'], clubs:[ {grade:'1학년',name:'미술반',activity:'디지털 드로잉'}, {grade:'2학년',name:'반도체연구반',activity:'공정 이론 학습'}, {grade:'3학년',name:'반도체연구반',activity:'포트폴리오 작성'} ], leader:[] },
  ]},
  { company:'SK하이닉스', count:6, year:2025, employees:[
    { name:'강민서', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자회로',unit:6,score:91,achieve:'A',rank:1} ], certs:['기능사(전자)','기능사(전기기사)'], clubs:[ {grade:'1학년',name:'코딩반',activity:'C언어 기초'}, {grade:'2학년',name:'전자공작반',activity:'회로 설계'}, {grade:'3학년',name:'전자공작반',activity:'반도체 공정 견학'} ], leader:[ {grade:'2학년',semester:'1학기',role:'반장'} ] },
    { name:'윤지호', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:0,late:2,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자기기',unit:4,score:87,achieve:'B',rank:2} ], certs:['기능사(전자기기)'], clubs:[ {grade:'1학년',name:'수학경시반',activity:'수학 문제 풀이'}, {grade:'2학년',name:'전자공작반',activity:'PCB 설계 실습'}, {grade:'3학년',name:'전자공작반',activity:'졸업작품 발표'} ], leader:[] },
    { name:'송예진', dept:'반도체계약학과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:1,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'반도체공정',unit:6,score:93,achieve:'A',rank:1} ], certs:['산업기사(반도체)'], clubs:[ {grade:'1학년',name:'화학탐구반',activity:'화학 실험 기초'}, {grade:'2학년',name:'반도체연구반',activity:'공정 실습'}, {grade:'3학년',name:'반도체연구반',activity:'현장실습 보고서 작성'} ], leader:[ {grade:'1학년',semester:'1학기',role:'부반장'}, {grade:'3학년',semester:'1학기',role:'반장'} ] },
    { name:'신동혁', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자회로',unit:6,score:84,achieve:'B',rank:4} ], certs:['기능사(전자)'], clubs:[ {grade:'1학년',name:'스포츠반',activity:'교내 체육대회 참가'}, {grade:'2학년',name:'전자공작반',activity:'회로 실습'}, {grade:'3학년',name:'전자공작반',activity:'IoT 프로젝트 발표'} ], leader:[] },
    { name:'백서현', dept:'반도체계약학과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:1,early:1,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'반도체설계',unit:6,score:90,achieve:'A',rank:2} ], certs:['기능사(반도체)','기능사(전기)'], clubs:[ {grade:'1학년',name:'독서반',activity:'독서 토론'}, {grade:'2학년',name:'반도체연구반',activity:'공정 이론'}, {grade:'3학년',name:'반도체연구반',activity:'취업 준비 프로젝트'} ], leader:[] },
    { name:'구자현', dept:'전자과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전자회로',unit:6,score:89,achieve:'A',rank:3} ], certs:['기능사(전자기기)','기능사(전기)'], clubs:[ {grade:'1학년',name:'로봇제작반',activity:'기초 로봇'}, {grade:'2학년',name:'전자공작반',activity:'아두이노 실습'}, {grade:'3학년',name:'전자공작반',activity:'졸업 작품 전시'} ], leader:[ {grade:'2학년',semester:'2학기',role:'반장'}, {grade:'3학년',semester:'1학기',role:'반장'}, {grade:'3학년',semester:'2학기',role:'반장'} ] },
  ]},
  { company:'현대자동차', count:5, year:2025, employees:[
    { name:'류준혁', dept:'로봇설계과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'로봇설계',unit:6,score:95,achieve:'A',rank:1} ], certs:['산업기사(기계)','기능사(용접)'], clubs:[ {grade:'1학년',name:'로봇제작반',activity:'기초 메카니즘 학습'}, {grade:'2학년',name:'로봇제작반',activity:'자율주행 로봇 제작'}, {grade:'3학년',name:'로봇제작반',activity:'로봇 경진대회 출전'} ], leader:[ {grade:'1학년',semester:'1학기',role:'반장'}, {grade:'1학년',semester:'2학기',role:'반장'} ] },
    { name:'나지은', dept:'로봇설계과', attend:[ {grade:'1학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'기계설계',unit:4,score:88,achieve:'B',rank:2} ], certs:['기능사(기계)'], clubs:[ {grade:'1학년',name:'환경봉사반',activity:'지역 환경 정화'}, {grade:'2학년',name:'로봇제작반',activity:'3D 프린팅 실습'}, {grade:'3학년',name:'로봇제작반',activity:'졸업작품 제작'} ], leader:[] },
    { name:'마태오', dept:'로봇설계과', attend:[ {grade:'1학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'로봇설계',unit:6,score:91,achieve:'A',rank:2} ], certs:['기능사(기계)','기능사(전기)'], clubs:[ {grade:'1학년',name:'수학경시반',activity:'수학 올림피아드'}, {grade:'2학년',name:'로봇제작반',activity:'PLC 제어 실습'}, {grade:'3학년',name:'로봇제작반',activity:'산업용 로봇 시뮬레이션'} ], leader:[ {grade:'3학년',semester:'1학기',role:'반장'} ] },
    { name:'서유진', dept:'소방전기과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:1,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전기설비',unit:6,score:86,achieve:'B',rank:3} ], certs:['기능사(소방설비)'], clubs:[ {grade:'1학년',name:'과학탐구반',activity:'기초 전기 실험'}, {grade:'2학년',name:'소방안전반',activity:'소방 시뮬레이션'}, {grade:'3학년',name:'소방안전반',activity:'현장실습 연계'} ], leader:[] },
    { name:'어진우', dept:'로봇설계과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'기계설계',unit:4,score:83,achieve:'B',rank:4} ], certs:['기능사(기계)'], clubs:[ {grade:'1학년',name:'독서반',activity:'독서 논술'}, {grade:'2학년',name:'로봇제작반',activity:'센서 제어 실습'}, {grade:'3학년',name:'로봇제작반',activity:'졸업 작품 발표'} ], leader:[] },
  ]},
  { company:'LG에너지솔루션', count:4, year:2025, employees:[
    { name:'전하은', dept:'화학공업과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'화학공정',unit:6,score:92,achieve:'A',rank:1} ], certs:['기능사(화학)','산업기사(화공)'], clubs:[ {grade:'1학년',name:'화학탐구반',activity:'기초 화학 실험'}, {grade:'2학년',name:'화학탐구반',activity:'배터리 소재 연구'}, {grade:'3학년',name:'화학탐구반',activity:'에너지 소재 프로젝트'} ], leader:[ {grade:'2학년',semester:'1학기',role:'반장'} ] },
    { name:'조민재', dept:'화학공업과', attend:[ {grade:'1학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'공업화학',unit:4,score:87,achieve:'B',rank:3} ], certs:['기능사(화학)'], clubs:[ {grade:'1학년',name:'환경과학반',activity:'환경 분석 실험'}, {grade:'2학년',name:'화학탐구반',activity:'공정 실습'}, {grade:'3학년',name:'화학탐구반',activity:'취업 포트폴리오'} ], leader:[] },
    { name:'차은우', dept:'환경과', attend:[ {grade:'1학년',days:190,absent:0,late:2,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'환경분석',unit:6,score:84,achieve:'B',rank:2} ], certs:['기능사(환경)'], clubs:[ {grade:'1학년',name:'환경봉사반',activity:'환경 캠페인'}, {grade:'2학년',name:'환경과학반',activity:'수질 분석 실습'}, {grade:'3학년',name:'환경과학반',activity:'대기환경 모니터링'} ], leader:[] },
    { name:'표지수', dept:'화학공업과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:1,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'화학공정',unit:6,score:89,achieve:'A',rank:2} ], certs:['기능사(화학)','기능사(전기)'], clubs:[ {grade:'1학년',name:'수학경시반',activity:'수학 심화'}, {grade:'2학년',name:'화학탐구반',activity:'배터리 화학 실습'}, {grade:'3학년',name:'화학탐구반',activity:'현장실습 연계 프로젝트'} ], leader:[ {grade:'3학년',semester:'1학기',role:'부반장'} ] },
  ]},
  { company:'포스코', count:3, year:2025, employees:[
    { name:'하준서', dept:'사물인터넷과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'IoT시스템',unit:6,score:93,achieve:'A',rank:1} ], certs:['기능사(전자)','기능사(전기)'], clubs:[ {grade:'1학년',name:'코딩반',activity:'파이썬 기초'}, {grade:'2학년',name:'IoT연구반',activity:'스마트홈 구현'}, {grade:'3학년',name:'IoT연구반',activity:'스마트 팩토리 프로젝트'} ], leader:[ {grade:'2학년',semester:'1학기',role:'반장'}, {grade:'3학년',semester:'1학기',role:'반장'} ] },
    { name:'허유나', dept:'사물인터넷과', attend:[ {grade:'1학년',days:190,absent:1,late:1,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'네트워크',unit:4,score:85,achieve:'B',rank:3} ], certs:['기능사(전자)'], clubs:[ {grade:'1학년',name:'환경봉사반',activity:'지역 봉사활동'}, {grade:'2학년',name:'IoT연구반',activity:'센서 네트워크 실습'}, {grade:'3학년',name:'IoT연구반',activity:'졸업작품 IoT 시스템'} ], leader:[] },
    { name:'황민찬', dept:'사물인터넷과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'IoT시스템',unit:6,score:88,achieve:'B',rank:2} ], certs:['기능사(전자)','기능사(전기)'], clubs:[ {grade:'1학년',name:'로봇제작반',activity:'아두이노 기초'}, {grade:'2학년',name:'IoT연구반',activity:'라즈베리파이 실습'}, {grade:'3학년',name:'IoT연구반',activity:'스마트 팩토리 구현'} ], leader:[ {grade:'1학년',semester:'2학기',role:'부반장'} ] },
  ]},
  { company:'KCC글라스', count:3, year:2024, employees:[
    { name:'고은비', dept:'소방전기과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:1,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'소방설비',unit:6,score:87,achieve:'B',rank:2} ], certs:['기능사(소방설비)'], clubs:[ {grade:'1학년',name:'과학탐구반',activity:'기초 물리 실험'}, {grade:'2학년',name:'소방안전반',activity:'소방 시뮬레이션'}, {grade:'3학년',name:'소방안전반',activity:'현장실습 연계'} ], leader:[] },
    { name:'남준혁', dept:'소방전기과', attend:[ {grade:'1학년',days:190,absent:1,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:1,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'전기설비',unit:6,score:82,achieve:'B',rank:4} ], certs:['기능사(전기)'], clubs:[ {grade:'1학년',name:'스포츠반',activity:'교내 체육대회'}, {grade:'2학년',name:'소방안전반',activity:'소방 장비 실습'}, {grade:'3학년',name:'소방안전반',activity:'졸업작품 발표'} ], leader:[] },
    { name:'도현우', dept:'소방전기과', attend:[ {grade:'1학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'2학년',days:190,absent:0,late:0,early:0,miss:0}, {grade:'3학년',days:95,absent:0,late:0,early:0,miss:0} ], grades:[ {category:'전문교과',subject:'소방설비',unit:6,score:91,achieve:'A',rank:1} ], certs:['기능사(소방설비)','기능사(전기)'], clubs:[ {grade:'1학년',name:'독서반',activity:'독서 토론'}, {grade:'2학년',name:'소방안전반',activity:'소방 시뮬레이션'}, {grade:'3학년',name:'소방안전반',activity:'현장 소방 훈련'} ], leader:[ {grade:'2학년',semester:'1학기',role:'반장'}, {grade:'3학년',semester:'1학기',role:'반장'} ] },
  ]},
];

// ══ DEPT_DETAIL ══
const DEPT_DETAIL = [
  {
    dept: '반도체계약학과', graduates:20, employed:19, college:0, year:2025,
    students: [
      {name:'김민준',company:'삼성전자',job:'반도체 생산기술',salary:'월 280만원~',type:'정규직',year:2025},
      {name:'이서연',company:'삼성전자',job:'공정관리',salary:'월 280만원~',type:'정규직',year:2025},
      {name:'정우성',company:'삼성전자',job:'설비보전',salary:'월 280만원~',type:'정규직',year:2025},
      {name:'오태양',company:'삼성전자',job:'품질관리',salary:'월 280만원~',type:'정규직',year:2025},
      {name:'임나은',company:'삼성전자',job:'반도체 공정',salary:'월 275만원~',type:'정규직',year:2025},
      {name:'송예진',company:'SK하이닉스',job:'반도체 공정',salary:'월 290만원~',type:'정규직',year:2025},
      {name:'백서현',company:'SK하이닉스',job:'생산기술',salary:'월 285만원~',type:'정규직',year:2025},
      {name:'박은지',company:'DB하이텍',job:'반도체 생산',salary:'월 260만원~',type:'정규직',year:2025},
      {name:'최현우',company:'원익IPS',job:'장비엔지니어',salary:'월 270만원~',type:'정규직',year:2025},
      {name:'강지원',company:'동진쎄미켐',job:'화학공정',salary:'월 255만원~',type:'정규직',year:2025},
    ],
    college: [],
    trend: [{year:2023,employed:16,rate:84},{year:2024,employed:18,rate:90},{year:2025,employed:19,rate:95}]
  },
  {
    dept: '전자과', graduates:24, employed:22, college:1, year:2025,
    students: [
      {name:'박지훈',company:'삼성전자',job:'전자 생산',salary:'월 260만원~',type:'정규직',year:2025},
      {name:'최예린',company:'삼성전자',job:'품질검사',salary:'월 258만원~',type:'정규직',year:2025},
      {name:'한소희',company:'삼성전자',job:'설비관리',salary:'월 262만원~',type:'정규직',year:2025},
      {name:'강민서',company:'SK하이닉스',job:'전자회로 검사',salary:'월 270만원~',type:'정규직',year:2025},
      {name:'윤지호',company:'SK하이닉스',job:'생산기술',salary:'월 265만원~',type:'정규직',year:2025},
      {name:'신동혁',company:'SK하이닉스',job:'공정관리',salary:'월 260만원~',type:'정규직',year:2025},
      {name:'구자현',company:'SK하이닉스',job:'설비보전',salary:'월 268만원~',type:'정규직',year:2025},
      {name:'이준호',company:'LG전자',job:'전자 생산',salary:'월 250만원~',type:'정규직',year:2025},
      {name:'김서영',company:'삼성SDI',job:'전지 생산',salary:'월 255만원~',type:'정규직',year:2025},
      {name:'박민철',company:'LS일렉트릭',job:'전기전자 설비',salary:'월 245만원~',type:'정규직',year:2025},
    ],
    college: [
      {name:'이태양',univ:'한국산업기술대',major:'전자공학과',type:'특성화고 전형',year:2025}
    ],
    trend: [{year:2023,employed:19,rate:82},{year:2024,employed:20,rate:86},{year:2025,employed:22,rate:92}]
  },
  {
    dept: '로봇설계과', graduates:18, employed:17, college:1, year:2025,
    students: [
      {name:'류준혁',company:'현대자동차',job:'설비보전',salary:'월 300만원~',type:'정규직',year:2025},
      {name:'나지은',company:'현대자동차',job:'생산기술',salary:'월 295만원~',type:'정규직',year:2025},
      {name:'마태오',company:'현대자동차',job:'로봇 운영',salary:'월 298만원~',type:'정규직',year:2025},
      {name:'어진우',company:'현대자동차',job:'공정관리',salary:'월 290만원~',type:'정규직',year:2025},
      {name:'정하윤',company:'현대모비스',job:'생산기술',salary:'월 270만원~',type:'정규직',year:2025},
      {name:'이상민',company:'한화로보틱스',job:'로봇 설치',salary:'월 260만원~',type:'정규직',year:2025},
      {name:'김예슬',company:'두산로보틱스',job:'설비엔지니어',salary:'월 265만원~',type:'정규직',year:2025},
    ],
    college: [
      {name:'송태양',univ:'인하대학교',major:'기계공학과',type:'특성화고 전형',year:2025}
    ],
    trend: [{year:2023,employed:13,rate:76},{year:2024,employed:15,rate:83},{year:2025,employed:17,rate:94}]
  },
  {
    dept: '화학공업과', graduates:20, employed:19, college:0, year:2025,
    students: [
      {name:'전하은',company:'LG에너지솔루션',job:'배터리 품질관리',salary:'월 260만원~',type:'정규직',year:2025},
      {name:'조민재',company:'LG에너지솔루션',job:'공정관리',salary:'월 255만원~',type:'정규직',year:2025},
      {name:'표지수',company:'LG에너지솔루션',job:'생산기술',salary:'월 258만원~',type:'정규직',year:2025},
      {name:'홍지수',company:'삼성SDI',job:'전지 생산',salary:'월 250만원~',type:'정규직',year:2025},
      {name:'윤채원',company:'SK이노베이션',job:'화학공정',salary:'월 255만원~',type:'정규직',year:2025},
      {name:'박수빈',company:'롯데케미칼',job:'화학 생산',salary:'월 245만원~',type:'정규직',year:2025},
      {name:'이민아',company:'한화솔루션',job:'공정관리',salary:'월 248만원~',type:'정규직',year:2025},
    ],
    college: [],
    trend: [{year:2023,employed:15,rate:81},{year:2024,employed:17,rate:89},{year:2025,employed:19,rate:95}]
  },
  {
    dept: '사물인터넷과', graduates:22, employed:20, college:1, year:2025,
    students: [
      {name:'하준서',company:'포스코',job:'설비 IoT',salary:'월 270만원~',type:'정규직',year:2025},
      {name:'허유나',company:'포스코',job:'스마트팩토리',salary:'월 265만원~',type:'정규직',year:2025},
      {name:'황민찬',company:'포스코',job:'설비관리',salary:'월 268만원~',type:'정규직',year:2025},
      {name:'김도윤',company:'KT',job:'네트워크 관리',salary:'월 250만원~',type:'정규직',year:2025},
      {name:'이하은',company:'SK텔레콤',job:'IoT 서비스',salary:'월 255만원~',type:'정규직',year:2025},
      {name:'박준영',company:'현대오토에버',job:'시스템 엔지니어',salary:'월 260만원~',type:'정규직',year:2025},
    ],
    college: [
      {name:'최민준',univ:'경기대학교',major:'컴퓨터공학과',type:'특성화고 전형',year:2025}
    ],
    trend: [{year:2023,employed:16,rate:80},{year:2024,employed:18,rate:86},{year:2025,employed:20,rate:91}]
  },
  {
    dept: '소방전기과', graduates:22, employed:21, college:0, year:2025,
    students: [
      {name:'서유진',company:'현대자동차',job:'전기설비',salary:'월 290만원~',type:'정규직',year:2025},
      {name:'고은비',company:'KCC글라스',job:'소방설비',salary:'월 240만원~',type:'정규직',year:2024},
      {name:'남준혁',company:'KCC글라스',job:'전기관리',salary:'월 238만원~',type:'정규직',year:2024},
      {name:'도현우',company:'KCC글라스',job:'소방관리',salary:'월 242만원~',type:'정규직',year:2024},
      {name:'황정민',company:'한국전력',job:'전기 기술직',salary:'월 270만원~',type:'공기업',year:2025},
      {name:'이지원',company:'GS건설',job:'소방시설',salary:'월 245만원~',type:'정규직',year:2025},
      {name:'박승훈',company:'소방청',job:'소방공무원',salary:'공무원',type:'공무원',year:2025},
    ],
    college: [],
    trend: [{year:2023,employed:17,rate:85},{year:2024,employed:19,rate:90},{year:2025,employed:21,rate:95}]
  },
  {
    dept: '환경과', graduates:18, employed:16, college:2, year:2025,
    students: [
      {name:'차은우',company:'LG에너지솔루션',job:'환경관리',salary:'월 248만원~',type:'정규직',year:2025},
      {name:'김나연',company:'환경부',job:'환경직 공무원',salary:'공무원',type:'공무원',year:2025},
      {name:'이준서',company:'코오롱ENI',job:'환경설비',salary:'월 240만원~',type:'정규직',year:2025},
      {name:'박하늘',company:'GS이앤알',job:'환경관리',salary:'월 238만원~',type:'정규직',year:2025},
    ],
    college: [
      {name:'정수진',univ:'서울시립대',major:'환경공학과',type:'특성화고 전형',year:2025},
      {name:'홍민재',univ:'인하대학교',major:'환경공학과',type:'수시',year:2025}
    ],
    trend: [{year:2023,employed:12,rate:75},{year:2024,employed:14,rate:82},{year:2025,employed:16,rate:89}]
  },
  {
    dept: '3D융합콘텐츠과', graduates:20, employed:16, college:2, year:2025,
    students: [
      {name:'강하린',company:'카카오게임즈',job:'콘텐츠 제작',salary:'월 240만원~',type:'정규직',year:2025},
      {name:'윤서율',company:'넥슨',job:'3D 모델링',salary:'월 250만원~',type:'정규직',year:2025},
      {name:'박지민',company:'현대건설',job:'BIM 설계',salary:'월 245만원~',type:'정규직',year:2025},
      {name:'이소율',company:'건축사무소',job:'3D 렌더링',salary:'월 230만원~',type:'정규직',year:2025},
    ],
    college: [
      {name:'김태윤',univ:'홍익대학교',major:'디지털미디어',type:'특성화고 전형',year:2025},
      {name:'최서현',univ:'경희대학교',major:'컴퓨터그래픽',type:'수시',year:2025}
    ],
    trend: [{year:2023,employed:12,rate:72},{year:2024,employed:14,rate:78},{year:2025,employed:16,rate:84}]
  },
];

// ══ DEPT_LIST (연도별 누적 구조) ══
const DEPT_LIST_DEFAULT = [
  { name:'화학공업과',     startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'환경과',         startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'전자과',         startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'소방전기과',     startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'사물인터넷과',   startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'반도체계약학과', startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'레저스포츠과',   startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'로봇설계과',     startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'3D융합콘텐츠과', startYear:2020, endYear:null, mergedFrom:[], alias:[] },
  { name:'경찰사무행정과', startYear:2020, endYear:null, mergedFrom:[], alias:[] },
];

function getDeptList() {
  try { const s=localStorage.getItem('deptList'); if(s) return JSON.parse(s); } catch(e) {}
  return DEPT_LIST_DEFAULT;
}
function saveDeptListData(list) {
  try { localStorage.setItem('deptList', JSON.stringify(list)); } catch(e) {}
}
function getActiveDepts(year) {
  const y = year || new Date().getFullYear();
  return getDeptList().filter(d => d.startYear<=y && (d.endYear===null||d.endYear>=y));
}
function getDeptSearchNames(deptName) {
  const d = getDeptList().find(x=>x.name===deptName);
  if(!d) return [deptName];
  return [d.name,...(d.mergedFrom||[]),...(d.alias||[])];
}

// 하위호환: 현재 운영중 학과명 배열
function getActiveDeptNames(year) { return getActiveDepts(year).map(d=>d.name); }

// DEPT_LIST 는 현재 운영중 학과명 배열 (동적)
let DEPT_LIST = getActiveDeptNames();
