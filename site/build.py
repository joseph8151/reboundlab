"""AFTERLINE 정적 페이지 생성기.

`python3 build.py`를 실행하면 아래 파일을 다시 만듭니다.
- column/index.html, column/*.html   (원고: columns_data.py, articles_data.py)
- privacy.html, terms.html, 404.html (원고: legal_data.py)
- sitemap.xml, robots.txt, _redirects
- index.html의 상담 신청서 항목 (FORM:START~FORM:END 사이, 원본: src/form_fields.json)

index.html의 나머지 부분은 직접 편집합니다.
"""
import json
import re
import shutil
from html import escape
from pathlib import Path

from columns_data import ALL as COLUMNS, CATEGORIES
from legal_data import PRIVACY, TERMS
import guide_data as G

ROOT = Path(__file__).parent
DOMAIN = "https://www.afterline.site"
CAT = dict(CATEGORIES)

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
           "%3Crect width='64' height='64' fill='%2317202B'/%3E%3Ctext x='32' y='44' text-anchor='middle' "
           "font-family='Georgia,serif' font-size='34' fill='%23F6F3EE'%3EA%3C/text%3E%3C/svg%3E")


# 검색 키워드: 화면에 나열하지 않고 제목, 설명, 구조화 데이터에만 자연스럽게 씁니다.
CAT_KW = {
    "block": ("차단 후 재회", ["차단 후 재회", "카톡 차단 재회", "차단 해제 후 연락", "차단 풀렸는데 연락 없음", "인스타 차단 재회"]),
    "contact": ("이별 후 연락", ["이별 후 연락", "헤어진 후 연락", "먼저 연락해도 될까", "전남친 연락", "전여친 연락"]),
    "gap": ("재회 공백기", ["재회 공백기", "공백기 기간", "재회 한달 공백기", "헤어진 후 기다리기", "공백기 연락"]),
    "last-talk": ("마지막 카톡 분석", ["마지막 카톡 분석", "이별 마지막 대화", "카톡 답장 분석", "이별 카톡 분석", "읽씹 재회"]),
    "sns": ("SNS와 재회 신호", ["인스타 스토리 재회", "전남친 스토리 보는 이유", "전여친 스토리 보는 이유", "재회 신호", "SNS 재회"]),
    "reconnect": ("재접촉 시기", ["재접촉 시기", "재회 첫 연락", "재회 첫 메시지", "헤어진 후 첫 연락", "재접촉 방법"]),
    "repeat": ("반복 이별과 재회", ["반복 이별", "반복 재회", "세번째 재회", "헤어졌다 다시 만남", "재회 후 다시 이별"]),
    "after-reunion": ("재회 후 관계", ["재회 후 관계", "재회 후 관계 회복", "재회 후 같은 문제", "재회 후 연락 문제", "재회 후 상담"]),
    "first-days": ("이별 직후 행동", ["이별 직후 행동", "헤어진 직후 해야 할 일", "이별 직후 연락 금지", "이별 후 매달림", "이별 후 사과"]),
}
BRAND_KW = ["애프터라인", "AFTERLINE", "재회상담", "이별상담"]
TODAY = __import__("datetime").date.today().isoformat()
ORG = {"@type": "ProfessionalService", "@id": "https://www.afterline.site/#org", "name": "AFTERLINE",
       "alternateName": ["애프터라인", "애프터라인 재회상담"], "url": "https://www.afterline.site/"}


def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False).replace("</", "<\\/") + "</script>"


