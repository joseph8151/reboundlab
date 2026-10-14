// 사용법: node --experimental-strip-types scripts/generate-seed.mjs > supabase/seed.sql
import { sampleProducts } from "../src/lib/sample-products.ts";

const q = (v) => (v === null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(", ")}]::text[]`;

console.log("-- 예시 상품 데이터 (scripts/generate-seed.mjs로 생성)");
console.log("-- file_path는 비어 있습니다. 관리자 페이지에서 PDF를 업로드하거나, 직접 경로를 채워 주세요.\n");
for (const p of sampleProducts) {
  console.log(`insert into public.products
  (slug, title, summary, description, subject, grades, type, price, page_count, toc, targets, includes, sample_excerpt, is_featured, is_published)
values
  (${q(p.slug)}, ${q(p.title)}, ${q(p.summary)}, ${q(p.description)}, ${q(p.subject)}, ${arr(p.grades)}, ${q(p.type)}, ${p.price}, ${p.pageCount},
   ${arr(p.toc)},
   ${arr(p.targets)},
   ${arr(p.includes)},
   ${arr(p.sampleExcerpt)},
   ${p.isFeatured}, ${p.isPublished})
on conflict (slug) do nothing;
`);
}
