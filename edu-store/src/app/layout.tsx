import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileConsultBar } from "@/components/layout/mobile-consult-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const title = `${siteConfig.nameEn} | 수능·내신 전문 교재`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: title, template: `%s | ${siteConfig.nameEn}` },
  description: siteConfig.description,
  applicationName: siteConfig.nameEn,
  keywords: [siteConfig.name, siteConfig.nameEn, "수능 문제집", "수능 기출문제집", "고등학교 내신 문제집", "중학교 내신 문제집", "PDF 교재"],
  openGraph: { type: "website", locale: "ko_KR", siteName: `${siteConfig.nameEn} (${siteConfig.name})`, title, description: siteConfig.description, url: "/" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#F7F5F0", width: "device-width", initialScale: 1 };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: siteConfig.nameEn, alternateName: siteConfig.name, url: siteConfig.url, ...(siteConfig.supportEmail ? { email: siteConfig.supportEmail } : {}) },
    {
      "@type": "WebSite",
      name: siteConfig.nameEn,
      url: siteConfig.url,
      potentialAction: { "@type": "SearchAction", target: `${siteConfig.url}/books?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
        <MobileConsultBar />
      </body>
    </html>
  );
}
