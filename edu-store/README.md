# MELISA EDU (멜리사 에듀)

수능·학교 내신 전문 교재를 PDF로 펴내는 교육 출판 브랜드의 온라인 서점.
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · 토스페이먼츠 · Cloudflare Workers(OpenNext).

디자인 시스템과 분류 체계는 [`docs/BRAND.md`](docs/BRAND.md)를 참고하세요.

## 구조

```
src/
├─ app/
│  ├─ page.tsx                     홈 (12개 섹션, 섹션마다 다른 배경·정렬)
│  ├─ books/ , books/[slug]        전체 교재 (필터·검색·정렬), 교재 상세
│  ├─ category/[slug]              수능·과목별·고등 내신·중등 내신·모의고사·학습자료
│  ├─ packages/ , packages/[slug]  패키지(묶음) 목록·상세
│  ├─ cart , checkout              장바구니, 주문·결제(토스 결제위젯)
│  ├─ mypage                       내 자료함 (교재별 다운로드·정답/해설)
│  ├─ admin/                       교재·패키지 등록·수정, 주문 목록
│  ├─ study/*                      무료 학습 도구 8종
│  ├─ consult, support, faq, refund, terms, privacy
│  └─ api/{orders,payments,download,cart,admin,ai}
├─ components/{brand,layout,books,study,ui}
└─ lib/
   ├─ catalog.ts        분류 체계(학년·과목·유형·난이도·교육과정·상태)
   ├─ catalog-plan.ts   우선 출시 6종 + 출시 예정 교재 목록 + 패키지 예정 목록 (시드·데모용)
   ├─ categories.ts     카테고리 페이지 문구·필터
   ├─ products.ts       조회·검색 해석·필터·정렬·패키지 계산
   ├─ orders.ts, toss.ts, watermark.ts, seo.ts, shelf.ts(장바구니·위시리스트·최근 본 교재)
supabase/{schema.sql, seed.sql}
```

## 교재 데이터 관리

교재의 원본은 **Supabase DB**이며 관리자 페이지(`/admin`)에서 등록·수정합니다.
- 필드: 상품 ID(UUID)·상품 코드(SKU), 상품명, 슬러그, 시리즈, 학습 과정, 학년, 과목·세부 과목, 학년도, 교육과정, 난이도, 유형, 페이지 수, 문제 수, 정상가·할인가, 표지, 목차, 학습 목표, 상세 설명, 미리보기 PDF·이미지, 구매용 PDF, 정답·해설 PDF, 출시일, 판매 상태, SEO 제목·설명, 키워드, 개정판·정오표 이력.
- **판매 중**으로 저장하려면 정상가와 구매용 PDF가 모두 있어야 합니다(DB 제약 + 관리자 검증). 파일이 없으면 자동으로 구매할 수 없습니다.
- 출시일은 입력하지 않으면 비어 있고, 화면에도 표시되지 않습니다.
- 대표 노출 순서(`featured_rank`)가 있는 교재가 홈 첫 화면과 추천 순서에 먼저 나옵니다.
- `src/lib/catalog-plan.ts`는 시드 SQL을 만들고, Supabase를 연결하지 않았을 때(데모 모드) 화면을 확인하기 위한 데이터입니다. 데모 모드에서는 우선 출시 6종만 '판매 중'으로 보이고 결제는 막혀 있습니다.

## 환경 변수

`.env.example`을 참고하세요. Cloudflare에서는 `NEXT_PUBLIC_*`는 **Build variables**, 키·시크릿은 **Variables and Secrets**에 넣습니다.

| 구분 | 변수 | 비고 |
| --- | --- | --- |
| 사이트 | `NEXT_PUBLIC_SITE_URL` | 배포 주소. canonical·sitemap·OG에 사용 |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`(서버 전용) | |
| 결제 | `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`(서버 전용) | 결제위젯 연동 키(gck/gsk) |
| 관리자 | `ADMIN_EMAILS` | 쉼표 구분 |
| 사업자 정보 | `NEXT_PUBLIC_BIZ_*`, `NEXT_PUBLIC_SUPPORT_EMAIL` | 비우면 표시되지 않음. 판매 전 필수 입력 |
| 법률 문서 | `NEXT_PUBLIC_LEGAL_REVIEWED` | 검토 완료 후 true |
| AI | `ANTHROPIC_API_KEY`, `AI_DAILY_LIMIT` | 없으면 사이트 내 AI 분석은 꺼지고 외부 GPT 링크만 안내 |
| 상담 | `NEXT_PUBLIC_FORMSPREE_URL` | 기본값이 코드에 있음 |

## 설정 순서

1. Supabase 프로젝트 생성(서울 리전 권장) → SQL Editor에서 `supabase/schema.sql` 실행 → `supabase/seed.sql` 실행.
   - `schema.sql`은 처음 실행해도, 이전 버전을 이미 실행했어도 안전합니다(재실행 가능).
2. 환경 변수 입력 후 배포. `ADMIN_EMAILS`의 이메일로 가입·로그인.
3. `/admin`에서 교재를 열어 PDF·표지·미리보기를 올리고 판매 상태를 '판매 중'으로 변경.
4. 토스 개발자센터에서 웹훅 `https://<도메인>/api/payments/webhook` (PAYMENT_STATUS_CHANGED) 등록.
5. Supabase Auth의 Site URL·Redirect URL(`/auth/callback`)을 실제 도메인으로 설정.

## 로컬 실행

```bash
npm install
npm run dev          # http://localhost:3000 (환경 변수가 없으면 데모 모드)
npm run typecheck
npm run build
npm run preview:cf   # Workers 런타임 미리보기
```

## 배포 (Cloudflare Workers)

배포 명령 `npx wrangler deploy`만으로 동작하도록, `package.json`의 `postinstall`이 Cloudflare 빌드 환경(`WORKERS_CI=1`)에서만 `opennextjs-cloudflare build`를 실행합니다. 번들은 압축 후 약 2.6MB로 무료 플랜 한도(3MB) 안이지만 여유가 적으니, 기능을 더 추가하기 전에 유료 플랜(10MB) 전환을 고려하세요.

모든 페이지는 요청 시 서버에서 그려집니다(`force-dynamic`). 관리자에서 교재를 바꾸면 재배포 없이 바로 반영됩니다.

## 결제·다운로드 흐름

```
교재 상세 / 장바구니 → /checkout (로그인 필요, 청약철회 제한 동의)
  → POST /api/orders      서버가 DB 기준으로 판매 상태·가격·파일 준비를 재검증하고 주문(+order_items) 생성
  → 토스 결제창 → /checkout/success → POST /api/payments/confirm (소유자·금액 확인 → 토스 승인)
  → 내 자료함 → POST /api/download/[주문번호] (교재별 기한·횟수 확인 → 구매자 정보 워터마크 PDF → 60초 서명 URL)
```

## 참고

- 장바구니·위시리스트·최근 본 교재는 이 브라우저(localStorage)에만 저장됩니다. 결제 시 서버가 가격과 판매 상태를 다시 확인합니다.
- 기출 문항을 교재에 수록해 판매하려면 한국교육과정평가원 등 권리자의 이용 허락이 필요합니다. 학교별 교재는 자료 사용 권한이 확인된 경우에만 출시하세요.
- 수능 출제 범위는 학년도마다 달라질 수 있으므로 교재 등록 시 교육과정·학년도를 한국교육과정평가원 공고에 맞춰 입력하세요.
