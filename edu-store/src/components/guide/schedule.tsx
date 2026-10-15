"use client";

import { useMemo, useState } from "react";
import { Disclaimer, lineBtn } from "./ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { distribute } from "@/lib/guide";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const lab = "mb-1.5 block text-[13px] font-semibold";
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function Schedule({ books }: { books: { slug: string; title: string; questionCount: number | null }[] }) {
  const today = iso(new Date());
  const [book, setBook] = useState("");
  const [total, setTotal] = useState("");
  const [unitText, setUnitText] = useState("");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState("");
  const [off, setOff] = useState<number[]>([]);
  const [shown, setShown] = useState(false);

  const picked = books.find((b) => b.slug === book);
  const units = unitText.split("\n").map((s) => s.trim()).filter(Boolean);
  const amount = units.length ? units.length : Number(total) || 0;

  const plan = useMemo(() => {
    if (!shown || !start || !end || amount <= 0) return null;
    const days: Date[] = [];
    for (let d = new Date(`${start}T00:00:00`); iso(d) <= end && days.length < 400; d.setDate(d.getDate() + 1)) if (!off.includes(d.getDay())) days.push(new Date(d));
    if (!days.length) return { error: "학습 가능한 날이 없습니다. 기간이나 쉬는 요일을 확인해 주세요.", rows: [], days: 0 };
    const per = distribute(amount, days.length);
    let cursor = 0;
    const rows = days.map((d, i) => {
      const n = per[i];
      const from = cursor + 1; cursor += n;
      const label = units.length ? (n ? units.slice(from - 1, cursor).join(", ") : "복습") : n ? (n === 1 ? `${from}번` : `${from}~${cursor}번`) : "복습";
      return { date: iso(d), dow: DOW[d.getDay()], n, label };
    });
    return { error: "", rows, days: days.length };
  }, [shown, start, end, amount, off, units]);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 print:hidden">
        <div className="sm:col-span-2"><Label htmlFor="sc-book" className={lab}>교재 (선택)</Label>
          <select id="sc-book" value={book} onChange={(e) => { setBook(e.target.value); const b = books.find((x) => x.slug === e.target.value); if (b?.questionCount) setTotal(String(b.questionCount)); }} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-[15px]">
            <option value="">직접 입력</option>{books.map((b) => <option key={b.slug} value={b.slug}>{b.title}{b.questionCount ? ` (${b.questionCount}문항)` : ""}</option>)}
          </select></div>
        <div><Label htmlFor="sc-total" className={lab}>전체 분량 (문항·쪽·강 등)</Label><Input id="sc-total" type="number" min={1} max={5000} inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value)} disabled={units.length > 0} placeholder="예: 100" /></div>
        <div><p className={lab}>쉬는 요일</p><div className="flex flex-wrap gap-3 pt-2 text-[14px]">{DOW.map((d, i) => <label key={d} className="flex items-center gap-1.5"><input type="checkbox" checked={off.includes(i)} onChange={(e) => setOff(e.target.checked ? [...off, i] : off.filter((x) => x !== i))} className="size-4 accent-[var(--primary)]" />{d}</label>)}</div></div>
        <div><Label htmlFor="sc-start" className={lab}>시작일</Label><Input id="sc-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
        <div><Label htmlFor="sc-end" className={lab}>목표 완료일</Label><Input id="sc-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></div>
        <div className="sm:col-span-2"><Label htmlFor="sc-units" className={lab}>단원별 분량이 다르다면 단원을 한 줄에 하나씩 (선택)</Label>
          <textarea id="sc-units" rows={4} value={unitText} onChange={(e) => setUnitText(e.target.value)} placeholder={"1단원\n2단원\n3단원"} className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-[15px]" />
          <p className="mt-1 text-[12px] text-muted-foreground">단원을 입력하면 단원 단위로 하루 분량을 배분합니다. 단원마다 분량이 다르면 학습일 수에 맞춰 단원을 나누어 담습니다.</p></div>
      </div>
      <button type="button" className="mt-6 inline-flex h-12 items-center bg-primary px-7 text-[15px] font-semibold text-primary-foreground print:hidden" onClick={() => setShown(true)}>일정 만들기</button>

      {shown && !plan && <p className="mt-6 text-[14px] text-destructive">시작일, 완료일, 분량을 모두 입력해 주세요.</p>}
      {plan && plan.error && <p className="mt-6 text-[14px] text-destructive">{plan.error}</p>}
      {plan && !plan.error && (
        <section className="mt-10" aria-labelledby="sc-result">
          <h2 id="sc-result" className="text-[22px] font-bold tracking-[-0.03em]">{picked?.title ?? "학습 일정"}</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">{start} ~ {end} · 학습일 {plan.days}일 · 총 {amount}{units.length ? "개 단원" : "개"} · 하루 평균 {(amount / plan.days).toFixed(1)}</p>
          <table className="mt-4 w-full border-collapse text-left text-[14px]">
            <thead><tr className="border-b border-foreground/30 text-[12px] text-muted-foreground"><th className="py-2 pr-3 font-medium">날짜</th><th className="pr-3 font-medium">분량</th><th className="font-medium">완료</th></tr></thead>
            <tbody>{plan.rows.map((r) => <tr key={r.date} className="border-b border-border"><td className="py-2 pr-3 tabular-nums">{r.date} ({r.dow})</td><td className="pr-3">{r.label}{r.n ? ` · ${units.length ? `${r.n}단원` : `${r.n}개`}` : ""}</td><td>☐</td></tr>)}</tbody>
          </table>
          <button type="button" className={`${lineBtn} mt-6 print:hidden`} onClick={() => window.print()}>인쇄 / PDF로 저장</button>
        </section>
      )}
      <div className="mt-8 print:hidden"><Disclaimer>입력한 내용은 이 브라우저 안에서만 계산되며 서버로 전송되지 않습니다. 분량이 학습일 수보다 적으면 남는 날은 복습일로 표시됩니다.</Disclaimer></div>
    </div>
  );
}
