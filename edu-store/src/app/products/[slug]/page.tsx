import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheckBig, Download, FileText, RotateCcw, ShieldCheck } from "lucide-react";
import { ProductCover } from "@/components/product-cover";
import { SamplePreview } from "@/components/sample-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gradeLabel, subjectLabel, typeLabel } from "@/lib/catalog";
import { getProductBySlug, getProducts } from "@/lib/products";
import { downloadPolicy, siteConfig } from "@/lib/site";
import { formatDate, formatPrice } from "@/lib/utils";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "자료를 찾을 수 없습니다" };
  const url = `/products/${product.slug}`;
  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: product.title,
      description: product.summary,
      url,
      images: product.thumbnailUrl ? [{ url: product.thumbnailUrl }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.summary,
    category: `${subjectLabel(product.subject)} ${typeLabel(product.type)}`,
    brand: { "@type": "Brand", name: siteConfig.name },
    image: product.thumbnailUrl ?? undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/products/${product.slug}`,
    },
  };

  return (
    <div className="pb-28 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container-page pt-6">
        <nav className="text-sm text-muted-foreground" aria-label="현재 위치">
          <Link href="/products" className="hover:text-foreground">전체 자료</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?subject=${product.subject}`} className="hover:text-foreground">
            {subjectLabel(product.subject)}
          </Link>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* 본문 */}
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <Badge>{subjectLabel(product.subject)}</Badge>
            <Badge variant="muted">{product.grades.map(gradeLabel).join("·")}</Badge>
            <Badge variant="outline">{typeLabel(product.type)}</Badge>
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-snug sm:text-[32px]">{product.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{product.summary}</p>

          <ProductCover product={product} className="mt-8 rounded-2xl border border-border lg:hidden" sizes="100vw" />

          <section className="mt-12" aria-labelledby="desc">
            <h2 id="desc" className="text-xl font-bold">자료 소개</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[1.85]">
              {product.description.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl bg-accent/60 p-6" aria-labelledby="targets">
              <h2 id="targets" className="font-bold">이런 학생에게 추천해요</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
                {product.targets.map((t) => (
                  <li key={t} className="flex gap-2">
                    <CircleCheckBig className="mt-1 size-4 shrink-0 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-border p-6" aria-labelledby="includes">
              <h2 id="includes" className="font-bold">포함 내용</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
                {product.includes.map((t) => (
                  <li key={t} className="flex gap-2">
                    <FileText className="mt-1 size-4 shrink-0 text-muted-foreground" /> {t}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-12" aria-labelledby="toc">
            <h2 id="toc" className="text-xl font-bold">목차</h2>
            <ol className="mt-4 divide-y divide-border rounded-2xl border border-border">
              {product.toc.map((item, i) => (
                <li key={item} className="flex gap-4 px-5 py-3.5 text-[15px]">
                  <span className="w-6 shrink-0 font-semibold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section id="preview" className="mt-12 scroll-mt-24" aria-labelledby="preview-title">
            <h2 id="preview-title" className="text-xl font-bold">샘플 미리보기</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              실제 자료의 일부입니다. 미리보기 화면에는 워터마크가 표시되며, 구매한 PDF에는 표시되지 않습니다.
            </p>
            <div className="mt-5">
              <SamplePreview product={product} />
            </div>
          </section>

          <section className="mt-12 rounded-2xl bg-muted p-6 text-sm leading-relaxed text-muted-foreground" aria-labelledby="notice">
            <h2 id="notice" className="font-bold text-foreground">구매 전 확인해 주세요</h2>
            <ul className="mt-3 space-y-1.5">
              <li>· 디지털 콘텐츠(PDF) 상품으로 실물 배송이 없습니다.</li>
              <li>· 결제일로부터 {downloadPolicy.validDays}일 동안 최대 {downloadPolicy.maxCount}회 내려받을 수 있습니다.</li>
              <li>· 결제 후 7일 이내, 다운로드 이력이 없으면 전액 환불됩니다. 다운로드 후에는 단순 변심 환불이 제한됩니다.</li>
              <li>· 구매자 본인의 학습 목적 외 복제·공유·재판매를 금지합니다.</li>
            </ul>
            <Link href="/refund" className="mt-3 inline-block font-semibold text-primary hover:underline">
              환불·교환 정책 자세히 보기
            </Link>
          </section>
        </div>

        {/* 구매 박스 (데스크톱) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-border">
            <ProductCover product={product} sizes="380px" />
            <div className="p-6">
              <p className="text-2xl font-bold">{formatPrice(product.price)}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">형식</dt><dd>PDF · {product.pageCount}쪽</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">다운로드</dt><dd>{downloadPolicy.validDays}일 · 최대 {downloadPolicy.maxCount}회</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">최근 업데이트</dt><dd>{formatDate(product.updatedAt)}</dd></div>
              </dl>
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href={`/checkout/${product.slug}`}>구매하기</Link>
              </Button>
              <ul className="mt-5 space-y-2 text-[13px] text-muted-foreground">
                <li className="flex items-center gap-2"><Download className="size-4" /> 결제 즉시 내 자료함에서 다운로드</li>
                <li className="flex items-center gap-2"><RotateCcw className="size-4" /> 다운로드 전 7일 이내 전액 환불</li>
                <li className="flex items-center gap-2"><ShieldCheck className="size-4" /> 토스페이먼츠 안전 결제</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* 구매 바 (모바일) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="container-page flex items-center justify-between gap-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div>
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
            <p className="text-xs text-muted-foreground">PDF {product.pageCount}쪽 · 즉시 다운로드</p>
          </div>
          <Button asChild size="lg" className="flex-1 sm:flex-none">
            <Link href={`/checkout/${product.slug}`}>구매하기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
