// 사용법: npx esbuild scripts/generate-seed.mjs --bundle --platform=node --format=esm --log-level=error | node --input-type=module > supabase/seed.sql
// 교재·패키지 목록(src/lib/catalog-plan.ts)을 SQL로 만듭니다. 모든 교재는 '판매 중(상담 구매)'이며 PDF 미완성 교재는 주문 제작 상담입니다.
// 이미 같은 슬러그의 상품이 있으면 건드리지 않으므로(on conflict do nothing) 기존 가격은 바뀌지 않습니다.
import { SEED_PRODUCTS, PLANNED_PACKAGES } from "../src/lib/catalog-plan.ts";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a = []) => `array[${a.map(q).join(", ")}]::text[]`;
const num = (v) => (v === null || v === undefined ? "null" : String(v));

console.log("-- 교재 목록 (scripts/generate-seed.mjs로 생성)");
console.log("-- 가격은 src/lib/catalog-plan.ts의 PRICE_TABLE 기준이며, 관리자 페이지에서 바꿀 수 있습니다.");
console.log("-- 출시일·교육과정·학년도·쪽수는 확정 전이라 비워 두었습니다.\n");
console.log("insert into public.products\n  (sku, slug, title, series, summary, description, track, area, course, grades, kind, difficulty, question_count, price, delivery_type, weak_tags, collection, study_method, targets, includes, goals, keywords, featured_rank, seo_title, seo_description, status, is_published)\nvalues");
const rows = SEED_PRODUCTS.map(
  (p) =>
    `  (${q(p.sku)}, ${q(p.slug)}, ${q(p.title)}, ${q(p.series)}, ${q(p.summary ?? "")}, ${q(p.description ?? "")}, ${q(p.track)}, ${q(p.area)}, ${q(p.course)}, ${arr(p.levels)}, ${q(p.kind)}, ${q(p.difficulty)}, ${num(p.questionCount)}, ${num(p.price)}, ${q(p.deliveryType ?? 'custom')}, ${arr(p.weakTags)}, ${q(p.collection)}, ${q(p.method)}, ${arr(p.targets)}, ${arr(p.includes)}, ${arr(p.goals)}, ${arr(p.keywords)}, ${num(p.featuredRank)}, ${q(p.seoTitle)}, ${q(p.seoDescription)}, 'on_sale', true)`,
);
console.log(rows.join(",\n") + "\non conflict (slug) do nothing;\n");

console.log("insert into public.bundles (slug, title, summary, track, price, status)\nvalues");
console.log(
  PLANNED_PACKAGES.map((b) => `  (${q(b.slug)}, ${q(b.title)}, ${q(b.summary)}, ${q(b.track)}, ${num(b.price)}, 'on_sale')`).join(",\n") +
    "\non conflict (slug) do nothing;\n",
);
console.log("insert into public.bundle_items (bundle_id, product_id, position)");
console.log("select b.id, p.id, v.position from (values");
console.log(PLANNED_PACKAGES.flatMap((b) => b.items.map((slug, i) => `  (${q(b.slug)}, ${q(slug)}, ${i})`)).join(",\n"));
console.log(") as v(bundle_slug, product_slug, position)\njoin public.bundles b on b.slug = v.bundle_slug\njoin public.products p on p.slug = v.product_slug\non conflict do nothing;");
