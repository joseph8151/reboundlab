import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ConsultForm } from "@/components/consult-form";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const description = "수능 관련·중등 관련 전자책(PDF), 어떤 자료가 내게 맞는지 궁금할 때 상담을 남겨 주세요. 영업일 기준 1일 이내에 답변드립니다.";

export const metadata: Metadata = {
  title: "상담 신청",
  description,
  alternates: { canonical: "/consult" },
  openGraph: { title: "상담 신청", description, url: "/consult" },
};

const TRACKS = {
  suneung: {
    label: "수능 상담",
    heading: "수능 관련 상담",
    topics: [
      ["자료 추천", "현재 등급과 취약 영역(국어·수학·영어·탐구)을 알려 주시면 지금 필요한 자료를 골라 드려요."],
      ["학습 계획", "수능까지 남은 기간에 맞춰 기출·변형문제·스터디가이드 활용 순서를 안내해 드려요."],
    ],
    products: "/products?grade=high3",
    productsLabel: "수능 전자책 보기",
  },
  middle: {
    label: "중등 상담",
    heading: "중등 관련 상담",
    topics: [
      ["내신 대비", "학년·학교 시험 범위를 알려 주시면 맞는 스터디가이드와 문제 자료를 안내해 드려요."],
      ["학습 습관", "자기주도학습 플래너, 오답노트 등 혼자 공부하는 습관을 만들 자료를 추천해 드려요. 학부모님 상담도 환영합니다."],
    ],
    products: "/products?grade=middle",
    productsLabel: "중등 전자책 보기",
  },
} as const;

type Track = keyof typeof TRACKS;

export default async function ConsultPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const { track: raw } = await searchParams;
  const track: Track = raw === "middle" ? "middle" : "suneung";
  const t = TRACKS[track];

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <h1 className="text-2xl font-bold sm:text-3xl">상담 신청</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-8 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold" role="tablist" aria-label="상담 분야">
        {(Object.keys(TRACKS) as Track[]).map((k) => (
          <Link
            key={k}
            href={`/consult?track=${k}`}
            role="tab"
            aria-selected={track === k}
            scroll={false}
            className={cn("rounded-lg py-2.5 text-center", track === k ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            {TRACKS[k].label}
          </Link>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-bold">{t.heading}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {t.topics.map(([title, body]) => (
          <li key={title} className="rounded-2xl bg-muted p-5">
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>

      <section className="mt-8" aria-label="상담 폼">
        <ConsultForm key={track} track={track} trackLabel={t.label} endpoint={siteConfig.consultEndpoint} supportEmail={siteConfig.supportEmail} />
      </section>

      <div className="mt-10 rounded-2xl border border-border p-5 text-sm leading-relaxed">
        <p className="font-semibold">급하게 확인할 것이 있다면</p>
        <p className="mt-2 flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4" /> {siteConfig.supportEmail} (주문번호를 함께 알려 주세요)
        </p>
        <p className="mt-3 text-muted-foreground">
          <Link href="/faq" className="text-primary underline">자주 묻는 질문</Link>과 <Link href="/refund" className="text-primary underline">환불·교환 정책</Link>에서 답을 먼저 찾아보실 수 있어요.
          중등 학생이 직접 남기는 경우 보호자와 함께 작성해 주세요. 상담 내용에 카드번호·비밀번호 같은 민감한 정보는 적지 마세요.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={t.products}>{t.productsLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
