# [브랜드명] 수능·내신 PDF 학습자료 스토어

Next.js 15(App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Supabase + 토스페이먼츠 결제위젯으로 만든 디지털 상품(PDF) 판매 사이트입니다.

- 브랜드 컨셉, 슬로건, 컬러, 폰트, 카테고리: [`docs/BRAND.md`](docs/BRAND.md)
- **환경 변수가 없어도 바로 실행됩니다(데모 모드).** 예시 상품 6개로 랜딩·목록·상세·FAQ·약관 페이지를 확인할 수 있고, 로그인·결제·다운로드는 Supabase와 토스 키를 넣으면 활성화됩니다.

## 무료 학습 도구 (`/study`)

| 경로 | 기능 | 벤치마킹 포인트 |
| --- | --- | --- |
| `/study/words` | 초고속 수능 영단어 30일 챌린지 (300단어, 카드 → 단어당 5초 퀴즈 → 80% 통과, 오답 단어장, 연속 학습일) | 30일 영단어 챌린지 |
| `/study/speed-reading` | 수능형 지문 속독 훈련 (WPM 측정, 의미 단위 끊어 읽기 페이서, 이해도 문제·해설, 기록) | 속독 강의 |
| `/study/structures` | 수능 영어 지문 구조 10가지 (신호어·주제문 위치·유형·요령, 연습 지문 연결) | 지문 구조 분류 |
| `/study/strategy` | 독해 45분 시간 배분·풀이 순서 + 실전 구간 타이머 | 시간 단축 풀이법 |
| `/study/ai-melisa` | **AI 지문 분석**: 지문 텍스트·사진을 올리면 핵심 내용·구조·문장별 해석·어휘·문법·정답 근거를 스트리밍으로 분석 (Claude). AI 멜리사 GPT 링크 병행 | 멜리사 선생님 GPT |
| `/study/report` | **주간 학습 리포트**: 모든 도구 기록을 모아 코멘트와 함께 보여 주고 인쇄·PDF 저장 | 학생 스케줄 분석기 |
| `/study/habit` | 66일 습관 트래커 (최대 3개, 3단계 구간 조언, 연속 기록) | 66일 공부습관 |
| `/study/time` | 순공 시간 분석기 (과목별 스톱워치, 주간 누적 막대·과목별 합계) | 학생 스케줄 분석기 |
| `/study/wrong-notes` | 오답노트 (틀린 이유 5분류, 1·3·7·14일 간격 복습) | 오답노트 습관 |

- 기록은 브라우저(localStorage)에 저장되고, 로그인하면 Supabase `study_progress` 테이블과 동기화됩니다. 기존에 `schema.sql`을 실행했다면 **한 번 더 실행**해 테이블을 추가하세요(재실행해도 안전).
- 공감 체크리스트("시험 볼 때 항상 시간이 부족해요" 등)는 랜딩과 `/study`에 있고, 각 고민을 해당 도구로 연결합니다.
- 긴급성 연출은 가짜 마감 카운트다운 대신 **실제 수능 D-day**(`NEXT_PUBLIC_SUNEUNG_DATE`, 기본 2026-11-19)로 대체했습니다. 시행일은 평가원 공고로 확인하세요.
- 속독 지문 6개는 모두 새로 쓴 창작 지문이고, 지문 구조·시간 전략은 다른 강사의 강의·교재 내용을 옮기지 않고 자체 기준으로 정리했습니다. 실제 기출 지문을 넣거나 특정 강사명을 마케팅에 쓰려면 권리자 허락이 필요합니다.

### AI 지문 분석 설정

- `ANTHROPIC_API_KEY`를 넣으면 활성화됩니다(서버 전용). 모델은 `claude-opus-5-5`, 안전 분류기 거절 시 서버가 대체 모델로 다시 시도하도록 `fallbacks: "default"`를 켰습니다. 코드: `src/lib/ai.ts`, `src/app/api/ai/analyze/route.ts`.
- **비용 관리:** 로그인 사용자만, 1인 하루 `AI_DAILY_LIMIT`회(기본 5). 사용량은 `ai_usage` 테이블에 기록됩니다(`schema.sql` 재실행 필요). 사진은 브라우저에서 긴 변 1600px로 줄여 보냅니다. 1회 비용은 지문 길이에 따라 다르니, 운영 전 실제 호출로 측정한 뒤 한도를 정하세요.
- 사용자가 입력한 지문·사진은 Anthropic으로 전송됩니다. 개인정보처리방침에 위탁·국외 이전 항목을 이미 추가해 두었으니 실제 계약·리전에 맞게 확인하세요.

### 구매 PDF 워터마크

- 다운로드 시 `pdf-lib`로 **모든 쪽 하단에 구매자 이메일·주문번호**와 옅은 대각선 이메일을 넣은 개인용 사본을 만들어 비공개 버킷 `stamped/`에 캐시한 뒤 서명 URL로 제공합니다(`src/lib/watermark.ts`). `PDF_WATERMARK=false`로 끌 수 있습니다.
- 표준 PDF 폰트는 한글을 지원하지 않아 워터마크에는 영문·숫자만 쓰이고, 이메일의 한글은 `?`로 바뀝니다. 한글을 넣으려면 글꼴 파일을 임베드하세요(`pdf-lib` + `@pdf-lib/fontkit`).
- 암호화·손상된 PDF는 워터마크에 실패해 원본이 제공되고 서버 로그에 남습니다. 대용량(수십 MB) PDF는 첫 다운로드가 느릴 수 있어 `maxDuration`을 60초로 두었습니다.

## 폴더 구조

```
edu-store/
├─ docs/BRAND.md                  브랜드 & 컨셉 정의
├─ supabase/
│  ├─ schema.sql                  테이블·RLS·Storage 버킷
│  └─ seed.sql                    예시 상품 6개
├─ scripts/generate-seed.mjs      sample-products.ts → seed.sql 생성
├─ src/
│  ├─ middleware.ts               세션 갱신, /mypage·/checkout·/admin 로그인 보호
│  ├─ app/
│  │  ├─ layout.tsx               공통 레이아웃, 기본 SEO/OG 메타데이터
│  │  ├─ page.tsx                 랜딩 (히어로·카테고리·추천·차별점·이용방법·신뢰·FAQ·CTA)
│  │  ├─ products/page.tsx        목록 (과목/학년/유형 필터, 검색, 정렬)
│  │  ├─ products/[slug]/page.tsx 상세 (설명·추천 대상·포함 내용·목차·워터마크 미리보기·JSON-LD)
│  │  ├─ checkout/[slug]/         주문·결제 (토스 결제위젯, 청약철회 제한 동의)
│  │  ├─ checkout/success|fail/   결제 승인 요청 / 실패 안내
│  │  ├─ mypage/page.tsx          내 자료함 (다운로드 횟수·기한·환불 가능 여부·영수증)
│  │  ├─ login/                   이메일 로그인·회원가입
│  │  ├─ auth/callback|signout/   이메일 인증 콜백, 로그아웃
│  │  ├─ admin/                   상품 등록(PDF·썸네일·샘플 업로드), PDF 연결, 공개 전환, 최근 주문
│  │  ├─ faq, terms, privacy, refund
│  │  ├─ api/orders               주문 생성 (가격은 DB 기준)
│  │  ├─ api/payments/confirm     결제 승인 (소유자·금액 검증 → 토스 승인 API)
│  │  ├─ api/payments/webhook     가상계좌 입금·취소 반영 (토스에 재조회해 검증)
│  │  ├─ api/download/[orderId]   다운로드 (권한·기한·횟수 확인 → 60초 서명 URL)
│  │  ├─ api/admin/*              서명 업로드 URL 발급, 상품 생성·수정
│  │  ├─ sitemap.ts, robots.ts, opengraph-image.tsx, icon.svg
│  ├─ components/                 헤더·푸터·상품 카드·표지·필터·미리보기, ui/(shadcn)
│  └─ lib/                        catalog, products, orders, toss, auth, site 설정, supabase 클라이언트
└─ .env.example
```

## 로컬 실행

```bash
cd edu-store
npm install
cp .env.example .env.local   # 데모 모드로 볼 때는 이 단계를 건너뛰어도 됩니다
npm run dev                  # http://localhost:3000
```

`npm run typecheck`, `npm run build`로 타입 검사와 프로덕션 빌드를 확인할 수 있습니다.

## 실제 결제까지 연결하기

### 1) Supabase

1. [supabase.com](https://supabase.com)에서 프로젝트를 만듭니다. 리전은 **Northeast Asia (Seoul)** 를 권장합니다(개인정보 국외 이전 고지 부담 감소).
2. SQL Editor에서 `supabase/schema.sql` → `supabase/seed.sql` 순서로 실행합니다. 테이블, RLS 정책, `product-files`(비공개)·`product-assets`(공개) 버킷이 생성됩니다.
3. Project Settings → API에서 URL, `anon` 키, `service_role` 키를 `.env.local`에 넣습니다.
4. Authentication → URL Configuration에 Site URL(`http://localhost:3000`, 배포 후 실제 도메인)과 Redirect URL(`.../auth/callback`)을 등록합니다.
5. 기본 이메일 발송은 시간당 발송 수가 매우 적습니다. 운영 전 Authentication → SMTP에 자체 SMTP(예: AWS SES, Resend)를 연결하세요.

### 2) 관리자 & 상품 파일

1. `ADMIN_EMAILS`에 관리자 이메일을 넣고, 그 이메일로 회원가입·로그인합니다.
2. `/admin`에서 seed 상품 옆 **PDF 연결** 버튼으로 PDF를 올리거나, 새 상품을 등록합니다.
   - 파일은 브라우저 → Supabase Storage로 **서명 업로드 URL**을 통해 바로 올라갑니다(Vercel 함수 본문 4.5MB 제한 회피).
   - PDF가 연결되지 않은 상품은 결제가 막혀 있습니다(빈 상품 판매 방지).

### 3) 토스페이먼츠

1. `.env.example`에는 토스 공식 문서에 공개된 **결제위젯 테스트 키**가 들어 있어 바로 테스트할 수 있습니다. 실제 돈은 나가지 않습니다.
2. [개발자센터](https://developers.tosspayments.com)에 가입하면 내 상점의 테스트 키(`test_gck_…`, `test_gsk_…`)를 받을 수 있으니 그걸로 바꾸는 것을 권장합니다. **결제위젯 연동 키**(gck/gsk)를 써야 하며, API 개별 연동 키(ck/sk)로는 위젯이 뜨지 않습니다.
3. 개발자센터 → 웹훅에 `https://<도메인>/api/payments/webhook`을 `PAYMENT_STATUS_CHANGED` 이벤트로 등록합니다(가상계좌 입금 확인, 상점관리자에서 한 환불 반영).
4. 라이브 전환: 전자결제 계약 → 심사 완료 후 라이브 키(`live_gck_…`, `live_gsk_…`)로 교체합니다.

### 결제 흐름

```
상세 → /checkout/[slug] (로그인 필요, 청약철회 제한 동의)
  → POST /api/orders           서버가 DB 가격으로 pending 주문 생성
  → widgets.requestPayment()   토스 결제창
  → /checkout/success?paymentKey&orderId&amount
  → POST /api/payments/confirm 주문 소유자·금액 일치 확인 → 토스 승인 API → orders.status = paid
  → /mypage → POST /api/download/[orderId] → 60초 서명 URL로 리다이렉트
```

## Cloudflare Workers 배포 (이 저장소 기본 설정)

`@opennextjs/cloudflare`로 Next.js를 Workers에서 실행합니다. 대시보드의 **배포 명령이 `npx wrangler deploy`뿐이어도** 동작하도록, `wrangler.jsonc`의 `build.command`가 배포 직전에 `opennextjs-cloudflare build`를 실행합니다(빌드 명령은 비워 둬도 됩니다).

1. Workers & Pages → 프로젝트 `melisaedu` → Settings → Build: 저장소 `joseph8151/melisaedu`, 브랜치 `main`, 루트 디렉터리 `/`, 배포 명령 `npx wrangler deploy`.
2. **Build variables**(빌드 때 화면에 박히는 공개 값)에 아래를 넣습니다. 없으면 사이트는 데모 모드로 뜹니다.
   - `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BRAND_NAME`,  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `NEXT_PUBLIC_SUNEUNG_DATE`
3. **Variables and Secrets**(런타임, 서버 전용)에 **Secret**으로 넣습니다: `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_EMAILS`, (선택) `AI_DAILY_LIMIT`, `DOWNLOAD_*`, `PDF_WATERMARK`.
4. 도메인: Settings → Domains에서 연결한 뒤 `NEXT_PUBLIC_SITE_URL`, Supabase Auth의 Site URL·Redirect URL, 토스 웹훅 URL(`/api/payments/webhook`)을 그 주소로 맞춥니다.
5. 로컬 Workers 미리보기: `npm run preview:cf` (`.dev.vars.example` 참고). 수동 배포: `npm run deploy:cf`.

참고: 번들은 gzip 약 2.6MB로 무료 플랜 한도(3MB) 안이지만 여유가 적습니다. 기능을 더하다 한도를 넘으면 유료 플랜(10MB)이 필요합니다.

## Vercel 배포 (대안)

1. 이 저장소를 Vercel에 Import하고 **Root Directory를 `edu-store`** 로 지정합니다.
2. Environment Variables에 `.env.example`의 모든 키를 입력합니다. `NEXT_PUBLIC_SITE_URL`은 실제 도메인(예: `https://example.com`)으로 설정합니다.
3. 배포 후 Supabase Auth의 Site URL·Redirect URL과 토스 웹훅 URL을 실제 도메인으로 바꿉니다.
4. 도메인 연결 후 Google Search Console·네이버 서치어드바이저에 `/sitemap.xml`을 제출합니다.

## 결제·스토리지 연동 시 주의사항

- **금액은 서버에서만 결정합니다.** 클라이언트가 보낸 금액은 승인 전 DB 주문 금액과 비교하며, 다르면 주문을 실패 처리합니다.
- **`SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY`는 서버 전용입니다.** `NEXT_PUBLIC_` 접두사를 절대 붙이지 마세요.
- **PDF 원본은 비공개 버킷에만 둡니다.** `products.file_path` 컬럼은 anon/authenticated 역할에 SELECT 권한이 없어 브라우저로 노출되지 않습니다.
- **다운로드는 POST로만** 받습니다. 링크 미리 불러오기나 크롤러가 다운로드 횟수를 소진하지 않게 하기 위해서입니다.
- **샘플 이미지에는 직접 워터마크를 넣어 올리세요.** 화면의 워터마크 오버레이는 이미지 저장으로 우회될 수 있습니다. 공개 버킷에는 저해상도 샘플만 둡니다.
- **기출문제 저작권:** 수능·평가원 모의평가 문항은 한국교육과정평가원, 학력평가는 각 시·도교육청에 저작권이 있습니다. 문항을 수록해 **판매**하려면 사전에 이용 허락(평가원 저작물 이용 신청 등)을 받아야 합니다. 허락 전에는 문항 원문 없이 출처(학년도·번호)만 표기하고 분석·해설만 담는 방식을 검토하세요. 교과서 지문·EBS 연계 교재도 마찬가지입니다.
- **법적 표시 의무:** `src/lib/site.ts`의 사업자 정보(상호, 대표자, 사업자등록번호, 통신판매업 신고번호 등)를 실제 값으로 바꾸세요. 통신판매업 신고 없이 판매하면 안 됩니다. 약관·개인정보처리방침·환불 정책은 **초안**이므로 게시 전 전문가 검토를 받으세요.
- **청약철회:** 다운로드 이력은 `downloads` 테이블에 남고, 내 자료함에 '환불 가능(다운로드 전)' 배지로 표시됩니다. 환불은 토스 상점관리자에서 결제를 취소하면 웹훅으로 주문이 `refunded`가 되고 다운로드가 막힙니다.
- **만 14세 미만:** 중등 대상 상품이 있으므로 회원가입 시 법정대리인 동의 절차(예: 생년월일 입력 → 보호자 이메일 동의)를 운영 전에 추가하는 것을 권장합니다. 현재는 동의 문구 안내만 있습니다.

## 다음 단계 제안

1. **PDF 개인화 워터마크:** 다운로드 시 `pdf-lib`로 각 페이지 하단에 구매자 이메일·주문번호를 찍어 유출 억제 (Supabase Edge Function 또는 Route Handler)
2. **장바구니·묶음 할인:** 현재는 한 주문 = 한 상품 구조입니다. `order_items` 테이블을 추가하면 확장할 수 있습니다.
3. **관리자 기능 확장:** 상품 수정·삭제, 주문 검색, 환불 API(`/v1/payments/{paymentKey}/cancel`) 연동, 수정본 업로드 시 구매자 알림 메일
4. **회원 기능:** 카카오·네이버 소셜 로그인(Supabase Auth Provider), 비밀번호 재설정 페이지
5. **분석:** GA4 또는 Vercel Analytics로 상세 → 결제 전환율 측정
6. **후기:** 구매자만 작성 가능한 후기(실구매 인증 배지)로 신뢰 요소 보강
