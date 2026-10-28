"use client";

import { cn } from "@/lib/utils";

type Json = unknown;
const LABELS: Record<string, string> = {
  topic: "소재", theme: "주제", mainIdea: "핵심 주장", titleEn: "영어 제목", titleKo: "우리말 제목", purpose: "글의 목적", structure: "지문 유형·논리 구조", coreLogic: "핵심 논리", summaryEn: "영어 한 문장 요약", summaryKo: "한국어 한 문장 요약", background: "배경지식",
  en: "영어", ko: "우리말", chunks: "직독직해", syntax: "구문 분석", grammar: "문법", words: "단어·숙어", role: "논리적 역할", roleTag: "역할 태그", answerLink: "정답과의 관련성", expr: "표현", note: "설명", point: "포인트", w: "단어",
  steps: "단계", label: "라벨", type: "유형", sentenceNos: "문장 번호", text: "내용", connective: "연결어", emphasis: "강조(핵심)", contrast: "대조 박스", leftLabel: "왼쪽 제목", left: "왼쪽 항목", rightLabel: "오른쪽 제목", right: "오른쪽 항목",
  answerNo: "정답 번호", answerText: "정답 선택지", answerKo: "정답 해석", explicit: "명시적 근거", inferential: "추론적 근거", keyExpressions: "핵심 표현", process: "도출 과정", verdict: "최종 판단", sentenceNo: "문장 번호", quote: "인용", reasoning: "추론 과정",
  choiceNo: "선택지 번호", passageExpr: "지문 표현", choiceExpr: "선택지 표현", why: "연결되는 이유", impact: "정답에 미치는 영향", explain: "해설", types: "오답 유형", word: "단어", meaning: "뜻", pos: "품사", synonyms: "유의어", antonyms: "반의어", idioms: "숙어", example: "예문", key: "정답 연결 어휘",
  sentenceEn: "영어 요약", sentenceKo: "한국어 요약", keywords: "키워드", blank: "빈칸 요약", answers: "인정 답안", stem: "발문", choices: "선택지", answer: "정답", acceptedAnswers: "인정 답안", evidence: "근거", from: "원문", to: "변형", difficulty: "난이도", intent: "출제 의도", passage: "문제 지문", id: "ID", no: "번호", n: "번호", verdict2: "판정", reason: "이유",
};
const label = (k: string) => LABELS[k] ?? k;

export function blankLike(v: Json): Json {
  if (typeof v === "string") return "";
  if (typeof v === "number") return 0;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)]));
  return "";
}

type Props = { value: Json; path: string; onChange: (path: string, v: Json) => void; locked: Set<string>; onUnlock: (path: string) => void };

/** 구조가 무엇이든 그대로 편집할 수 있는 재귀 편집기(문자열·숫자·체크·목록·묶음). */
export function TreeEditor({ value, path, onChange, locked, onUnlock }: Props) {
  const key = path.split(".").pop() ?? "";
  const lk = locked.has(path);
  const lockMark = lk && (
    <button type="button" onClick={() => onUnlock(path)} title="직접 수정한 항목입니다. 누르면 AI 재생성이 덮어쓸 수 있도록 잠금을 풉니다." className="ml-1.5 border border-mustard px-1 text-[10px] font-semibold text-secondary-foreground">🔒 수정됨</button>
  );

  if (typeof value === "string") {
    const long = value.length > 60 || value.includes("\n");
    return (
      <label className="block">
        <span className="text-[11.5px] font-semibold text-muted-foreground">{label(key)}{lockMark}</span>
        {long ? <textarea value={value} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 70)))} onChange={(e) => onChange(path, e.target.value)} className="mt-0.5 block w-full border border-input bg-card px-2.5 py-2 text-[13.5px] leading-relaxed focus-visible:border-dusty-rose focus-visible:outline-none" />
          : <input value={value} onChange={(e) => onChange(path, e.target.value)} className="mt-0.5 block h-9 w-full border border-input bg-card px-2.5 text-[13.5px] focus-visible:border-dusty-rose focus-visible:outline-none" />}
      </label>
    );
  }
  if (typeof value === "number")
    return <label className="block"><span className="text-[11.5px] font-semibold text-muted-foreground">{label(key)}{lockMark}</span><input type="number" value={value} onChange={(e) => onChange(path, Number(e.target.value))} className="mt-0.5 block h-9 w-24 border border-input bg-card px-2.5 text-[13.5px]" /></label>;
  if (typeof value === "boolean")
    return <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={value} onChange={(e) => onChange(path, e.target.checked)} /> {label(key)}{lockMark}</label>;

  if (Array.isArray(value)) {
    const primitive = value.every((x) => typeof x === "string" || typeof x === "number");
    const sample = value[value.length - 1];
    return (
      <fieldset className="border border-border p-3">
        <legend className="px-1 text-[12px] font-bold text-primary">{label(key)} ({value.length}){lockMark}</legend>
        <div className="space-y-2.5">
          {value.map((x, i) => (
            <div key={i} className={cn("relative", !primitive && "border-l-2 border-blush pl-3")}>
              <TreeEditor value={x} path={`${path}.${i}`} onChange={onChange} locked={locked} onUnlock={onUnlock} />
              <button type="button" onClick={() => onChange(path, value.filter((_, j) => j !== i))} className="mt-0.5 text-[11px] text-destructive underline">이 항목 삭제</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => onChange(path, [...value, sample === undefined ? "" : blankLike(sample)])} className="mt-2 border border-primary px-2.5 py-1 text-[12px] font-semibold text-primary hover:bg-blush/50">+ 항목 추가</button>
      </fieldset>
    );
  }
  if (value && typeof value === "object") {
    return (
      <div className="space-y-2.5">
        {key && /^\d+$/.test(key) === false && path.includes(".") && <p className="text-[12px] font-bold text-primary">{label(key)}</p>}
        {Object.entries(value).map(([k, v]) => <TreeEditor key={k} value={v} path={path ? `${path}.${k}` : k} onChange={onChange} locked={locked} onUnlock={onUnlock} />)}
      </div>
    );
  }
  return null;
}
