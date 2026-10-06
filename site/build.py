"""AFTERLINE 정적 페이지 생성기.

`python3 build.py`를 실행하면 아래 파일을 다시 만듭니다.
- column/index.html, column/*.html   (원고: columns_data.py, articles_data.py)
- privacy.html, terms.html, 404.html (원고: legal_data.py)
- sitemap.xml, robots.txt, _redirects

index.html은 직접 편집하는 파일이라 여기서 만들지 않습니다.
"""
import shutil
from html import escape
from pathlib import Path

from columns_data import ALL as COLUMNS, CATEGORIES
from legal_data import PRIVACY, TERMS

ROOT = Path(__file__).parent
DOMAIN = "https://afterline.site"
CAT = dict(CATEGORIES)

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' fill='%2317202B'/%3E%3Ctext x='32' y='44' text-anchor='middle' "
           "font-family='Georgia,serif' font-size='34' fill='%23F6F3EE'%3EA%3C/text%3E%3C/svg%3E")
FONTS = """<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Noto+Serif+KR:wght@300;400&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">"""


def head(title, desc, p, path, active="", image=None, robots=None):
    meta = f'<meta name="robots" content="{robots}">' if robots else f'<link rel="canonical" href="{DOMAIN}/{path}">'
    og_img = f'\n<meta property="og:image" content="{DOMAIN}/{image}">' if image else ""
    cur = lambda k: ' aria-current="page"' if k == active else ""  # noqa: E731
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
{meta}
<meta property="og:type" content="article">
<meta property="og:site_name" content="AFTERLINE">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">{og_img}
<link rel="icon" href="{FAVICON}">
{FONTS}
<link rel="stylesheet" href="{p}styles.css">
</head>
<body>

<header class="site-header" id="site-header">
  <div class="wrap">
    <a class="wordmark" href="{p}index.html" aria-label="AFTERLINE 홈">AFTERLINE</a>
    <nav class="nav" aria-label="주요 메뉴">
      <a href="{p}index.html#services">Consultation</a>
      <a href="{p}index.html#approach">Approach</a>
      <a href="{p}index.html#cases">Cases</a>
      <a href="{p}column/index.html"{cur("column")}>Column</a>
      <a href="{p}index.html#faq">FAQ</a>
      <a class="btn btn-primary" href="{p}index.html#apply">상담 시작하기</a>
    </nav>
    <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav">Menu</button>
  </div>
  <nav class="mobile-nav" id="mobile-nav" hidden aria-label="모바일 메뉴">
    <div class="wrap">
      <ul>
        <li><a href="{p}index.html#services">Consultation <span>상담 서비스</span></a></li>
        <li><a href="{p}index.html#approach">Approach <span>분석 기준</span></a></li>
        <li><a href="{p}index.html#cases">Cases <span>상담 사례</span></a></li>
        <li><a href="{p}column/index.html">Column <span>칼럼</span></a></li>
        <li><a href="{p}index.html#faq">FAQ <span>자주 묻는 질문</span></a></li>
        <li><a href="{p}index.html#apply">Contact <span>상담 시작하기</span></a></li>
      </ul>
    </div>
  </nav>
</header>
"""


def foot(p, extra_js=""):
    return f"""
<footer>
  <div class="wrap">
    <div class="top">
      <div>
        <a class="wordmark" href="{p}index.html">AFTERLINE</a>
        <p class="tag">Relationship Advisory</p>
      </div>
      <ul>
        <li><a href="{p}index.html#services">Consultation</a></li>
        <li><a href="{p}index.html#approach">Approach</a></li>
        <li><a href="{p}column/index.html">Column</a></li>
        <li><a href="{p}privacy.html">개인정보처리방침</a></li>
        <li><a href="{p}terms.html">이용약관 및 환불 규정</a></li>
      </ul>
    </div>
    <div class="legal">
      <p>AFTERLINE은 재회를 보장하지 않으며, 상대의 차단과 거절 의사를 존중합니다.</p>
      <p>[상호] · [대표자] · [사업자등록번호] · [통신판매업 신고번호] · [문의 연락처]</p>
    </div>
  </div>
</footer>

<div class="bottom-bar" id="bottom-bar">
  <a href="{p}index.html#apply">상담 시작하기 <span class="arr" aria-hidden="true">→</span></a>
</div>

