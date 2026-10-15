"use client";

import { useState, type FormEvent } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, daysBetween, todayKey, useStudyProgress } from "@/lib/study/use-progress";
import { cn } from "@/lib/utils";
import { SyncNote } from "./sync-note";

const TOTAL = 66;
const MAX_HABITS = 3;
const PRESETS = ["영단어 30일 챌린지 하루 1 Day", "영어 지문 2개 속독 훈련", "오답노트 20분 정리", "아침 6시 30분 기상", "순공 시간 4시간 채우기"];

export type Habit = { id: string; name: string; start: string; checks: string[] };

const STAGES = [
  { from: 1, to: 22, name: "1단계 · 시작하기", desc: "의지로 버티는 구간. 시간과 장소를 고정해 '언제 할지' 고민하지 않게 만드세요." },
  { from: 23, to: 44, name: "2단계 · 흔들림 버티기", desc: "가장 많이 포기하는 구간. 하루 빠져도 괜찮아요. 이틀 연속으로만 빠지지 마세요." },
  { from: 45, to: 66, name: "3단계 · 자동화", desc: "생각하지 않아도 몸이 먼저 움직이기 시작합니다. 다음 습관을 하나 더 얹어 볼 시기예요." },
];

export function habitStreak(checks: string[]) {
  const set = new Set(checks);
  let day = todayKey();
  if (!set.has(day)) day = addDays(day, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

export function HabitTracker() {
  const { value: habits, setValue: setHabits, synced } = useStudyProgress<Habit[]>("habit-66", []);
  const [name, setName] = useState("");
  const today = todayKey();

  function add(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n || habits.length >= MAX_HABITS) return;
    setHabits((h) => [...h, { id: crypto.randomUUID(), name: n.slice(0, 40), start: today, checks: [] }]);
    setName("");
  }

  function toggle(id: string, date: string) {
    setHabits((hs) =>
      hs.map((h) => (h.id !== id ? h : { ...h, checks: h.checks.includes(date) ? h.checks.filter((d) => d !== date) : [...h.checks, date] })),
    );
  }

  return (
    <div className="space-y-8">
      {habits.length < MAX_HABITS && (
        <form onSubmit={add} className="rounded-2xl border border-border p-5 sm:p-6">
          <p className="font-bold">새 습관 시작하기 <span className="text-sm font-normal text-muted-foreground">(최대 {MAX_HABITS}개)</span></p>
          <div className="mt-3 flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 영단어 30일 챌린지 하루 1 Day" maxLength={40} />
            <Button type="submit" disabled={!name.trim()}><Plus /> 시작</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => setName(p)} className="rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">{p}</button>
            ))}
          </div>
          <div className="mt-4"><SyncNote synced={synced} /></div>
        </form>
      )}

      {habits.map((h) => {
        const dayNo = Math.min(TOTAL, daysBetween(h.start, today) + 1);
        const done = h.checks.filter((d) => daysBetween(h.start, d) >= 0 && daysBetween(h.start, d) < TOTAL).length;
        const stage = STAGES.find((s) => dayNo >= s.from && dayNo <= s.to) ?? STAGES[2];
        const s = habitStreak(h.checks);
        return (
          <section key={h.id} className="rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-primary">Day {dayNo} / {TOTAL} · {stage.name}</p>
                <h3 className="mt-1 text-lg font-bold">{h.name}</h3>
              </div>
              <button
                onClick={() => confirm(`'${h.name}' 습관 기록을 삭제할까요?`) && setHabits((hs) => hs.filter((x) => x.id !== h.id))}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                aria-label="습관 삭제"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span>달성 <strong>{done}</strong>일 ({Math.round((done / TOTAL) * 100)}%)</span>
              <span className="flex items-center gap-1"><Flame className="size-4 text-[#eb6834]" /> 연속 <strong>{s}</strong>일</span>
            </div>
            <div className="mt-4 grid grid-cols-11 gap-1.5 sm:gap-2">
              {Array.from({ length: TOTAL }).map((_, i) => {
                const date = addDays(h.start, i);
                const checked = h.checks.includes(date);
                const future = date > today;
                const isToday = date === today;
                return (
                  <button
                    key={i}
                    disabled={future}
                    onClick={() => toggle(h.id, date)}
                    title={`${i + 1}일차 · ${date}`}
                    aria-label={`${i + 1}일차 ${date} ${checked ? "완료" : "미완료"}`}
                    className={cn(
                      "aspect-square rounded-md text-[10px] font-semibold transition-colors sm:text-xs",
                      checked ? "bg-primary text-primary-foreground" : future ? "bg-muted/60 text-muted-foreground/40" : "bg-muted text-muted-foreground hover:bg-accent",
                      isToday && !checked && "ring-2 ring-primary ring-offset-1",
                    )}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">{stage.desc}</p>
              {dayNo <= TOTAL && (
                <Button className="shrink-0" variant={h.checks.includes(today) ? "outline" : "default"} onClick={() => toggle(h.id, today)}>
                  {h.checks.includes(today) ? "오늘 완료 취소" : "오늘 완료 체크"}
                </Button>
              )}
            </div>
          </section>
        );
      })}

      {habits.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">아직 시작한 습관이 없어요. 위에서 하나만 골라 오늘부터 시작해 보세요.</p>
      )}
    </div>
  );
}
