import type { SampleBlock, SamplePage } from "@/lib/samples";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function Block({ b }: { b: SampleBlock }) {
  if (b.t === "problem") {
    return (
      <section className="break-inside-avoid border-t border-primary/30 pt-4">
        <p className="flex items-baseline gap-2 text-[13px] font-semibold text-primary"><span className="font-display text-[20px]">{String(b.no).padStart(2, "0")}</span>{b.label && <span className="text-[11.5px] font-medium text-dusty-rose">{b.label}</span>}</p>
        {b.passage && <div className="mt-2 whitespace-pre-line border-l-2 border-blush bg-light-pink px-4 py-3 text-[13.5px] leading-[1.9]">{b.passage}</div>}
        <p className="mt-3 whitespace-pre-line text-[14.5px] font-medium leading-[1.8]">{b.question}</p>
        {b.choices && <ol className="mt-2 space-y-1 text-[14px] leading-relaxed">{b.choices.map((c, i) => <li key={i} className="grid grid-cols-[1.4rem_1fr]"><span>{CIRCLED[i]}</span><span>{c}</span></li>)}</ol>}
        <div className="mt-3 border border-blush bg-card px-4 py-3 text-[13px] leading-[1.8]">
          <p><span className="mr-2 inline-block bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">정답</span><strong>{b.answer}</strong></p>
          <p className="mt-1.5 whitespace-pre-line"><span className="font-semibold text-primary">해설 </span>{b.explain}</p>
          {b.wrong && b.wrong.length > 0 && <ul className="mt-1.5 list-disc pl-5 text-foreground/80">{b.wrong.map((w, i) => <li key={i}>{w}</li>)}</ul>}
        </div>
      </section>
    );
  }
  if (b.t === "sheet") {
    return (
      <section className="break-inside-avoid border-t border-primary/30 pt-4">
        <h3 className="text-[15px] font-semibold text-secondary-foreground">{b.title}</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
            {b.columns && <thead><tr className="bg-blush/60">{b.columns.map((c) => <th key={c} className="border border-dusty-rose/40 px-2.5 py-1.5 font-semibold">{c}</th>)}</tr></thead>}
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="h-9 border border-dusty-rose/40 px-2.5 py-1.5 align-top leading-snug">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {b.note && <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{b.note}</p>}
      </section>
    );
  }
  if (b.t === "steps") {
    return (
      <section className="break-inside-avoid border-t border-primary/30 pt-4">
        <h3 className="text-[15px] font-semibold text-secondary-foreground">{b.title}</h3>
        <ol className="mt-2 space-y-1.5 text-[13.5px] leading-[1.8]">{b.items.map((s, i) => <li key={i} className="grid grid-cols-[1.6rem_1fr]"><span className="font-display text-[16px] text-dusty-rose">{i + 1}</span><span>{s}</span></li>)}</ol>
      </section>
    );
  }
  if (b.t === "fill") {
    return (
      <section className="break-inside-avoid border-t border-primary/30 pt-4">
        <h3 className="text-[15px] font-semibold text-secondary-foreground">{b.title}</h3>
        <ul className="mt-2 space-y-2.5 text-[13px]">{b.lines.map((l, i) => <li key={i} className="grid grid-cols-[8.5rem_1fr] items-end gap-3"><span className="text-muted-foreground">{l}</span><span className="h-6 border-b border-dusty-rose/60" /></li>)}</ul>
      </section>
    );
  }
  return <p className="border-l-2 border-mustard pl-3 text-[12.5px] leading-relaxed text-foreground/80">{b.text}</p>;
}

/** A4 비율의 샘플 용지. 화면에서는 종이처럼, 인쇄할 때는 쪽 단위로 나뉩니다. */
export function SampleSheet({ productTitle, page, no, total }: { productTitle: string; page: SamplePage; no: number; total: number }) {
  return (
    <article className="relative mx-auto flex min-h-[640px] w-full flex-col border border-border bg-white p-6 shadow-[0_12px_28px_-18px_rgba(74,29,40,0.45)] sm:p-10 print:break-after-page print:border-0 print:p-[14mm] print:shadow-none">
      <header className="flex items-baseline justify-between border-b border-primary pb-3">
        <p className="font-display text-[13px] font-semibold uppercase tracking-[0.24em] text-primary">Melissa Edu <span className="italic text-dusty-rose">Sample</span></p>
        <p className="text-[11.5px] text-muted-foreground">{productTitle}</p>
      </header>
      <h2 className="mt-5 text-[20px] leading-snug text-secondary-foreground">{page.heading}</h2>
      <div className="mt-4 space-y-5">{page.blocks.map((b, i) => <Block key={i} b={b} />)}</div>
      <footer className="mt-auto flex items-center justify-between pt-8 text-[11px] text-muted-foreground">
        <span>샘플 · 예시 구성입니다</span><span className="font-display text-[13px]">{no} / {total}</span>
      </footer>
      <span aria-hidden className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 -rotate-12 font-display text-[64px] italic text-primary/[0.04] print:text-primary/[0.05]">Sample</span>
    </article>
  );
}
