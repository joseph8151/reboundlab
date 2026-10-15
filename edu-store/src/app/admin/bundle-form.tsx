"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STATUSES, TRACKS } from "@/lib/catalog";

export type BundleInit = { id?: string; slug: string; title: string; summary: string; description: string; track: string; price: string; status: string; releaseDate: string; seoTitle: string; seoDescription: string; itemSlugs: string[] };
export const EMPTY_BUNDLE: BundleInit = { slug: "", title: "", summary: "", description: "", track: "", price: "", status: "on_sale", releaseDate: "", seoTitle: "", seoDescription: "", itemSlugs: [] };

export function BundleForm({ init, sellable }: { init: BundleInit; sellable: { slug: string; title: string; price: number | null }[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ type: "error" | "busy"; text: string } | null>(null);
  const editing = Boolean(init.id);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = { id: init.id, itemSlugs: f.getAll("items") };
    for (const k of ["slug", "title", "summary", "description", "track", "price", "status", "releaseDate", "seoTitle", "seoDescription"]) body[k] = f.get(k);
    setMsg({ type: "busy", text: "저장 중…" });
    const res = await fetch("/api/admin/bundles", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const out = await res.json();
    if (!res.ok) return setMsg({ type: "error", text: out.message });
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label>패키지명 *</Label><Input name="title" required defaultValue={init.title} /></div>
        <div className="space-y-2"><Label>슬러그 *</Label><Input name="slug" required pattern="[a-z0-9-]{3,90}" defaultValue={init.slug} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>한 줄 소개</Label><Input name="summary" defaultValue={init.summary} /></div>
        <div className="space-y-2 sm:col-span-2"><Label>상세 설명</Label><Textarea name="description" rows={4} defaultValue={init.description} /></div>
        <div className="space-y-2"><Label>학습 과정</Label>
          <NativeSelect name="track" defaultValue={init.track}><option value="">선택 안 함</option>{TRACKS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</NativeSelect></div>
        <div className="space-y-2"><Label>판매 상태 *</Label>
          <NativeSelect name="status" defaultValue={init.status}>{STATUSES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</NativeSelect></div>
        <div className="space-y-2"><Label>패키지 가격(원)</Label><Input name="price" type="number" min={0} step={100} defaultValue={init.price} /><p className="text-xs text-muted-foreground">할인액은 포함 교재의 판매가 합계와 이 가격의 차이로 자동 계산됩니다.</p></div>
        <div className="space-y-2"><Label>출시일 (선택)</Label><Input name="releaseDate" type="date" defaultValue={init.releaseDate} /></div>
      </div>

      <fieldset className="border-t border-border pt-5">
        <legend className="pb-3 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">포함 교재 (판매 중인 교재만 표시)</legend>
        {sellable.length === 0 ? <p className="text-sm text-muted-foreground">패키지에 넣을 수 있는 판매 중 교재가 아직 없습니다.</p> : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {sellable.map((p) => (
              <li key={p.slug}><label className="flex items-start gap-2 text-sm"><input type="checkbox" name="items" value={p.slug} defaultChecked={init.itemSlugs.includes(p.slug)} className="mt-1 size-4 accent-primary" /> <span>{p.title}<span className="ml-2 text-muted-foreground">{p.price?.toLocaleString("ko-KR")}원</span></span></label></li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2"><Label>SEO 제목</Label><Input name="seoTitle" defaultValue={init.seoTitle} /></div>
        <div className="space-y-2"><Label>SEO 설명</Label><Input name="seoDescription" defaultValue={init.seoDescription} /></div>
      </div>
      {msg && <p role="status" className={`whitespace-pre-line text-[14px] ${msg.type === "error" ? "text-destructive" : ""}`}>{msg.text}</p>}
      <div className="flex items-center gap-5">
        <Button type="submit" size="lg" disabled={msg?.type === "busy"}>{editing ? "변경 저장" : "패키지 등록"}</Button>
        <Link href="/admin" className="text-[14px] text-muted-foreground underline underline-offset-4">목록으로</Link>
      </div>
    </form>
  );
}