<script>
(function () {{
  var b = document.getElementById('menu-btn'), n = document.getElementById('mobile-nav');
  function set(open) {{ n.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Close' : 'Menu'; }}
  b.addEventListener('click', function () {{ set(n.hidden); }});
  n.addEventListener('click', function (e) {{ if (e.target.closest('a')) set(false); }});
  var h = document.getElementById('site-header');
  function s() {{ h.classList.toggle('scrolled', window.scrollY > 8); }}
  window.addEventListener('scroll', s, {{ passive: true }}); s();
{extra_js}}})();
</script>
</body>
</html>
"""


def ul(items):
    return "<ul>" + "".join(f"<li>{escape(i)}</li>" for i in items) + "</ul>"


def pair_side(title, content):
    inner = ul(content) if isinstance(content, list) else f"<p>{escape(content)}</p>"
    return f"<div><b>{escape(title)}</b>{inner}</div>"


def render(block):
    kind = block[0]
    if kind == "p":
        return f"<p>{escape(block[1])}</p>"
    if kind == "h2":
        return f"<h2>{escape(block[1])}</h2>"
    if kind == "quote":
        return f"<blockquote>{escape(block[1])}</blockquote>"
    if kind == "list":
        return ul(block[1])
    if kind == "pair":
        return f'<div class="pair">{pair_side(*block[1])}{pair_side(*block[2])}</div>'
    if kind == "steps":
        return '<ol class="steps">' + "".join(f"<li><b>{escape(q)}</b><span>{escape(a)}</span></li>" for q, a in block[1]) + "</ol>"
    if kind == "rows":
        return '<dl class="rows">' + "".join(f"<div><dt>{escape(k)}</dt><dd>{escape(v)}</dd></div>" for k, v in block[1]) + "</dl>"
    raise ValueError(kind)


def list_item(c, photo=False):
    img = ""
    if photo and c["image"]:
        img = f'<figure class="photo"><img src="../{c["image"]}" alt="" loading="lazy"></figure>'
    cls = ' class="with-photo"' if img else ""
    return (f'<li{cls} data-cat="{c["cat"]}"><a href="{c["slug"]}.html">'
            f'<span class="meta"><span class="col-cat">{escape(CAT[c["cat"]])}</span></span>'
            f'<span><h3>{escape(c["title"])}</h3><p>{escape(c["lead"])}</p></span>{img}</a></li>')


def column_page(c):
    same = [o for o in COLUMNS if o["cat"] == c["cat"] and o is not c][:2]
    others = [o for o in COLUMNS if o["cat"] != c["cat"]]
    related = same + [others[COLUMNS.index(c) % len(others)]]
    rel = "\n".join(list_item(o) for o in related[:3])
    photo = ""
    if c["image"]:
        photo = f"""
  <div class="article-photo"><div class="wrap"><figure class="photo"><img src="../{c["image"]}" alt="" fetchpriority="high"></figure></div></div>"""
    body = "\n        ".join(render(b) for b in c["body"])
    html = f"""
<main>
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="index.html">Column</a><span aria-hidden="true">/</span><a href="index.html#{c["cat"]}">{escape(CAT[c["cat"]])}</a></p>
      <h1>{escape(c["title"])}</h1>
      <p class="lead">{escape(c["lead"])}</p>
    </div>
  </section>{photo}
  <section class="article-body">
    <div class="wrap">
      <article class="prose">
        {body}
      </article>
      <div class="article-end">
        <p>{escape(c["end"])}</p>
        <a class="btn btn-primary" href="../index.html#apply">상담 시작하기 <span class="arr" aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>
  <section class="related" aria-labelledby="related-title">
    <div class="wrap">
      <h2 id="related-title">More Column</h2>
      <ul class="col-list">
{rel}
      </ul>
      <div><a class="link-u" href="index.html">Column 전체 보기</a></div>
    </div>
  </section>
</main>
"""
    title = f'{escape(c["title"])} | AFTERLINE Column'
    return head(title, escape(c["lead"]), "../", f'column/{c["slug"]}.html', "column", c["image"]) + html + foot("../")


FILTER_JS = """
  var btns = document.querySelectorAll('.filters button'), items = document.querySelectorAll('.col-list li'), empty = document.getElementById('empty');
  function apply(cat) {
    var shown = 0;
    btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.cat === cat)); });
    items.forEach(function (li) { var ok = cat === 'all' || li.dataset.cat === cat; li.hidden = !ok; if (ok) shown++; });
    empty.hidden = shown > 0;
  }
  btns.forEach(function (x) { x.addEventListener('click', function () {
    apply(x.dataset.cat);
    try { history.replaceState(null, '', x.dataset.cat === 'all' ? location.pathname : '#' + x.dataset.cat); } catch (e) {}
  }); });
  var start = location.hash.slice(1);
  apply(document.querySelector('.filters button[data-cat="' + start + '"]') ? start : 'all');
