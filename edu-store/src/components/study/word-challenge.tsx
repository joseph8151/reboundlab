"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Flame, RotateCcw, Timer, Trophy, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_WORDS, WORD_DAYS, type Word } from "@/lib/study/words";
import { todayKey, useStudyProgress } from "@/lib/study/use-progress";
import { cn } from "@/lib/utils";
import { SyncNote } from "./sync-note";

const SECONDS_PER_WORD = 5;
const PASS_RATIO = 0.8;

type Progress = {
  days: Record<number, { best: number; total: number; clearedAt?: string }>;
  wrong: string[];
  activity: string[]; // 학습한 날짜(연속 학습일 계산)
};

const EMPTY: Progress = { days: {}, wrong: [], activity: [] };

type Mode =
  | { kind: "home" }
  | { kind: "cards"; day: number; index: number; flipped: boolean }
  | { kind: "quiz"; day: number | "wrong"; words: Word[]; index: number; answers: (number | null)[]; choices: string[][]; started: number }
  | { kind: "result"; day: number | "wrong"; words: Word[]; answers: (number | null)[]; choices: string[][] };

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChoices(word: Word) {
  const others = shuffle(ALL_WORDS.filter((w) => w.word !== word.word)).slice(0, 3).map((w) => w.meaning);
  return shuffle([word.meaning, ...others]);
}

