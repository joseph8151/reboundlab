"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarClock, Check, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addDays, todayKey, useStudyProgress } from "@/lib/study/use-progress";
import { cn } from "@/lib/utils";
import { STUDY_SUBJECTS } from "./study-timer";
import { SyncNote } from "./sync-note";

/** 복습 간격: 1일 → 3일 → 7일 → 14일 → 졸업 (망각 곡선에 맞춘 간격 반복) */
const INTERVALS = [1, 3, 7, 14];

export const REASONS = [
  { id: "concept", label: "개념 부족", tip: "개념서를 다시 보고, 정의를 내 말로 한 줄 적어 보세요." },
  { id: "condition", label: "조건 누락", tip: "문제의 조건에 밑줄을 긋고 풀이에서 쓴 조건에 체크하는 습관을 들이세요." },
  { id: "reading", label: "해석·독해 오류", tip: "틀린 문장을 끊어 읽기로 다시 해석하고, 지문 구조를 표시해 보세요." },
  { id: "careless", label: "계산·실수", tip: "어디서 틀렸는지 한 줄만 적고, 같은 유형 3문제로 확인하세요." },
  { id: "time", label: "시간 부족", tip: "유형별 제한 시간을 정해 타이머를 켜고 다시 풀어 보세요." },
] as const;

type Note = {
  id: string;
  createdAt: string;
  subject: string;
  source: string;
  question: string;
  reason: (typeof REASONS)[number]["id"];
  lesson: string;
  stage: number; // 0~4, 4 = 졸업
  nextReview: string;
};

export function WrongNotes() {
  const { value: notes, setValue: setNotes, synced } = useStudyProgress<Note[]>("wrong-notes", []);
  const [filter, setFilter] = useState<string>("due");
  const today = todayKey();

  const due = notes.filter((n) => n.stage < 4 && n.nextReview <= today);
  const visible = useMemo(() => {
    const list = filter === "due" ? due : filter === "all" ? notes : filter === "done" ? notes.filter((n) => n.stage >= 4) : notes.filter((n) => n.subject === filter);
    return [...list].sort((a, b) => a.nextReview.localeCompare(b.nextReview));
  }, [filter, notes, due]);

  const reasonStats = REASONS.map((r) => ({ ...r, count: notes.filter((n) => n.reason === r.id).length })).sort((a, b) => b.count - a.count);
  const topReason = reasonStats[0]?.count ? reasonStats[0] : null;

  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const note: Note = {
      id: crypto.randomUUID(),
      createdAt: today,
      subject: String(f.get("subject")),
      source: String(f.get("source") ?? "").trim().slice(0, 60),
      question: String(f.get("question") ?? "").trim().slice(0, 500),
      reason: f.get("reason") as Note["reason"],
      lesson: String(f.get("lesson") ?? "").trim().slice(0, 300),
      stage: 0,
      nextReview: addDays(today, INTERVALS[0]),
    };
    if (!note.question) return;
    setNotes((ns) => [note, ...ns].slice(0, 500));
    e.currentTarget.reset();
  }

  function review(id: string, ok: boolean) {
    setNotes((ns) =>
      ns.map((n) => {
        if (n.id !== id) return n;
        const stage = ok ? n.stage + 1 : 0;
        return { ...n, stage, nextReview: stage >= 4 ? n.nextReview : addDays(today, INTERVALS[stage]) };
      }),
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile label="오늘 복습할 문제" value={`${due.length}개`} highlight={due.length > 0} />
        <Tile label="전체 오답" value={`${notes.length}개`} />
        <Tile label="졸업(4회 복습 성공)" value={`${notes.filter((n) => n.stage >= 4).length}개`} />
      </div>
      {topReason && (
        <p className="rounded-xl bg-accent p-4 text-sm leading-relaxed">
          가장 많이 틀린 이유는 <strong>{topReason.label}</strong>({topReason.count}회)이에요. {topReason.tip}
        </p>
      )}

      <form onSubmit={add} className="rounded-2xl border border-border p-5 sm:p-6">
        <p className="font-bold">오답 기록하기</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="wn-subject">과목</Label>
            <NativeSelect id="wn-subject" name="subject" defaultValue="english">
              {STUDY_SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wn-source">출처</Label>
            <Input id="wn-source" name="source" placeholder="예: 9월 모의평가 34번 / 수학 변형문제 유형 17" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="wn-question">무엇을 틀렸나요? *</Label>
          <Textarea id="wn-question" name="question" rows={3} required placeholder="문제 요약이나 핵심 문장을 적어 두세요. 다시 볼 때 이것만 보고 풀 수 있게." />
        </div>
        <div className="mt-4 space-y-2">
          <Label>틀린 이유 *</Label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r, i) => (
              <label key={r.id} className="cursor-pointer">
                <input type="radio" name="reason" value={r.id} defaultChecked={i === 0} className="peer sr-only" />
                <span className="inline-block rounded-full border border-border px-3 py-1.5 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="wn-lesson">다음엔 이렇게 푼다</Label>
          <Input id="wn-lesson" name="lesson" placeholder="예: However 뒤 문장이 요지. 통념 부분 선택지는 지운다." />
        </div>
        <Button type="submit" className="mt-5">저장하고 내일 복습 예약</Button>
        <div className="mt-3"><SyncNote synced={synced} /></div>
      </form>

      <section>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: "due", label: `오늘 복습 ${due.length}` }, { id: "all", label: "전체" }, ...STUDY_SUBJECTS.map((s) => ({ id: s.id, label: s.label })), { id: "done", label: "졸업" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              aria-pressed={filter === t.id}
              className={cn("h-9 shrink-0 rounded-full border px-4 text-sm font-medium", filter === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")}
            >
              {t.label}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            {filter === "due" ? "오늘 복습할 문제가 없어요. 새로 틀린 문제를 기록해 보세요." : "기록이 없어요."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {visible.map((n) => {
              const subj = STUDY_SUBJECTS.find((s) => s.id === n.subject);
              const reason = REASONS.find((r) => r.id === n.reason);
              const isDue = n.stage < 4 && n.nextReview <= today;
              return (
                <li key={n.id} className={cn("rounded-2xl border p-5", isDue ? "border-primary/40" : "border-border")}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge>{subj?.label ?? n.subject}</Badge>
                    <Badge variant="outline">{reason?.label}</Badge>
                    {n.source && <span className="text-xs text-muted-foreground">{n.source}</span>}
                    <button aria-label="삭제" className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted" onClick={() => confirm("이 오답 기록을 삭제할까요?") && setNotes((ns) => ns.filter((x) => x.id !== n.id))}>
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{n.question}</p>
                  {n.lesson && <p className="mt-2 text-sm text-primary">→ {n.lesson}</p>}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" />
                      {n.stage >= 4 ? "졸업" : `복습 ${n.stage}/4 · 다음 복습 ${n.nextReview}`}
                    </p>
                    {isDue && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => review(n.id, false)}><RotateCcw /> 또 틀림</Button>
                        <Button size="sm" onClick={() => review(n.id, true)}><Check /> 맞혔어요</Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold", highlight && "text-primary")}>{value}</p>
    </div>
  );
}
