/**
 * 교재별 샘플 페이지(예시 구성). 문항·본문은 모두 멜리사 에듀가 새로 쓴 예시이며 기출 문항을 옮기지 않았습니다.
 * 슬러그를 키로 하는 JSON 파일을 합쳐 사용합니다. 샘플이 없는 교재는 샘플 안내를 표시하지 않습니다.
 */
import csatKorean from "./csat-korean.json";
import csatMath from "./csat-math.json";
import csatEnglish from "./csat-english.json";
import highMock from "./high-mock.json";
import middle from "./middle.json";
import plannerSelf from "./planner-self.json";
import method from "./method.json";
import plannerParent from "./planner-parent.json";

export type SampleBlock =
  | { t: "problem"; no: number; label?: string; passage?: string; question: string; choices?: string[]; answer: string; explain: string; wrong?: string[] }
  | { t: "sheet"; title: string; columns?: string[]; rows: string[][]; note?: string }
  | { t: "steps"; title: string; items: string[] }
  | { t: "fill"; title: string; lines: string[] }
  | { t: "note"; text: string }
  /** 직독직해형 본문: 문장마다 영어(또는 국어 본문)와 번역을 짝지어 보여 줍니다. en 안의 {{단어|태그}} 는 굵게 표시되고 [태그]가 붙습니다. */
  | { t: "read"; no: number; question: string; sentences: { en: string; ko: string; lead?: string }[]; note?: string }
  /** 지문 분석: 본문·글의 구성·제목·주제·요지·요약과 분석 요약을 ■ 항목으로 보여 줍니다. */
  | { t: "analysis"; sections: { h: string; en?: string; ko?: string; lines?: string[] }[]; summary?: { structure?: string; theme?: string } };

export type SamplePage = { heading: string; blocks: SampleBlock[] };
export type Sample = { summary: string; pages: SamplePage[] };

const ALL = { ...csatKorean, ...csatMath, ...csatEnglish, ...highMock, ...middle, ...plannerSelf, ...method, ...plannerParent } as unknown as Record<string, Sample>;

export const getSample = (slug: string): Sample | null => ALL[slug] ?? null;
export const sampleSlugs = () => Object.keys(ALL);
