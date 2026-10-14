import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CircleCheckBig,
  Download,
  Eye,
  FlaskConical,
  Languages,
  NotebookPen,
  RotateCcw,
  ShieldCheck,
  Target,
  Timer,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { GRADES, TYPES } from "@/lib/catalog";
import { FAQ_ITEMS } from "@/lib/faq";
import { getFeaturedProducts } from "@/lib/products";
import { downloadPolicy } from "@/lib/site";

export const revalidate = 300;

const SUBJECT_SHORTCUTS = [
  { id: "korean", label: "국어", desc: "문학·독서 기출 분석", icon: BookOpenCheck },
  { id: "math", label: "수학", desc: "내신 변형문제·유형 정리", icon: Calculator },
  { id: "english", label: "영어", desc: "독해 유형별 풀이 순서", icon: Languages },
  { id: "inquiry", label: "탐구", desc: "고난도 단원 기출+해설", icon: FlaskConical },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "정확성",
    body: "모든 문항에 출처를 표기하고, 정답과 해설은 두 명이 각각 검수합니다. 오류가 확인되면 수정본을 다운로드센터에 바로 올리고 구매자에게 알려 드립니다.",
  },
  {
    icon: Timer,
    title: "효율성",
    body: "단원·유형별로 묶어 지금 필요한 부분만 골라 풀 수 있습니다. 해설은 '왜 그 답인지'에 집중해 복습 시간을 줄였습니다.",
  },
  {
    icon: Target,
    title: "자기주도성",
    body: "체크리스트, 회독 기록표, 오답 분류 시트를 함께 넣어 계획 → 실행 → 점검을 스스로 반복할 수 있게 구성했습니다.",
  },
  {
    icon: Download,
    title: "즉시 다운로드",
    body: "결제가 끝나면 내 자료함에서 바로 PDF를 내려받습니다. 배송을 기다리지 않고 오늘 계획에 넣을 수 있습니다.",
  },
];

