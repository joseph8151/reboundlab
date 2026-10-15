# MELISSA EDU (멜리사 에듀)

수능·학교 내신 전문 교재를 PDF로 펴내는 교육 출판 브랜드의 **상담 판매** 사이트.
Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase(선택) · Formspree · Cloudflare Workers(OpenNext).

## 판매 방식

홈페이지에서는 결제를 받지 않습니다. 모든 교재와 패키지는 상담 신청으로 판매합니다.

```
학습 고민·진단 → 교재 선택 → 상담 신청(Formspree) → 문자·전화 상담 → 계좌이체 → 입금 확인 → PDF 교재 전달
```

- 카드 결제·PG·장바구니·회원가입·자동 다운로드는 없습니다. (`/cart`, `/checkout`, `/mypage`는 `/consult`로 이동)
- PDF가 완성되지 않은 교재는 **‘주문 제작 상담 가능’**(`delivery_type = custom`)으로 표시하고, 제작 가능 여부와 납품 시점은 상담에서 안내합니다.
- 계좌번호는 사이트에 공개하지 않고 상담 시 개별 안내합니다. 상담 접수 내역은 Formspree에서 관리하며 사이트에는 별도 상담 DB가 없습니다.

## 신규 컬렉션 (자기주도학습·공부법·플래너·학부모 가이드)

`src/lib/catalog-guides.ts`에 개별 교재 40종과 패키지 4종이 있습니다(`/category/self-study`, `study-method`, `study-planner`, `parent-guide`). 가격은 확정 최종가이며 코드에서 다시 곱하지 않습니다. 모두 PDF가 아직 제작되지 않아 ‘주문 제작 상담 가능’이고, 쪽수·문항 수·목차는 원고 확정 전까지 비워 둡니다. PDF가 완성되면 관리자에서 납품 형태를 ‘PDF 완성본’으로 바꾸세요.

## 주요 기능

| 경로 | 기능 |
| --- | --- |
| `/consult` | 교재 상담 및 구매 신청. `?product=슬러그`(복수는 쉼표)로 교재명·가격 자동 입력. `?type=parent/custom/academy/errata`로 유형 전환 |
| `/find?c=` | 학습 고민으로 교재 찾기(규칙 기반) |
| `/diagnosis` | 3분 학습 진단(6단계) → 추천 교재 3권·예상 기간·합계 → 상담폼에 진단 정보 전달 |
| `/exam` | 시험이 얼마 남지 않았다면: D-DAY 계산, 단계별 방향·교재, 매일 체크리스트, 시험 준비 체크리스트 |
| `/custom` | MELISSA CUSTOM BOOK 구성 상담(즉시 생성 아님) |
| `/parents` | 우리 아이 교재 찾기(학부모용, 보호자 연락처 상담) |
| `/academy` | 학원·교육기관 교재 문의(`inquiry_type=academy`) |
| `/compare` | 교재 2~3권 비교 → 한 번에 상담 신청 |
| `/schedule` | 학습 일정 자동 배분(인쇄/PDF 저장) |
| `/errata` | 교재 오류 제보(확인 전에는 정오표로 게시하지 않음) |
| `/books`, `/category/*`, `/packages` | 목록·검색·필터(취약 유형·학습 목적 포함) |

진단·고민·시험 추천은 상품에 연결된 **취약 유형 태그(weakTags)**·학년·과목·유형·난이도를 점수화하는 규칙 기반이며, 실력 측정이나 등급 예측이 아닙니다.

## 상품 데이터와 가격

- 원본: Supabase 연결 시 DB(`/admin`에서 수정), 연결하지 않으면 `src/lib/catalog-plan.ts`의 목록이 그대로 표시됩니다.
- **가격은 `catalog-plan.ts`의 `PRICE_TABLE` 한 곳**에서 관리합니다. 우선 6종은 운영자 지정가(이미 인상 반영, 다시 올리지 않음)이며, 나머지는 권장 가격표를 적용했습니다. 홈·카테고리·카드·상세·상담폼은 모두 같은 데이터에서 가격을 읽습니다.
- 상담폼의 가격은 **서버가 내려준 상품 데이터**를 쓰며, 브라우저의 입력값으로 바꿀 수 없습니다.
- `supabase/seed.sql`은 `on conflict (slug) do nothing`이라 이미 등록된 상품의 가격을 바꾸지 않습니다.

## 환경 변수

`.env.example` 참고. Cloudflare에서는 `NEXT_PUBLIC_*`는 Build variables, 키는 Variables and Secrets에 넣습니다.

| 변수 | 용도 |
| --- | --- |
| `PUBLIC_FORMSPREE_ENDPOINT` / `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Formspree 폼 주소(없으면 코드 기본값 `https://formspree.io/f/mwlvwoev`) |
| `NEXT_PUBLIC_SITE_URL` | canonical·sitemap·OG |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | (선택) 상품 DB·관리자 |
| `ADMIN_EMAILS` | 관리자 이메일(쉼표 구분) |
| `NEXT_PUBLIC_BIZ_*`, `NEXT_PUBLIC_SUPPORT_EMAIL` | 사업자 정보(전자상거래법 표시 의무). 비우면 표시 안 함 |
| `NEXT_PUBLIC_LEGAL_REVIEWED` | 약관·방침 검토 후 `true` |

Supabase를 쓰려면 SQL Editor에서 `supabase/schema.sql` → `supabase/seed.sql` 순으로 실행합니다(재실행 가능).

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build
npm run preview:cf # Workers 런타임 미리보기
```

## 배포 (Cloudflare Workers)

`postinstall`이 Cloudflare 빌드 환경(`WORKERS_CI=1`)에서만 `opennextjs-cloudflare build`를 실행하므로 배포 명령은 `npx wrangler deploy`입니다. 모든 페이지는 요청 시 렌더링됩니다.

## 참고

- 기출 문항을 교재에 수록해 판매하려면 한국교육과정평가원 등 권리자의 이용 허락이 필요합니다.
- 법률 문서(`/terms`, `/privacy`, `/refund`)는 초안입니다. 사업자 정보 입력과 법률 검토 후 게시하세요.
- 쪽수·문항 수·목차·미리보기·정오표·개정 이력은 확정된 값만 표시합니다. 비어 있으면 화면에 나타나지 않거나 ‘상담 시 안내’로 표시됩니다.
