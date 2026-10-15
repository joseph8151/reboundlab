"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ANSWER_MODES, AREAS, CURRICULA, DELIVERY_TYPES, DIFFICULTIES, KINDS, LEVELS, STATUSES, TRACKS, WEAK_TAGS } from "@/lib/catalog";
import { uploadFile } from "./upload";

export type ProductInit = {
  id?: string;
  title: string; slug: string; sku: string; series: string; summary: string; description: string;
  track: string; area: string; course: string; grades: string[]; kind: string; difficulty: string; curriculum: string;
  examYear: string; pageCount: string; questionCount: string; price: string; salePrice: string;
  toc: string; goals: string; targets: string; includes: string; keywords: string; edition: string; revisionNotes: string;
  releaseDate: string; status: string; featuredRank: string; seoTitle: string; seoDescription: string; answerMode: string;
  deliveryType: string; weakTags: string[]; previewPdfUrl: string; coverUrl: string; previewImages: string[];
};

export const EMPTY_PRODUCT: ProductInit = {
  title: "", slug: "", sku: "", series: "", summary: "", description: "", track: "csat", area: "korean", course: "", grades: [], kind: "concept",
  difficulty: "", curriculum: "", examYear: "", pageCount: "", questionCount: "", price: "", salePrice: "", toc: "", goals: "", targets: "", includes: "",
  keywords: "", edition: "", revisionNotes: "", releaseDate: "", status: "on_sale", featuredRank: "", seoTitle: "", seoDescription: "", answerMode: "none",
  deliveryType: "custom", weakTags: [], previewPdfUrl: "", coverUrl: "", previewImages: [],
};

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <fieldset className="border-t border-border pt-6">
    <legend className="pb-4 text-[13px] font-semibold tracking-[0.1em] text-muted-foreground">{title}</legend>
    <div className="grid gap-5 sm:grid-cols-2">{children}</div>
  </fieldset>
);

