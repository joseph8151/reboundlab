import type { SampleBlock, SamplePage } from "@/lib/samples";
import type { Product } from "@/lib/types";
import { BookCover } from "./book-cover";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

/** {{단어|태그}} → 굵은 단어 + [태그]. 번역 노트형 교재의 표시법입니다. */
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\{\{([^|}]+)\|([^}]+)\}\}$/.exec(p);
        return m ? <span key={i}><strong className="font-bold text-secondary-foreground">{m[1]}</strong><span className="text-[0.78em] font-semibold text-dusty-rose">[{m[2]}]</span></span> : <span key={i}>{p}</span>;
      })}
    </>
  );
}

const Heading = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-secondary-foreground"><span aria-hidden className="inline-block size-[7px] bg-primary" />{children}</p>
);

function Block({ b }: { b: SampleBlock }) {
  if (b.t === "problem") {
    return (
      <section>
        <p className="flex items-baseline gap-2 text-[13.5px] font-bold text-secondary-foreground">
          <span aria-hidden className="inline-block size-[9px] translate-y-px rounded-full bg-primary" />
          <span className="font-display text-[17px] text-primary">{String(b.no).padStart(2, "0")}</span>
          <span className="whitespace-pre-line">{b.question}</span>
          {b.label && <span className="ml-auto max-w-[45%] text-right text-[11px] font-medium leading-snug text-dusty-rose">{b.label}</span>}
        </p>
        <div className="mt-1.5 border-[1.5px] border-primary px-3.5 py-2.5">
          {b.passage && <div className="whitespace-pre-line text-[12.5px] leading-[1.85]">{b.passage}</div>}
          {b.choices && <ol className={"space-y-0.5 text-[12.5px] leading-snug " + (b.passage ? "mt-2.5 border-t border-blush pt-2" : "")}>{b.choices.map((c, i) => <li key={i} className="grid grid-cols-[1.4rem_1fr]"><span>{CIRCLED[i]}</span><span>{c}</span></li>)}</ol>}
        </div>
        <div className="mt-1.5 text-[11.5px] leading-[1.7]">
          <p><span className="mr-1.5 inline-block bg-primary px-1.5 text-[10.5px] font-semibold text-primary-foreground">정답</span><strong className="text-primary">{b.answer}</strong></p>
          <p className="mt-1 whitespace-pre-line"><span className="font-semibold text-primary">해설 </span>{b.explain}</p>
          {b.wrong && b.wrong.length > 0 && <ul className="mt-1 list-disc pl-5 text-foreground/75">{b.wrong.map((w, i) => <li key={i}>{w}</li>)}</ul>}
        </div>
      </section>
    );
  }
  if (b.t === "read") {
    return (
      <section>
        <p className="flex items-baseline gap-2 text-[13.5px] font-bold text-secondary-foreground"><span aria-hidden className="inline-block size-[9px] translate-y-px rounded-full bg-primary" /><span className="font-display text-[17px] text-primary">{String(b.no).padStart(2, "0")}</span>{b.question}</p>
        <div className="mt-1.5 space-y-3 border-[1.5px] border-primary px-3.5 py-3">
          {b.sentences.map((s, i) => (
            <div key={i}>
              <p className="text-justify text-[12.5px] font-medium leading-[1.75] text-foreground">{s.lead && <span className="mr-1 font-bold text-dusty-rose">{s.lead}</span>}<Marked text={s.en} /></p>
              <p className="mt-0.5 pl-3 text-justify text-[11.5px] leading-[1.7] text-muted-foreground">{s.ko}</p>
            </div>
          ))}
        </div>
        {b.note && <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{b.note}</p>}
      </section>
    );
  }
  if (b.t === "analysis") {
    return (
      <section className="space-y-2.5 text-[12.5px] leading-[1.75]">
        {b.sections.map((s, i) => (
          <div key={i}>
            <Heading>{s.h}</Heading>
            {s.en && <p className="mt-0.5 whitespace-pre-line text-justify font-medium">{s.en}</p>}
            {s.ko && <p className="whitespace-pre-line text-justify text-muted-foreground">{s.ko}</p>}
            {s.lines && s.lines.map((l, j) => <p key={j} className="text-justify" style={{ paddingLeft: "0.9em", textIndent: "-0.9em" }}>{l}</p>)}
          </div>
        ))}
        {b.summary && (
          <div className="space-y-2 pt-1 font-semibold text-primary">
            <p className="text-[12px] text-dusty-rose">[지문 분석 요약]</p>
            {b.summary.structure && <p>논리 구조: {b.summary.structure}</p>}
            {b.summary.theme && <p>핵심 주제: {b.summary.theme}</p>}
          </div>
        )}
      </section>
    );
  }
  if (b.t === "sheet") {
    return (
      <section>
        <Heading>{b.title}</Heading>
        <div className="mt-1.5 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-[12px]">
            {b.columns && <thead><tr className="bg-blush/60">{b.columns.map((c) => <th key={c} className="border border-dusty-rose/50 px-2 py-1 font-semibold">{c}</th>)}</tr></thead>}
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="h-8 border border-dusty-rose/50 px-2 py-1 align-top leading-snug">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {b.note && <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{b.note}</p>}
      </section>
    );
  }
  if (b.t === "steps") {
    return (
      <section>
        <Heading>{b.title}</Heading>
        <ol className="mt-1 space-y-1 text-[12.5px] leading-[1.75]">{b.items.map((s, i) => <li key={i} className="grid grid-cols-[1.5rem_1fr]"><span className="font-display text-[15px] text-dusty-rose">{i + 1}</span><span>{s}</span></li>)}</ol>
      </section>
    );
  }
  if (b.t === "fill") {
    return (
      <section>
        <Heading>{b.title}</Heading>
        <ul className="mt-1.5 space-y-2 text-[12px]">{b.lines.map((l, i) => <li key={i} className="grid grid-cols-[8rem_1fr] items-end gap-3"><span className="text-muted-foreground">{l}</span><span className="h-5 border-b border-dusty-rose/60" /></li>)}</ul>
      </section>
    );
  }
  return <p className="border-l-2 border-mustard pl-3 text-[12px] leading-relaxed text-foreground/80">{b.text}</p>;
}

