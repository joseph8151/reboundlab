"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TreeEditor } from "./tree-editor";
import { AnalysisViewer } from "./viewer";
import { localKey } from "@/lib/analysis/use-override";
import {
  CONTENT_KEYS, REVIEW_CHECKS, RIGHTS, STATUSES, approvalProblems, diffPaths, setPath, statusLabel,
  type AnalysisPassage,
} from "@/lib/analysis/types";
import { cn } from "@/lib/utils";

const SECTIONS: { key: (typeof CONTENT_KEYS)[number]; label: string }[] = [
  { key: "passage", label: "지문" }, { key: "question", label: "문제" }, { key: "overview", label: "A 핵심 정보" }, { key: "sentences", label: "B 문장별 해석" },
  { key: "logic", label: "C 논리 구조" }, { key: "evidence", label: "D 정답 근거" }, { key: "paraphrase", label: "E 패러프레이징" }, { key: "wrong", label: "F 오답 분석" },
  { key: "vocab", label: "G 어휘" }, { key: "summary", label: "H 요약" }, { key: "variants", label: "변형문제" },
];
const field = "mt-0.5 block h-9 w-full border border-input bg-card px-2.5 text-[13.5px] focus-visible:border-dusty-rose focus-visible:outline-none";

export function AnalysisEditor({ initial, demo }: { initial: AnalysisPassage | null; demo: boolean }) {
  const [base, setBase] = useState<AnalysisPassage | null>(initial); // 마지막 저장본
  const [cur, setCur] = useState<AnalysisPassage | null>(initial);
  const [sec, setSec] = useState<(typeof CONTENT_KEYS)[number] | "meta" | "review" | "preview">("meta");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!demo || !initial) return;
    try {
      const raw = localStorage.getItem(localKey(initial.slug));
      if (raw) { const p = JSON.parse(raw) as AnalysisPassage; setBase(p); setCur(p); }
    } catch { /* 무시 */ }
  }, [demo, initial]);

  const locked = useMemo(() => new Set(cur?.lockedPaths ?? []), [cur]);
  const dirty = useMemo(() => (cur && base ? JSON.stringify(cur) !== JSON.stringify(base) : false), [cur, base]);
  if (!cur || !base) return <p className="text-muted-foreground">지문을 찾을 수 없습니다.</p>;

  const edit = (path: string, v: unknown) => setCur((c) => (c ? setPath(c, path, v) : c));
  const unlock = (path: string) => setCur((c) => (c ? { ...c, lockedPaths: c.lockedPaths.filter((p) => p !== path) } : c));
  const problems = approvalProblems(cur);

  async function save() {
    if (!cur || !base) return;
    // 이번에 사람이 바꾼 경로를 잠가 두어 AI 재생성이 덮어쓰지 못하게 합니다.
    const changed = CONTENT_KEYS.flatMap((k) => diffPaths((base as never)[k], (cur as never)[k], k));
    const next: AnalysisPassage = { ...cur, lockedPaths: [...new Set([...cur.lockedPaths, ...changed])], updatedAt: new Date().toISOString() };
    setBusy(true); setMsg(null);
    try {
      if (demo) {
        localStorage.setItem(localKey(next.slug), JSON.stringify(next));
      } else {
        const r = await fetch("/api/admin/analysis", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
        const j = (await r.json()) as { message?: string };
        if (!r.ok) throw new Error(j.message ?? "저장에 실패했습니다.");
      }
      setBase(next); setCur(next);
      setMsg({ ok: true, text: demo ? "이 브라우저에 저장했습니다. (데이터베이스 연결 전 미리보기 모드)" : "저장했습니다." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "저장에 실패했습니다." });
    } finally { setBusy(false); }
  }

  async function regenerate() {
    if (!cur) return;
    if (dirty && !confirm("저장하지 않은 수정이 있습니다. 먼저 저장하지 않으면 잠금 보호가 적용되지 않습니다. 계속할까요?")) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/admin/analysis/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passage: cur }) });
      const j = (await r.json()) as { message?: string; passage?: AnalysisPassage; protectedPaths?: string[] };
      if (!r.ok || !j.passage) throw new Error(j.message ?? "AI 생성에 실패했습니다.");
      setCur(j.passage);
      setMsg({ ok: true, text: `AI 분석을 반영했습니다. 직접 수정한 ${j.protectedPaths?.length ?? 0}개 항목은 그대로 유지했습니다. 내용을 확인하고 저장하세요.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "AI 생성에 실패했습니다." });
    } finally { setBusy(false); }
  }

  const tabs = [{ id: "meta", label: "기본·상태" }, ...SECTIONS.map((s) => ({ id: s.key, label: s.label })), { id: "review", label: "검수·승인" }, { id: "preview", label: "미리보기" }] as const;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><Link href="/admin/analysis" className="text-[12.5px] text-muted-foreground hover:text-foreground">← 지문 분석 목록</Link><h1 className="mt-1 text-[24px] text-secondary-foreground">{cur.title}</h1></div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-border px-2 py-1 text-[12px]">{statusLabel(cur.status)}</span>
          <button onClick={regenerate} disabled={busy} className="h-10 border border-primary px-4 text-[13px] font-semibold text-primary hover:bg-blush/50 disabled:opacity-50">AI 분석 생성·재생성</button>
          <button onClick={save} disabled={busy || !dirty} className="h-10 bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-40">{dirty ? "저장" : "저장됨"}</button>
        </div>
      </div>
      {msg && <p role="status" className={cn("mt-3 whitespace-pre-line border-l-2 px-3 py-2 text-[13px]", msg.ok ? "border-success bg-success/5" : "border-destructive bg-destructive/5 text-destructive")}>{msg.text}</p>}
      <p className="mt-2 text-[12px] text-muted-foreground">직접 고친 문장은 🔒로 표시되고, AI가 다시 생성해도 덮어쓰지 않습니다.</p>

      <div role="tablist" className="mt-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => <button key={t.id} role="tab" aria-selected={sec === t.id} onClick={() => setSec(t.id)} className={cn("-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[13px]", sec === t.id ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground")}>{t.label}</button>)}
      </div>

      <div className="py-6">
        {sec === "meta" && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-[12px] font-semibold text-muted-foreground">제목<input className={field} value={cur.title} onChange={(e) => edit("title", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">진행 상태
              <select className={field} value={cur.status} onChange={(e) => edit("status", e.target.value)}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">문제 유형<input className={field} value={cur.meta.questionType} onChange={(e) => edit("meta.questionType", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">난이도<input className={field} value={cur.meta.difficulty} onChange={(e) => edit("meta.difficulty", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">출처<input className={field} value={cur.source.origin} onChange={(e) => edit("source.origin", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">연도<input className={field} value={cur.source.year} onChange={(e) => edit("source.year", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">저작권 상태
              <select className={field} value={cur.source.rights} onChange={(e) => edit("source.rights", e.target.value)}>{RIGHTS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">저작권·창작 메모<input className={field} value={cur.source.rightsNote} onChange={(e) => edit("source.rightsNote", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">이용 허락 확인자<input className={field} value={cur.source.verifiedBy} onChange={(e) => edit("source.verifiedBy", e.target.value)} /></label>
            <label className="block text-[12px] font-semibold text-muted-foreground">확인일<input type="date" className={field} value={cur.source.verifiedAt} onChange={(e) => edit("source.verifiedAt", e.target.value)} /></label>
          </div>
        )}
        {SECTIONS.map((s) => sec === s.key && <TreeEditor key={s.key} value={(cur as never)[s.key]} path={s.key} onChange={edit} locked={locked} onUnlock={unlock} />)}
        {sec === "review" && (
          <div className="max-w-2xl space-y-3">
            <p className="text-[13px] text-muted-foreground">11개 항목을 모두 확인해야 &lsquo;승인&rsquo; 또는 &lsquo;판매 중&rsquo;으로 저장할 수 있고, 승인된 것만 공개 화면에 나타납니다.</p>
            {REVIEW_CHECKS.map((c) => <label key={c.id} className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-[13.5px]"><input type="checkbox" checked={Boolean(cur.review.checks[c.id])} onChange={(e) => edit(`review.checks.${c.id}`, e.target.checked)} />{c.label}</label>)}
            <label className="block text-[12px] font-semibold text-muted-foreground">검수 메모<textarea rows={3} className="mt-0.5 block w-full border border-input bg-card p-2.5 text-[13.5px]" value={cur.review.notes} onChange={(e) => edit("review.notes", e.target.value)} /></label>
            {problems.length > 0 ? <ul className="border-l-2 border-mustard bg-light-pink px-3 py-2 text-[12.5px]">{problems.map((p) => <li key={p}>· {p}</li>)}</ul> : <p className="border-l-2 border-success bg-success/5 px-3 py-2 text-[13px] font-semibold">모든 검수를 마쳤습니다. 상태를 ‘승인’으로 바꿔 저장할 수 있습니다.</p>}
          </div>
        )}
        {sec === "preview" && <div className="-mx-5 border border-border md:mx-0"><AnalysisViewer data={cur} /></div>}
      </div>
    </div>
  );
}
