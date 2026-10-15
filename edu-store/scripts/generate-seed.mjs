// 사용법: node --experimental-strip-types scripts/generate-seed.mjs > supabase/seed.sql
// 출시 예정 교재 목록(src/lib/catalog-plan.ts)을 SQL로 만듭니다. 모든 교재는 파일이 연결되기 전까지 '출시 예정'입니다.
import { SEED_PRODUCTS, PLANNED_PACKAGES } from "../src/lib/catalog-plan.ts";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a = []) => `array[${a.map(q).join(", ")}]::text[]`;
const num = (v) => (v === null || v === undefined ? "null" : String(v));

console.log("-- 출시 예정 교재 목록 (scripts/generate-seed.mjs로 생성)");
console.log("-- 파일(PDF)이 연결되고 관리자에서 '판매 중'으로 바꾸기 전까지 구매할 수 없습니다.");
console.log("-- 출시일·교육과정·학년도·쪽수는 확정 전이라 비워 두었습니다.\n");
console.log("insert into public.products\n  (sku, slug, title, series, summary, description, track, area, course, grades, kind, difficulty, question_count, price, goals, keywords, featured_rank, seo_title, seo_description, status, is_published)\nvalues");
const rows = SEED_PRODUCTS.map(
  (p) =>
    `  (${q(p.sku)}, ${q(p.slug)}, ${q(p.title)}, ${q(p.series)}, ${q(p.summary ?? "")}, ${q(p.description ?? "")}, ${q(p.track)}, ${q(p.area)}, ${q(p.course)}, ${arr(p.levels)}, ${q(p.kind)}, ${q(p.difficulty)}, ${num(p.questionCount)}, ${num(p.price)}, ${arr(p.goals)}, ${arr(p.keywords)}, ${num(p.featuredRank)}, ${q(p.seoTitle)}, ${q(p.seoDescription)}, 'coming_soon', false)`,
);
console.log(rows.join(",\n") + "\non conflict (slug) do nothing;\n");

console.log("insert into public.bundles (slug, title, summary, track, status)\nvalues");
console.log(
  PLANNED_PACKAGES.map((b) => `  (${q(b.slug)}, ${q(b.title)}, '구성 교재와 가격은 교재 출시 후 확정됩니다.', ${q(b.track)}, 'coming_soon')`).join(",\n") +
    "\non conflict (slug) do nothing;",
);
