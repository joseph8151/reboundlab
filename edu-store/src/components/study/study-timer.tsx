"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { addDays, todayKey, useStudyProgress } from "@/lib/study/use-progress";
import { cn } from "@/lib/utils";
import { SyncNote } from "./sync-note";

/** 범주형 팔레트 (색각 이상 대비 검증 완료). 과목 색은 순서가 아니라 과목에 고정됩니다. */
export const STUDY_SUBJECTS = [
  { id: "korean", label: "국어", color: "#7b263b" },
  { id: "math", label: "수학", color: "#4a1d28" },
  { id: "english", label: "영어", color: "#d88fa0" },
  { id: "inquiry", label: "탐구", color: "#d9a63a" },
  { id: "etc", label: "기타", color: "#c9b79a" },
] as const;
type SubjectId = (typeof STUDY_SUBJECTS)[number]["id"];

export type Session = { id: string; date: string; subject: SubjectId; minutes: number };
export type StudyTimeState = { sessions: Session[]; running: { subject: SubjectId; startedAt: number } | null };

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function mondayOf(key: string) {
  const d = new Date(`${key}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return addDays(key, -dow);
}

export const fmtMinutes = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}` : `${m}분`);

export function StudyTimer() {
  const { value: state, setValue: setState, synced } = useStudyProgress<StudyTimeState>("study-time", { sessions: [], running: null });
  const [subject, setSubject] = useState<SubjectId>("english");
  const [now, setNow] = useState(Date.now());
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayKey()));
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!state.running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.running]);

  function start() {
    setNow(Date.now());
    setState((s) => ({ ...s, running: { subject, startedAt: Date.now() } }));
  }

  function stop() {
    setState((s) => {
      if (!s.running) return s;
      const minutes = Math.max(1, Math.round((Date.now() - s.running.startedAt) / 60000));
      const session: Session = { id: crypto.randomUUID(), date: todayKey(new Date(s.running.startedAt)), subject: s.running.subject, minutes: Math.min(minutes, 720) };
      return { sessions: [...s.sessions, session].slice(-2000), running: null };
    });
  }

  function addManual(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const minutes = Math.round(Number(f.get("minutes")));
    if (!minutes || minutes <= 0 || minutes > 720) return;
    const session: Session = { id: crypto.randomUUID(), date: String(f.get("date")) || todayKey(), subject: f.get("subject") as SubjectId, minutes };
    setState((s) => ({ ...s, sessions: [...s.sessions, session] }));
    e.currentTarget.reset();
  }

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const week = useMemo(
    () =>
      days.map((date) => {
        const byS = Object.fromEntries(STUDY_SUBJECTS.map((s) => [s.id, 0])) as Record<SubjectId, number>;
        state.sessions.filter((x) => x.date === date).forEach((x) => (byS[x.subject] += x.minutes));
        return { date, byS, total: Object.values(byS).reduce((a, b) => a + b, 0) };
      }),
    [days, state.sessions],
  );
  const weekTotal = week.reduce((a, d) => a + d.total, 0);
  const totals = STUDY_SUBJECTS.map((s) => ({ ...s, minutes: week.reduce((a, d) => a + d.byS[s.id], 0) })).sort((a, b) => b.minutes - a.minutes);
  const maxDay = Math.max(60, ...week.map((d) => d.total));
  const axisMax = Math.ceil(maxDay / 60) * 60;
  const elapsed = state.running ? Math.floor((now - state.running.startedAt) / 1000) : 0;
  const runningLabel = STUDY_SUBJECTS.find((s) => s.id === state.running?.subject)?.label;
  const todaySessions = state.sessions.filter((s) => s.date === todayKey()).slice().reverse();

  return (
    <div className="space-y-8">
      {/* 스톱워치 */}
      <section className="rounded-2xl border border-border p-5 sm:p-6">
        <p className="font-bold">순공 스톱워치</p>
        <p className="mt-1 text-sm text-muted-foreground">책상에 앉아 실제로 공부한 시간만 재세요. 쉬는 시간에는 멈춥니다.</p>
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
          <p className="font-mono text-5xl font-bold tabular-nums tracking-tight">
            {String(Math.floor(elapsed / 3600)).padStart(2, "0")}:{String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </p>
          <div className="flex w-full flex-1 gap-2 sm:justify-end">
            {state.running ? (
              <Button size="lg" className="flex-1 sm:flex-none" onClick={stop}><Pause /> {runningLabel} 기록 저장</Button>
            ) : (
              <>
                <NativeSelect aria-label="과목" value={subject} onChange={(e) => setSubject(e.target.value as SubjectId)} className="w-28">
                  {STUDY_SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </NativeSelect>
                <Button size="lg" className="flex-1 sm:flex-none" onClick={start}><Play /> 시작</Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-4"><SyncNote synced={synced} /></div>
      </section>

      {/* 주간 분석 */}
      <section className="rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="font-bold">주간 순공 시간 분석</p>
          <div className="flex items-center gap-1 text-sm">
            <Button size="icon" variant="ghost" aria-label="이전 주" onClick={() => setWeekStart((w) => addDays(w, -7))}><ChevronLeft /></Button>
            <span className="tabular-nums text-muted-foreground">{weekStart.slice(5).replace("-", ".")} ~ {addDays(weekStart, 6).slice(5).replace("-", ".")}</span>
            <Button size="icon" variant="ghost" aria-label="다음 주" disabled={weekStart >= mondayOf(todayKey())} onClick={() => setWeekStart((w) => addDays(w, 7))}><ChevronRight /></Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Tile label="주간 순공" value={fmtMinutes(weekTotal)} />
          <Tile label="하루 평균" value={fmtMinutes(Math.round(weekTotal / 7))} />
          <Tile label="가장 많이 한 과목" value={totals[0].minutes ? totals[0].label : "-"} />
        </div>

        {/* 범례 */}
        <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="범례">
          {STUDY_SUBJECTS.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: s.color }} />{s.label}</li>
          ))}
        </ul>

        {/* 일별 누적 막대 */}
        <div className="relative mt-6 h-56" role="img" aria-label="요일별 과목별 순공 시간 누적 막대 차트">
          {Array.from({ length: axisMax / 60 + 1 }).map((_, i) => (
            <div key={i} className="absolute inset-x-0 flex items-center" style={{ bottom: `${(i * 60 * 100) / axisMax}%` }}>
              <span className="w-8 -translate-y-1/2 text-[10px] text-muted-foreground">{i}h</span>
              <div className="h-px flex-1 bg-border/70" />
            </div>
          ))}
          <div className="absolute inset-y-0 left-8 right-0 grid grid-cols-7 gap-2 sm:gap-4">
            {week.map((d, i) => (
              <div
                key={d.date}
                className="relative flex h-full flex-col items-center justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover((h) => (h === i ? null : i))}
              >
                <div className="flex w-full max-w-9 flex-col-reverse gap-[2px]" style={{ height: `${(d.total / axisMax) * 100}%` }}>
                  {STUDY_SUBJECTS.filter((s) => d.byS[s.id] > 0).map((s, idx, arr) => (
                    <div
                      key={s.id}
                      className={cn("w-full", idx === arr.length - 1 && "rounded-t-[4px]")}
                      style={{ background: s.color, flexGrow: d.byS[s.id], flexBasis: 0, opacity: hover === null || hover === i ? 1 : 0.45 }}
                    />
                  ))}
                </div>
                {hover === i && d.total > 0 && (
                  <div className="pointer-events-none absolute bottom-full z-10 mb-1 w-36 rounded-lg border border-border bg-background p-2.5 text-xs shadow-lg">
                    <p className="font-semibold">{DAY_LABELS[i]} · {fmtMinutes(d.total)}</p>
                    {STUDY_SUBJECTS.filter((s) => d.byS[s.id] > 0).map((s) => (
                      <p key={s.id} className="mt-1 flex items-center justify-between gap-2 text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm" style={{ background: s.color }} />{s.label}</span>
                        <span className="text-foreground">{fmtMinutes(d.byS[s.id])}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="ml-8 mt-2 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground sm:gap-4">
          {week.map((d, i) => <span key={d.date} className={cn(d.date === todayKey() && "font-bold text-foreground")}>{DAY_LABELS[i]}</span>)}
        </div>

        {/* 과목별 합계 (표 보기) */}
        <ul className="mt-6 space-y-2.5">
          {totals.map((s) => (
            <li key={s.id} className="grid grid-cols-[3rem_1fr_5.5rem] items-center gap-3 text-sm">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="h-2.5 rounded-full bg-muted">
                <span className="block h-2.5 rounded-full" style={{ width: weekTotal ? `${(s.minutes / weekTotal) * 100}%` : 0, background: s.color }} />
              </span>
              <span className="text-right tabular-nums">{fmtMinutes(s.minutes)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 직접 입력 & 오늘 기록 */}
      <section className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={addManual} className="rounded-2xl border border-border p-5 sm:p-6">
          <p className="font-bold">기록 직접 추가</p>
          <p className="mt-1 text-sm text-muted-foreground">스톱워치를 깜빡했다면 여기서 입력하세요.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Input name="date" type="date" defaultValue={todayKey()} max={todayKey()} aria-label="날짜" className="col-span-3 sm:col-span-1" />
            <NativeSelect name="subject" defaultValue="english" aria-label="과목">
              {STUDY_SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </NativeSelect>
            <Input name="minutes" type="number" min={1} max={720} placeholder="분" aria-label="공부 시간(분)" required />
          </div>
          <Button type="submit" variant="outline" className="mt-3"><Plus /> 추가</Button>
        </form>
        <div className="rounded-2xl border border-border p-5 sm:p-6">
          <p className="font-bold">오늘 기록</p>
          {todaySessions.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">아직 기록이 없어요.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border text-sm">
              {todaySessions.map((s) => {
                const subj = STUDY_SUBJECTS.find((x) => x.id === s.subject)!;
                return (
                  <li key={s.id} className="flex items-center gap-2 py-2">
                    <span className="size-2.5 rounded-sm" style={{ background: subj.color }} />
                    <span>{subj.label}</span>
                    <span className="ml-auto tabular-nums">{fmtMinutes(s.minutes)}</span>
                    <button aria-label="기록 삭제" className="rounded p-1 text-muted-foreground hover:bg-muted" onClick={() => setState((st) => ({ ...st, sessions: st.sessions.filter((x) => x.id !== s.id) }))}>
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-3 sm:p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold sm:text-xl">{value}</p>
    </div>
  );
}
