"use client";

import type { ReactNode } from "react";
import type { AnalysisPassage } from "@/lib/analysis/types";
import { useOverride } from "@/lib/analysis/use-override";
import { MarkedText } from "./common";

const C = ["①", "②", "③", "④", "⑤"];

function Page({ children, title, n, mode, d }: { children: ReactNode; title?: string; n?: number; mode: string; d: AnalysisPassage }) {
  return (
    <section className="a4 relative mx-auto mb-6 w-[210mm] max-w-full bg-white px-[16mm] py-[14mm] shadow-sm print:mb-0 print:w-auto print:max-w-none print:break-after-page print:px-0 print:py-0 print:shadow-none" style={{ minHeight: "297mm" }}>
      {title && <header className="mb-4 flex items-baseline justify-between border-b-2 border-primary pb-1.5"><h2 className="text-[15pt] text-secondary-foreground">{title}</h2><span className="text-[8.5pt] text-muted-foreground">{d.title} · {mode === "teacher" ? "교사용" : "학생용"}</span></header>}
      {children}
      <footer className="absolute inset-x-[16mm] bottom-[8mm] flex justify-between text-[8pt] text-muted-foreground print:hidden"><span>MELISSA EDU</span>{n && <span>{n}</span>}</footer>
    </section>
  );
}

const Box = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="mb-3 break-inside-avoid border border-dusty-rose/60 p-3"><p className="mb-1 text-[8.5pt] font-bold text-primary">{label}</p><div className="text-[9.5pt] leading-[1.7]">{children}</div></div>
);

