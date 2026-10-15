/**
 * 속독 훈련용 지문. 모두 수능 독해 형식을 참고해 새로 쓴 창작 지문입니다.
 * (실제 수능·모의평가 지문을 넣으려면 한국교육과정평가원의 이용 허락이 필요합니다.)
 */
import type { StructureId } from "./structures";

export type Question = { prompt: string; choices: string[]; answer: number; explanation: string };

export type Passage = {
  id: string;
  title: string;
  level: "기본" | "표준" | "심화";
  structure: StructureId;
  text: string;
  questions: Question[];
};

export const PASSAGES: Passage[] = [
  {
    id: "multitasking",
    title: "멀티태스킹의 착각",
    level: "기본",
    structure: "belief-rebuttal",
    text: `Many people take pride in their ability to do several things at once. They answer messages while listening to a lecture, or they check social media while writing an essay, and they believe this makes them more productive. However, research on attention tells a different story. The brain does not actually perform two demanding tasks at the same time. Instead, it switches rapidly between them, and every switch has a cost. Each time we move our attention from one task to another, we need a moment to remember where we were and what we were trying to do. These small delays add up. In addition, errors become more frequent because part of our mind is still occupied with the previous task. As a result, people who multitask often take longer to finish their work, and the quality of that work is lower than when they focus on one thing at a time. The feeling of being busy, in other words, is easily mistaken for the reality of being productive. If we want to get more done, the wiser strategy is to protect blocks of time for a single task.`,
    questions: [
      {
        prompt: "글의 요지로 가장 적절한 것은?",
        choices: [
          "멀티태스킹은 집중력을 기르는 좋은 훈련이다.",
          "여러 일을 동시에 하면 오히려 생산성이 떨어진다.",
          "과제의 난이도에 따라 공부 순서를 정해야 한다.",
          "소셜 미디어 사용 시간을 정확히 기록해야 한다.",
          "바쁘다는 느낌은 성취감을 높여 준다.",
        ],
        answer: 1,
        explanation: "However 이후 반박 내용과 마지막 문장(single task)이 요지입니다. 통념-반박 구조에서는 However 뒤가 핵심입니다.",
      },
      {
        prompt: "글의 내용과 일치하지 않는 것은?",
        choices: [
          "뇌는 두 과제 사이를 빠르게 오간다.",
          "과제를 전환할 때마다 시간 비용이 든다.",
          "멀티태스킹을 하면 실수가 줄어든다.",
          "바쁜 느낌을 생산성으로 착각하기 쉽다.",
          "한 가지 과제를 위한 시간을 확보하라고 조언한다.",
        ],
        answer: 2,
        explanation: "errors become more frequent — 실수는 오히려 늘어납니다.",
      },
    ],
  },
  {
    id: "forgetting-curve",
    title: "왜 외운 단어를 잊어버릴까",
    level: "기본",
    structure: "cause-effect",
    text: `In the late nineteenth century, the German psychologist Hermann Ebbinghaus tested his own memory by learning lists of meaningless syllables and checking how many he could recall later. He found that forgetting is fastest right after learning. Within a day, a large part of what he had memorized was gone, and after that the loss slowed down. This pattern, now known as the forgetting curve, explains why students who study a word list once often feel that they never learned it at all. The problem is not that their memory is weak. It is that a single exposure leaves only a fragile trace in the brain. Ebbinghaus also discovered something encouraging. Each time he reviewed the material, he forgot it more slowly than before. Reviewing at increasing intervals, such as one day, three days, and a week after the first study session, strengthens the memory so that it lasts much longer. Therefore, the most efficient way to build vocabulary is not to spend hours on one long session but to return to the same words several times, a little later each time.`,
    questions: [
      {
        prompt: "글의 주제로 가장 적절한 것은?",
        choices: [
          "the history of German psychology",
          "why meaningless syllables are hard to learn",
          "how spaced review reduces forgetting",
          "the difference between weak and strong memory",
          "the best time of day to study vocabulary",
        ],
        answer: 2,
        explanation: "원인(한 번만 보면 흔적이 약함) → 결과(망각) → 해결(간격을 두고 반복)으로 이어집니다. Therefore 문장이 주제입니다.",
      },
      {
        prompt: "에빙하우스가 발견한 사실로 옳은 것은?",
        choices: [
          "망각은 학습 일주일 후에 가장 빠르다.",
          "복습할 때마다 망각 속도가 느려졌다.",
          "의미 없는 음절은 잊히지 않는다.",
          "한 번의 긴 학습이 가장 효율적이다.",
          "기억력은 사람마다 거의 같다.",
        ],
        answer: 1,
        explanation: "Each time he reviewed the material, he forgot it more slowly than before.",
      },
    ],
  },
  {
    id: "tool-using-animals",
    title: "도구를 쓰는 동물들",
    level: "표준",
    structure: "general-example",
    text: `For a long time, the use of tools was considered a defining feature of human beings. Observations of the natural world, however, have gradually made this boundary less clear. Sea otters, for example, float on their backs with a flat stone resting on their chests and strike shellfish against it until the shells crack open. Some crows in New Caledonia go even further: they shape twigs and leaves into hooks that allow them to pull insects out of narrow holes, and young birds appear to learn the technique by watching older ones. Chimpanzees strip leaves from thin branches and insert them into termite mounds, carefully drawing out the insects that cling to the stick. In each case, the animal is not simply using its body. It is selecting an object, sometimes modifying it, and applying it to solve a specific problem. These examples do not mean that animals think exactly as humans do. They do suggest, though, that the abilities underlying tool use are spread more widely across the animal kingdom than we once assumed, and that intelligence is better understood as a range than as a line separating us from other species.`,
    questions: [
      {
        prompt: "글의 제목으로 가장 적절한 것은?",
        choices: [
          "Why Crows Are Smarter Than Chimpanzees",
          "Tool Use: No Longer a Uniquely Human Trait",
          "How Sea Otters Survive in Cold Water",
          "Humans Learned Tool Use from Animals",
          "The Dangers of Studying Wild Animals",
        ],
        answer: 1,
        explanation: "일반 진술(도구 사용 = 인간 고유?) → 예시 3개 → 일반화(지능은 연속적인 범위). 예시는 빠르게 읽고 앞뒤 일반 진술을 잡으세요.",
      },
      {
        prompt: "뉴칼레도니아 까마귀에 대한 설명으로 옳은 것은?",
        choices: [
          "돌을 이용해 조개를 깬다.",
          "나뭇잎을 벗겨 흰개미 굴에 넣는다.",
          "잔가지와 잎을 갈고리 모양으로 만든다.",
          "도구 사용법을 스스로만 익힌다.",
          "물 위에 누운 채 먹이를 먹는다.",
        ],
        answer: 2,
        explanation: "shape twigs and leaves into hooks — 어린 새는 나이 든 새를 보고 배운다고 했으므로 ④는 오답입니다.",
      },
    ],
  },
  {
    id: "handwriting-notes",
    title: "손으로 필기하기 vs 노트북 필기",
    level: "표준",
    structure: "experiment",
    text: `Does it matter whether students take notes by hand or on a laptop? To find out, researchers asked university students to watch short lectures and take notes in their usual way, using either a pen or a computer. Afterwards, the students answered two kinds of questions: factual ones, which asked them to recall specific details, and conceptual ones, which required them to understand and apply the main ideas. The two groups performed similarly on the factual questions. On the conceptual questions, however, the students who had written by hand did noticeably better. When the researchers examined the notes, they found a likely explanation. Laptop users, who can type almost as fast as a speaker talks, tended to record the lecture word for word. Students writing by hand could not keep up, so they had to listen, decide what was important, and summarize it in their own words. That extra mental effort, which seems like a disadvantage, turned out to be the very process that produced deeper understanding. The lesson is not that technology is harmful, but that learning depends less on how much we record than on how much we process.`,
    questions: [
      {
        prompt: "연구 결과가 시사하는 바로 가장 적절한 것은?",
        choices: [
          "노트북은 수업 시간에 사용하지 말아야 한다.",
          "필기의 양이 많을수록 시험 점수가 높아진다.",
          "내용을 스스로 정리하는 과정이 깊은 이해를 만든다.",
          "사실 확인 문제는 개념 문제보다 어렵다.",
          "강의 속도를 늦추면 학습 효과가 커진다.",
        ],
        answer: 2,
        explanation: "실험 구조는 '연구 질문 → 방법 → 결과 → 해석(시사점)' 순서입니다. 마지막 문장이 시사점입니다.",
      },
      {
        prompt: "두 집단의 차이가 나타난 문제 유형은?",
        choices: ["사실 확인 문제", "개념 이해·적용 문제", "어휘 문제", "두 유형 모두", "차이가 없었다"],
        answer: 1,
        explanation: "On the conceptual questions, however, the students who had written by hand did noticeably better.",
      },
    ],
  },
  {
    id: "urban-heat",
    title: "도시가 더 뜨거운 이유와 해법",
    level: "심화",
    structure: "problem-solution",
    text: `On a summer afternoon, the center of a large city can be several degrees warmer than the countryside around it. This phenomenon, called the urban heat island effect, is more than a matter of comfort. Higher temperatures increase the demand for air conditioning, which raises energy consumption and, in turn, releases more heat and pollution into the air. During heat waves, the effect can also be dangerous for elderly people and others who are vulnerable to extreme temperatures. The causes are largely the materials and shapes of the city itself. Dark asphalt and concrete absorb sunlight during the day and slowly release it at night, while tall buildings trap warm air and block cooling winds. Fortunately, because the problem is built into the city, it can also be designed out of it. Roofs painted in light colors reflect a greater portion of sunlight instead of absorbing it. Green roofs and street trees provide shade and cool the surrounding air as water evaporates from their leaves. Some cities have replaced parts of their paved surfaces with permeable materials that hold rainwater, which later cools the ground as it evaporates. None of these measures is dramatic on its own, but together they can make a measurable difference in how livable a city feels.`,
    questions: [
      {
        prompt: "글의 주제로 가장 적절한 것은?",
        choices: [
          "the health risks of air conditioning",
          "causes of the urban heat island effect and ways to reduce it",
          "why cities should stop building tall buildings",
          "the history of asphalt in modern cities",
          "the benefits of moving to the countryside",
        ],
        answer: 1,
        explanation: "문제 제기(열섬) → 원인 → Fortunately 이후 해결책. 문제-해결 구조는 해결책 부분에 필자의 주장이 담깁니다.",
      },
      {
        prompt: "글에서 언급된 해결책이 아닌 것은?",
        choices: ["밝은 색 지붕", "옥상 녹화", "가로수 심기", "투수성 포장재", "에어컨 사용 제한"],
        answer: 4,
        explanation: "에어컨은 문제를 키우는 요인으로만 언급되었습니다.",
      },
    ],
  },
  {
    id: "sad-music",
    title: "우리는 왜 슬픈 음악을 들을까",
    level: "심화",
    structure: "question-answer",
    text: `Why would anyone choose to listen to music that makes them feel sad? From a simple point of view, people should seek out pleasure and avoid pain, so the popularity of sorrowful songs seems puzzling. One answer lies in the difference between real sadness and the sadness we experience through art. When we lose something in real life, the loss has consequences that we cannot escape. The sadness evoked by a melancholy song, by contrast, comes without any actual loss. We can explore the emotion safely, knowing that we are free to stop the music at any moment. In this protected space, sadness can even feel meaningful, because it allows us to reflect on our own memories and to recognize feelings we had not fully understood. Another answer is social. A sad song can make listeners feel that someone else has experienced what they are going through, which reduces the sense of being alone. Researchers have found that people who listen to sad music often describe the experience as comforting rather than depressing. What looks like a contradiction, then, is better understood as a way of using art to process emotions that everyday life gives us little room to explore.`,
    questions: [
      {
        prompt: "글의 요지로 가장 적절한 것은?",
        choices: [
          "슬픈 음악은 우울감을 심화시키므로 피해야 한다.",
          "사람들은 실제 상실을 경험할 때만 음악을 듣는다.",
          "슬픈 음악은 감정을 안전하게 탐색하고 위로받는 수단이 된다.",
          "음악 취향은 나이에 따라 크게 달라진다.",
          "예술은 현실의 슬픔을 완전히 없애 준다.",
        ],
        answer: 2,
        explanation: "질문(Why...?) → 답변 1(안전한 감정 탐색) → 답변 2(사회적 위로) → 결론. 첫 질문에 대한 답을 찾으며 읽습니다.",
      },
      {
        prompt: "글에 따르면 예술을 통해 느끼는 슬픔의 특징은?",
        choices: [
          "실제 상실을 동반한다.",
          "언제든 멈출 수 있어 안전하다.",
          "혼자라는 느낌을 키운다.",
          "기억을 떠올리지 못하게 한다.",
          "현실의 슬픔보다 더 오래간다.",
        ],
        answer: 1,
        explanation: "we are free to stop the music at any moment — 안전하게 탐색할 수 있다는 점이 핵심입니다.",
      },
    ],
  },
];

export const wordCount = (text: string) => text.trim().split(/\s+/).length;

/** 수능 독해 45분 · 28문항 기준으로 보면 지문을 분당 약 150단어 이상으로 읽어야 여유가 생깁니다. */
export const TARGET_WPM = 150;
