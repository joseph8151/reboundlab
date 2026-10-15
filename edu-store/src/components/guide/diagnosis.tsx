"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Disclaimer, Options, RecList, StepHead, lineBtn, primaryBtn } from "./ui";
import { WEAK_TAGS, kindLabel, weakTagLabel } from "@/lib/catalog";
import { saveDraft } from "@/lib/consult";
import { GRADE_CHOICES, LEVEL_BANDS, orderForStudy, recommend, sumPrice, type GuideProduct, type Rec } from "@/lib/guide";
import { formatPrice } from "@/lib/utils";

const SUBJECTS = [
  { id: "korean", label: "국어" }, { id: "math", label: "수학" }, { id: "english", label: "영어" },
  { id: "social", label: "사회탐구" }, { id: "science", label: "과학탐구" },
] as const;
const REMAIN = [
  { id: "30", label: "한 달 이내", days: 30 }, { id: "90", label: "1~3개월", days: 90 },
  { id: "180", label: "3~6개월", days: 180 }, { id: "365", label: "6개월 이상", days: 365 }, { id: "none", label: "정해진 시험 일정 없음", days: 0 },
];
const WEEKS: Record<string, number> = { concept: 3, variant: 3, "past-exam": 4, mock: 2, material: 2 };

export function Diagnosis({ products }: { products: GuideProduct[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");
  const [weak, setWeak] = useState<string[]>([]);
  const [remain, setRemain] = useState("");
  const [done, setDone] = useState(false);

  const gradeInfo = GRADE_CHOICES.find((g) => g.id === grade);
  const weakOptions = WEAK_TAGS.filter((t) => t.area === subject || t.id === "time" || t.id === "wrong-note" || (t.id === "school-score" && gradeInfo && !["suneung"].includes(gradeInfo.id)));
  const total = 6;
  const answered = [grade, subject, current, target, weak.length ? "x" : "", remain][step - 1];

  const result = useMemo(() => {
    if (!done) return null;
    const area = subject as GuideProduct["area"];
    const levels = gradeInfo?.levels;
    const cIdx = LEVEL_BANDS.findIndex((b) => b.id === current);
    const tIdx = LEVEL_BANDS.findIndex((b) => b.id === target);
    const base = { tags: weak, area, levels, allowAreaOnly: true } as const;
    const picked: Rec[] = [];
    const add = (rs: Rec[]) => rs.forEach((r) => picked.length < 3 && !picked.some((p) => p.product.slug === r.product.slug) && picked.push(r));
    add(recommend(products, { ...base, band: LEVEL_BANDS[cIdx].id, limit: 4 }));
    add(recommend(products, { ...base, band: LEVEL_BANDS[Math.max(tIdx, cIdx)].id, limit: 4 }));
    add(recommend(products, { area, levels, limit: 6, band: LEVEL_BANDS[cIdx].id }));
    const ordered = orderForStudy(picked);
    const gap = Math.max(0, tIdx - cIdx);
    const weeks = ordered.reduce((s, r) => s + (WEEKS[r.product.kind] ?? 3), 0) + gap;
    const days = REMAIN.find((r) => r.id === remain)?.days ?? 0;
    return { ordered, gap, weeks, days, price: sumPrice(ordered.map((r) => r.product)), cLabel: LEVEL_BANDS[cIdx].label, tLabel: LEVEL_BANDS[tIdx].label };
  }, [done, products, subject, gradeInfo, current, target, weak, remain]);

  function consult() {
    if (!result) return;
    const subjectLabel = SUBJECTS.find((s) => s.id === subject)?.label ?? "";
    const weakLabels = weak.map(weakTagLabel);
    saveDraft({
      source: "3분 학습 진단",
      inquiryType: "book",
      slugs: result.ordered.map((r) => r.product.slug),
      grade: gradeInfo?.label,
      subject: subjectLabel,
      currentLevel: result.cLabel,
      targetLevel: result.tLabel,
      weakTypes: weakLabels,
      diagnosis: `현재 ${result.cLabel} → 목표 ${result.tLabel}, 남은 기간 ${REMAIN.find((r) => r.id === remain)?.label}, 어려운 유형: ${weakLabels.join(", ")}`,
      recommended: result.ordered.map((r) => r.product.title),
      message: `3분 학습 진단 결과로 교재 상담을 요청합니다. (${gradeInfo?.label} ${subjectLabel}, 어려운 유형: ${weakLabels.join(", ")})`,
    });
    router.push("/consult");
  }

  if (done && result) {
    const n = result.ordered.length;
    return (
      <div>
        <h2 className="text-[28px] font-bold tracking-[-0.035em] md:text-[34px]">지금 필요한 공부를 찾아보세요.</h2>
        <p className="mt-3 text-[14px] text-muted-foreground">{gradeInfo?.label} · {SUBJECTS.find((s) => s.id === subject)?.label} · 현재 {result.cLabel} → 목표 {result.tLabel}</p>

        <section className="mt-10 border-t border-foreground/30 pt-5" aria-labelledby="r-focus">
          <h3 id="r-focus" className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">보완할 주요 학습 영역</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {weak.map((w) => <li key={w} className="border border-border bg-card px-3 py-1.5 text-[14px]">{weakTagLabel(w)}</li>)}
          </ul>
          <p className="mt-3 text-[14px] leading-relaxed text-foreground/80">
            {result.gap > 0 ? `현재 단계에서 목표 단계까지 ${result.gap}단계 차이가 있습니다. 선택하신 어려운 유형을 먼저 보완한 뒤 목표 단계의 훈련으로 이어가는 순서를 권합니다.` : "현재 단계와 목표 단계가 같아, 선택하신 어려운 유형을 반복 훈련하는 구성을 권합니다."}
          </p>
        </section>

        {n > 0 ? (
          <>
            <section className="mt-10" aria-labelledby="r-order">
              <h3 id="r-order" className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">추천 학습 순서와 추천 교재 {n}권</h3>
              <div className="mt-3"><RecList recs={result.ordered} numbered /></div>
              <p className="mt-3 text-[12px] text-muted-foreground">순서: {result.ordered.map((r) => kindLabel(r.product.kind)).join(" → ")}</p>
            </section>
            <section className="mt-10 grid gap-6 border-t border-foreground/30 pt-5 sm:grid-cols-2">
              <div>
                <h3 className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">예상 학습 기간</h3>
                <p className="mt-2 text-[20px] font-semibold">약 {result.weeks}주</p>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">교재당 평균 2~4주로 가정한 일반적인 안내입니다. 개인의 학습 시간에 따라 달라집니다.{result.days > 0 && result.weeks * 7 > result.days ? " 남은 기간보다 길어, 앞의 교재부터 우선하는 구성을 권합니다." : ""}</p>
              </div>
              <div>
                <h3 className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">추천 교재 합계 가격</h3>
                <p className="mt-2 text-[20px] font-semibold tabular-nums">{result.price !== null ? formatPrice(result.price) : "상담 시 안내"}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">각 교재의 판매가 합계입니다.</p>
              </div>
            </section>
          </>
        ) : (
          <p className="mt-10 border-t border-border pt-6 text-[15px] leading-relaxed">선택하신 조건에 연결된 교재가 아직 등록되어 있지 않습니다. 필요한 단원과 유형을 알려 주시면 제작 가능 여부를 상담으로 안내해 드립니다.</p>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={consult} data-consult-button className={primaryBtn}>이 진단 결과로 교재 상담 신청</button>
          <Link href="/custom" className={lineBtn}>나만의 구성 상담</Link>
          <button type="button" className="h-12 px-3 text-[14px] text-muted-foreground underline underline-offset-4" onClick={() => { setDone(false); setStep(1); setGrade(""); setSubject(""); setCurrent(""); setTarget(""); setWeak([]); setRemain(""); }}>다시 진단하기</button>
        </div>
        <div className="mt-8"><Disclaimer>이 결과는 실제 시험이 아닌 간단한 설문 응답을 바탕으로 한 학습 방향 안내입니다. 실력의 객관적 측정이나 등급 예측이 아니며, 성적 향상을 보장하지 않습니다. 상담 신청 시 입력하신 선택 내용이 함께 전달됩니다.</Disclaimer></div>
      </div>
    );
  }

  const heads = [
    ["학년을 선택해 주세요", undefined], ["공부할 과목을 선택해 주세요", undefined], ["현재 성적대를 선택해 주세요", "정확한 등급이 아니라 현재 학습 단계에 가까운 설명을 골라 주세요."],
    ["목표 성적대를 선택해 주세요", undefined], ["어려운 문제 유형을 선택해 주세요", "여러 개 선택할 수 있습니다."], ["시험까지 남은 기간은 어느 정도인가요?", undefined],
  ] as const;

  return (
    <div>
      <StepHead step={step} total={total} title={heads[step - 1][0]} hint={heads[step - 1][1]} />
      <div className="mt-6">
        {step === 1 && <Options value={grade} onChange={setGrade} items={GRADE_CHOICES.map((g) => ({ id: g.id, label: g.label }))} columns={3} />}
        {step === 2 && <Options value={subject} onChange={(v) => { setSubject(v); setWeak([]); }} items={SUBJECTS.map((s) => ({ id: s.id, label: s.label }))} columns={3} />}
        {step === 3 && <Options columns={1} value={current} onChange={setCurrent} items={LEVEL_BANDS.map((b) => ({ id: b.id, label: b.label, note: b.note }))} />}
        {step === 4 && <Options columns={1} value={target} onChange={setTarget} items={LEVEL_BANDS.map((b) => ({ id: b.id, label: b.label, note: b.note }))} />}
        {step === 5 && <Options multiple value={weak} onChange={(v) => setWeak((w) => (w.includes(v) ? w.filter((x) => x !== v) : [...w, v]))} items={weakOptions.map((t) => ({ id: t.id, label: t.label }))} columns={3} />}
        {step === 6 && <Options columns={1} value={remain} onChange={setRemain} items={REMAIN.map((r) => ({ id: r.id, label: r.label }))} />}
      </div>
      <div className="mt-8 flex items-center gap-3">
        {step > 1 && <button type="button" className={lineBtn} onClick={() => setStep(step - 1)}>이전</button>}
        {step < total ? (
          <button type="button" className={primaryBtn} disabled={!answered} onClick={() => setStep(step + 1)}>다음</button>
        ) : (
          <button type="button" className={primaryBtn} disabled={!answered} onClick={() => setDone(true)}>결과 보기</button>
        )}
      </div>
    </div>
  );
}
