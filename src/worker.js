// Afterline Worker
// - /api/apply : 상담 신청서 접수 (D1 저장)
// - /admin     : 신청 목록 확인과 상태 변경 (비밀번호: ADMIN_PASSWORD 시크릿)
// - 그 밖의 경로: site/ 정적 파일

const BREAKUP = ["1주 이내", "1주~1개월", "1~3개월", "3개월 이상", "재회 후 상담 (해당 없음)"];
const STATE = ["연락 중", "답장 없음", "차단", "재회 후"];
const SERVICE = ["이별 직후 상담", "카톡 분석 상담", "재회 전략 상담", "재회 후 상담", "잘 모르겠음"];
const STATUS = ["접수", "입금 대기", "일정 확정", "상담 완료", "취소"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/apply") return apply(request, env);
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

async function apply(request, env) {
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
  const memo = String(d.memo || "").trim().slice(0, 1000);
  const valid =
    BREAKUP.includes(d.when) &&
    STATE.includes(d.state) &&
    SERVICE.includes(d.service) &&
    phone.length >= 9 && phone.length <= 12 &&
    d.consent === true;
  if (!valid) return json({ ok: false, error: "invalid" }, 400);

  await env.DB.prepare(
    "INSERT INTO applications (phone, breakup, state, service, memo) VALUES (?, ?, ?, ?, ?)"
  ).bind(phone, d.when, d.state, d.service, memo || null).run();

  return json({ ok: true });
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
      headers: { ...html, "www-authenticate": 'Basic realm="Afterline admin", charset="UTF-8"' },
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
        <td class="num">${esc(r.created_at)}</td>
        <td class="phone">${esc(formatPhone(r.phone))}</td>
        <td>${esc(r.service)}<br><span class="muted">${esc(r.breakup)} · ${esc(r.state)}</span></td>
        <td class="memo">${esc(r.memo || "")}</td>
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
<meta name="robots" content="noindex"><title>신청 목록 | Afterline</title>
<style>
  :root { --bg:#ECEFEB; --fg:#2A2A2A; --muted:#626862; --line:#D2D8D0; --surface:#fff; color-scheme: light; }
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
  .memo { max-width:320px; white-space:pre-wrap; }
  select { font:inherit; padding:4px 6px; }
</style></head>
<body>
  <h1>신청 목록</h1>
  <p class="muted">최근 300건 · 시간은 UTC 기준(한국 시간 +9시간)</p>
  <nav aria-label="상태별 보기">${tabs}</nav>
  <div class="table"><table>
    <thead><tr><th>#</th><th>접수</th><th>전화번호</th><th>상담 / 상황</th><th>메모</th><th>상태</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6" class="muted">아직 신청이 없습니다.</td></tr>'}</tbody>
  </table></div>
</body></html>`, { headers: html });
}
