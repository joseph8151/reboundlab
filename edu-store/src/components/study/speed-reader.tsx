"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Gauge, Pause, Play, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TARGET_WPM, wordCount, type Passage } from "@/lib/study/passages";
import { structureName } from "@/lib/study/structures";
import { todayKey, useStudyProgress } from "@/lib/study/use-progress";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { SyncNote } from "./sync-note";


export type ReadingRecord = { wpm: number; correct: number; total: number; date: string; mode: "free" | "pacer" };
export type ReadingHistory = Record<string, ReadingRecord[]>;

/** 의미 단위(끊어 읽기)로 나누기: 구두점과 접속사·전치사 앞에서 끊고, 최대 5단어 */
function toChunks(text: string) {
  const breakBefore = /^(and|but|or|so|because|which|who|that|when|while|although|if|to|in|on|at|for|with|from|by|of|as|than|instead|after|before)$/i;
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let cur: string[] = [];
  for (const w of words) {
    if (cur.length >= 2 && (breakBefore.test(w) || cur.length >= 5)) {
      chunks.push(cur.join(" "));
      cur = [];
    }
    cur.push(w);
    if (/[.,;:?!]$/.test(w)) {
      chunks.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur.join(" "));
  return chunks;
}

type Phase = "ready" | "reading" | "quiz" | "result";

export function SpeedReader({ passage }: { passage: Passage }) {
  const { value: history, setValue: setHistory, synced } = useStudyProgress<ReadingHistory>("speed-reading", {});
  const words = wordCount(passage.text);
  const chunks = useMemo(() => toChunks(passage.text), [passage.text]);

  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState<"free" | "pacer">("free");
  const [pace, setPace] = useState(TARGET_WPM);
  const [startedAt, setStartedAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(passage.questions.map(() => null));
  const tick = useRef<ReturnType<typeof setInterval>>(undefined);

  const past = history[passage.id] ?? [];
  const best = past.reduce((m, r) => Math.max(m, r.wpm), 0);

  // 경과 시간 표시
  useEffect(() => {
    if (phase !== "reading") return;
    const t = setInterval(() => setSeconds((Date.now() - startedAt) / 1000), 200);
    return () => clearInterval(t);
  }, [phase, startedAt]);

  // 페이서: 목표 속도로 의미 단위를 하나씩 강조
  useEffect(() => {
    if (phase !== "reading" || mode !== "pacer" || paused) return;
    const ms = (60_000 / pace) * (wordCount(chunks[chunkIndex] ?? "a") || 1);
    tick.current = setTimeout(() => {
      if (chunkIndex + 1 >= chunks.length) finishReading();
      else setChunkIndex((i) => i + 1);
    }, ms);
    return () => clearTimeout(tick.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, paused, chunkIndex, pace]);

  function start() {
    setStartedAt(Date.now());
    setSeconds(0);
    setChunkIndex(0);
    setPaused(false);
    setAnswers(passage.questions.map(() => null));
    setPhase("reading");
  }

  function finishReading() {
    setSeconds((Date.now() - startedAt) / 1000);
    setPhase("quiz");
  }

  const wpm = seconds > 0 ? Math.round(words / (seconds / 60)) : 0;
  const correct = passage.questions.filter((q, i) => answers[i] === q.answer).length;

  function submit() {
    setPhase("result");
    const record: ReadingRecord = { wpm, correct, total: passage.questions.length, date: todayKey(), mode };
    setHistory((prev) => ({ ...prev, [passage.id]: [...(prev[passage.id] ?? []), record].slice(-20) }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{words}단어</span>
        <span>구조: <strong className="text-foreground">{structureName(passage.structure)}</strong></span>
        {best > 0 && <span>내 최고 기록 {best} WPM</span>}
      </div>

      {phase === "ready" && (
        <div className="rounded-2xl border border-border p-6">
          <p className="font-bold">읽기 방식을 고르세요</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ModeCard active={mode === "free"} onClick={() => setMode("free")} title="자유 읽기" desc="평소처럼 읽고 다 읽으면 버튼을 눌러요. 지금 내 속도를 측정합니다." />
            <ModeCard active={mode === "pacer"} onClick={() => setMode("pacer")} title="끊어 읽기 페이서" desc="의미 단위로 하이라이트가 목표 속도에 맞춰 움직여요. 앞으로만 읽는 습관을 만듭니다." />
          </div>
          {mode === "pacer" && (
            <label className="mt-5 block text-sm">
              <span className="flex justify-between font-semibold">목표 속도 <span className="text-primary">{pace} WPM</span></span>
              <input type="range" min={90} max={300} step={10} value={pace} onChange={(e) => setPace(Number(e.target.value))} className="mt-2 w-full accent-primary" />
              <span className="flex justify-between text-xs text-muted-foreground"><span>90</span><span>수능 권장 {TARGET_WPM}</span><span>300</span></span>
            </label>
          )}
          <Button size="lg" className="mt-6 w-full sm:w-auto" onClick={start}><Play /> 읽기 시작</Button>
          <div className="mt-3"><SyncNote synced={synced} /></div>
        </div>
      )}

      {phase === "reading" && (
        <div>
          <div className="sticky top-16 z-10 -mx-1 flex items-center justify-between rounded-xl bg-background/95 px-1 py-2 backdrop-blur">
            <span className="text-sm tabular-nums text-muted-foreground">{Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, "0")}</span>
            <div className="flex gap-2">
              {mode === "pacer" && (
                <Button size="sm" variant="outline" onClick={() => setPaused((p) => !p)}>{paused ? <Play /> : <Pause />}{paused ? "계속" : "일시정지"}</Button>
              )}
              <Button size="sm" onClick={finishReading}><Check /> 다 읽었어요</Button>
            </div>
          </div>
          <p className="mt-3 rounded-2xl border border-border bg-card p-5 font-serif text-[17px] leading-[2] sm:p-8 sm:text-lg" lang="en">
            {mode === "free"
              ? passage.text
              : chunks.map((c, i) => (
                  <span key={i} className={cn("rounded px-0.5 transition-colors duration-150", i === chunkIndex ? "bg-primary text-primary-foreground" : i < chunkIndex ? "text-muted-foreground/60" : "")}>
                    {c}{" "}
                  </span>
                ))}
          </p>
        </div>
      )}

      {(phase === "quiz" || phase === "result") && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="읽기 시간" value={`${Math.floor(seconds / 60)}분 ${Math.round(seconds % 60)}초`} />
            <Metric label="읽기 속도" value={`${wpm} WPM`} highlight={wpm >= TARGET_WPM} />
            <Metric label="이해도" value={phase === "result" ? `${correct}/${passage.questions.length}` : "?"} />
          </div>
          {passage.questions.map((q, qi) => (
            <fieldset key={qi} className="rounded-2xl border border-border p-5">
              <legend className="px-1 text-[15px] font-bold">{qi + 1}. {q.prompt}</legend>
              <div className="mt-2 grid gap-2">
                {q.choices.map((c, ci) => {
                  const picked = answers[qi] === ci;
                  const showRight = phase === "result" && ci === q.answer;
                  const showWrong = phase === "result" && picked && ci !== q.answer;
                  return (
                    <button
                      key={ci}
                      disabled={phase === "result"}
                      onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? ci : v)))}
                      className={cn(
                        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        showRight ? "border-success bg-success/10" : showWrong ? "border-destructive bg-red-50" : picked ? "border-primary bg-accent" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="font-semibold text-muted-foreground">{"①②③④⑤"[ci]}</span>
                      <span className="flex-1">{c}</span>
                      {showRight && <Check className="size-4 text-success" />}
                      {showWrong && <X className="size-4 text-destructive" />}
                    </button>
                  );
                })}
              </div>
              {phase === "result" && <p className="mt-3 rounded-lg bg-muted p-3 text-sm leading-relaxed text-muted-foreground">해설 · {q.explanation}</p>}
            </fieldset>
          ))}

          {phase === "quiz" ? (
            <Button size="lg" onClick={submit} disabled={answers.some((a) => a === null)}>채점하기</Button>
          ) : (
            <div className="rounded-2xl bg-accent p-6">
              <p className="flex items-center gap-2 font-bold"><Gauge className="size-5 text-primary" /> {feedback(wpm, correct, passage.questions.length)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={() => setPhase("ready")}>다시 읽기</Button>
                <Button asChild variant="outline"><Link href="/study/speed-reading">다른 지문</Link></Button>
                <Button asChild variant="outline">
                  <a href={siteConfig.aiTutor.url} target="_blank" rel="noopener noreferrer"><Sparkles /> {siteConfig.aiTutor.name}로 문장별 분석</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {past.length > 0 && phase !== "reading" && (
        <div>
          <p className="text-sm font-semibold">이 지문 기록</p>
          <ul className="mt-2 divide-y divide-border rounded-xl border border-border text-sm">
            {past.slice(-5).reverse().map((r, i) => (
              <li key={i} className="flex justify-between px-4 py-2 text-muted-foreground">
                <span>{r.date} · {r.mode === "pacer" ? "페이서" : "자유"}</span>
                <span className="text-foreground">{r.wpm} WPM · {r.correct}/{r.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function feedback(wpm: number, correct: number, total: number) {
  const ratio = correct / total;
  if (ratio < 1 && wpm >= TARGET_WPM) return "속도는 충분해요. 이번엔 구조 신호어(However, Therefore 등)를 잡으며 이해도를 올려 보세요.";
  if (ratio < 1) return "속도보다 정확한 이해가 먼저예요. 끊어 읽기 페이서를 120 WPM으로 낮춰 연습해 보세요.";
  if (wpm < TARGET_WPM) return `이해는 완벽해요! 다음엔 페이서를 ${Math.min(300, Math.ceil((wpm + 15) / 10) * 10)} WPM으로 맞춰 속도를 올려 보세요.`;
  return "속도와 이해 모두 수능 기준을 넘었어요. 심화 지문에 도전해 보세요.";
}

function ModeCard({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button onClick={onClick} aria-pressed={active} className={cn("rounded-xl border p-4 text-left transition-colors", active ? "border-primary bg-accent" : "border-border hover:border-primary/40")}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </button>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-border p-3 sm:p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-base font-bold sm:text-xl", highlight && "text-success")}>{value}</p>
    </div>
  );
}
