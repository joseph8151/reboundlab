"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Disclaimer, Options, primaryBtn } from "./ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WEAK_TAGS } from "@/lib/catalog";
import { saveDraft } from "@/lib/consult";
import { GRADE_CHOICES, LEVEL_BANDS } from "@/lib/guide";

const SUBJECTS = [{ id: "korean", label: "국어" }, { id: "math", label: "수학" }, { id: "english", label: "영어" }, { id: "social", label: "사회탐구" }, { id: "science", label: "과학탐구" }];
const ANSWERS = [{ id: "해설 포함 필요", label: "정답·해설 모두 필요" }, { id: "정답만 필요", label: "정답만 필요" }, { id: "필요 없음", label: "필요 없음" }];
const lab = "mb-1.5 block text-[13px] font-semibold";

export function CustomBook() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [weak, setWeak] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [questions, setQuestions] = useState("");
  const [pages, setPages] = useState("");
  const [answer, setAnswer] = useState("해설 포함 필요");
  const [exam, setExam] = useState("");
  const [extra, setExtra] = useState("");
  const [err, setErr] = useState("");

  const gradeLabel = GRADE_CHOICES.find((g) => g.id === grade)?.label ?? "";
  const subjectLabel = SUBJECTS.find((s) => s.id === subject)?.label ?? "";
  const weakLabels = WEAK_TAGS.filter((t) => weak.includes(t.id)).map((t) => t.label);
  const levelLabel = LEVEL_BANDS.find((b) => b.id === level)?.label ?? "";
  const rows: [string, string][] = ([
    ["학년", gradeLabel], ["과목", subjectLabel], ["단원", unit.trim()], ["취약 유형", weakLabels.join(", ")], ["목표 난이도", levelLabel],
    ["희망 문제 수", questions ? `${questions}문항` : ""], ["희망 페이지 수", pages ? `${pages}쪽` : ""], ["정답·해설", answer], ["시험 예정일", exam], ["추가 요청", extra.trim()],
  ] as [string, string][]).filter(([, v]) => v);

  function submit() {
    if (!gradeLabel || !subjectLabel) return setErr("학년과 과목을 선택해 주세요.");
    setErr("");
    const spec = rows.map(([k, v]) => `${k}: ${v}`).join(" / ");
    saveDraft({
      source: "MELISSA CUSTOM BOOK", inquiryType: "custom", grade: gradeLabel, subject: subjectLabel, currentLevel: undefined, targetLevel: levelLabel || undefined,
      examDate: exam || undefined, weakTypes: weakLabels, customSpec: spec,
      message: `나만의 문제집 구성 상담을 요청합니다. 제작 가능 여부와 가격, 납품 일정을 안내해 주세요.\n${spec}`,
    });
    router.push("/consult?type=custom");
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
      <div className="space-y-8">
        <div><p className={lab}>학년 *</p><Options value={grade} onChange={setGrade} items={GRADE_CHOICES.map((g) => ({ id: g.id, label: g.label }))} columns={3} /></div>
        <div><p className={lab}>과목 *</p><Options value={subject} onChange={(v) => { setSubject(v); setWeak([]); }} items={SUBJECTS} columns={3} /></div>
        <div><Label htmlFor="cb-unit" className={lab}>단원</Label><Input id="cb-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="예: 다항식, 이차방정식 / 독서 사회·경제 지문" maxLength={120} /></div>
        <div><p className={lab}>취약 유형 (여러 개 선택)</p><Options multiple value={weak} onChange={(v) => setWeak((w) => (w.includes(v) ? w.filter((x) => x !== v) : [...w, v]))} items={WEAK_TAGS.filter((t) => !subject || t.area === subject || t.area === "common").map((t) => ({ id: t.id, label: t.label }))} columns={3} /></div>
        <div><p className={lab}>목표 난이도</p><Options value={level} onChange={setLevel} items={LEVEL_BANDS.map((b) => ({ id: b.id, label: b.label, note: b.note }))} /></div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div><Label htmlFor="cb-q" className={lab}>희망 문제 수</Label><Input id="cb-q" type="number" min={0} max={2000} inputMode="numeric" value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder="예: 100" /></div>
          <div><Label htmlFor="cb-p" className={lab}>희망 페이지 수</Label><Input id="cb-p" type="number" min={0} max={1000} inputMode="numeric" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="예: 40" /></div>
          <div><Label htmlFor="cb-e" className={lab}>시험 예정일</Label><Input id="cb-e" type="date" value={exam} onChange={(e) => setExam(e.target.value)} /></div>
        </div>
        <div><p className={lab}>정답·해설</p><Options value={answer} onChange={setAnswer} items={ANSWERS} columns={3} /></div>
        <div><Label htmlFor="cb-x" className={lab}>추가 요청 사항</Label><Textarea id="cb-x" rows={4} value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={800} className="text-[16px]" /></div>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-border bg-card p-5">
          <h2 className="text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">선택한 구성</h2>
          {rows.length ? (
            <dl className="mt-3 space-y-2 text-[14px]">
              {rows.map(([k, v]) => <div key={k}><dt className="text-[12px] text-muted-foreground">{k}</dt><dd className="break-words">{v}</dd></div>)}
            </dl>
          ) : <p className="mt-3 text-[13px] text-muted-foreground">항목을 선택하면 여기에 요약됩니다.</p>}
          {err && <p role="alert" className="mt-3 text-[13px] text-destructive">{err}</p>}
          <button type="button" onClick={submit} data-consult-button className={`${primaryBtn} mt-5 w-full`}>이 구성으로 상담 신청</button>
        </div>
        <div className="mt-4"><Disclaimer>문제집이 즉시 만들어지는 기능이 아닙니다. 상담 신청 후 담당자가 제작 가능 여부, 가격, 납품 일정을 문자 또는 전화로 안내해 드립니다. 입력하신 구성은 상담 신청과 함께 전달됩니다.</Disclaimer></div>
      </aside>
    </div>
  );
}
