"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GRADES, SUBJECTS, TYPES } from "@/lib/catalog";
import { uploadFile } from "./upload";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProductForm() {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "error" | "ok" | "busy"; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const pdf = f.get("pdf") as File | null;
    const thumb = f.get("thumbnail") as File | null;
    const samples = (f.getAll("samples") as File[]).filter((s) => s.size > 0);

    if (!pdf || pdf.size === 0) return setStatus({ type: "error", text: "PDF 파일을 선택하세요." });

    try {
      setStatus({ type: "busy", text: "PDF 업로드 중…" });
      const { path: filePath } = await uploadFile(pdf, "file");

      let thumbnailUrl: string | null = null;
      if (thumb && thumb.size > 0) {
        setStatus({ type: "busy", text: "썸네일 업로드 중…" });
        thumbnailUrl = (await uploadFile(thumb, "asset")).publicUrl;
      }

      const sampleImages: string[] = [];
      for (const [i, s] of samples.entries()) {
        setStatus({ type: "busy", text: `샘플 이미지 업로드 중… (${i + 1}/${samples.length})` });
        const { publicUrl } = await uploadFile(s, "asset");
        if (publicUrl) sampleImages.push(publicUrl);
      }

      setStatus({ type: "busy", text: "상품 정보 저장 중…" });
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: f.get("slug"),
          title: f.get("title"),
          summary: f.get("summary"),
          description: f.get("description"),
          subject: f.get("subject"),
          type: f.get("type"),
          grades: f.getAll("grades"),
          price: Number(f.get("price")),
          pageCount: Number(f.get("pageCount")),
          toc: f.get("toc"),
          targets: f.get("targets"),
          includes: f.get("includes"),
          sampleExcerpt: f.get("sampleExcerpt"),
          isFeatured: f.get("isFeatured") === "on",
          isPublished: f.get("isPublished") === "on",
          filePath,
          thumbnailUrl,
          sampleImages,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);
      setStatus({ type: "ok", text: `등록했습니다: /products/${body.slug}` });
      formEl.reset();
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", text: (err as Error).message });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="제목 *"><Input name="title" required /></Field>
        <Field label="슬러그 (URL) *" hint="예: high1-math-variant-300"><Input name="slug" required pattern="[a-z0-9-]{3,80}" /></Field>
      </div>
      <Field label="한 줄 요약 *"><Input name="summary" required maxLength={120} /></Field>
      <Field label="상세 설명" hint="빈 줄로 문단을 나눕니다."><Textarea name="description" rows={6} /></Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="과목 *">
          <NativeSelect name="subject" required defaultValue="">
            <option value="" disabled>선택</option>
            {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </NativeSelect>
        </Field>
        <Field label="유형 *">
          <NativeSelect name="type" required defaultValue="">
            <option value="" disabled>선택</option>
            {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </NativeSelect>
        </Field>
        <Field label="가격(원) *"><Input name="price" type="number" min={0} step={100} required /></Field>
      </div>

      <Field label="학년 * (복수 선택)">
        <div className="flex flex-wrap gap-4">
          {GRADES.map((g) => (
            <label key={g.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="grades" value={g.id} className="size-4 accent-primary" /> {g.label}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="목차" hint="한 줄에 하나씩"><Textarea name="toc" rows={5} /></Field>
        <Field label="추천 대상" hint="한 줄에 하나씩"><Textarea name="targets" rows={5} /></Field>
        <Field label="포함 내용" hint="한 줄에 하나씩"><Textarea name="includes" rows={5} /></Field>
        <Field label="본문 샘플 텍스트" hint="샘플 이미지가 없을 때 미리보기에 표시"><Textarea name="sampleExcerpt" rows={5} /></Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="PDF 파일 *"><Input name="pdf" type="file" accept="application/pdf" required /></Field>
        <Field label="썸네일 (4:3)"><Input name="thumbnail" type="file" accept="image/png,image/jpeg,image/webp" /></Field>
        <Field label="샘플 이미지 (여러 장)"><Input name="samples" type="file" accept="image/png,image/jpeg,image/webp" multiple /></Field>
      </div>
      <Field label="쪽수"><Input name="pageCount" type="number" min={0} className="sm:w-40" /></Field>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="isPublished" defaultChecked className="size-4 accent-primary" /> 바로 공개</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" className="size-4 accent-primary" /> 추천 상품으로 노출</label>
      </div>

      {status && (
        <p
          role="status"
          className={`whitespace-pre-line rounded-lg p-3 text-sm ${status.type === "error" ? "bg-red-50 text-destructive" : status.type === "ok" ? "bg-success/10 text-success" : "bg-muted"}`}
        >
          {status.text}
        </p>
      )}
      <Button type="submit" size="lg" disabled={status?.type === "busy"}>상품 등록</Button>
    </form>
  );
}