function streakOf(activity: string[]) {
  const set = new Set(activity);
  let streak = 0;
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1); // 오늘 아직 안 했어도 어제까지 연속이면 유지
  while (set.has(todayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function WordChallenge() {
  const { value: progress, setValue: setProgress, loaded, synced } = useStudyProgress<Progress>("word-challenge", EMPTY);
  const [mode, setMode] = useState<Mode>({ kind: "home" });
  const [now, setNow] = useState(Date.now());

  const cleared = Object.values(progress.days).filter((d) => d.clearedAt).length;
  const nextDay = useMemo(() => {
    for (let i = 1; i <= 30; i++) if (!progress.days[i]?.clearedAt) return i;
    return 30;
  }, [progress.days]);

  // 퀴즈 타이머
  useEffect(() => {
    if (mode.kind !== "quiz") return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [mode.kind]);

  const elapsed = mode.kind === "quiz" ? (now - mode.started) / 1000 : 0;
  const remaining = Math.max(0, SECONDS_PER_WORD - elapsed);

  function startQuiz(day: number | "wrong") {
    const source = day === "wrong" ? ALL_WORDS.filter((w) => progress.wrong.includes(w.word)) : WORD_DAYS[day - 1];
    const words = shuffle(source);
    setNow(Date.now());
    setMode({ kind: "quiz", day, words, index: 0, answers: [], choices: words.map(makeChoices), started: Date.now() });
  }

  function answer(choice: number | null) {
    if (mode.kind !== "quiz") return;
    const answers = [...mode.answers, choice];
    if (mode.index + 1 < mode.words.length) {
      setNow(Date.now());
      setMode({ ...mode, index: mode.index + 1, answers, started: Date.now() });
      return;
    }
    // 결과 저장
    const correctWords = mode.words.filter((w, i) => answers[i] !== null && mode.choices[i][answers[i]!] === w.meaning).map((w) => w.word);
    const wrongWords = mode.words.map((w) => w.word).filter((w) => !correctWords.includes(w));
    const score = correctWords.length;
    setProgress((prev) => {
      const wrong = new Set(prev.wrong);
      correctWords.forEach((w) => wrong.delete(w));
      wrongWords.forEach((w) => wrong.add(w));
      const days = { ...prev.days };
      if (mode.day !== "wrong") {
        const before = days[mode.day];
        const passed = score / mode.words.length >= PASS_RATIO;
        days[mode.day] = {
          best: Math.max(before?.best ?? 0, score),
          total: mode.words.length,
          clearedAt: before?.clearedAt ?? (passed ? todayKey() : undefined),
        };
      }
      const today = todayKey();
      return { days, wrong: [...wrong], activity: prev.activity.includes(today) ? prev.activity : [...prev.activity, today].slice(-120) };
    });
    setMode({ kind: "result", day: mode.day, words: mode.words, answers, choices: mode.choices });
  }

  // 시간 초과 시 자동으로 오답 처리
  useEffect(() => {
    if (mode.kind === "quiz" && remaining <= 0) answer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // 키보드 1~4로 답하기
  useEffect(() => {
    if (mode.kind !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) answer(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (mode.kind === "cards") {
    const words = WORD_DAYS[mode.day - 1];
    const w = words[mode.index];
    return (
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between text-sm">
          <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode({ kind: "home" })}>← 목록</button>
          <span className="font-semibold">Day {mode.day} · {mode.index + 1}/{words.length}</span>
        </div>
        <button
          type="button"
          onClick={() => setMode({ ...mode, flipped: !mode.flipped })}
          className="mt-4 flex aspect-[4/3] w-full flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition hover:border-primary/40"
          aria-label="카드 뒤집기"
        >
          <span className="text-3xl font-bold tracking-tight sm:text-4xl">{w.word}</span>
          <span className={cn("mt-4 text-lg text-primary transition-opacity", mode.flipped ? "opacity-100" : "opacity-0")}>{w.meaning}</span>
          {!mode.flipped && <span className="mt-4 text-xs text-muted-foreground">뜻을 떠올린 뒤 눌러서 확인</span>}
        </button>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" disabled={mode.index === 0} onClick={() => setMode({ ...mode, index: mode.index - 1, flipped: false })}>이전</Button>
          {mode.index + 1 < words.length ? (
            <Button onClick={() => setMode({ ...mode, index: mode.index + 1, flipped: false })}>다음</Button>
          ) : (
            <Button onClick={() => startQuiz(mode.day)}><Zap /> 스피드 퀴즈</Button>
          )}
        </div>
      </div>
    );
  }

  if (mode.kind === "quiz") {
    const w = mode.words[mode.index];
    return (
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{mode.day === "wrong" ? "오답 단어 퀴즈" : `Day ${mode.day} 스피드 퀴즈`}</span>
          <span className="text-muted-foreground">{mode.index + 1}/{mode.words.length}</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-muted" role="progressbar" aria-valuenow={Math.ceil(remaining)} aria-valuemax={SECONDS_PER_WORD}>
          <div className={cn("h-1.5 rounded-full transition-[width] duration-100", remaining < 2 ? "bg-destructive" : "bg-primary")} style={{ width: `${(remaining / SECONDS_PER_WORD) * 100}%` }} />
        </div>
        <p className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground"><Timer className="size-3.5" /> {remaining.toFixed(1)}초</p>
        <p className="mt-6 text-center text-4xl font-bold tracking-tight">{w.word}</p>
        <div className="mt-8 grid gap-3">
          {mode.choices[mode.index].map((c, i) => (
            <button
              key={c + i}
              onClick={() => answer(i)}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-left text-[15px] transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
              {c}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">키보드 1~4로도 답할 수 있어요 · 한 단어 {SECONDS_PER_WORD}초</p>
      </div>
    );
  }

  if (mode.kind === "result") {
    const correct = mode.words.filter((w, i) => mode.answers[i] !== null && mode.choices[i][mode.answers[i]!] === w.meaning);
    const passed = correct.length / mode.words.length >= PASS_RATIO;
    return (
      <div className="mx-auto max-w-md text-center">
        {passed ? <Trophy className="mx-auto size-10 text-primary" /> : <RotateCcw className="mx-auto size-10 text-muted-foreground" />}
        <p className="mt-4 text-3xl font-bold">{correct.length} / {mode.words.length}</p>
        <p className="mt-2 text-muted-foreground">
          {mode.day === "wrong" ? "맞힌 단어는 오답 단어장에서 빠졌어요." : passed ? `Day ${mode.day} 통과! 내일은 다음 Day로 넘어가세요.` : `${Math.ceil(mode.words.length * PASS_RATIO)}개 이상 맞히면 통과예요. 카드로 한 번 더 보고 다시 도전해 보세요.`}
        </p>
        <ul className="mt-8 divide-y divide-border rounded-2xl border border-border text-left text-sm">
          {mode.words.map((w, i) => {
            const ok = mode.answers[i] !== null && mode.choices[i][mode.answers[i]!] === w.meaning;
            return (
              <li key={w.word} className="flex items-center gap-3 px-4 py-2.5">
                {ok ? <Check className="size-4 shrink-0 text-success" /> : <X className="size-4 shrink-0 text-destructive" />}
                <span className="font-semibold">{w.word}</span>
                <span className="ml-auto text-right text-muted-foreground">{w.meaning}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setMode({ kind: "home" })}>목록으로</Button>
          <Button onClick={() => startQuiz(mode.day)}>다시 풀기</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="통과한 Day" value={`${cleared} / 30`} />
        <Stat label="연속 학습" value={`${streakOf(progress.activity)}일`} icon={<Flame className="size-4 text-[#eb6834]" />} />
        <Stat label="오답 단어" value={`${progress.wrong.length}개`} />
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${(cleared / 30) * 100}%` }} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => setMode({ kind: "cards", day: nextDay, index: 0, flipped: false })} disabled={!loaded}>
          Day {nextDay} 시작하기
        </Button>
        <Button size="lg" variant="outline" onClick={() => startQuiz("wrong")} disabled={progress.wrong.length === 0}>
          오답 단어만 퀴즈 ({progress.wrong.length})
        </Button>
      </div>
      <div className="mt-3"><SyncNote synced={synced} /></div>

      <div className="mt-8 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {WORD_DAYS.map((_, i) => {
          const day = i + 1;
          const rec = progress.days[day];
          return (
            <button
              key={day}
              onClick={() => setMode({ kind: "cards", day, index: 0, flipped: false })}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                rec?.clearedAt ? "border-primary bg-primary text-primary-foreground" : day === nextDay ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40",
              )}
              aria-label={`Day ${day}${rec?.clearedAt ? " 통과" : ""}`}
            >
              <span>{day}</span>
              {rec && <span className="text-[10px] font-normal opacity-80">{rec.best}/{rec.total}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
