import type { Metadata } from "next";
import { HabitTracker } from "@/components/study/habit-tracker";
import { StudyHeader } from "@/components/study/study-header";

const description = "새 습관이 자리 잡는 데 평균 66일이 걸린다는 연구에 맞춰, 공부 습관을 66일 동안 매일 체크합니다. 3단계 구간별 조언과 연속 기록으로 작심삼일을 넘기세요.";

export const metadata: Metadata = {
  title: "66일 공부 습관 만들기",
  description,
  alternates: { canonical: "/study/habit" },
  openGraph: { title: "66일 공부 습관 만들기", description, url: "/study/habit" },
};

export default function HabitPage() {
  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <StudyHeader eyebrow="66일 습관" title="66일 공부 습관 만들기" description={description}>
        <p className="mt-4 rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
          영국 UCL 연구팀(Lally 외, 2009)이 참가자들의 습관 형성 과정을 추적한 결과, 행동이 자동으로 나오기까지 평균 66일이 걸렸습니다. 사람과 행동에 따라 차이가 크고,
          하루 정도 빠지는 것은 습관 형성에 큰 영향을 주지 않았어요. 완벽하게보다 <strong className="text-foreground">끊기지 않게</strong>가 중요합니다.
        </p>
      </StudyHeader>
      <HabitTracker />
    </div>
  );
}