"""


def column_index():
    buttons = '<li><button type="button" data-cat="all" aria-pressed="true">ALL</button></li>' + "".join(
        f'<li><button type="button" data-cat="{k}" aria-pressed="false">{escape(n)}</button></li>' for k, n in CATEGORIES)
    items = "\n".join(list_item(c, photo=(i == 0)) for i, c in enumerate(COLUMNS))
    html = f"""
<main>
  <section class="page-head">
    <div class="wrap">
      <span class="eyebrow">Afterline Column</span>
      <h1 class="en-title">Column</h1>
      <p class="lead">이별 이후 자주 마주치는 장면을 하나씩 기록합니다. 한 편의 글은 하나의 상황만 다룹니다.</p>
    </div>
  </section>
  <section class="article-body" style="padding-top:0">
    <div class="wrap">
      <ul class="filters" aria-label="카테고리">{buttons}</ul>
      <ul class="col-list">
{items}
      </ul>
      <p class="empty" id="empty" hidden>이 카테고리의 글을 준비하고 있습니다.</p>
    </div>
  </section>
</main>
"""
    return head("Column | AFTERLINE", "이별 이후 자주 마주치는 장면을 하나씩 기록하는 AFTERLINE의 칼럼입니다.",
                "../", "column/index.html", "column", "images/city-night.jpg") + html + foot("../", FILTER_JS)


def doc_page(path, title, lead, sections):
    parts = []
    for h, items in sections:
        inner = "".join(f"<p>{i}</p>" if isinstance(i, str) else ul(i[1]) for i in items)
        parts.append(f"<h2>{h}</h2>{inner}")
    html = f"""
<main>
  <!-- 초안입니다. 게시 전에 [ ] 항목을 채우고 전문가 검토를 받으세요. -->
  <section class="page-head">
    <div class="wrap">
      <p class="crumbs"><a href="index.html">AFTERLINE</a><span aria-hidden="true">/</span><span>{title}</span></p>
      <h1>{title}</h1>
      <p class="lead">{lead}</p>
    </div>
  </section>
  <section class="article-body" style="padding-top:0">
    <div class="wrap">
      <article class="prose doc">
        {"".join(parts)}
      </article>
    </div>
  </section>
</main>
"""
    return head(f"{title} | AFTERLINE", lead, "", path) + html + foot("")


def not_found_page():
    html = """
<main>
  <section class="nf">
    <div class="wrap">
      <span class="eyebrow">404</span>
      <h1>찾으시는 페이지가 없습니다.</h1>
      <p class="muted">주소가 바뀌었거나 삭제된 페이지입니다.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="/index.html#apply">상담 시작하기</a>
        <a class="btn btn-ghost" href="/column/index.html">Column 보기</a>
      </div>
    </div>
  </section>
</main>
"""
    return head("페이지를 찾을 수 없습니다 | AFTERLINE", "요청하신 페이지를 찾을 수 없습니다.", "/", "404.html", robots="noindex") + html + foot("/")


def sitemap():
    urls = ["", "column/index.html", "privacy.html", "terms.html"] + [f'column/{c["slug"]}.html' for c in COLUMNS]
    rows = "\n".join(f"  <url><loc>{DOMAIN}/{u}</loc></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n'


REDIRECTS = """# 이전 아티클 주소 → Column
/articles/message-at-2am /column/long-message-next-day 301
/articles/message-at-2am.html /column/long-message-next-day 301
/articles/index.html /column/ 301
/articles/ /column/ 301
/articles /column/ 301
/articles/* /column/:splat 301
"""

if __name__ == "__main__":
    out = ROOT / "column"
    out.mkdir(exist_ok=True)
    for c in COLUMNS:
        (out / f'{c["slug"]}.html').write_text(column_page(c), encoding="utf-8")
    (out / "index.html").write_text(column_index(), encoding="utf-8")
    shutil.rmtree(ROOT / "articles", ignore_errors=True)
    (ROOT / "privacy.html").write_text(doc_page(
        "privacy.html", "개인정보처리방침", "AFTERLINE은 상담 신청과 진행에 필요한 최소한의 개인정보만 처리합니다.", PRIVACY), encoding="utf-8")
    (ROOT / "terms.html").write_text(doc_page(
        "terms.html", "이용약관 및 환불 규정", "상담 신청부터 결제, 일정 변경, 환불까지의 기준입니다.", TERMS), encoding="utf-8")
    (ROOT / "404.html").write_text(not_found_page(), encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(sitemap(), encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: {DOMAIN}/sitemap.xml\n", encoding="utf-8")
    (ROOT / "_redirects").write_text(REDIRECTS, encoding="utf-8")
    print(f"wrote {len(COLUMNS)} columns, column index, privacy, terms, 404, sitemap, robots, _redirects")
