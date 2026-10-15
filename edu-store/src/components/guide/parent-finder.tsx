"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Disclaimer, Options, RecList, lineBtn, primaryBtn } from "./ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveDraft } from "@/lib/consult";
import { CONCERNS, GRADE_CHOICES, daysUntil, recommend, sumPrice, type GuideProduct } from "@/lib/guide";
import { formatPrice } from "@/lib/utils";

const SUBJECTS = [{ id: "korean", label: "국어" }, { id: "math", label: "수학" }, { id: "english", label: "영어" }, { id: "social", label: "사회탐구" }, { id: "science", label: "과학탐구" }];
const GOALS = [{ id: "concept", label: "개념을 제대로 이해하기" }, { id: "school", label: "학교 내신 성적 관리" }, { id: "csat", label: "수능 대비" }, { id: "practice", label: "실전 문제 훈련" }];
const lab = "mb-2 block text-[13px] font-semibold";

export function ParentFinder({ products }: { products: GuideProduct[] }) {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [concern, setConcern] = useState("");
  const [goal, setGoal] = useState("");
  const [exam, setExam] = useState("");
  const [shown, setShown] = useState(false);

  const g = GRADE_CHOICES.find((x) => x.id === grade);
  const c = CONCERNS.find((x) => x.id === concern);
  const recs = useMemo(() => {
    if (!shown || !g || !subject) return [];
    const kinds = goal === "concept" ? ["concept" as const] : goal === "practice" ? ["mock" as const, "variant" as const] : goal === "csat" ? ["past-exam" as const, "variant" as const] : undefined;
    return recommend(products, { tags: c ? [...c.tags] : [], area: subject as GuideProduct["area"], levels: g.levels, kinds, allowAreaOnly: true, limit: 3 });
  }, [shown, g, subject, c, goal, products]);
  const left = exam ? daysUntil(exam) : null;
  const subjLabel = SUBJECTS.find((s) => s.id === subject)?.label ?? "";
  const concernOptions = CONCERNS.filter((x) => !subject || x.area === subject || x.area === null);

  function consult() {
    saveDraft({
      source: "우리 아이 교재 찾기", inquiryType: "parent", slugs: recs.map((r) => r.product.slug), grade: g?.label, subject: subjLabel, examDate: exam || undefined,
      diagnosis: [c?.label, GOALS.find((x) => x.id === goal)?.label].filter(Boolean).join(" / "), recommended: recs.map((r) => r.product.title),
      message: `자녀(${g?.label}, ${subjLabel})에게 맞는 교재 상담을 요청합니다.${c ? ` 현재 고민: ${c.label}.` : ""}`,
    });
    router.push("/consult?type=parent");
  }

  return (
    <div className="space-y-8">
      <div><p className={lab}>자녀 학년 *</p><Options value={grade} onChange={setGrade} items={GRADE_CHOICES.map((x) => ({ id: x.id, label: x.label }))} columns={3} /></div>
      <div><p className={lab}>과목 *</p><Options value={subject} onChange={(v) => { setSubject(v); setConcern(""); }} items={SUBJECTS} columns={3} /></div>
      <div><p className={lab}>현재 학습 고민</p><Options columns={1} value={concern} onChange={(v) => setConcern(concern === v ? "" : v)} items={concernOptions.map((x) => ({ id: x.id, label: x.label }))} /></div>
      <div><p className={lab}>목표</p><Options value={goal} onChange={setGoal} items={GOALS} /></div>
      <div className="max-w-xs"><Label htmlFor="pf-exam" className={lab}>시험 일정 (선택)</Label><Input id="pf-exam" type="date" value={exam} onChange={(e) => setExam(e.target.value)} /></div>
      <button type="button" className={primaryBtn} disabled={!grade || !subject} onClick={() => setShown(true)}>맞는 교재 보기</button>

      {shown && (
        <section className="border-t border-foreground/30 pt-8" aria-labelledby="pf-result">
          <h2 id="pf-result" className="text-[24px] font-bold tracking-[-0.03em]">{g?.label} {subjLabel}, 이런 교재를 권해 드립니다</h2>
          {left !== null && left >= 0 && <p className="mt-2 text-[14px] text-muted-foreground">시험까지 {left}일 남았습니다. 남은 기간이 짧다면 새 교재를 늘리기보다 취약한 부분을 집중해서 복습하는 쪽이 좋습니다.</p>}
          {recs.length > 0 ? (
            <div className="mt-5">
              <RecList recs={recs} />
              {sumPrice(recs.map((r) => r.product)) !== null && <p className="mt-2 text-right text-[13px] text-muted-foreground">합계 <span className="font-semibold text-foreground tabular-nums">{formatPrice(sumPrice(recs.map((r) => r.product))!)}</span></p>}
              <p className="mt-4 text-[14px] leading-relaxed text-foreground/80">학부모님께: 위 교재는 선택하신 학년·과목과 고민에 연결된 순서대로 보여 드립니다. 아이의 현재 수준과 학습 습관에 따라 맞는 교재가 달라질 수 있으니, 상담에서 함께 정해 드립니다.</p>
              <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={consult} data-consult-button className={primaryBtn}>학부모 상담 신청</button><Link href="/compare" className={lineBtn}>교재 비교</Link></div>
            </div>
          ) : (
            <div className="mt-5"><p className="text-[15px] leading-relaxed">선택하신 조건에 연결된 교재가 아직 등록되어 있지 않습니다. 상담으로 제작 가능 여부와 일정을 안내해 드립니다.</p><div className="mt-5"><button type="button" onClick={consult} data-consult-button className={primaryBtn}>학부모 상담 신청</button></div></div>
          )}
        </section>
      )}
      <Disclaimer>학부모용 안내입니다. 만 14세 미만 자녀의 이름·연락처는 받지 않으며, 상담은 보호자 연락처로 진행합니다. 추천은 규칙 기반 안내이며 성적 향상을 보장하지 않습니다.</Disclaimer>
    </div>
  );
}
