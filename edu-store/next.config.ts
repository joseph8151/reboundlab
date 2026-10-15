import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // 이전 주소(/products)를 새 교재 주소로 영구 이동합니다.
  async redirects() {
    return [
      { source: "/products", destination: "/books", permanent: true },
      { source: "/products/:slug", destination: "/books/:slug", permanent: true },
      // 결제·장바구니·주문 화면은 폐지되었습니다. 상담 신청으로 연결합니다.
      { source: "/checkout", destination: "/consult", permanent: false },
      { source: "/checkout/:slug*", destination: "/consult?product=:slug*", permanent: false },
      { source: "/cart", destination: "/consult", permanent: false },
      { source: "/mypage", destination: "/consult", permanent: false },
      { source: "/category/material", destination: "/category/planner", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
