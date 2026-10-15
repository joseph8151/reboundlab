import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { AI_DAILY_LIMIT, AI_MODEL, ANALYZE_SYSTEM_PROMPT, getAnthropic, isAiConfigured, MAX_IMAGE_BYTES, MAX_PASSAGE_CHARS } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { todayKey } from "@/lib/study/dates";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const maxDuration = 300;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

type Body = { passage?: string; question?: string; image?: { mediaType: string; data: string } };

/** 하루 사용 횟수 확인 후 1 증가. 한도를 넘으면 false */
async function consumeQuota(userId: string) {
  const admin = createAdminClient();
  const day = todayKey();
  const { data } = await admin.from("ai_usage").select("count").eq("user_id", userId).eq("day", day).maybeSingle();
  const used = data?.count ?? 0;
  if (used >= AI_DAILY_LIMIT) return { ok: false, used };
  await admin.from("ai_usage").upsert({ user_id: userId, day, count: used + 1 });
  return { ok: true, used: used + 1 };
}

export async function POST(request: NextRequest) {
  if (!isAiConfigured()) {
    return NextResponse.json({ message: "AI 분석이 아직 설정되지 않았습니다." }, { status: 503 });
  }

  // 비용 관리를 위해 로그인 사용자만, 하루 횟수 제한. (Supabase 없이 로컬 개발할 때만 예외)
  let remaining: number | null = null;
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: "로그인하면 AI 분석을 쓸 수 있어요." }, { status: 401 });
    const quota = await consumeQuota(user.id);
    if (!quota.ok) return NextResponse.json({ message: `오늘 분석 횟수(${AI_DAILY_LIMIT}회)를 모두 사용했어요. 내일 다시 이용해 주세요.` }, { status: 429 });
    remaining = AI_DAILY_LIMIT - quota.used;
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "AI 분석을 쓰려면 Supabase(로그인)가 필요합니다." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const passage = (body.passage ?? "").trim();
  const question = (body.question ?? "").trim().slice(0, 2000);
  const image = body.image;

  if (!passage && !image) return NextResponse.json({ message: "지문을 붙여넣거나 사진을 올려 주세요." }, { status: 400 });
  if (passage.length > MAX_PASSAGE_CHARS) return NextResponse.json({ message: `지문은 ${MAX_PASSAGE_CHARS.toLocaleString()}자 이내로 넣어 주세요.` }, { status: 400 });
  if (image) {
    if (!IMAGE_TYPES.includes(image.mediaType as ImageType)) return NextResponse.json({ message: "JPG, PNG, WEBP 사진만 올릴 수 있어요." }, { status: 400 });
    if (Math.ceil((image.data.length * 3) / 4) > MAX_IMAGE_BYTES) return NextResponse.json({ message: "사진 용량이 너무 큽니다." }, { status: 400 });
  }

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: image.mediaType as ImageType, data: image.data } });
  content.push({
    type: "text",
    text: [
      passage ? `<passage>\n${passage}\n</passage>` : "지문은 위 사진에 있어.",
      question ? `<question>\n${question}\n</question>` : "문제와 선택지는 보내지 않았어.",
    ].join("\n\n"),
  });

  const stream = getAnthropic().beta.messages.stream({
    model: AI_MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium" },
    // 안전 분류기가 요청을 거절하면 서버가 기본 대체 모델로 다시 시도합니다.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    cache_control: { type: "ephemeral" },
    system: ANALYZE_SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n> 이 요청은 분석할 수 없었어요. 수능 영어 지문만 넣어 주세요."));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n> 지문이 길어 분석이 중간에 끝났어요. 지문을 나눠서 다시 넣어 주세요."));
        }
      } catch (error) {
        console.error("[ai] 분석 실패", error);
        const message =
          error instanceof Anthropic.RateLimitError
            ? "지금 요청이 많아요. 잠시 후 다시 시도해 주세요."
            : error instanceof Anthropic.BadRequestError
              ? "이 사진이나 지문은 분석할 수 없어요. 다른 사진으로 시도해 주세요."
              : "분석 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
        controller.enqueue(encoder.encode(`\n\n> ${message}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      ...(remaining !== null ? { "X-AI-Remaining": String(remaining) } : {}),
    },
  });
}