def head(title, desc, p, path, active="", image=None, robots=None, keywords=None, jsonld=None):
    meta = f'<meta name="robots" content="{robots}">' if robots else f'<link rel="canonical" href="{DOMAIN}/{path}">'
    if keywords:
        meta += f'\n<meta name="keywords" content="{escape(", ".join(keywords))}">'
    if jsonld:
        meta += "\n" + "\n".join(ld(x) for x in jsonld)
    og_img = f'\n<meta property="og:image" content="{DOMAIN}/{image or "images/hero.webp"}">\n<meta name="twitter:card" content="summary_large_image">' 
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
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="AFTERLINE 애프터라인">
<meta property="og:url" content="{DOMAIN}/{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">{og_img}
<link rel="icon" href="{FAVICON}">
<link rel="preload" href="{p}fonts/pretendard-subset.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{p}fonts/fonts.css">
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
      <a href="{p}check/index.html"{cur("check")}>Check</a>
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
        <li><a href="{p}check/index.html">Check <span>재회 가능성 진단</span></a></li>
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
        <li><a href="{p}guide/index.html">재회상담 안내</a></li>
        <li><a href="{p}privacy.html">개인정보처리방침</a></li>
        <li><a href="{p}terms.html">이용약관 및 환불 규정</a></li>
      </ul>
    </div>
    <div class="legal">
      <p>애프터라인(AFTERLINE)은 재회상담, 이별상담, 재접촉 상담, 카톡 대화 분석을 전화로 진행하는 관계 컨설팅입니다.</p>
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
    kw_label, kws = CAT_KW[c["cat"]]
    title = f'{escape(c["title"])} | {kw_label} · AFTERLINE'
    url = f'{DOMAIN}/column/{c["slug"]}.html'
    article = {"@context": "https://schema.org", "@type": "Article", "headline": c["title"], "description": c["lead"],
               "keywords": ", ".join(kws), "articleSection": CAT[c["cat"]], "inLanguage": "ko-KR",
               "mainEntityOfPage": url, "image": f"{DOMAIN}/images/hero.webp",
               "author": {"@type": "Organization", "name": "AFTERLINE"},
               "publisher": {"@type": "Organization", "name": "AFTERLINE", "alternateName": "애프터라인"},
               "dateModified": TODAY}
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "AFTERLINE", "item": f"{DOMAIN}/"},
        {"@type": "ListItem", "position": 2, "name": "Column", "item": f"{DOMAIN}/column/index.html"},
        {"@type": "ListItem", "position": 3, "name": c["title"], "item": url}]}
    return head(title, escape(c["lead"]), "../", f'column/{c["slug"]}.html', "column", c["image"],
                keywords=kws + ["재회상담", "애프터라인"], jsonld=[article, crumbs]) + html + foot("../")


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
    return head("재회·이별 칼럼 | AFTERLINE Column", "차단 후 재회, 이별 후 연락, 재회 공백기, 마지막 카톡 분석처럼 이별 이후 자주 마주치는 장면을 하나씩 기록하는 애프터라인(AFTERLINE)의 칼럼입니다.",
                "../", "column/index.html", "column", "images/hero.webp",
                keywords=["재회 칼럼", "이별 후 연락", "차단 후 재회", "재회 공백기", "카톡 분석", "전남친 재회", "전여친 재회", "애프터라인"]) + html + foot("../", FILTER_JS)


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


def guide_page():
    body = "\n        ".join(render(x) for x in G.BODY)
    faq = "".join(f'<details><summary>{escape(q)}</summary><p class="answer">{escape(a)}</p></details>' for q, a in G.FAQ)
    html = f"""
<main>
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="../index.html">AFTERLINE</a><span aria-hidden="true">/</span><span>재회상담 안내</span></p>
      <h1>{escape(G.TITLE)}</h1>
      <p class="lead">{escape(G.LEAD)}</p>
    </div>
  </section>
  <section class="article-body">
    <div class="wrap">
      <article class="prose">
        {body}
        <h2>자주 묻는 질문</h2>
        <div class="faq">{faq}</div>
      </article>
      <div class="article-end">
        <p>지금 필요한 건 더 많은 연락이 아니라, 다음 행동을 정하는 일일 수 있습니다.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="../index.html#apply">상담 시작하기 <span class="arr" aria-hidden="true">→</span></a>
          <a class="btn btn-ghost" href="../check/index.html">재회 가능성 진단</a>
        </div>
      </div>
    </div>
  </section>
</main>
"""
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in G.FAQ]}
    service = {"@context": "https://schema.org", "@type": "Service", "name": "재회상담 · 이별상담",
               "serviceType": ["재회상담", "이별상담", "재접촉 상담", "카톡 대화 분석", "재회 후 관계 상담"],
               "provider": ORG, "areaServed": "KR", "availableChannel": {"@type": "ServiceChannel", "name": "전화상담"},
               "description": G.META_DESC}
    return head(G.META_TITLE, G.META_DESC, "../", "guide/index.html", "", "images/hero.webp",
                keywords=G.KEYWORDS, jsonld=[service, faq_ld]) + html + foot("../")


def check_page():
    cols = {c["slug"]: [c["title"], CAT[c["cat"]]] for c in COLUMNS}
    data = json.dumps(cols, ensure_ascii=False).replace("</", "<\\/")
    html = f"""
<main>
  <section class="check-wrap">
    <div class="wrap">
      <div id="check-app" class="check-app" aria-live="polite">
        <noscript><p>재회 가능성 진단은 자바스크립트를 켜야 이용할 수 있습니다.</p></noscript>
      </div>
    </div>
  </section>
</main>
<script type="application/json" id="col-data">{data}</script>
<script src="check.js" defer></script>
"""
    app = {"@context": "https://schema.org", "@type": "WebApplication", "name": "재회 가능성 진단", "alternateName": "Relationship Status Check",
           "applicationCategory": "LifestyleApplication", "operatingSystem": "Web", "inLanguage": "ko-KR",
           "url": f"{DOMAIN}/check/index.html", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "KRW"},
           "provider": {"@type": "Organization", "name": "AFTERLINE"}}
    page = head("재회 가능성 진단 · 무료 자가진단 | AFTERLINE 애프터라인", "28개 질문으로 이별 원인, 마지막 대화, 차단 여부, 이별 후 연락 흐름을 보고 현재 재접촉 여건을 정리하는 무료 자가진단입니다. 재회 확률 예측이 아닌 참고 지표이며, 개인정보 없이 진행합니다.",
                "../", "check/index.html", "check", "images/hero.webp",
                keywords=["재회 가능성 진단", "재회 가능성 테스트", "재회 가능성", "재회 가능할까", "다시 만날 가능성", "재접촉 시기", "연락할지 기다릴지", "애프터라인"],
                jsonld=[app]) + html + foot("../")
    # 진단 화면에서는 하단 고정 상담 버튼을 숨깁니다(진행 버튼과 겹치지 않도록).
    return page.replace('<div class="bottom-bar" id="bottom-bar">', '<div class="bottom-bar" id="bottom-bar" hidden>')


