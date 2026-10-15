"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 마크다운 렌더러. 서버 번들 크기를 줄이기 위해 next/dynamic(ssr: false)로만 불러옵니다. */
export default function MarkdownView({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
}
