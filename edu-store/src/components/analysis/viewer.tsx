"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalysisPassage, VariantQuestion } from "@/lib/analysis/types";
import { statusLabel } from "@/lib/analysis/types";
import { useOverride } from "@/lib/analysis/use-override";
import { Emph, Label, MarkedText, Panel, Tag } from "./common";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "A", label: "A. 핵심 정보" },
  { id: "B", label: "B. 문장별 해석" },
  { id: "C", label: "C. 논리 구조" },
  { id: "D", label: "D. 정답 근거" },
  { id: "E", label: "E. 패러프레이징" },
  { id: "F", label: "F. 오답 분석" },
  { id: "G", label: "G. 핵심 어휘" },
  { id: "H", label: "H. 요약문" },
  { id: "Q", label: "변형문제" },
] as const;
type TabId = (typeof TABS)[number]["id"];
const CIRCLED = ["①", "②", "③", "④", "⑤"];

export function AnalysisViewer({ data: base, adminHref, demo }: { data: AnalysisPassage; adminHref?: string; demo?: boolean }) {
  const data = useOverride(base, demo);
  const [tab, setTab] = useState<TabId>("A");
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [focusN, setFocusN] = useState<number | null>(null);

  useEffect(() => {
    const h = window.location.hash.replace("#", "") as TabId;
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);
  const go = useCallback((t: TabId) => { setTab(t); setAll(false); history.replaceState(null, "", `#${t}`); }, []);
  const jumpToSentence = useCallback((n: number) => {
    setTab("B"); setAll(false); setOpen((s) => new Set(s).add(n)); setFocusN(n);
    history.replaceState(null, "", "#B");
    setTimeout(() => document.getElementById(`s-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }, []);

  const sections: Record<TabId, React.ReactNode> = {
    A: <Overview d={data} />,
    B: <SentencesView d={data} open={open} setOpen={setOpen} focusN={focusN} />,
    C: <LogicView d={data} onJump={jumpToSentence} />,
    D: <EvidenceView d={data} onJump={jumpToSentence} />,
    E: <ParaphraseView d={data} onJump={jumpToSentence} />,
    F: <WrongView d={data} />,
    G: <VocabView d={data} />,
    H: <SummaryView d={data} />,
    Q: <VariantsView d={data} />,
  };

  return (
    <div>
      {/* 상단 정보 */}
      <header className="border-b border-border bg-muted">
        <div className="container-page max-w-5xl py-7 md:py-10">
          <div className="flex flex-wrap items-center gap-2"><Tag tone="wine">{statusLabel(data.status)}</Tag>{demo && <Tag tone="gold">개발 미리보기</Tag>}<Tag>{data.meta.questionType}</Tag><Tag>난이도 {data.meta.difficulty}</Tag></div>
          <h1 className="mt-3 text-[28px] leading-[1.25] text-secondary-foreground md:text-[40px]">{data.title}</h1>
          <p className="mt-1 text-[16px] text-muted-foreground">{data.overview.titleKo}</p>
          <dl className="mt-5 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2 md:grid-cols-4">
            <div><dt className="text-muted-foreground">출처</dt><dd className="font-medium">{data.source.origin}{data.source.year && ` · ${data.source.year}`}</dd></div>
            <div><dt className="text-muted-foreground">문제 유형</dt><dd className="font-medium">{data.meta.questionType}</dd></div>
            <div><dt className="text-muted-foreground">소재</dt><dd className="font-medium">{data.overview.topic}</dd></div>
            <div><dt className="text-muted-foreground">주제</dt><dd className="font-medium">{data.overview.theme}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2 print:hidden">
            <Link href={`/analysis/${data.slug}/print?mode=student`} target="_blank" className="inline-flex h-10 items-center border border-dusty-rose/70 bg-card px-4 text-[13px] font-semibold text-secondary-foreground hover:bg-blush/50">학생용 PDF</Link>
            <Link href={`/analysis/${data.slug}/print?mode=teacher`} target="_blank" className="inline-flex h-10 items-center bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">교사용 해설지 PDF</Link>
            {adminHref && <Link href={adminHref} className="inline-flex h-10 items-center border border-primary px-4 text-[13px] font-semibold text-primary hover:bg-blush/50">관리자 편집</Link>}
          </div>
        </div>
      </header>

      {/* 문제 */}
      <div className="container-page max-w-5xl pt-8">
        <Panel>
          <Label>문제</Label>
          <p className="mt-2 text-[15px] font-semibold">{data.question.stem}</p>
          <p className="mt-3 text-[15px] leading-[2]">{data.passage.sentences.map((s) => <span key={s.n}>{s.en} </span>)}</p>
          <ol className="mt-3 space-y-1 text-[14px]">{data.question.choices.map((c, i) => <li key={i} className="grid grid-cols-[1.5rem_1fr]"><span>{CIRCLED[i]}</span><span>{c}</span></li>)}</ol>
        </Panel>

        {/* 탭 */}
        <div role="tablist" aria-label="분석 영역" className="sticky top-0 z-20 -mx-5 mt-6 flex gap-1 overflow-x-auto border-b border-border bg-background/95 px-5 backdrop-blur md:static md:mx-0 md:flex-wrap md:px-0">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={!all && tab === t.id} onClick={() => go(t.id)} className={cn("-mb-px shrink-0 border-b-2 px-3 py-3 text-[13.5px] transition-colors", !all && tab === t.id ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t.label}</button>
          ))}
          <button onClick={() => setAll((v) => !v)} aria-pressed={all} className={cn("ml-auto shrink-0 px-3 py-3 text-[13px] font-semibold", all ? "text-primary underline underline-offset-4" : "text-secondary-foreground hover:text-primary")}>전체 해설 {all ? "접기" : "한 번에 보기"}</button>
        </div>

        <div className="py-8 md:py-10" role="tabpanel">
          {all ? (
            <div className="space-y-14">{TABS.map((t) => <section key={t.id}><h2 className="mb-5 border-b border-primary pb-2 text-[20px] text-secondary-foreground">{t.label}</h2>{sections[t.id]}</section>)}</div>
          ) : sections[tab]}
        </div>
      </div>
    </div>
  );
}

// ── A ──────────────────────────────────────────────────────────────
function Overview({ d }: { d: AnalysisPassage }) {
  const o = d.overview;
  const items: [string, string][] = [
    ["1. 소재 (Topic)", o.topic], ["2. 주제 (Theme)", o.theme], ["3. 핵심 주장 (Main Idea)", o.mainIdea], ["4. 영어 제목", o.titleEn], ["5. 우리말 제목", o.titleKo],
    ["6. 글의 목적 (Purpose)", o.purpose], ["7. 지문 유형 및 논리 구조", o.structure], ["8. 핵심 논리 (Core Logic)", o.coreLogic], ["9. 영어 한 문장 요약", o.summaryEn], ["10. 한국어 한 문장 요약", o.summaryKo],
  ];
  return (
    <div className="space-y-6">
      <p className="border-l-2 border-mustard pl-3 text-[13px] leading-relaxed text-muted-foreground">소재는 글이 다루는 구체적 대상, 주제는 글 전체의 중심 생각(명사구), 핵심 주장은 필자의 메시지(완전한 문장)입니다. 셋을 구분해서 읽어 보세요.</p>
      <dl className="grid gap-px border border-border bg-border md:grid-cols-2">
        {items.map(([k, v], i) => (
          <div key={k} className={cn("bg-card p-4", i === 2 || i === 7 ? "md:col-span-2" : "")}><dt className="text-[11.5px] font-bold tracking-[0.04em] text-primary">{k}</dt><dd className={cn("mt-1 text-[14.5px] leading-[1.75]", k.includes("영어") && "font-medium")}>{v}</dd></div>
        ))}
      </dl>
      <Panel className="bg-light-pink"><Label>배경지식</Label><p className="mt-1.5 text-[14px] leading-[1.85]">{o.background}</p></Panel>
    </div>
  );
}

// ── B ──────────────────────────────────────────────────────────────
function SentencesView({ d, open, setOpen, focusN }: { d: AnalysisPassage; open: Set<number>; setOpen: (f: (s: Set<number>) => Set<number>) => void; focusN: number | null }) {
  const allOpen = open.size === d.sentences.length;
  const toggle = (n: number) => setOpen((s) => { const x = new Set(s); x.has(n) ? x.delete(n) : x.add(n); return x; });
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-muted-foreground">문장 번호를 누르면 해당 문장의 정밀 해설이 펼쳐집니다.</p>
        <button onClick={() => setOpen(() => (allOpen ? new Set() : new Set(d.sentences.map((s) => s.n))))} className="border border-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary hover:bg-blush/50">{allOpen ? "모두 접기" : "모두 펼치기"}</button>
      </div>
      <ol className="space-y-3">
        {d.sentences.map((s) => {
          const isOpen = open.has(s.n);
          return (
            <li key={s.n} id={`s-${s.n}`} className={cn("border bg-card", focusN === s.n ? "border-primary" : "border-border")}>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 p-4">
                <button onClick={() => toggle(s.n)} aria-expanded={isOpen} aria-controls={`sd-${s.n}`} className="flex size-10 shrink-0 flex-col items-center justify-center bg-primary text-primary-foreground hover:bg-primary-hover" title="클릭하여 펼치기/접기">
                  <span className="font-display text-[10px] leading-none opacity-80">S</span><span className="text-[15px] font-bold leading-none">{String(s.n).padStart(2, "0")}</span>
                </button>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5"><Tag tone={s.roleTag.includes("전환") || s.roleTag.includes("빈칸") ? "gold" : "plain"}>{s.roleTag}</Tag></div>
                  <p className="text-[15.5px] font-medium leading-[1.7]">{s.en}</p>
                  <p className="mt-1 text-[14px] leading-[1.75] text-muted-foreground"><span className="mr-1.5 text-[11px] font-bold text-dusty-rose">한줄해석</span>{s.ko}</p>
                </div>
              </div>
              {isOpen && (
                <div id={`sd-${s.n}`} className="space-y-4 border-t border-border bg-light-pink px-4 py-4 text-[13.5px] leading-[1.8]">
                  <div><Label>직독직해</Label><p className="mt-1 text-[14.5px] leading-[2]">{s.chunks.map((c, i) => <span key={i}>{i > 0 && <span className="mx-1.5 font-bold text-dusty-rose">/</span>}<span className="font-medium">{c.en}</span> <span className="text-[12.5px] text-muted-foreground">({c.ko})</span></span>)}</p></div>
                  <div><Label>핵심 구문 분석</Label><ul className="mt-1 space-y-1">{s.syntax.map((x, i) => <li key={i}><b className="text-secondary-foreground">{x.expr}</b>: {x.note}</li>)}</ul></div>
                  <div><Label>주요 문법</Label><ul className="mt-1 space-y-1">{s.grammar.map((x, i) => <li key={i}><b className="text-secondary-foreground">{x.point}</b>: {x.note}</li>)}</ul></div>
                  <div><Label>중요한 단어와 숙어</Label><ul className="mt-1 space-y-1">{s.words.map((x, i) => <li key={i}><b className="text-secondary-foreground">{x.w}</b>: {x.note}</li>)}</ul></div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="border-l-2 border-primary bg-card p-3"><Label>문장의 논리적 역할</Label><p className="mt-1">{s.role}</p></div>
                    <div className="border-l-2 border-mustard bg-card p-3"><Label>정답과의 관련성</Label><p className="mt-1">{s.answerLink}</p></div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── C ──────────────────────────────────────────────────────────────
function LogicView({ d, onJump }: { d: AnalysisPassage; onJump: (n: number) => void }) {
  const l = d.logic;
  const conn = l.steps.map((s) => s.connective).filter(Boolean) as string[];
  return (
    <div className="space-y-8">
      <ol className="mx-auto max-w-2xl">
        {l.steps.map((s, i) => (
          <li key={i}>
            <div className={cn("border p-4", s.emphasis ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("text-[12.5px] font-bold", s.emphasis ? "text-gold" : "text-primary")}>{s.label}{s.emphasis && " ★"}</span>
                <Tag tone={s.emphasis ? "gold" : "plain"}>{s.type}</Tag>
                {s.sentenceNos.map((n) => <button key={n} onClick={() => onJump(n)} className={cn("px-1.5 py-px text-[11px] font-bold underline underline-offset-2", s.emphasis ? "text-primary-foreground" : "text-primary")}>{n}번 문장</button>)}
              </div>
              <p className="mt-1.5 font-display text-[18px] leading-snug">{s.connective && <><span className={cn("mr-1.5 px-1 font-sans text-[13px] font-bold", s.emphasis ? "bg-gold text-secondary-foreground" : "bg-gold/70 text-secondary-foreground")}>{s.connective}</span></>}<Emph text={s.text} words={conn} /></p>
            </div>
            {i < l.steps.length - 1 && <div className="flex flex-col items-center py-1 text-dusty-rose" aria-hidden><span className="h-3 w-px bg-dusty-rose" /><span className="text-[14px] leading-none">▼</span></div>}
          </li>
        ))}
      </ol>
      {l.contrast && (
        <div className="grid gap-px border border-border bg-border md:grid-cols-[1fr_auto_1fr]">
          <div className="bg-card p-4"><Label>{l.contrast.leftLabel}</Label><ul className="mt-2 space-y-1 text-[14px]">{l.contrast.left.map((x) => <li key={x}>– {x}</li>)}</ul></div>
          <div className="flex items-center justify-center bg-gold/40 px-3 py-2 text-[13px] font-bold text-secondary-foreground">VS</div>
          <div className="bg-card p-4"><Label>{l.contrast.rightLabel}</Label><ul className="mt-2 space-y-1 text-[14px]">{l.contrast.right.map((x) => <li key={x}>– {x}</li>)}</ul></div>
        </div>
      )}
      <p className="border-l-2 border-mustard pl-3 text-[13.5px] leading-[1.8]">{l.note}</p>
    </div>
  );
}

// ── 지문 하이라이트(D·E 공용) ───────────────────────────────────────
function PassageHighlight({ d, mark, onJump }: { d: AnalysisPassage; mark: Record<number, "explicit" | "inferential" | "active" | undefined>; onJump?: (n: number) => void }) {
  return (
    <Panel className="bg-light-pink">
      <Label>지문 (근거 문장 표시)</Label>
      <p className="mt-2 text-[14.5px] leading-[2.1]">
        {d.passage.sentences.map((s) => (
          <span key={s.n} onClick={() => onJump?.(s.n)} className={cn("mr-1 cursor-pointer px-0.5 transition-colors", mark[s.n] === "explicit" && "bg-primary/15 font-semibold text-secondary-foreground", mark[s.n] === "inferential" && "bg-gold/50", mark[s.n] === "active" && "bg-primary text-primary-foreground")}>
            <sup className="mr-0.5 font-display text-[10px] text-dusty-rose">{s.n}</sup>{s.en}
          </span>
        ))}
      </p>
    </Panel>
  );
}

// ── D ──────────────────────────────────────────────────────────────
function EvidenceView({ d, onJump }: { d: AnalysisPassage; onJump: (n: number) => void }) {
  const e = d.evidence;
  const mark = useMemo(() => {
    const m: Record<number, "explicit" | "inferential"> = {};
    e.inferential.forEach((x) => x.sentenceNos.forEach((n) => (m[n] = "inferential")));
    e.explicit.forEach((x) => (m[x.sentenceNo] = "explicit"));
    return m;
  }, [e]);
  return (
    <div className="space-y-6">
      <div className="border-2 border-primary bg-card p-5">
        <Label>정답</Label>
        <p className="mt-1 text-[20px] font-bold text-primary">{CIRCLED[e.answerNo - 1]} {e.answerText}</p>
        <p className="mt-0.5 text-[14px] text-muted-foreground">{e.answerKo}</p>
      </div>
      <div className="flex flex-wrap gap-3 text-[12px]"><span><span className="mr-1 inline-block size-3 bg-primary/15 align-middle" />명시적 근거</span><span><span className="mr-1 inline-block size-3 bg-gold/50 align-middle" />추론적 근거</span></div>
      <PassageHighlight d={d} mark={mark} onJump={onJump} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3"><h3 className="text-[15px] font-bold text-secondary-foreground">명시적 근거 <span className="text-[12px] font-normal text-muted-foreground">지문에 직접 제시된 정보</span></h3>
          {e.explicit.map((x, i) => (
            <Panel key={i} className="border-l-4 border-l-primary"><button onClick={() => onJump(x.sentenceNo)} className="text-[12px] font-bold text-primary underline underline-offset-2">근거 {i + 1} — {x.sentenceNo}번 문장</button><p className="mt-1 font-display text-[16px] italic leading-snug">“{x.quote}”</p><p className="mt-1 text-[13.5px] text-muted-foreground">{x.ko}</p></Panel>
          ))}</div>
        <div className="space-y-3"><h3 className="text-[15px] font-bold text-secondary-foreground">추론적 근거 <span className="text-[12px] font-normal text-muted-foreground">여러 문장을 연결해 도출</span></h3>
          {e.inferential.map((x, i) => (
            <Panel key={i} className="border-l-4 border-l-mustard"><p className="text-[12px] font-bold text-primary">추론 {i + 1} — {x.sentenceNos.map((n) => `${n}번`).join(" + ")} 문장</p><p className="mt-1 text-[14px] leading-[1.8]">{x.reasoning}</p><p className="mt-1 text-[12.5px] text-muted-foreground">{x.ko}</p></Panel>
          ))}</div>
      </div>
      <div><Label>근거가 되는 핵심 표현</Label><p className="mt-1.5 flex flex-wrap gap-1.5">{e.keyExpressions.map((k) => <Tag key={k} tone="wine">{k}</Tag>)}</p></div>
      <div><Label>정답 도출 과정</Label><ol className="mt-2 flex flex-wrap items-center gap-y-2">{e.process.map((p, i) => <li key={i} className="flex items-center"><span className={cn("border px-2.5 py-1 text-[13px]", i === e.process.length - 1 ? "border-primary bg-primary font-bold text-primary-foreground" : "border-border bg-card")}>{p}</span>{i < e.process.length - 1 && <span aria-hidden className="mx-1.5 text-dusty-rose">→</span>}</li>)}</ol></div>
      <Panel className="bg-blush/50"><Label>최종 정답 판단</Label><p className="mt-1 text-[14.5px] leading-[1.8]">{e.verdict}</p></Panel>
    </div>
  );
}

// ── E ──────────────────────────────────────────────────────────────
function ParaphraseView({ d, onJump }: { d: AnalysisPassage; onJump: (n: number) => void }) {
  const [sel, setSel] = useState(0);
  const cur = d.paraphrase[sel];
  const mark: Record<number, "active" | undefined> = cur ? { [cur.sentenceNo]: "active" } : {};
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-muted-foreground">지문 표현(왼쪽)이 선택지 표현(오른쪽)으로 어떻게 바뀌었는지 보세요. 줄을 누르면 해당 지문 문장이 강조됩니다. 의미가 완전히 같지 않은 표현은 억지로 동의어로 묶지 않았습니다.</p>
      <PassageHighlight d={d} mark={mark} onJump={onJump} />
      <div className="hidden grid-cols-[1fr_auto_1fr] gap-3 px-1 text-[11.5px] font-bold text-primary md:grid"><span>지문 표현</span><span className="w-24 text-center">환원</span><span>선택지 표현</span></div>
      <ul className="space-y-2">
        {d.paraphrase.map((p, i) => {
          const correct = p.choiceNo === d.question.answerNo;
          return (
            <li key={i}>
              <button onClick={() => setSel(i)} aria-pressed={sel === i} className={cn("grid w-full gap-2 border p-3 text-left md:grid-cols-[1fr_auto_1fr] md:items-center", sel === i ? "border-primary bg-light-pink" : "border-border bg-card hover:border-dusty-rose")}>
                <span className="text-[14px]"><span className="mr-1.5 text-[11px] font-bold text-dusty-rose">{p.sentenceNo}번</span><b className="font-display italic">{p.passageExpr}</b></span>
                <span className="flex items-center justify-center gap-1 md:w-24" aria-hidden><span className="h-px w-6 bg-dusty-rose" /><span className="text-primary">▶</span></span>
                <span className="text-[14px]"><span className={cn("mr-1.5 text-[11px] font-bold", correct ? "text-success" : "text-destructive")}>{CIRCLED[p.choiceNo - 1]}{correct ? " 정답" : " 오답"}</span><b className="font-display italic">{p.choiceExpr}</b></span>
              </button>
              {sel === i && (
                <div className="space-y-2 border border-t-0 border-primary bg-card p-4 text-[13.5px] leading-[1.8]">
                  <p><Tag tone="wine">{p.type}</Tag> <span className="ml-1 text-muted-foreground">{p.ko}</span></p>
                  <p><b className="text-primary">의미가 연결되는 이유 </b>{p.why}</p>
                  <p><b className="text-primary">정답 판단에 미치는 영향 </b>{p.impact}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── F ──────────────────────────────────────────────────────────────
function WrongView({ d }: { d: AnalysisPassage }) {
  return (
    <ol className="space-y-3">
      {d.wrong.map((w) => (
        <li key={w.choiceNo} className={cn("border bg-card p-4", w.verdict === "정답" ? "border-2 border-primary" : "border-border")}>
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold"><span>{CIRCLED[w.choiceNo - 1]}</span><span className="font-display italic">{w.text}</span><Tag tone={w.verdict === "정답" ? "ok" : "bad"}>판정: {w.verdict}</Tag>{w.types.map((t) => <Tag key={t}>{t}</Tag>)}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{w.ko}</p>
          <p className="mt-2 text-[14px] leading-[1.85]"><b className="text-primary">해설 </b>{w.explain}</p>
        </li>
      ))}
    </ol>
  );
}

// ── G ──────────────────────────────────────────────────────────────
function VocabView({ d }: { d: AnalysisPassage }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-muted-foreground"><Tag tone="gold">정답 연결</Tag> 표시는 정답 판단과 직접 이어지는 핵심 어휘입니다.</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {d.vocab.map((v) => (
          <li key={v.word} className={cn("border bg-card p-4", v.key ? "border-mustard" : "border-border")}>
            <p className="flex flex-wrap items-baseline gap-2"><b className="font-display text-[20px] text-primary">{v.word}</b><span className="text-[12px] text-muted-foreground">{v.pos}</span>{v.key && <Tag tone="gold">정답 연결</Tag>}</p>
            <p className="mt-0.5 text-[14.5px] font-medium">{v.meaning}</p>
            <dl className="mt-2 grid grid-cols-[3.5rem_1fr] gap-y-0.5 text-[12.5px] leading-snug">
              <dt className="text-muted-foreground">유의어</dt><dd>{v.synonyms.join(", ") || "-"}</dd>
              <dt className="text-muted-foreground">반의어</dt><dd>{v.antonyms.join(", ") || "-"}</dd>
              <dt className="text-muted-foreground">숙어</dt><dd>{v.idioms.join(" / ") || "-"}</dd>
              <dt className="text-muted-foreground">지문 속</dt><dd className="font-display italic">“{v.example}”</dd>
            </dl>
            <p className="mt-2 border-t border-border pt-2 text-[12.5px] leading-[1.7]"><b className="text-primary">출제 포인트 </b>{v.point}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── H ──────────────────────────────────────────────────────────────
function SummaryView({ d }: { d: AnalysisPassage }) {
  const s = d.summary;
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const check = () => setChecked(s.blank.answers.some((a) => a.toLowerCase() === val.trim().toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Panel><Label>영어 한 문장 요약</Label><p className="mt-1.5 font-display text-[18px] italic leading-snug">{s.sentenceEn}</p></Panel>
        <Panel><Label>한국어 한 문장 요약</Label><p className="mt-1.5 text-[15px] leading-[1.75]">{s.sentenceKo}</p></Panel>
      </div>
      <div><Label>핵심 키워드</Label><p className="mt-1.5 flex flex-wrap gap-1.5">{s.keywords.map((k) => <Tag key={k} tone="wine">{k}</Tag>)}</p></div>
      <Panel className="bg-light-pink">
        <Label>요약문 빈칸 완성</Label>
        <p className="mt-2 font-display text-[18px] leading-[1.7]">{s.blank.text.split("__________")[0]}<span className="mx-1 inline-block min-w-24 border-b-2 border-primary text-center text-primary">{checked ? val : " "}</span>{s.blank.text.split("__________")[1]}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={val} onChange={(e) => { setVal(e.target.value); setChecked(null); }} placeholder="빈칸에 들어갈 말" className="h-10 w-48 border border-input bg-card px-3 text-[14px] focus-visible:border-dusty-rose focus-visible:outline-none" aria-label="빈칸 답" />
          <button onClick={check} className="h-10 bg-primary px-4 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">정답 확인</button>
          {checked !== null && <span role="status" className={cn("text-[13.5px] font-semibold", checked ? "text-success" : "text-destructive")}>{checked ? "정답입니다." : "다시 생각해 보세요."}</span>}
        </div>
        <details className="mt-3 text-[13px]"><summary className="cursor-pointer font-semibold text-primary">정답과 인정 범위 보기</summary><p className="mt-1.5 leading-[1.8]">정답: <b>{s.blank.answers.join(" / ")}</b><br />{s.blank.note}</p></details>
      </Panel>
    </div>
  );
}

// ── 변형문제 ────────────────────────────────────────────────────────
function VariantCard({ q, totalNote }: { q: VariantQuestion; totalNote?: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const objective = Boolean(q.choices);
  const correct = objective ? Number(q.answer) : null;
  return (
    <article className="border border-border bg-card p-4 sm:p-5">
      <p className="flex flex-wrap items-center gap-2"><span className="font-display text-[22px] text-primary">{String(q.no).padStart(2, "0")}</span><Tag tone="wine">{q.type}</Tag><Tag>난이도 {q.difficulty}</Tag></p>
      <p className="mt-2 whitespace-pre-line text-[14.5px] font-semibold">{q.stem}</p>
      {q.passage && <div className="mt-2 border-l-2 border-blush bg-light-pink px-4 py-3 text-[14px] leading-[2]"><MarkedText text={q.passage} /></div>}
      {q.choices && (
        <ol className="mt-3 space-y-1.5">
          {q.choices.map((c, i) => (
            <li key={i}><button onClick={() => setPick(i + 1)} className={cn("grid w-full grid-cols-[1.6rem_1fr] border px-3 py-2 text-left text-[14px]", pick === i + 1 ? (correct === i + 1 ? "border-success bg-success/10" : "border-destructive bg-destructive/5") : "border-border hover:border-dusty-rose")}><span>{CIRCLED[i]}</span><span>{c}</span></button></li>
          ))}
        </ol>
      )}
      {pick !== null && correct !== null && <p role="status" className={cn("mt-2 text-[13.5px] font-semibold", pick === correct ? "text-success" : "text-destructive")}>{pick === correct ? "정답입니다." : `오답입니다. 정답은 ${CIRCLED[correct - 1]}입니다.`}</p>}
      <button onClick={() => setShow((v) => !v)} aria-expanded={show} className="mt-3 border border-primary px-3 py-1.5 text-[12.5px] font-semibold text-primary hover:bg-blush/50">{show ? "해설 접기" : "정답·상세 해설 보기"}</button>
      {show && (
        <div className="mt-3 space-y-3 border-t border-border pt-3 text-[13.5px] leading-[1.8]">
          <p><Tag tone="wine">정답</Tag> <b className="ml-1">{objective ? `${CIRCLED[Number(q.answer) - 1]} ${q.choices?.[Number(q.answer) - 1]}` : q.answer}</b></p>
          {q.acceptedAnswers && <p className="text-[12.5px] text-muted-foreground">인정 답안: {q.acceptedAnswers.join(" / ")}</p>}
          <p><b className="text-primary">상세 해설 </b>{q.explain}</p>
          <div><b className="text-primary">정답 근거 문장</b>{q.evidence.map((e, i) => <p key={i} className="mt-0.5">{e.sentenceNos.join("·")}번 문장 — <span className="font-display italic">“{e.quote}”</span></p>)}</div>
          {q.paraphrase.length > 0 && <div><b className="text-primary">패러프레이징 분석</b>{q.paraphrase.map((p, i) => <p key={i} className="mt-0.5"><span className="font-display italic">{p.from}</span> <span className="text-dusty-rose">→</span> <span className="font-display italic">{p.to}</span><br /><span className="text-muted-foreground">{p.note}</span></p>)}</div>}
          {q.wrong.length > 0 && <div><b className="text-primary">선택지 분석</b><ul className="mt-0.5 space-y-1">{q.wrong.map((w) => <li key={w.choiceNo}>{CIRCLED[w.choiceNo - 1]} <Tag tone={w.verdict === "정답" ? "ok" : "bad"}>{w.verdict}</Tag> {w.types.map((t) => <Tag key={t}>{t}</Tag>)} {w.explain}</li>)}</ul></div>}
          <p><b className="text-primary">출제 의도 </b>{q.intent}</p>
        </div>
      )}
      {totalNote && null}
    </article>
  );
}

function VariantsView({ d }: { d: AnalysisPassage }) {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-muted-foreground">변형문제 {d.variants.length}문항. 각 문항의 정답은 하나이며, 억지로 문항 수를 채우지 않았습니다.</p>
      {d.variants.map((q) => <VariantCard key={q.id} q={q} />)}
      {d.skippedTypes.length > 0 && (
        <Panel className="bg-light-pink"><Label>만들지 않은 유형</Label><ul className="mt-1.5 space-y-1 text-[13.5px] leading-[1.7]">{d.skippedTypes.map((s) => <li key={s.type}><b>{s.type}</b> — {s.reason}</li>)}</ul></Panel>
      )}
    </div>
  );
}
