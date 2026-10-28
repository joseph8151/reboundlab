import type { AnalysisPassage } from "./types";

/** 입력(지문·문제)만 채운 빈 분석 골격. 이후 AI 분석 생성이나 직접 입력으로 채웁니다. */
export function blankPassage(i: { slug: string; title: string; sentences: string[]; stem: string; choices: string[]; answerNo: number; questionType: string; difficulty: string; origin: string; year: string; rights: AnalysisPassage["source"]["rights"]; rightsNote: string }): AnalysisPassage {
  return {
    id: i.slug, slug: i.slug, title: i.title, status: "draft",
    source: { origin: i.origin, year: i.year, rights: i.rights, rightsNote: i.rightsNote, verifiedBy: "", verifiedAt: "" },
    meta: { questionType: i.questionType, difficulty: i.difficulty, topicTag: "" },
    passage: { sentences: i.sentences.map((en, k) => ({ n: k + 1, en })) },
    question: { stem: i.stem, choices: i.choices, answerNo: i.answerNo },
    overview: { topic: "", theme: "", mainIdea: "", titleEn: "", titleKo: "", purpose: "", structure: "", coreLogic: "", summaryEn: "", summaryKo: "", background: "" },
    sentences: [], logic: { steps: [], note: "" },
    evidence: { answerNo: i.answerNo, answerText: i.choices[i.answerNo - 1] ?? "", answerKo: "", explicit: [], inferential: [], keyExpressions: [], process: [], verdict: "" },
    paraphrase: [], wrong: [], vocab: [],
    summary: { sentenceEn: "", sentenceKo: "", keywords: [], blank: { text: "", answers: [], note: "" } },
    variants: [], skippedTypes: [], review: { checks: {}, notes: "" }, lockedPaths: [], updatedAt: new Date().toISOString(),
  };
}
