export const STUDY_TOOLS = [
  { href: "/study/words", title: "영어 단어 학습", short: "영어 단어 학습", desc: "수능·모의고사 빈출 어휘 300개를 하루 10개씩 30일 동안. 카드로 익히고 단어당 5초 퀴즈로 확인하며, 틀린 단어는 오답 단어장에 쌓입니다.", tag: "영어", icon: "zap" },
  { href: "/study/speed-reading", title: "독해 속도 훈련", short: "독해 속도 훈련", desc: "읽는 속도(분당 단어 수)를 측정하고, 의미 단위로 끊어 읽는 페이서로 목표 속도에 맞춰 연습합니다. 읽은 뒤 이해도 문제로 확인합니다.", tag: "영어", icon: "gauge" },
  { href: "/study/structures", title: "영어 지문 구조 분석", short: "지문 구조 분석", desc: "수능 영어 지문의 전개 구조 10가지와 신호어, 주제문 위치, 자주 나오는 유형을 정리했습니다.", tag: "영어", icon: "layers" },
  { href: "/study/strategy", title: "독해 시간 배분 전략", short: "시간 배분 전략", desc: "독해 28문항을 45분 안에 풀기 위한 유형별 시간 배분과 풀이 순서, 구간 타이머를 제공합니다.", tag: "영어", icon: "timer" },
  { href: "/study/ai-melisa", title: "AI 멜리사 학습 도우미", short: "AI 멜리사", desc: "영어 지문의 핵심 내용, 문장별 해석, 어휘, 문법, 글의 구조, 정답 근거를 정리해 주는 도우미입니다. 연결 상태에 따라 사이트 안 분석 또는 외부 GPT로 이용합니다.", tag: "AI", icon: "sparkles" },
  { href: "/study/habit", title: "학습 플래너", short: "학습 플래너", desc: "습관이 자리 잡는 데 평균 66일이 걸린다는 연구에 맞춰, 66일 동안 매일 학습을 체크하는 플래너입니다. 연속 기록과 단계별 안내를 함께 보여 줍니다.", tag: "자기주도", icon: "flame" },
  { href: "/study/time", title: "공부 시간 기록", short: "공부 시간 기록", desc: "과목별 스톱워치로 순수 공부 시간만 기록하고, 요일별·과목별 주간 그래프로 확인합니다.", tag: "자기주도", icon: "chart" },
  { href: "/study/report", title: "학습 리포트", short: "학습 리포트", desc: "모든 도구의 기록을 모아 한 주를 점검합니다. 인쇄하거나 PDF로 저장해 보호자와 공유할 수 있습니다.", tag: "자기주도", icon: "report" },
  { href: "/study/wrong-notes", title: "오답노트", short: "오답노트", desc: "틀린 이유를 다섯 가지로 분류해 기록하고, 1·3·7·14일 간격으로 다시 풀 문제를 알려 줍니다.", tag: "자기주도", icon: "notebook" },
] as const;
