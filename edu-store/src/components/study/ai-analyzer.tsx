"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { Camera, Copy, ImageOff, LoaderCircle, Sparkles, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MarkdownView = dynamic(() => import("./markdown-view"), { ssr: false, loading: () => null });

type Props = { enabled: boolean; dailyLimit: number; loginRequired: boolean; gptUrl: string; tutorName: string };

/** 휴대폰 사진은 용량이 커서, 긴 변 1600px JPEG로 줄여서 보냅니다. */
async function shrinkImage(file: File): Promise<{ mediaType: string; data: string; preview: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { mediaType: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl };
}

export function AiAnalyzer({ enabled, dailyLimit, loginRequired, gptUrl, tutorName }: Props) {
  const [passage, setPassage] = useState("");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<{ mediaType: string; data: string; preview: string } | null>(null);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImage(await shrinkImage(file));
      setError(null);
    } catch {
      setError("이 사진 형식은 열 수 없어요. JPG나 PNG로 다시 찍어 주세요.");
    }
  }

  async function analyze() {
    setError(null);
    setResult("");
    setStatus("loading");
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage, question, image: image ? { mediaType: image.mediaType, data: image.data } : undefined }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "분석을 시작하지 못했어요.");
      }
      setRemaining(res.headers.get("X-AI-Remaining"));
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((r) => r + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setStatus("done");
    }
  }

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-sm leading-relaxed text-muted-foreground">
        사이트 안에서 바로 분석하는 기능은 준비 중이에요. 지금은{" "}
        <a href={gptUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">{tutorName} (ChatGPT)</a>를 이용해 주세요.
      </div>
    );
  }

  const loading = status === "loading";
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border p-5 sm:p-6">
        <div className="space-y-2">
          <Label htmlFor="ai-passage">영어 지문</Label>
          <Textarea
            id="ai-passage"
            rows={7}
            value={passage}
            onChange={(e) => setPassage(e.target.value)}
            maxLength={6000}
            lang="en"
            placeholder="지문을 붙여넣거나, 아래에서 지문 사진을 올려 주세요."
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={fileInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
          <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
            <Camera /> 지문 사진 {image ? "바꾸기" : "올리기"}
          </Button>
          {image && (
            <span className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.preview} alt="올린 지문 사진" className="h-14 w-14 rounded-lg border border-border object-cover" />
              <button type="button" onClick={() => setImage(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ImageOff className="size-3.5" /> 사진 빼기
              </button>
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="ai-question">문제와 선택지 <span className="font-normal text-muted-foreground">(선택 · 넣으면 정답 근거까지 분석)</span></Label>
          <Textarea id="ai-question" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={2000} placeholder="예: 다음 글의 요지로 가장 적절한 것은? ① ... ② ..." />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {loading ? (
            <Button variant="outline" onClick={() => abort.current?.abort()}><Square /> 멈추기</Button>
          ) : (
            <Button size="lg" onClick={analyze} disabled={!passage.trim() && !image}><Sparkles /> 분석하기</Button>
          )}
          <p className="text-xs text-muted-foreground">
            {loginRequired ? <>로그인 필요 · 하루 {dailyLimit}회{remaining !== null && ` · 오늘 ${remaining}회 남음`}</> : "개발 모드: 사용량 제한 없음"}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-destructive">
          {error} {error.includes("로그인") && <Link href="/login?next=/study/ai-melisa" className="font-semibold underline">로그인하기</Link>}
        </p>
      )}

      {(result || loading) && (
        <section className="rounded-2xl border border-border p-5 sm:p-7" aria-live="polite" aria-busy={loading}>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "분석하고 있어요…" : "분석 결과"}
            </p>
            {!loading && result && (
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(result)}><Copy /> 복사</Button>
            )}
          </div>
          <div className="prose-doc mt-2 overflow-x-auto">
            <MarkdownView>{result}</MarkdownView>
          </div>
          {!loading && result && (
            <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              AI 분석은 틀릴 수 있어요. 정답은 공식 해설로 확인하고, 틀린 문제는 <Link href="/study/wrong-notes" className="underline">오답노트</Link>에 기록해 두세요.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
