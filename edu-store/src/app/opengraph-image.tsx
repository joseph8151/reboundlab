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
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 84px", background: "#F7F5F0", fontFamily: "Pretendard" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, letterSpacing: 14, color: "#243C35", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 600 }}>MELISA EDU</div>
          <div style={{ marginTop: 10, fontSize: 20, letterSpacing: 10, color: "#5E635E" }}>멜리사 에듀</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", color: "#222522", fontSize: 84, lineHeight: 1.14, letterSpacing: -3 }}>
          <div>공부의 기준을</div>
          <div>다시 세우다.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, color: "#5E635E" }}>수능 · 고등 내신 · 중등 내신 전문 교재</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["#5B1F2C", "#1B2A45", "#2D4A3E", "#6B5442", "#44566F"].map((c) => <div key={c} style={{ width: 22, height: 64, background: c }} />)}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Pretendard", data: font, weight: 700, style: "normal" }] : undefined },
  );
}
