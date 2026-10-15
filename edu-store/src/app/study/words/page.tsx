import type { Metadata } from "next";
import { StudyHeader } from "@/components/study/study-header";
import { WordChallenge } from "@/components/study/word-challenge";

const description = "수능·모의고사 빈출 영단어 300개를 하루 10개씩 30일 동안. 카드 학습과 단어당 5초 스피드 퀴즈, 오답 단어장으로 확실하게 외웁니다.";

export const metadata: Metadata = {
  title: "초고속 수능 영단어 30일 챌린지",
  description,
  alternates: { canonical: "/study/words" },
  openGraph: { title: "초고속 수능 영단어 30일 챌린지", description, url: "/study/words" },
};

export default function WordsPage() {
  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <StudyHeader eyebrow="영단어 30일" title="초고속 수능 영단어 30일 챌린지" description={description}>
        <ol className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
          {["① 카드로 뜻 떠올리기 (10단어)", "② 단어당 5초 스피드 퀴즈", "③ 8개 이상 맞히면 Day 통과"].map((s) => (
            <li key={s} className="rounded-xl bg-muted px-4 py-3">{s}</li>
          ))}
        </ol>
      </StudyHeader>
      <WordChallenge />
      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        팁: 한 번에 몰아서 외우기보다 다음 날, 3일 뒤, 일주일 뒤에 오답 단어만 다시 퀴즈로 풀면 훨씬 오래 기억합니다. 속독 훈련의 &lsquo;왜 외운 단어를 잊어버릴까&rsquo; 지문도 읽어 보세요.
      </p>
    </div>
  );
}
