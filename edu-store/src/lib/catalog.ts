export const SUBJECTS = [
  { id: "korean", label: "국어", description: "문학·독서·언어와 매체" },
  { id: "math", label: "수학", description: "공통수학·수Ⅰ·수Ⅱ·선택과목" },
  { id: "english", label: "영어", description: "독해·어법·어휘" },
  { id: "inquiry", label: "탐구", description: "사회탐구·과학탐구" },
  { id: "common", label: "공통", description: "플래너·학습 관리" },
] as const;

export const GRADES = [
  { id: "middle", label: "중등" },
  { id: "high1", label: "고1" },
  { id: "high2", label: "고2" },
  { id: "high3", label: "고3·수능" },
] as const;

export const TYPES = [
  { id: "past-exam", label: "기출", description: "실제 출제 경향을 단원·유형별로 정리" },
  { id: "variant", label: "변형문제", description: "같은 개념, 다른 조건으로 다시 확인" },
  { id: "guide", label: "스터디가이드", description: "개념 흐름과 풀이 순서를 한 권에" },
  { id: "self-study", label: "자기주도학습", description: "계획·점검·오답 관리 도구" },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]["id"];
export type GradeId = (typeof GRADES)[number]["id"];
export type TypeId = (typeof TYPES)[number]["id"];

export const subjectLabel = (id: string) => SUBJECTS.find((s) => s.id === id)?.label ?? id;
export const gradeLabel = (id: string) => GRADES.find((g) => g.id === id)?.label ?? id;
export const typeLabel = (id: string) => TYPES.find((t) => t.id === id)?.label ?? id;

export const isSubject = (v: unknown): v is SubjectId => SUBJECTS.some((s) => s.id === v);
export const isGrade = (v: unknown): v is GradeId => GRADES.some((g) => g.id === v);
export const isType = (v: unknown): v is TypeId => TYPES.some((t) => t.id === v);
