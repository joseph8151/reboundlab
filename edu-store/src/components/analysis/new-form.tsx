"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { blankPassage } from "@/lib/analysis/blank";
import { QUESTION_TYPES, RIGHTS } from "@/lib/analysis/types";
import { localKey } from "@/lib/analysis/use-override";

const field = "mt-0.5 block h-10 w-full border border-input bg-card px-3 text-[14px] focus-visible:border-dusty-rose focus-visible:outline-none";
const area = "mt-0.5 block w-full border border-input bg-card p-3 text-[14px] leading-relaxed focus-visible:border-dusty-rose focus-visible:outline-none";

export function NewPassageForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    const sentences = g("passage").split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const choices = g("choices").split(/\n+/).map((s) => s.replace(/^[①②③④⑤1-5][.)]?\s*/, "").trim()).filter(Boolean);
    if (!/^[a-z0-9-]+$/.test(g("slug"))) return setErr("주소(slug)는 영문 소문자·숫자·하이픈만 쓸 수 있습니다.");
    if (!g("title") || !sentences.length) return setErr("제목과 지문(한 줄에 한 문장)을 입력해 주세요.");
    if (choices.length !== 5) return setErr("선택지는 5개(한 줄에 하나)여야 합니다.");
    const answerNo = Number(g("answerNo"));
    const p = blankPassage({ slug: g("slug"), title: g("title"), sentences, stem: g("stem"), choices, answerNo, questionType: g("questionType"), difficulty: g("difficulty"), origin: g("origin"), year: g("year"), rights: g("rights") as never, rightsNote: g("rightsNote") });
    setBusy(true); setErr("");
    try {
      if (demo) localStorage.setItem(localKey(p.slug), JSON.stringify(p));
      else {
        const r = await fetch("/api/admin/analysis", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(p) });
        if (!r.ok) throw new Error(((await r.json()) as { message?: string }).message ?? "저장 실패");
      }
      router.push(`/admin/analysis/${p.slug}`);
    } catch (x) { setErr(x instanceof Error ? x.message : "저장 실패"); setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 border border-border bg-card p-5 md:grid-cols-2">
      <label className="block text-[12px] font-semibold text-muted-foreground">제목<input name="title" className={field} /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">주소(영문 소문자·하이픈)<input name="slug" className={field} placeholder="my-passage-01" /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">문제 유형<select name="questionType" className={field}>{QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">난이도<select name="difficulty" className={field} defaultValue="중">{["하", "중하", "중", "중상", "상"].map((t) => <option key={t}>{t}</option>)}</select></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">출처<input name="origin" className={field} defaultValue="멜리사 에듀 창작" /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">연도<input name="year" className={field} /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">저작권 상태<select name="rights" className={field} defaultValue="pending">{RIGHTS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">저작권·창작 메모<input name="rightsNote" className={field} /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground md:col-span-2">지문 (한 줄에 한 문장)<textarea name="passage" rows={6} className={area} /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground md:col-span-2">발문<input name="stem" className={field} defaultValue="다음 빈칸에 들어갈 말로 가장 적절한 것은?" /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground md:col-span-2">선택지 (한 줄에 하나, 5개)<textarea name="choices" rows={5} className={area} /></label>
      <label className="block text-[12px] font-semibold text-muted-foreground">정답 번호<input name="answerNo" type="number" min={1} max={5} defaultValue={1} className={field} /></label>
      <div className="flex items-end gap-3 md:col-span-2">
        <button disabled={busy} className="h-11 bg-primary px-6 text-[14px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50">등록하고 편집하기</button>
        {err && <p role="alert" className="text-[13px] text-destructive">{err}</p>}
      </div>
    </form>
  );
}