export function PrintView({ data: base, mode, demo }: { data: AnalysisPassage; mode: "student" | "teacher"; demo?: boolean }) {
  const d = useOverride(base, demo);
  const t = mode === "teacher";
  const o = d.overview;
  const pages: { title?: string; body: ReactNode }[] = [];

  pages.push({ body: (
    <div className="flex min-h-[250mm] flex-col justify-center border-y-4 border-primary text-center">
      <p className="font-display text-[11pt] tracking-[0.3em] text-primary">MELISSA EDU</p>
      <h1 className="mt-6 text-[30pt] leading-tight text-secondary-foreground">{d.title}</h1>
      <p className="mt-2 text-[14pt] text-muted-foreground">{o.titleKo}</p>
      <p className="mt-10 text-[11pt]">수능 영어 프리미엄 지문 분석 · {t ? "교사용 해설지" : "학생용 문제지"}</p>
      <p className="mt-2 text-[10pt] text-muted-foreground">{d.meta.questionType} · 난이도 {d.meta.difficulty} · {d.source.origin}{d.source.year && ` ${d.source.year}`}</p>
      <p className="mt-16 text-[9pt] text-muted-foreground">이름 ______________ 　날짜 ______________</p>
    </div>
  ) });

  pages.push({ title: "지문 · 문제", body: (
    <>
      <p className="text-[10pt] font-semibold">{d.question.stem}</p>
      <p className="mt-3 border border-border p-4 text-[11pt] leading-[2.1]">{d.passage.sentences.map((s) => <span key={s.n}><sup className="mr-0.5 text-[7pt] text-dusty-rose">{s.n}</sup>{s.en} </span>)}</p>
      <ol className="mt-4 space-y-1.5 text-[10.5pt]">{d.question.choices.map((c, i) => <li key={i} className="grid grid-cols-[1.4rem_1fr]"><span>{C[i]}</span><span>{c}</span></li>)}</ol>
      {t && <p className="mt-5 border-l-4 border-primary bg-light-pink px-3 py-2 text-[10.5pt] font-bold text-primary">정답 {C[d.question.answerNo - 1]}</p>}
    </>
  ) });

  if (t) {
    pages.push({ title: "핵심 정보 · 문장별 해석", body: (
      <>
        <div className="grid grid-cols-2 gap-x-3">{([["소재", o.topic], ["주제", o.theme], ["핵심 주장", o.mainIdea], ["글의 목적", o.purpose], ["논리 구조", o.structure], ["핵심 논리", o.coreLogic], ["영어 제목", o.titleEn], ["우리말 제목", o.titleKo]] as const).map(([k, v]) => <Box key={k} label={k}>{v}</Box>)}</div>
        <Box label="배경지식">{o.background}</Box>
        <table className="mt-2 w-full text-[9pt] leading-[1.6]"><tbody>{d.sentences.map((s) => <tr key={s.n} className="break-inside-avoid border-b border-border align-top"><td className="w-8 py-1.5 font-bold text-primary">{s.n}</td><td className="py-1.5">{s.en}<br /><span className="text-muted-foreground">{s.ko}</span></td></tr>)}</tbody></table>
      </>
    ) });
    pages.push({ title: "구문 분석", body: (
      <>
        {d.sentences.map((s) => (
          <div key={s.n} className="mb-2.5 break-inside-avoid text-[9pt] leading-[1.65]"><p className="font-bold"><span className="text-primary">{s.n}</span> {s.chunks.map((c) => c.en).join(" / ")}</p>
            <p>{s.syntax.map((x) => `${x.expr}: ${x.note}`).join(" · ")}</p><p className="text-muted-foreground">문법 — {s.grammar.map((x) => `${x.point}: ${x.note}`).join(" · ")}</p></div>
        ))}
      </>
    ) });
    pages.push({ title: "핵심 어휘", body: (
      <>
        <table className="w-full text-[9.5pt] leading-[1.7]"><tbody>{d.vocab.map((v) => <tr key={v.word} className="break-inside-avoid border-b border-border align-top"><td className="w-24 py-1 font-bold text-primary">{v.word}{v.key && " ★"}</td><td className="py-1">{v.pos} {v.meaning}<br /><span className="text-muted-foreground">유 {v.synonyms.join(", ") || "-"} / 반 {v.antonyms.join(", ") || "-"}</span></td></tr>)}</tbody></table>
      </>
    ) });
    pages.push({ title: "논리 구조도", body: (
      <>
        <ol className="mx-auto max-w-[130mm]">{d.logic.steps.map((s, i) => <li key={i} className="break-inside-avoid"><div className={s.emphasis ? "border-2 border-primary bg-primary p-3 text-white" : "border border-border p-3"}><p className="text-[8.5pt] font-bold">{s.label} · {s.type} · {s.sentenceNos.join(", ")}번</p><p className="mt-0.5 text-[10pt]">{s.connective && <b className="mr-1 bg-gold px-1 text-secondary-foreground">{s.connective}</b>}{s.text}</p></div>{i < d.logic.steps.length - 1 && <p className="text-center text-dusty-rose">▼</p>}</li>)}</ol>
        <p className="mt-4 text-[9.5pt] leading-[1.7]">{d.logic.note}</p>
      </>
    ) });
    pages.push({ title: "정답 근거 · 패러프레이징", body: (
      <>
        <Box label={`정답 ${C[d.evidence.answerNo - 1]} ${d.evidence.answerText}`}>{d.evidence.answerKo}</Box>
        {d.evidence.explicit.map((x, i) => <Box key={i} label={`명시적 근거 ${i + 1} · ${x.sentenceNo}번`}><i>“{x.quote}”</i> {x.ko}</Box>)}
        {d.evidence.inferential.map((x, i) => <Box key={i} label={`추론적 근거 ${i + 1} · ${x.sentenceNos.join("+")}번`}>{x.reasoning}</Box>)}
        <p className="mb-2 text-[9pt]"><b className="text-primary">도출 과정 </b>{d.evidence.process.join(" → ")}</p>
        <p className="mb-3 text-[9.5pt]"><b className="text-primary">판단 </b>{d.evidence.verdict}</p>
        <table className="w-full text-[8.5pt] leading-[1.5]"><tbody>{d.paraphrase.map((p, i) => <tr key={i} className="break-inside-avoid border-b border-border align-top"><td className="py-1"><i>{p.passageExpr}</i> <span className="text-dusty-rose">▶</span> <i>{p.choiceExpr}</i> <b className="text-primary">[{p.type}]</b><br /><span className="text-muted-foreground">{p.why}</span></td></tr>)}</tbody></table>
      </>
    ) });
    pages.push({ title: "오답 분석 · 요약", body: (
      <>
        {d.wrong.map((w) => <Box key={w.choiceNo} label={`${C[w.choiceNo - 1]} ${w.verdict} · ${w.types.join(", ")}`}><b>{w.text}</b><br />{w.explain}</Box>)}
        <Box label="요약">{d.summary.sentenceEn}<br />{d.summary.sentenceKo}<br />키워드: {d.summary.keywords.join(", ")}<br />빈칸 정답: <b>{d.summary.blank.answers.join(" / ")}</b></Box>
      </>
    ) });
  } else {
    pages.push({ title: "핵심 어휘 · 요약 빈칸", body: (
      <>
        <table className="w-full text-[10pt] leading-[2]"><tbody>{d.vocab.map((v) => <tr key={v.word} className="break-inside-avoid border-b border-border"><td className="w-32 py-1 font-bold">{v.word}</td><td className="py-1 text-muted-foreground">{v.pos}</td><td className="py-1">뜻: ______________________</td></tr>)}</tbody></table>
        <Box label="요약문 빈칸 완성"><p className="text-[11pt] leading-[2]">{d.summary.blank.text}</p></Box>
      </>
    ) });
  }

  const vs = d.variants;
  const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
  chunk(vs, t ? 2 : 3).forEach((g, gi) => pages.push({ title: `변형문제 ${t ? "· 해설 " : ""}(${gi + 1})`, body: (
    <>{g.map((q) => (
      <div key={q.id} className="mb-5 break-inside-avoid text-[10pt] leading-[1.75]">
        <p><b className="mr-1 text-primary">{q.no}.</b><b>[{q.type}]</b> <span className="whitespace-pre-line">{q.stem}</span></p>
        {q.passage && <p className="my-1.5 border-l-2 border-blush bg-light-pink px-3 py-1.5 leading-[2]"><MarkedText text={q.passage} /></p>}
        {q.choices && <ol className="space-y-0.5">{q.choices.map((c, i) => <li key={i} className="grid grid-cols-[1.4rem_1fr]"><span>{C[i]}</span><span>{c}</span></li>)}</ol>}
        {!q.choices && !t && <p className="mt-2 border-b border-dotted border-muted-foreground">&nbsp;</p>}
        {t && <div className="mt-1.5 border border-dusty-rose/60 p-2.5 text-[9pt]"><p><b className="text-primary">정답 </b>{q.choices ? `${C[Number(q.answer) - 1]} ${q.choices[Number(q.answer) - 1]}` : q.answer}</p><p><b className="text-primary">해설 </b>{q.explain}</p><p><b className="text-primary">근거 </b>{q.evidence.map((e) => `${e.sentenceNos.join("·")}번`).join(", ")} · <b className="text-primary">의도 </b>{q.intent}</p></div>}
      </div>
    ))}</>
  ) }));

  return (
    <div className="bg-muted py-6 print:bg-white print:py-0">
      <style>{`@page{size:A4;margin:14mm 16mm} @media print{header.sticky,footer.site{display:none!important} body{background:#fff!important} .a4{min-height:0!important}} .a4 h1,.a4 h2{break-after:avoid}`}</style>
      <div className="mx-auto mb-4 flex w-[210mm] max-w-full flex-wrap items-center justify-between gap-2 px-3 print:hidden">
        <p className="text-[13px] text-muted-foreground">{t ? "교사용 해설지" : "학생용 문제지"} · A4 {pages.length}쪽 — 인쇄 창에서 &lsquo;PDF로 저장&rsquo;을 선택하세요.</p>
        <button onClick={() => window.print()} className="h-10 bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:bg-primary-hover">인쇄 / PDF로 저장</button>
      </div>
      {pages.map((p, i) => <Page key={i} title={p.title} n={i + 1} mode={mode} d={d}>{p.body}</Page>)}
    </div>
  );
}