const spansAll = (b: SampleBlock) =>
  b.t === "read" || b.t === "analysis" || (b.t === "problem" && Boolean(b.passage)) || (b.t === "sheet" && (b.rows.length > 4 || (b.columns?.length ?? 0) > 3)) || b.t === "fill";

const levelLabel = (levels: readonly string[]) =>
  levels.some((l) => l.startsWith("middle")) && !levels.some((l) => l.startsWith("high") || l === "suneung") ? "Middle School" : levels.length ? "High School" : "Study Guide";

/** 번역 노트형 교재 한 장: 노란 테두리, 머리글(과정·교재명·차시·Made by), 쪽 번호. */
function Frame({ product, sub, no, children }: { product: Product; sub?: string; no: number; children: React.ReactNode }) {
  return (
    <article className="relative mx-auto flex min-h-[680px] min-w-0 overflow-hidden w-full flex-col border-[3px] border-gold bg-white px-5 pb-4 pt-4 shadow-[0_12px_28px_-18px_rgba(74,29,40,0.45)] sm:px-8 print:break-after-page print:min-h-[270mm] print:shadow-none">
      <header className="border-b border-primary pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <p className="font-display text-[15px] font-semibold text-primary">{levelLabel(product.levels)}</p>
          <p className="text-[12.5px] font-medium text-secondary-foreground">{product.series ?? "MELISSA EDU"} · {product.title}</p>
        </div>
        <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 text-[12px] text-muted-foreground">
          <p>{sub ?? "샘플 페이지"}</p>
          <p className="font-display text-[13px] font-semibold text-secondary-foreground">Made by <span className="italic text-dusty-rose">Melissa Edu</span></p>
        </div>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
      <footer className="mt-4 text-center font-display text-[13px] text-muted-foreground">- {no} -</footer>
    </article>
  );
}

export function SampleCover({ product, summary }: { product: Product; summary: string }) {
  return (
    <Frame product={product} sub="표지" no={1}>
      <div className="mx-auto mt-6 flex max-w-[360px] flex-col items-center text-center">
        <p className="font-display text-[44px] italic leading-none tracking-[0.04em] text-primary sm:text-[56px]">Sample</p>
        <p className="mt-2 text-[11.5px] tracking-[0.3em] text-dusty-rose">MELISSA EDU</p>
        <div className="mt-6 w-[200px] sm:w-[240px]"><BookCover product={product} sizes="240px" /></div>
        <p className="mt-6 text-[13px] leading-[1.75] text-muted-foreground">{summary}</p>
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">멜리사 에듀가 새로 작성한 예시 페이지입니다. 최종 교재의 문항·쪽수·구성은 상담 후 확정되는 원고에서 달라질 수 있습니다.</p>
      </div>
    </Frame>
  );
}

export function SampleSheet({ product, page, no }: { product: Product; page: SamplePage; no: number }) {
  return (
    <Frame product={product} sub={page.heading} no={no}>
      <div className="mt-3 md:columns-2 md:gap-x-7 print:columns-2 print:gap-x-6">
        {page.blocks.map((b, i) => (
          <div key={i} className={"mb-3.5 break-inside-avoid " + (spansAll(b) ? "md:[column-span:all] print:[column-span:all]" : "")}><Block b={b} /></div>
        ))}
      </div>
    </Frame>
  );
}
