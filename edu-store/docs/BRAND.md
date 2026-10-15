# MELISSA EDU 브랜드 · 디자인 시스템

공식 표기: **멜리사 에듀 / MELISSA EDU** (영문 철자는 S가 하나입니다)

## 방향
일반 온라인 강의 플랫폼이 아니라 교육 출판사의 온라인 서점. 절제된 편집 디자인, 넓은 아이보리 면, 분명한 타이포그래피 위계.

## 색상
밝고 부드러운 배경 위에 와인색을 중심 포인트로, 핑크는 보조 무드로, 옐로우는 아주 작은 강조에만 씁니다. 토큰은 `src/app/globals.css`.
| 역할 | 이름 | HEX | 용도 |
| --- | --- | --- | --- |
| 브랜드 | Deep Wine | `#6E2132` | 로고, 주요 버튼, 가격, 상담 CTA, 푸터 |
| 호버 | Burgundy Wine | `#7B263B` | 버튼 호버 |
| 진한 제목 | Dark Wine | `#4A1D28` | 제목, 보조 버튼 글자 |
| 보조 | Rose Pink / Dusty Rose | `#D88FA0` / `#C97B8D` | 입력창 포커스, 테두리, 표지 포인트 |
| 보조 면 | Soft Blush Pink | `#F3D5DC` | 보조 버튼, 상담 섹션 배경 |
| 포인트 | Warm Yellow / Muted Mustard | `#F2C94C` / `#D9A63A` | 추천 라벨, 하이라이트, 작은 선. 넓은 면적 금지 |
| 배경 | Ivory Cream / Warm Beige Pink / Soft Light Pink / White | `#FAF6F2` / `#F7ECE8` / `#FCF5F7` / `#FFFFFF` | 페이지·섹션·카드·입력창 |
| 텍스트 | Charcoal / Sub Gray | `#222222` / `#6B6B6B` | 본문·보조 |
| 보조색 | Light Gold Beige | `#E7D5B7` | 구분 포인트 |

과목 표지색(`src/lib/catalog.ts`의 AREAS): 국어 Wine+Rose · 수학 Dark Wine+Beige · 영어 Rose Pink+Wine · 사회 Dusty Rose+Mustard · 과학 Burgundy+Soft Pink · 중등 Blush Beige+Wine.

금지: 핫핑크, 형광 노랑, 과도한 그라데이션, 반복되는 둥근 카드, 하트·별 장식, 알록달록한 배색.

## 타이포그래피
- 한글: Pretendard Variable (본문 15~16px, 줄간격 1.75~1.9, `word-break: keep-all`)
- 영문 워드마크·번호·소제목: Cormorant Garamond (세리프, 대문자 + 넓은 자간). 한글 본문에는 쓰지 않습니다.
- 위계: 제목(굵게, 자간 −0.03~−0.05em) → 설명(회색) → 메타(12~13px) → 가격(tabular-nums).

## 로고
`MELISSA EDU` 영문 세리프 워드마크(와인색, ‘EDU’는 더스티 로즈 이탤릭)가 중심, `멜리사 에듀`는 아래 보조 표기. 책·학사모·전구 아이콘은 쓰지 않습니다. 파비콘은 와인 바탕의 `M` 글자와 얇은 옐로우 선입니다. (`src/components/brand/wordmark.tsx`, `src/app/icon.svg`)

## 교재 표지
`src/components/books/book-cover.tsx`. 슬러그로 세 가지 배치(전면 색, 아이보리 + 색 띠, 상하 분할) 중 하나가 고정 선택되고, 모든 표지에 `MELISSA EDU · 과목명 · 교재명 · 시리즈명 · 대상 학년 · 교육과정/학년도`가 같은 위치 규칙으로 들어갑니다. 글자 크기는 컨테이너 너비(cqw) 기준이라 썸네일에서도 비율이 유지됩니다. 표지 이미지를 등록하면 그 이미지가 우선합니다.

## 분류 체계
`src/lib/catalog.ts` 한 곳에서 관리합니다.
- 학습 과정(track): 수능 / 학교 내신 / 학습 관리
- 대상 학년: 중1·중2·중3·고1·고2·고3·수능 (필터는 중등/고1/고2/고3/수능 묶음)
- 과목: 국어·수학·영어·사회·과학·종합 + 세부 과목명(course)
- 유형: 개념·기출·변형문제·모의고사·학습자료
- 난이도: 기초·표준·심화 / 교육과정: 2015 개정·2022 개정 / 판매 상태: 판매 중·품절·판매 중단 (납품 형태: 주문 제작 상담 가능·PDF 완성본)
