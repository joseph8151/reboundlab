import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.nameEn} | 수능·내신 전문 교재`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadKoreanFont() {
  try {
    const res = await fetch("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf");
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await loadKoreanFont();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 84px", background: "#F7ECE8", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, letterSpacing: 14, color: "#6E2132", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 }}>MELISSA EDU</div>
          <div style={{ marginTop: 10, fontSize: 20, letterSpacing: 10, color: "#6B6B6B" }}>멜리사 에듀</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", color: "#4A1D28", fontSize: 84, lineHeight: 1.14, letterSpacing: -3 }}>
          <div>공부의 기준을</div>
          <div>다시 세우다.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, color: "#6B6B6B" }}>수능 · 학습 전략 · 자기주도학습 전문 교재</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["#6E2132", "#4A1D28", "#D88FA0", "#C97B8D", "#F2C94C"].map((c) => <div key={c} style={{ width: 22, height: 64, background: c }} />)}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Pretendard", data: font, weight: 700, style: "normal" }] : undefined },
  );
}