def sitemap():
    urls = ["", "guide/index.html", "check/index.html", "column/index.html", "privacy.html", "terms.html"] + [f'column/{c["slug"]}.html' for c in COLUMNS]
    rows = "\n".join(f"  <url><loc>{DOMAIN}/{u}</loc><lastmod>{TODAY}</lastmod></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n'


FORM_SPEC = ROOT.parent / "src" / "form_fields.json"
REQ = ' <span class="req-mark" aria-hidden="true">*</span>'


def form_field(f):
    name, label, kind = f["name"], escape(f["label"]), f["type"]
    req = f.get("required", False)
    hint = f'<p class="hint">{escape(f["hint"])}</p>' if f.get("hint") else ""
    mark = REQ if req else ""
    cond = ""
    if f.get("showIf"):
        (key, vals), = f["showIf"].items()
        cond = f' data-show-name="{key}" data-show-values="{escape("|".join(vals))}" hidden'
    if kind in ("radio", "checkbox"):
        items = []
        for i, o in enumerate(f["options"], 1):
            r = " required" if (req and kind == "radio" and i == 1) else ""
            items.append(f'<label class="choice"><input type="{kind}" id="f-{name}-{i}" name="{name}" value="{escape(o)}"{r}><span>{escape(o)}</span></label>')
        return (f'          <fieldset class="field"{cond}>\n            <legend>{label}{mark}</legend>\n'
                f'            <div class="choices">{"".join(items)}</div>{hint}\n          </fieldset>')
    if kind == "select":
        opts = '<option value="">선택해 주세요</option>' + "".join(f"<option>{escape(o)}</option>" for o in f["options"])
        r = " required" if req else ""
        return (f'          <div class="field"{cond}>\n            <label for="f-{name}">{label}{mark}</label>\n'
                f'            <select id="f-{name}" name="{name}"{r}>{opts}</select>{hint}\n          </div>')
    ph = f' placeholder="{escape(f["placeholder"])}"' if f.get("placeholder") else ""
    mx = f' maxlength="{f["max"]}"' if f.get("max") else ""
    opt = "" if req else ' <span class="opt">(선택)</span>'
    if kind == "textarea":
        ctrl = f'<textarea id="f-{name}" name="{name}"{ph}{mx}></textarea>'
    else:
        ctrl = f'<input type="text" id="f-{name}" name="{name}"{ph}{mx}>'
    return (f'          <div class="field"{cond}>\n            <label for="f-{name}">{label}{mark}{opt}</label>\n'
            f'            {ctrl}{hint}\n          </div>')


def form_html():
    spec = json.loads(FORM_SPEC.read_text(encoding="utf-8"))
    out = []
    for n, sec in enumerate(spec["sections"], 1):
        fields = "\n".join(form_field(f) for f in sec["fields"])
        out.append(f'          <div class="form-section">\n            <p class="form-step"><span>{n:02d}</span>{escape(sec["title"])}</p>\n{fields}\n          </div>')
    return "\n".join(out)


def inject_form():
    page = ROOT / "index.html"
    s = page.read_text(encoding="utf-8")
    s = re.sub(r"(<!-- FORM:START[^>]*-->\n).*?(<!-- FORM:END -->)",
               lambda m: m.group(1) + form_html() + "\n" + m.group(2), s, flags=re.S)
    page.write_text(s, encoding="utf-8")


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
    (ROOT / "guide").mkdir(exist_ok=True)
    (ROOT / "guide" / "index.html").write_text(guide_page(), encoding="utf-8")
    (ROOT / "check").mkdir(exist_ok=True)
    (ROOT / "check" / "index.html").write_text(check_page(), encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(sitemap(), encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: {DOMAIN}/sitemap.xml\n", encoding="utf-8")
    (ROOT / "_redirects").write_text(REDIRECTS, encoding="utf-8")
    inject_form()
    print(f"wrote {len(COLUMNS)} columns, column index, privacy, terms, 404, sitemap, robots, _redirects, form")
