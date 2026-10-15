import "server-only";
import { AREAS, ANSWER_MODES, DELIVERY_TYPES, WEAK_TAGS, CURRICULA, DIFFICULTIES, KINDS, LEVELS, STATUSES, TRACKS, isOneOf } from "./catalog";

const lines = (v: unknown) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const text = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s ? s : null;
};
const int = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};

/**
 * 관리자 입력을 DB 행으로 변환·검증합니다. partial=true이면 전달된 필드만 처리합니다(수정용).
 * 오류가 있으면 사람이 읽을 수 있는 메시지 배열을 함께 돌려줍니다.
 */
export function buildProductRow(b: Record<string, unknown>, partial: boolean) {
  const row: Record<string, unknown> = {};
  const errors: string[] = [];
  const has = (k: string) => !partial || k in b;

  if (has("slug")) {
    const slug = String(b.slug ?? "").trim();
    if (!/^[a-z0-9-]{3,90}$/.test(slug)) errors.push("슬러그는 영문 소문자·숫자·하이픈 3~90자로 입력하세요.");
    row.slug = slug;
  }
  if (has("title")) {
    const title = String(b.title ?? "").trim();
    if (!title) errors.push("상품명을 입력하세요.");
    row.title = title;
  }
  if (has("track")) { if (!isOneOf(TRACKS, b.track)) errors.push("학습 과정을 선택하세요."); row.track = b.track; }
  if (has("area")) { if (!isOneOf(AREAS, b.area)) errors.push("과목을 선택하세요."); row.area = b.area; }
  if (has("kind")) { if (!isOneOf(KINDS, b.kind)) errors.push("유형을 선택하세요."); row.kind = b.kind; }
  if (has("grades")) {
    const grades = Array.isArray(b.grades) ? b.grades.filter((g) => isOneOf(LEVELS, g)) : [];
    if (!grades.length) errors.push("대상 학년을 하나 이상 선택하세요.");
    row.grades = grades;
  }
  if (has("difficulty")) { row.difficulty = b.difficulty ? (isOneOf(DIFFICULTIES, b.difficulty) ? b.difficulty : (errors.push("난이도 값이 올바르지 않습니다."), null)) : null; }
  if (has("curriculum")) { row.curriculum = b.curriculum ? (isOneOf(CURRICULA, b.curriculum) ? b.curriculum : (errors.push("교육과정 값이 올바르지 않습니다."), null)) : null; }
  if (has("status")) { if (!isOneOf(STATUSES, b.status)) errors.push("판매 상태를 선택하세요."); row.status = b.status; }
  if (has("deliveryType")) row.delivery_type = isOneOf(DELIVERY_TYPES, b.deliveryType) ? b.deliveryType : "custom";
  if (has("collection")) row.collection = ["self-study", "study-method", "study-planner", "parent-guide"].includes(String(b.collection)) ? b.collection : null;
  if (has("method")) row.study_method = text(b.method);
  if (has("weakTags")) row.weak_tags = Array.isArray(b.weakTags) ? b.weakTags.filter((t) => WEAK_TAGS.some((w) => w.id === t)) : [];
  if (has("answerMode")) { row.answer_mode = isOneOf(ANSWER_MODES, b.answerMode) ? b.answerMode : "none"; }

  for (const [key, col] of [["examYear", "exam_year"], ["pageCount", "page_count"], ["questionCount", "question_count"], ["price", "price"], ["salePrice", "sale_price"], ["featuredRank", "featured_rank"]] as const) {
    if (!has(key)) continue;
    const n = int(b[key]);
    if (Number.isNaN(n) || (n !== null && n < 0)) errors.push(`${key} 값은 0 이상의 정수여야 합니다.`);
    row[col] = Number.isNaN(n) ? null : n;
  }
  if ("price" in row || "sale_price" in row) {
    const price = row.price as number | null | undefined;
    const sale = row.sale_price as number | null | undefined;
    if (price !== undefined && sale !== undefined && sale !== null && (price === null || sale >= price)) errors.push("할인 판매가는 정상 판매가보다 낮아야 합니다.");
  }

  for (const [key, col] of [["sku", "sku"], ["series", "series"], ["course", "course"], ["edition", "edition"], ["seoTitle", "seo_title"], ["seoDescription", "seo_description"], ["coverUrl", "cover_url"], ["previewPdfUrl", "preview_pdf_url"]] as const) {
    if (has(key)) row[col] = text(b[key]);
  }
  for (const [key, col] of [["summary", "summary"], ["description", "description"]] as const) if (has(key)) row[col] = String(b[key] ?? "").trim();
  for (const [key, col] of [["toc", "toc"], ["goals", "goals"], ["targets", "targets"], ["includes", "includes"], ["revisionNotes", "revision_notes"]] as const) if (has(key)) row[col] = lines(b[key]);
  if (has("keywords")) row.keywords = String(b.keywords ?? "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  if (has("previewImages")) row.sample_images = Array.isArray(b.previewImages) ? b.previewImages.filter((u): u is string => typeof u === "string") : [];
  if (has("releaseDate")) {
    const d = text(b.releaseDate);
    if (d && !/^\d{4}-\d{2}-\d{2}$/.test(d)) errors.push("출시일 형식이 올바르지 않습니다.");
    row.release_date = d;
  }
  return { row, errors };
}

export function skuFor(track: string, area: string) {
  return `ME-${track.toUpperCase().slice(0, 4)}-${area.slice(0, 3).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}
