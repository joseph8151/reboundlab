import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/faq";
import { siteConfig } from "@/lib/site";

const description = "결제, 다운로드, 환불, 자료 이용에 대해 자주 묻는 질문을 모았습니다.";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description,
  alternates: { canonical: "/faq" },
  openGraph: { title: "자주 묻는 질문", description, url: "/faq" },
};

const CATEGORIES = ["구매", "다운로드", "환불", "자료"] as const;

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <h1 className="text-2xl font-bold sm:text-3xl">자주 묻는 질문</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">{description}</p>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="mt-10">
          <h2 className="text-sm font-semibold text-primary">{cat}</h2>
          <Accordion type="multiple" className="mt-2 border-t border-border">
            {FAQ_ITEMS.filter((f) => f.category === cat).map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ))}

      <div className="mt-14 rounded-2xl bg-muted p-6 text-[15px]">
        <p className="font-bold">원하는 답을 찾지 못하셨나요?</p>
        <p className="mt-1 text-muted-foreground">
          {siteConfig.supportContact}로 문의해 주시면 영업일 기준 1일 이내에 답변드립니다. 환불 문의는{" "}
          <Link href="/refund" className="text-primary underline">환불·교환 정책</Link>을 먼저 확인해 주세요.
        </p>
      </div>
    </div>
  );
}
