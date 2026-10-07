// Afterline Worker
// - /api/apply : 상담 신청서 접수 (D1 저장, FORMSPREE_FORM_ID가 있으면 이메일 알림)
// - /admin     : 신청 목록 확인과 상태 변경 (비밀번호: ADMIN_PASSWORD 시크릿)
// - 그 밖의 경로: site/ 정적 파일

import SPEC from "./form_fields.json";

// 신청서 항목: 화면(site/build.py)과 같은 목록을 씁니다.
const FIELDS = SPEC.sections.flatMap((s) => s.fields);
const CORE = ["when", "state", "service", "memo"]; // 표의 열로 따로 저장하는 항목
const STATUS = ["접수", "입금 대기", "일정 확정", "상담 완료", "취소"];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/apply") return apply(request, env, ctx);
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) return admin(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function apply(request, env, ctx) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  let d;
  try {
    d = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }
  // 봇이 채우는 숨은 칸
  if (d.website) return json({ ok: true });

  const phone = String(d.contact || "").replace(/[^0-9]/g, "");
  if (phone.length < 9 || phone.length > 12 || d.consent !== true) return json({ ok: false, error: "invalid" }, 400);

  const clean = cleanFields(d);
  if (!clean) return json({ ok: false, error: "invalid" }, 400);

  const details = {};
  for (const f of FIELDS) if (!CORE.includes(f.name) && clean[f.name] !== undefined) details[f.name] = clean[f.name];

  await env.DB.prepare(
    "INSERT INTO applications (phone, breakup, state, service, memo, details) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(phone, clean.when, clean.state, clean.service, clean.memo || null, JSON.stringify(details)).run();

  // 새 신청 이메일 알림. 실패해도 접수는 이미 저장되어 있습니다.
  const formId = env.FORMSPREE_FORM_ID;
  if (formId && /^[A-Za-z0-9]+$/.test(formId)) {
    ctx.waitUntil(
      fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          _subject: `[AFTERLINE] 새 상담 신청 · ${clean.service} · ${clean.concern}`,
          전화번호: formatPhone(phone),
          ...Object.fromEntries(FIELDS.filter((f) => clean[f.name] !== undefined).map((f) => [f.label, show(clean[f.name])])),
        }),
      }).catch(() => {})
    );
  }

  return json({ ok: true });
}

// 항목별 검증: 선택지는 목록 안의 값만, 글은 길이 제한, 필수 항목은 비어 있으면 거절.
function cleanFields(d) {
  const out = {};
  for (const f of FIELDS) {
    let v = d[f.name];
    if (f.showIf) {
      const [[key, vals]] = Object.entries(f.showIf);
      if (!vals.includes(d[key])) v = undefined;
    }
    if (f.type === "checkbox") {
      const arr = Array.isArray(v) ? v.filter((x) => f.options.includes(x)) : [];
      if (arr.length) out[f.name] = [...new Set(arr)];
    } else if (f.type === "radio" || f.type === "select") {
      if (f.options.includes(v)) out[f.name] = v;
    } else {
      const t = String(v ?? "").trim().slice(0, f.max || 500);
      if (t) out[f.name] = t;
    }
    if (f.required && out[f.name] === undefined) return null;
  }
  return out;
}

function show(v) {
  return Array.isArray(v) ? v.join(", ") : String(v);
}

// ── 관리자 ─────────────────────────────────────────

