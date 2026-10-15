"use client";

import Link from "next/link";
import { BookOpenCheck, Flame, Gauge, NotebookPen, Printer, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TARGET_WPM } from "@/lib/study/passages";
import { addDays, daysBetween, todayKey } from "@/lib/study/dates";
import { useStudyProgress } from "@/lib/study/use-progress";
import { habitStreak, type Habit } from "./habit-tracker";
import type { ReadingHistory } from "./speed-reader";
import { fmtMinutes, mondayOf, STUDY_SUBJECTS, type StudyTimeState } from "./study-timer";
import { streakOf, type WordProgress } from "./word-challenge";
import { REASONS, type WrongNote } from "./wrong-notes";
import { SyncNote } from "./sync-note";

/** 모든 학습 도구 기록을 모아 한 주를 점검하는 리포트 (학부모 공유용 인쇄 지원) */
export function StudyReport() {
  const time = useStudyProgress<StudyTimeState>("study-time", { sessions: [], running: null });
  const words = useStudyProgress<WordProgress>("word-challenge", { days: {}, wrong: [], activity: [] });
  const reading = useStudyProgress<ReadingHistory>("speed-reading", {});
  const habits = useStudyProgress<Habit[]>("habit-66", []);
  const notes = useStudyProgress<WrongNote[]>("wrong-notes", []);
  const loaded = [time, words, reading, habits, notes].every((x) => x.loaded);

  const today = todayKey();
  const thisMon = mondayOf(today);
  const lastMon = addDays(thisMon, -7);
  const inRange = (d: string, from: string) => d >= from && d < addDays(from, 7);
  const thisWeek = time.value.sessions.filter((s) => inRange(s.date, thisMon));
  const lastWeek = time.value.sessions.filter((s) => inRange(s.date, lastMon));
  const sum = (xs: { minutes: number }[]) => xs.reduce((a, b) => a + b.minutes, 0);
  const weekMin = sum(thisWeek);
  const lastMin = sum(lastWeek);
  const bySubject = STUDY_SUBJECTS.map((s) => ({ ...s, minutes: sum(thisWeek.filter((x) => x.subject === s.id)) })).sort((a, b) => b.minutes - a.minutes);

  const cleared = Object.values(words.value.days).filter((d) => d.clearedAt).length;
  const records = Object.values(reading.value).flat().sort((a, b) => a.date.localeCompare(b.date));
  const recent = records.slice(-5);
  const avgWpm = recent.length ? Math.round(recent.reduce((a, r) => a + r.wpm, 0) / recent.length) : 0;
  const avgAcc = recent.length ? Math.round((recent.reduce((a, r) => a + r.correct / r.total, 0) / recent.length) * 100) : 0;
  const due = notes.value.filter((n) => n.stage < 4 && n.nextReview <= today).length;
  const weekNotes = notes.value.filter((n) => inRange(n.createdAt, thisMon));
  const topReason = REASONS.map((r) => ({ ...r, n: notes.value.filter((x) => x.reason === r.id).length })).sort((a, b) => b.n - a.n)[0];

  const comments: string[] = [];
  if (weekMin === 0) comments.push("이번 주 순공 기록이 없어요. 오늘 25분만 스톱워치를 켜 보세요.");
  else if (lastMin && weekMin < lastMin * 0.8) comments.push(`순공 시간이 지난주보다 ${fmtMinutes(lastMin - weekMin)} 줄었어요. 남은 요일에 하루 30분씩만 더해 보세요.`);
  else if (lastMin && weekMin >= lastMin) comments.push(`순공 시간이 지난주보다 ${fmtMinutes(weekMin - lastMin)} 늘었어요. 좋은 흐름이에요.`);
  if (weekMin > 0 && bySubject[0].minutes / weekMin > 0.6) comments.push(`${bySubject[0].label}에 시간의 ${Math.round((bySubject[0].minutes / weekMin) * 100)}%가 몰려 있어요. 다른 과목도 균형을 맞춰 보세요.`);
  if (recent.length && avgWpm < TARGET_WPM) comments.push(`최근 읽기 속도 평균 ${avgWpm} WPM. 페이서로 ${Math.min(TARGET_WPM, avgWpm + 20)} WPM에 맞춰 연습해 보세요.`);
  if (recent.length && avgAcc < 80) comments.push(`속독 이해도가 ${avgAcc}%예요. 속도보다 지문 구조 파악을 먼저 연습해 보세요.`);
  if (due > 0) comments.push(`오늘 다시 풀어야 할 오답이 ${due}개 있어요.`);
  if (words.value.wrong.length >= 15) comments.push(`오답 단어가 ${words.value.wrong.length}개 쌓였어요. 오답 단어 퀴즈를 한 번 돌려 보세요.`);
  if (!comments.length) comments.push("기록이 꾸준해요. 이번 주도 이대로만 가면 됩니다.");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <SyncNote synced={time.synced} />
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer /> 인쇄·PDF 저장</Button>
      </div>

      <section className="rounded-2xl bg-accent p-5 sm:p-6">
        <p className="text-sm font-semibold text-primary">이번 주 코멘트 · {thisMon.slice(5).replace("-", ".")} ~ {addDays(thisMon, 6).slice(5).replace("-", ".")}</p>
        {loaded ? (
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed">
            {comments.map((c) => <li key={c}>· {c}</li>)}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">기록을 불러오는 중…</p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card icon={<Timer className="size-5" />} title="순공 시간" href="/study/time">
          <Big value={fmtMinutes(weekMin)} sub={lastMin ? `지난주 ${fmtMinutes(lastMin)}` : "지난주 기록 없음"} />
          <ul className="mt-4 space-y-2">
            {bySubject.filter((s) => s.minutes > 0).map((s) => (
              <li key={s.id} className="grid grid-cols-[3rem_1fr_5rem] items-center gap-2 text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="h-2 rounded-full bg-muted"><span className="block h-2 rounded-full" style={{ width: `${(s.minutes / weekMin) * 100}%`, background: s.color }} /></span>
                <span className="text-right tabular-nums">{fmtMinutes(s.minutes)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={<BookOpenCheck className="size-5" />} title="영단어 30일 챌린지" href="/study/words">
          <Big value={`${cleared} / 30 Day`} sub={`연속 학습 ${streakOf(words.value.activity)}일 · 오답 단어 ${words.value.wrong.length}개`} />
          <div className="mt-4 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(cleared / 30) * 100}%` }} /></div>
        </Card>

        <Card icon={<Gauge className="size-5" />} title="지문 속독" href="/study/speed-reading">
          {recent.length ? (
            <>
              <Big value={`${avgWpm} WPM`} sub={`최근 ${recent.length}회 평균 · 이해도 ${avgAcc}% · 목표 ${TARGET_WPM} WPM`} />
              <ol className="mt-4 flex items-end gap-1.5" aria-label="최근 읽기 속도">
                {recent.map((r, i) => (
                  <li key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] tabular-nums text-muted-foreground">{r.wpm}</span>
                    <span className="w-full rounded-t-[4px] bg-primary" style={{ height: `${Math.max(6, Math.min(64, (r.wpm / 300) * 64))}px` }} />
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <Empty text="아직 속독 기록이 없어요." />
          )}
        </Card>

        <Card icon={<NotebookPen className="size-5" />} title="오답노트" href="/study/wrong-notes">
          <Big value={`오늘 복습 ${due}개`} sub={`이번 주 새 오답 ${weekNotes.length}개 · 졸업 ${notes.value.filter((n) => n.stage >= 4).length}개`} />
          {topReason?.n ? <p className="mt-4 text-sm text-muted-foreground">가장 많은 오답 이유: <strong className="text-foreground">{topReason.label}</strong> ({topReason.n}회)</p> : null}
        </Card>
      </div>

      <Card icon={<Flame className="size-5" />} title="66일 습관" href="/study/habit">
        {habits.value.length ? (
          <ul className="space-y-3">
            {habits.value.map((h) => {
              const dayNo = Math.min(66, daysBetween(h.start, today) + 1);
              const done = h.checks.filter((d) => daysBetween(h.start, d) >= 0 && daysBetween(h.start, d) < 66).length;
              return (
                <li key={h.id}>
                  <div className="flex justify-between text-sm"><span className="font-medium">{h.name}</span><span className="text-muted-foreground">Day {dayNo} · 달성 {done}일 · 연속 {habitStreak(h.checks)}일</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(done / 66) * 100}%` }} /></div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty text="시작한 습관이 없어요." />
        )}
      </Card>
    </div>
  );
}

function Card({ icon, title, href, children }: { icon: React.ReactNode; title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-border p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold"><span className="text-primary">{icon}</span>{title}</h2>
        <Link href={href} className="text-xs font-semibold text-primary hover:underline print:hidden">열기</Link>
      </div>
      {children}
    </section>
  );
}

function Big({ value, sub }: { value: string; sub: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
