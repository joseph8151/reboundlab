import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpeedReader } from "@/components/study/speed-reader";
import { StudyHeader } from "@/components/study/study-header";
import { PASSAGES } from "@/lib/study/passages";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return PASSAGES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = PASSAGES.find((x) => x.id === id);
  if (!p) return {};
  const description = `수능 영어 속독 훈련 지문 '${p.title}'. 읽기 속도를 재고 요지·세부 문제로 이해도를 확인하세요.`;
  return { title: `속독 훈련: ${p.title}`, description, alternates: { canonical: `/study/speed-reading/${p.id}` }, openGraph: { title: `속독 훈련: ${p.title}`, description } };
}

export default async function SpeedReadingPage({ params }: { params: Params }) {
  const { id } = await params;
  const passage = PASSAGES.find((p) => p.id === id);
  if (!passage) notFound();
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <StudyHeader eyebrow="지문 속독" title={passage.title} description="다 읽으면 바로 문제가 나옵니다. 읽는 동안에는 지문으로 되돌아가지 말고 앞으로만 읽어 보세요." />
      <SpeedReader passage={passage} />
    </div>
  );
}
