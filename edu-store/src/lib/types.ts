import type { AnswerMode, DeliveryType, AreaId, CurriculumId, DifficultyId, KindId, LevelId, StatusId, TrackId } from "./catalog";

/** 화면에 내려보내는 교재 정보. 구매 파일 경로(filePath 등)는 서버에서만 다루며 여기에 없습니다. */
export type Product = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  series: string | null;
  summary: string;
  description: string;
  track: TrackId;
  area: AreaId;
  course: string | null;
  levels: LevelId[];
  kind: KindId;
  difficulty: DifficultyId | null;
  curriculum: CurriculumId | null;
  examYear: number | null;
  pageCount: number | null;
  questionCount: number | null;
  price: number | null;
  salePrice: number | null;
  coverUrl: string | null;
  toc: string[];
  goals: string[];
  targets: string[];
  includes: string[];
  previewPdfUrl: string | null;
  previewImages: string[];
  answerMode: AnswerMode;
  edition: string | null;
  revisionNotes: string[];
  releaseDate: string | null;
  status: StatusId;
  featuredRank: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string[];
  /** 상담·구매 신청을 받을 수 있는 상태(판매 중 + 가격 등록) */
  consultable: boolean;
  deliveryType: DeliveryType;
  weakTags: string[];
  /** 정답·해설 파일이 별도로 등록되어 있는지 */
  hasAnswerFile: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductRow = {
  id: string;
  sku: string | null;
  slug: string;
  title: string;
  series: string | null;
  summary: string;
  description: string;
  track: TrackId;
  area: AreaId;
  course: string | null;
  grades: LevelId[];
  kind: KindId;
  difficulty: DifficultyId | null;
  curriculum: CurriculumId | null;
  exam_year: number | null;
  page_count: number | null;
  question_count: number | null;
  price: number | null;
  sale_price: number | null;
  cover_url: string | null;
  toc: string[];
  goals: string[];
  targets: string[];
  includes: string[];
  preview_pdf_url: string | null;
  sample_images: string[];
  answer_mode: AnswerMode;
  has_answer_file: boolean;
  has_file: boolean;
  delivery_type: DeliveryType | null;
  weak_tags: string[] | null;
  edition: string | null;
  revision_notes: string[];
  release_date: string | null;
  status: StatusId;
  featured_rank: number | null;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[];
  created_at: string;
  updated_at: string;
};

export type Bundle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  track: TrackId | null;
  price: number | null;
  status: StatusId;
  releaseDate: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  itemIds: string[];
  items: Product[];
  /** 포함 교재의 개별 판매가 합계 (모든 교재 가격이 있을 때만) */
  listTotal: number | null;
  /** 실제 할인액 (패키지가 합계보다 쌀 때만) */
  discount: number | null;
  totalPages: number | null;
  consultable: boolean;
  deliveryType: DeliveryType;
};

export type BundleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  track: TrackId | null;
  price: number | null;
  status: StatusId;
  release_date: string | null;
  seo_title: string | null;
  seo_description: string | null;
  delivery_type?: DeliveryType | null;
  bundle_items: { product_id: string; position: number }[] | null;
};

export const effectivePrice = (p: Pick<Product, "price" | "salePrice">) =>
  p.price === null ? null : p.salePrice !== null && p.salePrice < p.price ? p.salePrice : p.price;

export function rowToProduct(r: ProductRow): Product {
  const price = r.price;
  const status = r.status;
  const consultable = status === "on_sale" && price !== null;
  return {
    id: r.id,
    sku: r.sku ?? "",
    slug: r.slug,
    title: r.title,
    series: r.series,
    summary: r.summary,
    description: r.description,
    track: r.track,
    area: r.area,
    course: r.course,
    levels: r.grades ?? [],
    kind: r.kind,
    difficulty: r.difficulty,
    curriculum: r.curriculum,
    examYear: r.exam_year,
    pageCount: r.page_count,
    questionCount: r.question_count,
    price,
    salePrice: r.sale_price,
    coverUrl: r.cover_url,
    toc: r.toc ?? [],
    goals: r.goals ?? [],
    targets: r.targets ?? [],
    includes: r.includes ?? [],
    previewPdfUrl: r.preview_pdf_url,
    previewImages: r.sample_images ?? [],
    answerMode: r.answer_mode ?? "none",
    edition: r.edition,
    revisionNotes: r.revision_notes ?? [],
    releaseDate: r.release_date,
    status,
    featuredRank: r.featured_rank,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    keywords: r.keywords ?? [],
    consultable,
    deliveryType: r.delivery_type ?? (r.has_file ? "ready" : "custom"),
    weakTags: r.weak_tags ?? [],
    hasAnswerFile: Boolean(r.has_answer_file),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