async function authorized(request, env) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return false;
  let pass = "";
  try {
    pass = atob(header.slice(6)).split(":").slice(1).join(":");
  } catch {
    return false;
  }
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(pass)),
    crypto.subtle.digest("SHA-256", enc.encode(env.ADMIN_PASSWORD)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// D1의 UTC 시각("YYYY-MM-DD HH:MM:SS")을 한국 시간으로
function toKst(utc) {
  const t = new Date(utc.replace(" ", "T") + "Z");
  if (isNaN(t)) return utc;
  return new Date(t.getTime() + 9 * 3600e3).toISOString().slice(0, 16).replace("T", " ");
}

function detailList(r) {
  let d = {};
  try { d = JSON.parse(r.details || "{}"); } catch {}
  const rows = FIELDS.filter((f) => !CORE.includes(f.name) && d[f.name] !== undefined)
    .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(show(d[f.name]))}</dd></div>`).join("");
  const memo = r.memo ? `<p class="memo-text">${esc(r.memo)}</p>` : "";
  return (rows ? `<dl class="details">${rows}</dl>` : "") + memo;
}

function formatPhone(p) {
  if (p.length === 11) return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
  if (p.length === 10) return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  return p;
}

async function admin(request, env, url) {
  const html = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" };
  if (!env.ADMIN_PASSWORD) {
    return new Response("ADMIN_PASSWORD 시크릿이 설정되지 않았습니다.", { status: 503, headers: html });
  }
  if (!(await authorized(request, env))) {
    return new Response("로그인이 필요합니다.", {
      status: 401,
      headers: { ...html, "www-authenticate": 'Basic realm="AFTERLINE admin", charset="UTF-8"' },
    });
  }

  if (request.method === "POST" && url.pathname === "/admin/status") {
    const form = await request.formData();
    const id = Number(form.get("id"));
    const status = String(form.get("status"));
    if (Number.isInteger(id) && STATUS.includes(status)) {
      await env.DB.prepare("UPDATE applications SET status = ? WHERE id = ?").bind(status, id).run();
    }
    return Response.redirect(new URL("/admin", url).toString(), 303);
  }

  const filter = STATUS.includes(url.searchParams.get("status")) ? url.searchParams.get("status") : null;
  const stmt = filter
    ? env.DB.prepare("SELECT * FROM applications WHERE status = ? ORDER BY created_at DESC LIMIT 300").bind(filter)
    : env.DB.prepare("SELECT * FROM applications ORDER BY created_at DESC LIMIT 300");
  const { results } = await stmt.all();

  const rows = results.map((r) => `
      <tr>
        <td class="num">${r.id}</td>
        <td class="num">${esc(toKst(r.created_at))}</td>
        <td class="phone">${esc(formatPhone(r.phone))}</td>
        <td>${esc(r.service)}<br><span class="muted">${esc(r.breakup)} · ${esc(r.state)}</span></td>
        <td class="memo">${detailList(r)}</td>
        <td>
          <form method="post" action="/admin/status">
            <input type="hidden" name="id" value="${r.id}">
            <select name="status" aria-label="${r.id}번 상태" onchange="this.form.submit()">
              ${STATUS.map((s) => `<option${s === r.status ? " selected" : ""}>${s}</option>`).join("")}
            </select>
          </form>
        </td>
      </tr>`).join("");

  const tabs = [null, ...STATUS].map((s) => {
    const href = s ? `/admin?status=${encodeURIComponent(s)}` : "/admin";
    return `<a href="${href}"${s === filter ? ' aria-current="page"' : ""}>${s || "전체"}</a>`;
  }).join("");

  return new Response(`<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>신청 목록 | AFTERLINE</title>
<style>
  :root { --bg:#F7F4EF; --fg:#222222; --muted:#65615B; --line:#DCD5CA; --surface:#fff; color-scheme: light; }
  body { margin:0; padding:24px 16px 48px; background:var(--bg); color:var(--fg); font:15px/1.6 system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
  h1 { font-size:22px; margin:0 0 4px; }
  .muted { color:var(--muted); font-size:13px; }
  nav { display:flex; flex-wrap:wrap; gap:6px; margin:16px 0; }
  nav a { padding:6px 12px; border:1px solid var(--line); border-radius:2px; text-decoration:none; color:var(--fg); background:var(--surface); }
  nav a[aria-current] { border-color:var(--fg); font-weight:600; }
  .table { overflow-x:auto; background:var(--surface); border:1px solid var(--line); }
  table { border-collapse:collapse; width:100%; min-width:760px; }
  th, td { text-align:left; vertical-align:top; padding:10px 12px; border-bottom:1px solid var(--line); }
  th { font-size:13px; color:var(--muted); font-weight:500; }
  .num, .phone { font-variant-numeric: tabular-nums; white-space:nowrap; }
  .memo { min-width:320px; max-width:480px; }
  .details { margin:0; display:grid; gap:4px; font-size:13px; }
  .details div { display:grid; grid-template-columns:150px 1fr; gap:8px; }
  .details dt { color:var(--muted); }
  .details dd { margin:0; }
  .memo-text { white-space:pre-wrap; margin:10px 0 0; padding-top:8px; border-top:1px solid var(--line); }
  select { font:inherit; padding:4px 6px; }
</style></head>
<body>
  <h1>신청 목록</h1>
  <p class="muted">최근 300건 · 한국 시간</p>
  <nav aria-label="상태별 보기">${tabs}</nav>
  <div class="table"><table>
    <thead><tr><th>#</th><th>접수</th><th>전화번호</th><th>상담 / 상황</th><th>상세</th><th>상태</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="muted">아직 신청이 없습니다.</td></tr>'}</tbody>
  </table></div>
</body></html>`, { headers: html });
}