const STEPS = [
  { title: "샘플 먼저 확인", body: "상품마다 목차와 본문 일부를 공개합니다. 내 수준과 목적에 맞는지 먼저 보세요." },
  { title: "간편 결제", body: "카드, 계좌이체, 간편결제를 지원합니다. 결제 정보는 토스페이먼츠가 안전하게 처리합니다." },
  { title: "내 자료함에서 다운로드", body: `결제일로부터 ${downloadPolicy.validDays}일 동안 최대 ${downloadPolicy.maxCount}회 내려받을 수 있습니다. PC·태블릿 어디서든 열람하세요.` },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(6);

  return (
    <>
      {/* 1. 히어로 */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/70 to-background">
        <div className="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-[13px] font-semibold text-primary ring-1 ring-primary/15">
              수능 · 내신 · 자기주도학습 PDF
            </p>
            <h1 className="mt-5 text-[32px] font-extrabold leading-[1.25] sm:text-5xl sm:leading-[1.2] lg:text-[44px]">
              필요한 만큼, 정확하게.
              <br />
              <span className="text-primary">오늘 바로 시작하는</span>{" "}
              <span className="whitespace-nowrap">공부 자료</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              출처를 밝히고 두 번 검수한 기출 분석, 변형문제, 스터디가이드를 PDF로 만나 보세요.
              샘플을 먼저 확인하고, 결제 후 바로 내려받아 오늘 계획에 넣을 수 있습니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/products">
                  자료 둘러보기 <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#featured">
                  <Eye /> 샘플 먼저 보기
                </Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {["전 상품 샘플 미리보기", "결제 즉시 다운로드", "다운로드 전 7일 이내 전액 환불"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CircleCheckBig className="size-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* 히어로 비주얼: 자료 구성 예시 */}
          <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
            <div className="absolute -right-4 -top-4 h-full w-full rounded-3xl bg-primary/10" />
            <div className="relative rounded-3xl border border-border bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,31,61,0.3)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">이번 주 학습 계획</p>
                <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">진행 중</span>
              </div>
              <ul className="mt-5 space-y-3">
                {[
                  ["국어", "문학 기출 현대시 3세트", true],
                  ["수학", "변형문제 유형 17~20", true],
                  ["영어", "순서·삽입 적용 문제 10", false],
                  ["탐구", "가계도 분석 전략군 2", false],
                ].map(([subject, task, done]) => (
                  <li key={task as string} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className={`flex size-5 items-center justify-center rounded-md border ${done ? "border-primary bg-primary text-white" : "border-input"}`}>
                      {done && <CircleCheckBig className="size-3.5" />}
                    </span>
                    <span className="w-9 text-xs font-semibold text-primary">{subject}</span>
                    <span className={`text-sm ${done ? "text-muted-foreground line-through" : ""}`}>{task}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>주간 실행률</span>
                  <span className="font-semibold text-foreground">50%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-2 w-1/2 rounded-full bg-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 카테고리 바로가기 */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="카테고리"
          title="과목과 학년을 고르면, 필요한 자료만 보여 드려요"
          description="수능 대비부터 학교 내신, 공부 습관 관리까지. 목적에 맞는 자료를 빠르게 찾아보세요."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {SUBJECT_SHORTCUTS.map(({ id, label, desc, icon: Icon }) => (
            <Link
              key={id}
              href={`/products?subject=${id}`}
              className="group rounded-2xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </span>
              <p className="mt-4 text-lg font-bold">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <Link key={g.id} href={`/products?grade=${g.id}`} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary">
              {g.label}
            </Link>
          ))}
          {TYPES.map((t) => (
            <Link key={t.id} href={`/products?type=${t.id}`} className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary">
              #{t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. 추천 자료 */}
      <section id="featured" className="scroll-mt-20 border-y border-border bg-muted py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="추천 자료"
              title="지금 많이 찾는 자료"
              description="모든 자료는 상세 페이지에서 목차와 본문 샘플을 확인할 수 있습니다."
            />
            <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              전체 보기 <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. 차별점 */}
      <section className="container-page py-16 sm:py-24">
        <SectionHeading
          align="center"
          eyebrow="자료를 만드는 기준"
          title="많이 담기보다, 정확하고 바로 쓸 수 있게"
          description="문제 수를 늘리는 것보다 한 문제를 제대로 복습할 수 있는 구성이 성적에 더 도움이 된다고 믿습니다."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border p-6">
              <Icon className="size-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 이용 방법 */}
      <section className="bg-navy py-16 text-white sm:py-20">
        <div className="container-page">
          <p className="text-sm font-semibold text-blue-300">이용 방법</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-[28px]">확인하고, 결제하고, 바로 공부하세요</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <span className="text-sm font-bold text-blue-300">STEP {i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. 신뢰 요소: 미리보기 · 환불 */}
      <section className="container-page grid gap-5 py-16 sm:py-24 md:grid-cols-2">
        <div className="rounded-2xl bg-accent p-8">
          <Eye className="size-6 text-primary" />
          <h2 className="mt-4 text-xl font-bold">사기 전에 직접 확인하세요</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            모든 자료의 목차와 본문 일부를 미리보기로 공개합니다. 문제 난이도, 해설 방식, 편집 상태를 확인한 뒤 결정하셔도 늦지 않습니다.
          </p>
          <Link href="/products" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            샘플 보러 가기 <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border p-8">
          <RotateCcw className="size-6 text-primary" />
          <h2 className="mt-4 text-xl font-bold">환불 기준을 미리 알려 드립니다</h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            <li>· 결제 후 7일 이내, 한 번도 내려받지 않았다면 전액 환불</li>
            <li>· 파일 오류·내용 결함은 다운로드 여부와 관계없이 수정본 제공 또는 환불</li>
            <li>· 디지털 콘텐츠 특성상 다운로드 후 단순 변심 환불은 제한됩니다</li>
          </ul>
          <Link href="/refund" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            환불·교환 정책 전문 <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="border-t border-border bg-muted py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading eyebrow="FAQ" title="구매 전에 많이 묻는 질문" description="더 궁금한 점은 FAQ 페이지나 고객센터 이메일로 문의해 주세요." />
          <Accordion type="single" collapsible className="rounded-2xl bg-background px-6">
            {FAQ_ITEMS.slice(0, 5).map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`} className={i === 4 ? "border-b-0" : ""}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 8. 마지막 CTA */}
      <section className="container-page py-16 sm:py-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <NotebookPen className="size-7 opacity-80" />
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">오늘 풀 한 세트부터 시작하세요</h2>
            <p className="mt-2 text-[15px] text-primary-foreground/80">과목과 학년만 고르면 필요한 자료를 바로 찾을 수 있습니다.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link href="/products">
              자료 찾아보기 <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
