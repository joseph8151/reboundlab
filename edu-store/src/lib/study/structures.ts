/**
 * 수능 영어 지문 구조 10가지. 공개된 강의·교재 내용을 옮기지 않고,
 * 수능 독해 지문에서 반복되는 전개 방식을 자체 기준으로 정리했습니다.
 */
export type StructureId =
  | "claim-support"
  | "belief-rebuttal"
  | "problem-solution"
  | "cause-effect"
  | "compare-contrast"
  | "general-example"
  | "experiment"
  | "question-answer"
  | "sequence"
  | "definition";

export type Structure = {
  id: StructureId;
  no: number;
  name: string;
  flow: string[];
  summary: string;
  signals: string[];
  mainIdea: string;
  tip: string;
  types: string;
};

export const STRUCTURES: Structure[] = [
  {
    id: "claim-support",
    no: 1,
    name: "주장 - 근거",
    flow: ["주장", "근거 1·2", "주장 재확인"],
    summary: "필자의 주장이 먼저 나오고 이유와 사례가 뒤따릅니다. 수능에서 가장 흔한 구조입니다.",
    signals: ["should / must / need to", "It is important to", "This is because", "In short"],
    mainIdea: "첫 1~2문장, 그리고 마지막 문장",
    tip: "첫 문장에서 주장을 잡았다면 근거는 훑어 읽고, 마지막 문장으로 확인만 합니다.",
    types: "주장(20번)·요지(22번)·제목·요약문",
  },
  {
    id: "belief-rebuttal",
    no: 2,
    name: "통념 - 반박",
    flow: ["일반적 믿음", "However", "실제(필자 주장)"],
    summary: "많은 사람이 믿는 생각을 먼저 소개한 뒤 뒤집습니다. 앞부분을 주제로 착각하면 정반대 답을 고릅니다.",
    signals: ["Many people believe / It is often said", "However / But / In fact", "Contrary to"],
    mainIdea: "However·In fact 바로 뒤 문장",
    tip: "앞의 통념 부분은 '필자 생각이 아님' 표시만 하고 빠르게 넘어가세요. 오답 선택지에 통념이 그대로 나옵니다.",
    types: "요지·주장·빈칸(31~34번)",
  },
  {
    id: "problem-solution",
    no: 3,
    name: "문제 - 해결",
    flow: ["문제 제기", "원인", "해결책"],
    summary: "어떤 문제를 제시하고 그 원인과 해결 방법을 설명합니다.",
    signals: ["problem / challenge / issue", "One solution is", "Fortunately", "To address this"],
    mainIdea: "해결책이 나오는 후반부",
    tip: "문제 부분보다 해결책 부분에 필자의 주장이 담깁니다. 해결책이 여러 개면 공통점을 묶으세요.",
    types: "주제·제목·요지·무관한 문장(35번)",
  },
  {
    id: "cause-effect",
    no: 4,
    name: "원인 - 결과",
    flow: ["현상", "원인", "결과·시사점"],
    summary: "어떤 현상이 왜 일어나는지, 그 결과가 무엇인지 인과 관계로 풀어 갑니다.",
    signals: ["because / due to / result from", "As a result / Therefore / Thus", "lead to / cause"],
    mainIdea: "Therefore·As a result 문장",
    tip: "원인과 결과의 방향(A→B인지 B→A인지)을 뒤바꾼 선택지가 단골 오답입니다.",
    types: "빈칸·순서(36~37번)·요약문(40번)",
  },
  {
    id: "compare-contrast",
    no: 5,
    name: "비교 - 대조",
    flow: ["A의 특징", "B의 특징", "차이(또는 공통점)의 의미"],
    summary: "두 대상을 나란히 놓고 같은 점이나 다른 점을 설명합니다.",
    signals: ["whereas / while / on the other hand", "by contrast / unlike", "similarly / likewise"],
    mainIdea: "대조를 통해 필자가 강조하는 쪽",
    tip: "읽으면서 A쪽·B쪽 특징을 양쪽으로 갈라 표시하면, 요약문·빈칸에서 짝을 바로 찾을 수 있습니다.",
    types: "요약문·빈칸·내용 일치",
  },
  {
    id: "general-example",
    no: 6,
    name: "일반 진술 - 예시",
    flow: ["일반 진술", "For example ...", "일반화"],
    summary: "추상적인 주장 뒤에 구체적 사례를 들어 설명합니다.",
    signals: ["For example / For instance", "Take ... as an example", "Consider"],
    mainIdea: "예시 앞(또는 뒤)의 일반 진술",
    tip: "예시는 '주장을 증명하는 재료'일 뿐입니다. 예시를 정답 근거로 삼은 선택지는 대부분 지엽적인 오답입니다.",
    types: "함축 의미(21번)·빈칸·제목",
  },
  {
    id: "experiment",
    no: 7,
    name: "실험·연구",
    flow: ["연구 질문", "방법", "결과", "해석"],
    summary: "연구자가 무엇을 알고 싶었고, 어떻게 실험했고, 무엇을 발견했는지 보여 줍니다.",
    signals: ["researchers / participants / study", "found that / showed that", "This suggests"],
    mainIdea: "결과의 해석(This suggests / The lesson is)",
    tip: "실험 방법은 가장 빨리 읽어도 되는 부분입니다. '결과'와 '그래서 무엇을 의미하는가'에 시간을 쓰세요.",
    types: "요약문(40번)·요지·빈칸",
  },
  {
    id: "question-answer",
    no: 8,
    name: "질문 - 답변",
    flow: ["질문 던지기", "답변 1", "답변 2", "결론"],
    summary: "글 첫머리에 질문을 던지고 본문에서 답합니다. 질문 자체가 곧 주제입니다.",
    signals: ["Why ...? / How ...? / What if ...?", "One answer is", "The reason is"],
    mainIdea: "질문에 대한 답(본문 중후반)",
    tip: "질문을 읽자마자 '답을 찾으며' 읽습니다. 답이 두 개 이상이면 마지막 결론이 둘을 아우릅니다.",
    types: "주제·제목·빈칸",
  },
  {
    id: "sequence",
    no: 9,
    name: "시간순·과정",
    flow: ["과거·첫 단계", "변화", "현재·마지막 단계"],
    summary: "역사적 변화나 절차를 시간 순서대로 서술합니다.",
    signals: ["In the 19th century / Later / Today", "first / then / finally", "Since then"],
    mainIdea: "변화의 방향과 그 의미",
    tip: "연도·시대 표현과 first/then 같은 연결어에 동그라미를 치면 순서(36~37번)·삽입(38~39번) 문제가 빨라집니다.",
    types: "순서·문장 삽입·내용 일치",
  },
  {
    id: "definition",
    no: 10,
    name: "개념 정의·분류",
    flow: ["개념 제시", "정의", "종류·특징", "적용"],
    summary: "낯선 개념을 정의하고 종류나 특징을 나누어 설명합니다.",
    signals: ["refers to / is defined as / is called", "There are two types", "One ... The other ..."],
    mainIdea: "개념의 정의 문장",
    tip: "처음 보는 용어가 나와도 당황하지 마세요. 지문 안에서 반드시 풀어서 설명해 줍니다.",
    types: "빈칸·함축 의미·어휘(30번)",
  },
];

export const structureName = (id: StructureId) => STRUCTURES.find((s) => s.id === id)?.name ?? id;
