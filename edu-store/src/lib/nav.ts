export const NAV = [
  { href: "/books", label: "전체 교재" },
  { href: "/category/suneung", label: "수능" },
  { href: "/category/high-school", label: "고등 내신" },
  { href: "/category/middle-school", label: "중등 내신" },
  { href: "/category/mock", label: "모의고사" },
  { href: "/packages", label: "패키지" },
  { href: "/diagnosis", label: "3분 학습 진단" },
  { href: "/custom", label: "MELISSA CUSTOM BOOK" },
  { href: "/exam", label: "시험이 얼마 남지 않았다면" },
  { href: "/parents", label: "우리 아이 교재 찾기" },
  { href: "/study", label: "무료 학습 도구" },
] as const;

export const SUBJECT_LINKS = [
  { href: "/books?area=korean", label: "국어" },
  { href: "/books?area=math", label: "수학" },
  { href: "/books?area=english", label: "영어" },
  { href: "/books?area=social", label: "사회" },
  { href: "/books?area=science", label: "과학" },
] as const;
