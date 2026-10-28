import "server-only";
import { getAnthropic, AI_MODEL } from "@/lib/ai";
import { QUESTION_TYPES, PARAPHRASE_TYPES, WRONG_TYPES, LOGIC_TYPES, type AnalysisPassage } from "./types";

const SYSTEM = `너는 수능 영어 분석 교재를 만드는 15년차 영어 교사 겸 편집자다. 주어진 지문과 문제를 받아 아래 JSON 구조로 분석 전체를 만든다. 출력은 JSON 객체 하나뿐이며 설명이나 코드펜스를 붙이지 않는다.

원칙
- 모든 해설은 한국어, 영어 원문은 그대로 인용한다. 과장·홍보 문구 금지.
- 지문에 없는 내용을 단정하지 않는다. 억지 동의어를 만들지 않고, 의미가 다르면 그 차이를 적는다.
- 정답은 문제에 주어진 answerNo 하나뿐이며 모든 분석이 이와 모순되지 않아야 한다.
- 변형문제는 6~10문항. 논리가 자연스러울 때만 문장 삽입·글의 순서를 만들고, 만들지 않은 유형은 skippedTypes에 이유를 적는다.
- 어법·어휘 변형문제의 밑줄은 ⟦① that⟧ 형식으로 표기한다.
- 문제 유형 목록: ${QUESTION_TYPES.join(", ")}
- 논리 유형: ${LOGIC_TYPES.join(", ")}
- 패러프레이징 유형: ${PARAPHRASE_TYPES.map((t) => (typeof t === "string" ? t : "")).filter(Boolean).join(", ")}
- 오답 유형: ${WRONG_TYPES.map((t) => (typeof t === "string" ? t : "")).filter(Boolean).join(", ")}

JSON 키: overview{topic,theme,mainIdea,titleEn,titleKo,purpose,structure,coreLogic,summaryEn,summaryKo,background}, sentences[{n,en,ko,chunks[{en,ko}],syntax[{expr,note}],grammar[{point,note}],words[{w,note}],role,roleTag,answerLink}], logic{steps[{label,type,sentenceNos,text,connective,emphasis}],contrast?,note}, evidence{answerNo,answerText,answerKo,explicit[{sentenceNo,quote,ko}],inferential[{sentenceNos,ko,reasoning}],keyExpressions,process,verdict}, paraphrase[{sentenceNo,choiceNo,passageExpr,choiceExpr,type,ko,why,impact}], wrong[{choiceNo,text,ko,verdict,types,explain}], vocab[8~12개 {word,meaning,pos,synonyms,antonyms,idioms,example,point,key}], summary{sentenceEn,sentenceKo,keywords,blank{text,answers,note}}, variants[{id,type,no,stem,passage?,choices?,answer,acceptedAnswers?,explain,evidence[{sentenceNos,quote}],paraphrase[{from,to,note}],wrong[{choiceNo,verdict,types,explain}],difficulty,intent}], skippedTypes[{type,reason}]`;

export async function generateAnalysis(p: AnalysisPassage): Promise<Partial<AnalysisPassage>> {
  const input = { passage: p.passage.sentences, question: p.question, meta: p.meta };
  const stream = getAnthropic().messages.stream({ model: AI_MODEL, max_tokens: 32000, system: SYSTEM, messages: [{ role: "user", content: JSON.stringify(input) }] });
  const msg = await stream.finalMessage();
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("AI 응답을 해석하지 못했습니다.");
  return JSON.parse(text.slice(start, end + 1)) as Partial<AnalysisPassage>;
}
