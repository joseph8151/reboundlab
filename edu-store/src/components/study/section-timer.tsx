"use client";

import { useEffect, useState } from "react";
import { Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIME_BLOCKS } from "@/lib/study/strategy";
import { cn } from "@/lib/utils";

/** 실전 구간 타이머: 블록별 목표 시간에 맞춰 풀고 있는지 확인합니다. */
export function SectionTimer() {
  const [index, setIndex] = useState(-1);
  const [blockStart, setBlockStart] = useState(0);
  const [now, setNow] = useState(0);
  const [results, setResults] = useState<number[]>([]);

  useEffect(() => {
    if (index < 0 || index >= TIME_BLOCKS.length) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [index]);

  const running = index >= 0 && index < TIME_BLOCKS.length;
  const finished = index >= TIME_BLOCKS.length;
  const used = running ? (now - blockStart) / 1000 : 0;
  const target = running ? TIME_BLOCKS[index].minutes * 60 : 0;
  const fmt = (s: number) => `${s < 0 ? "-" : ""}${Math.floor(Math.abs(s) / 60)}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, "0")}`;

  function next() {
    const t = Date.now();
    if (running) setResults((r) => [...r, (t - blockStart) / 1000]);
    setBlockStart(t);
    setNow(t);
    setIndex((i) => i + 1);
  }

  const totalUsed = results.reduce((a, b) => a + b, 0);
  const totalTarget = TIME_BLOCKS.reduce((a, b) => a + b.minutes * 60, 0);

  return (
    <div className="rounded-2xl border border-border p-5 sm:p-6">
      <p className="font-bold">실전 구간 타이머</p>
      <p className="mt-1 text-sm text-muted-foreground">모의고사를 풀 때 켜 두고, 블록을 끝낼 때마다 &lsquo;다음 블록&rsquo;을 누르세요.</p>

      {running && (
        <div className="mt-5 text-center">
          <p className="text-sm text-muted-foreground">{TIME_BLOCKS[index].range}번 · {TIME_BLOCKS[index].types}</p>
          <p className={cn("mt-2 font-mono text-5xl font-bold tabular-nums", used > target ? "text-destructive" : "")}>{fmt(target - used)}</p>
          <p className="mt-1 text-xs text-muted-foreground">목표 {TIME_BLOCKS[index].minutes}분 {used > target && "· 초과! 표시하고 넘어가세요"}</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed">{TIME_BLOCKS[index].tip}</p>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        {!running && (
          <Button onClick={() => { setResults([]); setIndex(-1); next(); }}>
            {finished ? <RotateCcw /> : <Play />} {finished ? "다시 시작" : "독해 시작 (18번부터)"}
          </Button>
        )}
        {running && <Button onClick={next}><SkipForward /> {index + 1 < TIME_BLOCKS.length ? "다음 블록" : "종료"}</Button>}
      </div>

      {results.length > 0 && (
        <table className="mt-5 w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="py-1.5 font-medium">블록</th><th className="font-medium">목표</th><th className="font-medium">실제</th></tr></thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1.5">{TIME_BLOCKS[i].range}</td>
                <td>{TIME_BLOCKS[i].minutes}:00</td>
                <td className={r > TIME_BLOCKS[i].minutes * 60 ? "font-semibold text-destructive" : "text-success"}>{fmt(r)}</td>
              </tr>
            ))}
            {finished && (
              <tr className="border-t border-border font-semibold">
                <td className="py-1.5">합계</td><td>{fmt(totalTarget)}</td><td className={totalUsed > totalTarget ? "text-destructive" : "text-success"}>{fmt(totalUsed)}</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
