"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Disclaimer, RecList, lineBtn, primaryBtn } from "./ui";
import { NativeSelect } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { kindLabel, type KindId } from "@/lib/catalog";
import { saveDraft } from "@/lib/consult";
import { EXAM_STAGES, GRADE_CHOICES, daysUntil, dailyChecklist, examStage, recommend, sumPrice, type GuideProduct } from "@/lib/guide";
import { cn, formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SUBJECTS = [{ id: "", label: "전체 과목" }, { id: "korean", label: "국어" }, { id: "math", label: "수학" }, { id: "english", label: "영어" }, { id: "social", label: "사회탐구" }, { id: "science", label: "과학탐구" }];
const PREP: { id: string; label: string; kinds: KindId[] }[] = [
  { id: "scope", label: "학습 범위 확인", kinds: [] },
  { id: "past", label: "기출 분석", kinds: ["past-exam"] },
  { id: "weak", label: "취약 단원 점검", kinds: ["variant", "concept"] },
  { id: "mock", label: "실전 모의고사", kinds: ["mock"] },
  { id: "wrong", label: "오답 복습", kinds: ["material"] },
  { id: "final", label: "시험 직전 개념 정리", kinds: ["concept"] },
];

const KEY = "melisa.exam.v1";
type Saved = { date: string; grade: string; subject: string; checks: Record<string, boolean>; prep: Record<string, boolean> };

export function ExamPlanner({ products }: { products: GuideProduct[] }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [prep, setPrep] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "null") as Saved | null;
      if (s) { setDate(s.date ?? ""); setGrade(s.grade ?? ""); setSubject(s.subject ?? ""); setChecks(s.checks ?? {}); setPrep(s.prep ?? {}); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify({ date, grade, subject, checks, prep } satisfies Saved)); } catch {}
  }, [ready, date, grade, subject, checks, prep]);

  const left = date ? daysUntil(date) : null;
  const stage = left !== null && left >= 0 ? examStage(left) : null;
  const levels = GRADE_CHOICES.find((g) => g.id === grade)?.levels;
  const area = (subject || null) as GuideProduct["area"] | null;
  const stageRecs = useMemo(() => {
    if (!stage) return [];
    const tagged = stage.tags ? recommend(products, { tags: stage.tags, area, levels, kinds: stage.kinds, limit: 3, allowAreaOnly: true }) : [];
    return tagged.length >= 3 ? tagged : [...tagged, ...recommend(products, { area, levels, kinds: stage.kinds, limit: 6 }).filter((r) => !tagged.some((t) => t.product.slug === r.product.slug))].slice(0, 3);
  }, [stage, products, area, levels]);
  const list = useMemo(() => (left !== null && left >= 0 ? dailyChecklist(left) : []), [left]);
  const doneCount = list.filter((d) => checks[`${date}:${d.day}`]).length;

  const prepMissing = PREP.filter((p) => !prep[p.id]);

  function consult(slugs: string[], diagnosis: string) {
    saveDraft({
      source: "시험 D-DAY 학습 설계", inquiryType: "book", slugs,
      grade: GRADE_CHOICES.find((g) => g.id === grade)?.label, subject: SUBJECTS.find((s) => s.id === subject)?.label || undefined,
      examDate: date || undefined, diagnosis, recommended: slugs,
      message: `시험일 ${date || "미정"}${left !== null ? `(D-${left})` : ""} 기준으로 필요한 교재 상담을 요청합니다.`,
    });
    router.push("/consult");
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div><Label htmlFor="exam-date" className="mb-1.5 block text-[13px] font-semibold">시험 날짜</Label><Input id="exam-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><Label htmlFor="exam-grade" className="mb-1.5 block text-[13px] font-semibold">학년 (선택)</Label><NativeSelect><select id="exam-grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-3.5 pr-9 text-[15px]"><option value="">전체 학년</option>{GRADE_CHOICES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}</select></NativeSelect></div>
        <div><Label htmlFor="exam-subject" className="mb-1.5 block text-[13px] font-semibold">과목 (선택)</Label><NativeSelect><select id="exam-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-3.5 pr-9 text-[15px]">{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></NativeSelect></div>
      </div>

      {date && left !== null && left < 0 && <p className="mt-6 text-[15px] text-destructive">이미 지난 날짜입니다. 다음 시험 날짜를 선택해 주세요.</p>}

      {stage && left !== null && (
        <>
          <section className="mt-10 border-t border-foreground/30 pt-6" aria-labelledby="stage">
            <p className="font-display text-[40px] leading-none tracking-[-0.02em] md:text-[56px]">{left === 0 ? "D-DAY" : `D-${left}`}</p>
            <h2 id="stage" className="mt-4 text-[22px] font-bold tracking-[-0.03em]">{stage.headline}</h2>
            <ul className="mt-3 max-w-xl list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed">{stage.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <p className="mt-4 text-[13px] text-muted-foreground">단계 기준: {EXAM_STAGES.filter((s) => s.id !== "d31").map((s) => s.label).join(" · ")}. 남은 기간이 31일 이상이면 개념 보완과 유형 정리부터 시작합니다.</p>
          </section>

          <section className="mt-10" aria-labelledby="stage-books">
            <h2 id="stage-books" className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">이 시기에 쓸 수 있는 교재 ({stage.kinds.map(kindLabel).join("·")} 중심)</h2>
            {stageRecs.length > 0 ? (
              <div className="mt-3">
                <RecList recs={stageRecs} />
                {sumPrice(stageRecs.map((r) => r.product)) !== null && <p className="mt-2 text-right text-[13px] text-muted-foreground">합계 <span className="font-semibold text-foreground tabular-nums">{formatPrice(sumPrice(stageRecs.map((r) => r.product))!)}</span></p>}
                <div className="mt-5"><button type="button" onClick={() => consult(stageRecs.map((r) => r.product.slug), `${left === 0 ? "D-DAY" : `D-${left}`} ${stage.headline}`)} data-consult-button className={primaryBtn}>이 교재로 상담 신청</button></div>
                {left <= 14 && <p className="mt-3 text-[12px] text-muted-foreground">주문 제작 교재는 제작과 납품에 시간이 걸릴 수 있어, 시험이 가까울수록 납품 가능 시점을 상담에서 먼저 확인해 주세요.</p>}
              </div>
            ) : <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">선택하신 조건에 맞는 교재가 아직 없습니다. <Link href="/custom" className="text-foreground underline underline-offset-4">맞춤 구성 상담</Link>으로 필요한 단원과 유형을 알려 주세요.</p>}
          </section>

          <section className="mt-12 border-t border-border pt-8" aria-labelledby="daily">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="daily" className="text-[22px] font-bold tracking-[-0.03em]">매일 공부 체크리스트</h2>
              <p className="text-[13px] text-muted-foreground">{doneCount} / {list.length}일 완료{left > 60 ? " (시험 60일 전부터 표시)" : ""}</p>
            </div>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {list.map((d) => {
                const k = `${date}:${d.day}`;
                return (
                  <li key={k}>
                    <label className="grid cursor-pointer grid-cols-[auto_4.5rem_1fr] items-baseline gap-3 py-2.5 text-[14px]">
                      <input type="checkbox" checked={Boolean(checks[k])} onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} className="size-4 translate-y-0.5 accent-[var(--primary)]" />
                      <span className="font-display text-[15px] text-muted-foreground tabular-nums">{d.dLabel}</span>
                      <span className={cn(checks[k] && "text-muted-foreground line-through")}>{d.task}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3 print:hidden"><button type="button" className={lineBtn} onClick={() => window.print()}>인쇄 / PDF로 저장</button></div>
          </section>
        </>
      )}

      <section className="mt-14 border-t border-border pt-8 print:hidden" aria-labelledby="prep">
        <h2 id="prep" className="text-[22px] font-bold tracking-[-0.03em]">시험 준비 체크리스트</h2>
        <p className="mt-2 text-[14px] text-muted-foreground">끝낸 항목을 체크하면, 아직 부족한 항목에 맞는 교재를 연결해 드립니다.</p>
        <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {PREP.map((p) => (
            <li key={p.id} className="border-b border-border"><label className="flex cursor-pointer items-center gap-3 py-3 text-[15px]"><input type="checkbox" checked={Boolean(prep[p.id])} onChange={(e) => setPrep({ ...prep, [p.id]: e.target.checked })} className="size-4 accent-[var(--primary)]" />{p.label}</label></li>
          ))}
        </ul>
        {prepMissing.length > 0 && prepMissing.length < PREP.length && (
          <div className="mt-6 space-y-5">
            <h3 className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">아직 부족한 항목에 연결된 교재</h3>
            {prepMissing.map((p) => {
              const recs = p.kinds.length ? recommend(products, { area, levels, kinds: p.kinds, limit: 2 }) : [];
              return (
                <div key={p.id}>
                  <p className="text-[15px] font-semibold">{p.label}</p>
                  {recs.length ? <ul className="mt-1 space-y-0.5 text-[14px]">{recs.map((r) => <li key={r.product.slug}><Link href={`/books/${r.product.slug}`} className="underline underline-offset-4">{r.product.title}</Link> <span className="text-muted-foreground tabular-nums">{r.product.price !== null ? formatPrice(r.product.price) : ""}</span></li>)}</ul>
                    : <p className="mt-1 text-[13px] text-muted-foreground">{p.id === "scope" ? "학교 시험 범위 공지를 확인해 학습 범위를 정리해 보세요." : p.id === "wrong" ? <>오답노트는 <Link href="/study/wrong-notes" className="underline underline-offset-4">무료 오답노트</Link>로 바로 만들 수 있습니다.</> : "연결할 교재가 아직 없습니다. 상담으로 문의해 주세요."}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>
      <div className="mt-8 print:hidden"><Disclaimer>학습 방향은 남은 기간에 따른 일반적인 안내이며 성적 향상을 보장하지 않습니다. 입력한 날짜와 체크 내용은 이 브라우저에만 저장됩니다.</Disclaimer></div>
    </div>
  );
}
