"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { primaryBtn } from "./ui";
import { NativeSelect } from "@/components/ui/select";
import { areaLabel, deliveryLabel, difficultyLabel, kindLabel, levelsText } from "@/lib/catalog";
import { saveDraft } from "@/lib/consult";
import type { GuideProduct } from "@/lib/guide";
import { formatPrice } from "@/lib/utils";

export type CompareProduct = GuideProduct & { goals: string[]; answer: string; summary: string };

export function Compare({ products, initial }: { products: CompareProduct[]; initial: string[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<string[]>(initial.filter((s) => products.some((p) => p.slug === s)).slice(0, 3));
  const chosen = sel.map((s) => products.find((p) => p.slug === s)).filter((p): p is CompareProduct => Boolean(p));
  const rows: [string, (p: CompareProduct) => string][] = [
    ["대상 학년", (p) => levelsText(p.levels) || "-"], ["과목", (p) => areaLabel(p.area)], ["유형", (p) => kindLabel(p.kind)],
    ["난이도", (p) => difficultyLabel(p.difficulty) || "상담 시 안내"], ["문제 수", (p) => (p.questionCount ? `${p.questionCount}문항` : "상담 시 안내")],
    ["페이지 수", (p) => (p.pageCount ? `${p.pageCount}쪽` : "상담 시 안내")], ["학습 목표", (p) => (p.goals.length ? p.goals.join(" / ") : p.summary || "-")],
    ["판매 가격", (p) => (p.price !== null ? formatPrice(p.price) : "상담 시 안내")], ["제공 형태", (p) => deliveryLabel(p.deliveryType)],
    ["정답·해설", (p) => p.answer], ["추천 학습 기간", (p) => (p.questionCount ? `${Math.max(1, Math.ceil(p.questionCount / 10))}일 이상 (하루 10문항 기준)` : "상담 시 안내")],
  ];

  function consult() {
    saveDraft({ source: "교재 비교", inquiryType: "book", slugs: chosen.map((p) => p.slug), recommended: chosen.map((p) => p.title), message: `교재 비교 후 상담을 요청합니다: ${chosen.map((p) => p.title).join(", ")}` });
    router.push("/consult");
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <NativeSelect key={i}>
            <select aria-label={`비교 교재 ${i + 1}`} value={sel[i] ?? ""} onChange={(e) => setSel((cur) => { const n = [...cur]; if (e.target.value) n[i] = e.target.value; else n.splice(i, 1); return n.filter(Boolean); })} className="h-11 w-full appearance-none rounded-lg border border-input bg-background pl-3.5 pr-9 text-[14px]">
              <option value="">{i < 2 ? `교재 ${i + 1} 선택` : "교재 3 선택 (선택)"}</option>
              {products.filter((p) => p.slug === sel[i] || !sel.includes(p.slug)).map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
            </select>
          </NativeSelect>
        ))}
      </div>

      {chosen.length >= 2 ? (
        <>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
              <thead><tr className="border-b border-foreground/30"><th className="w-28 py-2 pr-3" />{chosen.map((p) => <th key={p.slug} className="py-2 pr-4 align-top text-[15px] font-semibold"><Link href={`/books/${p.slug}`} className="hover:underline">{p.title}</Link></th>)}</tr></thead>
              <tbody>{rows.map(([k, f]) => <tr key={k} className="border-b border-border align-top"><th className="py-3 pr-3 text-[13px] font-medium text-muted-foreground">{k}</th>{chosen.map((p) => <td key={p.slug} className="py-3 pr-4 leading-relaxed">{f(p)}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="mt-8"><button type="button" onClick={consult} data-consult-button className={primaryBtn}>비교한 교재 한 번에 상담 신청</button></div>
        </>
      ) : <p className="mt-8 text-[15px] text-muted-foreground">비교할 교재를 2권 이상 선택해 주세요.</p>}
    </div>
  );
}
