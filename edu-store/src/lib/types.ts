import type { GradeId, SubjectId, TypeId } from "./catalog";

export type Product = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  subject: SubjectId;
  grades: GradeId[];
  type: TypeId;
  price: number;
  pageCount: number;
  toc: string[];
  targets: string[];
  includes: string[];
  sampleExcerpt: string[];
  thumbnailUrl: string | null;
  sampleImages: string[];
  filePath: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  updatedAt: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  subject: SubjectId;
  grades: GradeId[];
  type: TypeId;
  price: number;
  page_count: number;
  toc: string[];
  targets: string[];
  includes: string[];
  sample_excerpt: string[];
  thumbnail_url: string | null;
  sample_images: string[];
  file_path?: string | null;
  is_featured: boolean;
  is_published: boolean;
  updated_at: string;
};

export type OrderStatus = "pending" | "paid" | "canceled" | "refunded" | "failed";

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    description: r.description,
    subject: r.subject,
    grades: r.grades ?? [],
    type: r.type,
    price: r.price,
    pageCount: r.page_count,
    toc: r.toc ?? [],
    targets: r.targets ?? [],
    includes: r.includes ?? [],
    sampleExcerpt: r.sample_excerpt ?? [],
    thumbnailUrl: r.thumbnail_url,
    sampleImages: r.sample_images ?? [],
    filePath: r.file_path ?? null,
    isFeatured: r.is_featured,
    isPublished: r.is_published,
    updatedAt: r.updated_at,
  };
}