export function ProductForm({ init }: { init: ProductInit }) {
  const router = useRouter();
  const editing = Boolean(init.id);
  const [status, setStatus] = useState<{ type: "error" | "ok" | "busy"; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const file = (n: string) => {
      const v = f.get(n) as File | null;
      return v && v.size > 0 ? v : null;
    };
    try {
      const body: Record<string, unknown> = {};
      for (const k of ["title", "slug", "sku", "series", "summary", "description", "track", "area", "course", "kind", "difficulty", "curriculum", "examYear", "pageCount", "questionCount", "price", "salePrice", "toc", "goals", "targets", "includes", "keywords", "edition", "revisionNotes", "releaseDate", "status", "featuredRank", "seoTitle", "seoDescription", "answerMode", "deliveryType"]) body[k] = f.get(k);
      body.grades = f.getAll("grades");
      body.weakTags = f.getAll("weakTags");

      const preview = file("previewPdf");
      if (preview) { setStatus({ type: "busy", text: "미리보기 PDF 업로드 중…" }); body.previewPdfUrl = (await uploadFile(preview, "preview")).publicUrl; }
      const cover = file("cover");
      if (cover) { setStatus({ type: "busy", text: "표지 업로드 중…" }); body.coverUrl = (await uploadFile(cover, "asset")).publicUrl; }
      const samples = (f.getAll("previewImages") as File[]).filter((s) => s.size > 0);
      if (samples.length) {
        const urls: string[] = [];
        for (const [i, s] of samples.entries()) { setStatus({ type: "busy", text: `미리보기 이미지 업로드 중… (${i + 1}/${samples.length})` }); const u = (await uploadFile(s, "asset")).publicUrl; if (u) urls.push(u); }
        body.previewImages = urls;
      }

      setStatus({ type: "busy", text: "저장 중…" });
      const res = await fetch("/api/admin/products", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { ...body, id: init.id } : body) });
      const out = await res.json();
      if (!res.ok) throw new Error(out.message);
      setStatus({ type: "ok", text: "저장했습니다." });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", text: (err as Error).message });
    }
  }

  const sel = (name: string, value: string, options: readonly { id: string; label: string }[], blank?: string) => (
    <NativeSelect name={name} defaultValue={value}>
      {blank !== undefined && <option value="">{blank}</option>}
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </NativeSelect>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Group title="기본 정보">
        <Field label="상품명 *" className="sm:col-span-2"><Input name="title" required defaultValue={init.title} /></Field>
        <Field label="슬러그 (URL) *" hint="영문 소문자·숫자·하이픈. 저장 후에는 바꾸지 않는 것을 권장합니다."><Input name="slug" required pattern="[a-z0-9-]{3,90}" defaultValue={init.slug} /></Field>
        <Field label="상품 코드" hint="비워 두면 자동으로 부여됩니다."><Input name="sku" defaultValue={init.sku} /></Field>
        <Field label="시리즈명"><Input name="series" defaultValue={init.series} /></Field>
        <Field label="한 줄 소개" className="sm:col-span-2"><Input name="summary" maxLength={160} defaultValue={init.summary} /></Field>
        <Field label="상세 설명" hint="빈 줄로 문단을 나눕니다. 확인되지 않은 수치나 성과는 적지 마세요." className="sm:col-span-2"><Textarea name="description" rows={7} defaultValue={init.description} /></Field>
      </Group>

      <Group title="분류">
        <Field label="학습 과정 *">{sel("track", init.track, TRACKS)}</Field>
        <Field label="과목 *">{sel("area", init.area, AREAS)}</Field>
        <Field label="과목명 (세부)" hint="예: 독서, 문학, 미적분Ⅰ, 한국지리"><Input name="course" defaultValue={init.course} /></Field>
        <Field label="유형 *">{sel("kind", init.kind, KINDS)}</Field>
        <Field label="난이도">{sel("difficulty", init.difficulty, DIFFICULTIES, "선택 안 함")}</Field>
        <Field label="교육과정" hint="수능 교재는 출제 범위 확정 후 입력하세요.">{sel("curriculum", init.curriculum, CURRICULA, "미정")}</Field>
        <Field label="적용 학년도"><Input name="examYear" type="number" min={2020} max={2040} defaultValue={init.examYear} /></Field>
        <Field label="대상 학년 * (복수 선택)" className="sm:col-span-2">
          <div className="flex flex-wrap gap-4">
            {LEVELS.map((g) => (
              <label key={g.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="grades" value={g.id} defaultChecked={init.grades.includes(g.id)} className="size-4 accent-primary" /> {g.label}</label>
            ))}
          </div>
        </Field>
      </Group>

      <Group title="구성">
        <Field label="페이지 수"><Input name="pageCount" type="number" min={0} defaultValue={init.pageCount} /></Field>
        <Field label="문제 수"><Input name="questionCount" type="number" min={0} defaultValue={init.questionCount} /></Field>
        <Field label="학습 목표" hint="한 줄에 하나씩"><Textarea name="goals" rows={4} defaultValue={init.goals} /></Field>
        <Field label="이런 학습자에게" hint="한 줄에 하나씩"><Textarea name="targets" rows={4} defaultValue={init.targets} /></Field>
        <Field label="상세 목차" hint="한 줄에 하나씩" className="sm:col-span-2"><Textarea name="toc" rows={6} defaultValue={init.toc} /></Field>
        <Field label="포함 내용" hint="한 줄에 하나씩"><Textarea name="includes" rows={3} defaultValue={init.includes} /></Field>
        <Field label="취약 유형 태그 (추천 연결)" hint="진단·고민별 추천에 쓰이는 연결 태그입니다." className="sm:col-span-2">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {WEAK_TAGS.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="weakTags" value={t.id} defaultChecked={init.weakTags.includes(t.id)} className="size-4 accent-primary" /> {t.label}</label>
            ))}
          </div>
        </Field>
        <Field label="검색 키워드" hint="쉼표 또는 줄바꿈으로 구분"><Textarea name="keywords" rows={3} defaultValue={init.keywords} /></Field>
        <Field label="정답·해설 제공 방식">{sel("answerMode", init.answerMode, ANSWER_MODES)}</Field>
        <Field label="개정판 표기"><Input name="edition" placeholder="예: 2027학년도 개정판" defaultValue={init.edition} /></Field>
        <Field label="개정·정오표 이력" hint="한 줄에 하나씩 (날짜와 내용). 확인된 내용만 적으세요." className="sm:col-span-2"><Textarea name="revisionNotes" rows={3} defaultValue={init.revisionNotes} /></Field>
      </Group>

      <Group title="가격과 판매">
        <Field label="정상 판매가(원)"><Input name="price" type="number" min={0} step={100} defaultValue={init.price} /></Field>
        <Field label="할인 판매가(원)" hint="정상 판매가보다 낮을 때만 입력. 비우면 할인 표시가 없습니다."><Input name="salePrice" type="number" min={0} step={100} defaultValue={init.salePrice} /></Field>
        <Field label="판매 상태 *" hint="‘판매 중’은 정상 판매가가 있어야 저장됩니다. 가격을 바꾸면 모든 화면에 같은 값이 표시됩니다.">{sel("status", init.status, STATUSES)}</Field>
        <Field label="납품 형태 *" hint="PDF가 아직 완성되지 않았으면 ‘주문 제작 상담 가능’으로 두세요. 완성된 PDF 교재만 ‘PDF 완성본’으로 바꿉니다.">{sel("deliveryType", init.deliveryType, DELIVERY_TYPES)}</Field>
        <Field label="출시일 (선택)" hint="확정된 일정이 없으면 비워 두세요."><Input name="releaseDate" type="date" defaultValue={init.releaseDate} /></Field>
        <Field label="대표 노출 순서" hint="1~6처럼 숫자가 작을수록 먼저 노출. 비우면 일반 노출."><Input name="featuredRank" type="number" min={1} defaultValue={init.featuredRank} /></Field>
      </Group>

      <Group title="표지·미리보기 (공개 파일)">
        <Field label="미리보기 PDF (공개)" hint={init.previewPdfUrl ? "등록됨 · 워터마크가 들어간 일부 쪽만 올리세요." : "워터마크가 들어간 일부 쪽만 올리세요. 누구나 내려받을 수 있습니다."}><Input name="previewPdf" type="file" accept="application/pdf" /></Field>
        <Field label="표지 이미지 (3:4)" hint={init.coverUrl ? "등록됨 · 없으면 자동 표지가 쓰입니다." : "없으면 자동 생성 표지가 쓰입니다."}><Input name="cover" type="file" accept="image/png,image/jpeg,image/webp" /></Field>
        <Field label="미리보기 이미지 (여러 장)" hint={init.previewImages.length ? `${init.previewImages.length}장 등록됨 · 새로 올리면 교체됩니다. 이미지 자체에 워터마크를 넣어 올리세요.` : "이미지 자체에 워터마크를 넣어 올리세요."} className="sm:col-span-2"><Input name="previewImages" type="file" multiple accept="image/png,image/jpeg,image/webp" /></Field>
      </Group>

      <Group title="검색 엔진 (SEO)">
        <Field label="SEO 제목" hint="비우면 상품명을 씁니다."><Input name="seoTitle" maxLength={70} defaultValue={init.seoTitle} /></Field>
        <Field label="SEO 설명" hint="비우면 한 줄 소개를 씁니다. 120자 안팎 권장."><Textarea name="seoDescription" rows={2} maxLength={200} defaultValue={init.seoDescription} /></Field>
      </Group>

      {status && <p role="status" className={`whitespace-pre-line text-[14px] ${status.type === "error" ? "text-destructive" : ""}`}>{status.text}</p>}
      <div className="flex items-center gap-5">
        <Button type="submit" size="lg" disabled={status?.type === "busy"}>{editing ? "변경 저장" : "교재 등록"}</Button>
        <Link href="/admin" className="text-[14px] text-muted-foreground underline underline-offset-4">목록으로</Link>
      </div>
    </form>
  );
}
