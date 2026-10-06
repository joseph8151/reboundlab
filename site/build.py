"""Afterline 정적 페이지 생성기.

`python3 build.py`를 실행하면 아래 파일을 다시 만듭니다.
- articles/*.html, articles/index.html  (원고: articles_data.py)
- privacy.html, terms.html, 404.html
- sitemap.xml, robots.txt

index.html은 직접 편집하는 파일이라 여기서 만들지 않습니다.
"""
from html import escape
from pathlib import Path

from articles_data import ARTICLES, CATEGORIES

ROOT = Path(__file__).parent
# 도메인이 정해지면 바꿉니다. sitemap.xml과 canonical 주소에 쓰입니다.
DOMAIN = "https://afterline.example"

CAT_NAME = dict(CATEGORIES)
FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E"
    "%3Crect width='64' height='64' fill='%231E2A44'/%3E"
    "%3Ctext x='32' y='45' text-anchor='middle' font-family='Georgia,serif' font-size='38' fill='%23ECEFEB'%3EA%3C/text%3E"
    "%3C/svg%3E"
)


def head(title, desc, prefix, path):
    return f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{DOMAIN}/{path}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Afterline">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="icon" href="{FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600&display=swap">
<link rel="stylesheet" href="{prefix}styles.css">
</head>
<body>

<header class="site-header">
  <div class="wrap">
    <a class="wordmark" href="{prefix}index.html">Afterline</a>
    <nav class="nav" aria-label="주요 메뉴">
      <a href="{prefix}index.html#services">상담 안내</a>
      <a href="{prefix}index.html#process">진행 방식</a>
      <a href="{prefix}index.html#cases">상담 예시</a>
      <a href="{prefix}articles/index.html">아티클</a>
      <a class="btn btn-primary" href="{prefix}index.html#apply">상담 시작하기</a>
    </nav>
    <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav">메뉴</button>
  </div>
  <nav class="mobile-nav wrap" id="mobile-nav" hidden aria-label="모바일 메뉴">
    <ul>
      <li><a href="{prefix}index.html#services">상담 안내</a></li>
      <li><a href="{prefix}index.html#process">진행 방식</a></li>
      <li><a href="{prefix}index.html#cases">상담 예시</a></li>
      <li><a href="{prefix}index.html#faq">자주 묻는 질문</a></li>
      <li><a href="{prefix}articles/index.html">아티클</a></li>
    </ul>
  </nav>
</header>
"""


def foot(prefix):
    return f"""
<footer>
  <div class="wrap">
    <a class="wordmark" href="{prefix}index.html">Afterline</a>
    <p>이별 이후의 흐름을 봅니다.</p>
    <ul>
      <li><a href="{prefix}index.html#services">상담 안내</a></li>
      <li><a href="{prefix}articles/index.html">아티클</a></li>
      <li><a href="{prefix}privacy.html">개인정보처리방침</a></li>
      <li><a href="{prefix}terms.html">이용약관 및 환불 규정</a></li>
    </ul>
    <p>[상호] · [대표자] · [사업자등록번호] · [통신판매업 신고번호] · [문의 연락처]</p>
    <p>Afterline은 재회를 보장하지 않으며, 상대의 차단과 거절 의사를 존중합니다.</p>
  </div>
</footer>

<div class="bottom-bar" id="bottom-bar">
  <a class="btn btn-primary" href="{prefix}index.html#apply">상담 시작하기</a>
</div>

<script>
(function () {{
  var b = document.getElementById('menu-btn'), n = document.getElementById('mobile-nav');
  b.addEventListener('click', function () {{
    var open = n.hidden; n.hidden = !open;
    b.setAttribute('aria-expanded', String(open)); b.textContent = open ? '닫기' : '메뉴';
  }});
}})();
</script>
</body>
</html>
"""


def ul(items):
    return "<ul>\n" + "\n".join(f"          <li>{escape(i)}</li>" for i in items) + "\n        </ul>"


def article_row(a, prefix=""):
    return (f'          <li><a href="{prefix}{a["slug"]}.html"><span class="cat">{escape(CAT_NAME[a["cat"]])}</span>'
            f'<span class="t">{escape(a["title"])}</span></a></li>')


def article_page(a):
    same = [o for o in ARTICLES if o["cat"] == a["cat"] and o is not a]
    idx = ARTICLES.index(a)
    other = ARTICLES[(idx + 3) % len(ARTICLES)]
    related = "\n".join(article_row(o) for o in same + ([other] if other["cat"] != a["cat"] else []))
    cat = CAT_NAME[a["cat"]]
    body = f"""
<main>
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="index.html">아티클</a><span aria-hidden="true">/</span><a href="index.html#{a["cat"]}">{escape(cat)}</a></p>
      <h1>{escape(a["title"])}</h1>
      <p class="lead">{escape(a["lead"])}</p>
    </div>
  </section>

  <section class="article-body">
    <div class="wrap">
      <article class="prose">
        <p class="scene">{escape(a["scene"])}</p>

        <h2>먼저 확인할 것</h2>
        {ul(a["check"])}
        <p>{escape(a["check_note"])}</p>

        <h2>하지 않아도 되는 것</h2>
        {ul(a["skip"])}

        <h2>다음 행동</h2>
        <blockquote>{escape(a["quote"])}</blockquote>
        {ul(a["next"])}

        <div class="article-cta">
          <p>{escape(a["cta"])}</p>
          <a class="btn btn-primary" href="../index.html#apply">상담 시작하기</a>
        </div>
      </article>
    </div>
  </section>

  <section class="related page-plain" aria-labelledby="related-title">
    <div class="wrap">
      <h2 id="related-title">다른 장면</h2>
      <ul class="articles">
{related}
      </ul>
      <div><a class="textlink" href="index.html">아티클 전체 보기</a></div>
    </div>
  </section>
</main>
"""
    title = f'{escape(a["title"])} | Afterline'
    return head(title, escape(a["lead"]), "../", f'articles/{a["slug"]}.html') + body + foot("../")


def index_page():
    groups = []
    for slug, name in CATEGORIES:
        rows = "\n".join(article_row(a) for a in ARTICLES if a["cat"] == slug)
        groups.append(f"""      <div class="cat-group" id="{slug}">
        <h2>{escape(name)}</h2>
        <ul class="articles">
{rows}
        </ul>
      </div>""")
    jump = "\n".join(f'        <li><a href="#{s}">{escape(n)}</a></li>' for s, n in CATEGORIES)
    body = f"""
<main>
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="../index.html">홈</a><span aria-hidden="true">/</span><span>아티클</span></p>
      <h1>이별 이후의 장면들</h1>
      <p class="lead">자주 마주치는 장면을 하나씩 정리합니다. 모든 글은 먼저 확인할 것, 하지 않아도 되는 것, 다음 행동 순서로 씁니다.</p>
      <ul class="cat-list" aria-label="카테고리 바로가기">
{jump}
      </ul>
    </div>
  </section>

  <section class="article-body page-plain">
    <div class="wrap">
{chr(10).join(groups)}
    </div>
  </section>
</main>
"""
    return head("아티클 | Afterline", "이별 이후 자주 마주치는 장면을 하나씩 정리한 Afterline의 아티클입니다.",
                "../", "articles/index.html") + body + foot("../")


def doc_page(path, title, lead, sections, note):
    parts = []
    for h, items in sections:
        inner = "\n".join(
            f"        <p>{i}</p>" if isinstance(i, str) else "        " + ul(i[1]) for i in items
        )
        parts.append(f"        <h2>{h}</h2>\n{inner}")
    body = f"""
<main>
  <!-- {note} -->
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="index.html">홈</a><span aria-hidden="true">/</span><span>{title}</span></p>
      <h1>{title}</h1>
      <p class="lead">{lead}</p>
    </div>
  </section>
  <section class="article-body page-plain">
    <div class="wrap">
      <article class="prose doc">
{chr(10).join(parts)}
      </article>
    </div>
  </section>
</main>
"""
    return head(f"{title} | Afterline", lead, "", path) + body + foot("")


L = lambda *items: ("list", list(items))  # noqa: E731

PRIVACY = [
    ("1. 처리하는 개인정보", [
        L("필수: 전화번호, 이별 시점, 현재 연락 상태, 원하는 상담",
          "선택: 상황 메모",
          "상담 중: 이용자가 직접 공유한 대화 내용(캡처 포함)",
          "결제 확인: 입금자명, 입금 금액, 입금 일시"),
        "카카오톡 ID 등 전화번호 외의 연락처는 받지 않습니다.",
    ]),
    ("2. 이용 목적", [
        L("상담 일정 안내와 전화 상담 진행",
          "입금 확인과 현금영수증 발행(요청 시)",
          "문의와 환불 요청 처리"),
    ]),
    ("3. 보유 기간", [
        L("상담 신청 정보: 상담 종료 후 [ ]개월",
          "상담 중 공유한 대화 자료: 상담 종료 후 [ ]일 이내 파기",
          "계약, 결제, 환불 기록: 관계 법령이 정한 기간 [전자상거래법 등 적용 기간 확인]"),
    ]),
    ("4. 제3자 제공", [
        "개인정보를 제3자에게 제공하지 않습니다. 법령에 따라 요구되는 경우는 예외로 합니다.",
    ]),
    ("5. 처리 위탁과 국외 이전", [
        L("Cloudflare, Inc.(미국): 웹사이트 운영과 상담 신청 정보 저장. 신청 정보는 아시아·태평양 지역 서버에 저장됩니다.",
          "Formspree, Inc.(미국): 새 신청을 운영자 이메일로 알리기 위해 신청 내용을 전달합니다.",
          "[문자 발송 서비스명]: 안내 문자 발송. 쓰지 않는 경우 이 줄을 삭제합니다."),
        "신청 정보는 신청서를 제출하는 시점에 위 서버로 전송되며, 보유 기간이 끝나면 파기합니다.",
    ]),
    ("6. 파기 방법", [
        "보유 기간이 끝난 정보는 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 삭제하고, 종이 문서는 분쇄합니다.",
    ]),
    ("7. 상담 대화 자료", [
        L("대화 자료는 필요한 부분만 공유하시면 됩니다.",
          "상대의 이름, 연락처, 사진은 가린 뒤 보내 주시길 권합니다.",
          "통화는 녹음하지 않습니다. [녹음 정책 확정 후 수정]"),
    ]),
    ("8. 이용자의 권리", [
        "언제든지 개인정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. [문의 연락처]로 요청하시면 지체 없이 처리합니다.",
    ]),
    ("9. 개인정보 보호책임자", [
        "성명 [ ] · 연락처 [ ]",
    ]),
    ("10. 변경 안내", [
        "이 방침을 바꾸는 경우 시행 7일 전부터 이 페이지에 알립니다. 시행일: [YYYY.MM.DD]",
    ]),
]

TERMS = [
    ("1. 서비스의 성격", [
        "Afterline은 이별 이후의 상황을 정리하고 다음 행동을 함께 정하는 전화 상담입니다.",
        L("심리 치료, 의료, 법률 상담이 아닙니다.",
          "재회 결과를 보장하지 않습니다.",
          "상대의 마음이나 의도를 단정하지 않습니다."),
    ]),
    ("2. 신청과 결제", [
        L("신청서에 전화번호와 상황을 남깁니다.",
          "남기신 번호로 금액과 입금 계좌를 문자로 안내합니다.",
          "결제는 상담 전 계좌이체로 받습니다. 입금자명은 '이름+전화번호 뒤 4자리'로 적어 주세요.",
          "입금이 확인되면 통화 일정을 확정합니다. 안내 후 [ ]시간 안에 입금이 없으면 신청이 취소됩니다.",
          "현금영수증이 필요하시면 입금 시 말씀해 주세요."),
    ]),
    ("3. 상담 진행", [
        L("약속한 시간에 [상담 전용 번호]로 전화드립니다.",
          "상담은 1회 [ ]분입니다.",
          "이용자와 [ ]분 이상 연결되지 않으면 [ ]합니다."),
    ]),
    ("4. 일정 변경과 환불", [
        L("상담 [ ]시간 전까지: 일정 변경 또는 전액 환불",
          "그 이후부터 상담 시작 전까지: [ ]",
          "상담 시작 후: [ ]",
          "Afterline의 사정으로 상담을 진행하지 못한 경우: 전액 환불"),
        "환불은 요청일로부터 [ ]영업일 안에 입금하신 계좌로 보내 드립니다.",
    ]),
    ("5. 상담에서 다루지 않는 일", [
        L("차단을 우회하는 연락 방법",
          "상대의 위치 확인, 계정 추적, 동의 없는 녹음이나 자료 수집",
          "상대를 압박하거나 속이기 위한 메시지 작성"),
        "이런 요청이 이어지면 상담을 중단할 수 있습니다. 이 경우 환불은 [ ]을 따릅니다.",
    ]),
    ("6. 안전에 관한 안내", [
        "상담 중 폭력, 스토킹, 신체적 위험이 확인되면 상담보다 112 신고나 전문 기관 연결을 먼저 안내합니다. 스스로를 해칠 생각이 든다면 자살예방상담전화 109로 바로 연락해 주세요.",
    ]),
    ("7. 사업자 정보", [
        "[상호] · [대표자] · [사업자등록번호] · [통신판매업 신고번호] · [사업장 주소] · [문의 연락처]",
        "시행일: [YYYY.MM.DD]",
    ]),
]


def not_found_page():
    # 어느 경로에서 열려도 깨지지 않도록 절대 경로("/")를 씁니다.
    body = """
<main>
  <section class="article-head page-plain">
    <div class="wrap">
      <p class="label">404</p>
      <h1>찾으시는 페이지가 없습니다.</h1>
      <p class="lead">주소가 바뀌었거나 삭제된 페이지입니다. 아래에서 다시 시작해 주세요.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="/index.html#apply">상담 시작하기</a>
        <a class="btn btn-ghost" href="/articles/index.html">아티클 보기</a>
      </div>
    </div>
  </section>
</main>
"""
    page = head("페이지를 찾을 수 없습니다 | Afterline", "요청하신 페이지를 찾을 수 없습니다.", "/", "404.html") + body + foot("/")
    return page.replace(f'<link rel="canonical" href="{DOMAIN}/404.html">', '<meta name="robots" content="noindex">')


def sitemap():
    urls = ["index.html", "articles/index.html", "privacy.html", "terms.html"] + [f'articles/{a["slug"]}.html' for a in ARTICLES]
    rows = "\n".join(f"  <url><loc>{DOMAIN}/{u}</loc></url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n'


if __name__ == "__main__":
    out = ROOT / "articles"
    out.mkdir(exist_ok=True)
    for a in ARTICLES:
        (out / f'{a["slug"]}.html').write_text(article_page(a), encoding="utf-8")
    (out / "index.html").write_text(index_page(), encoding="utf-8")
    note = "초안입니다. 게시 전에 [ ] 항목을 채우고 전문가 검토를 받으세요."
    (ROOT / "privacy.html").write_text(doc_page(
        "privacy.html", "개인정보처리방침",
        "Afterline은 상담 신청과 진행에 필요한 최소한의 개인정보만 처리합니다.", PRIVACY, note), encoding="utf-8")
    (ROOT / "terms.html").write_text(doc_page(
        "terms.html", "이용약관 및 환불 규정",
        "상담 신청부터 결제, 일정 변경, 환불까지의 기준입니다.", TERMS, note), encoding="utf-8")
    (ROOT / "404.html").write_text(not_found_page(), encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(sitemap(), encoding="utf-8")
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n", encoding="utf-8")
    print(f"wrote {len(ARTICLES)} articles, article index, privacy, terms, 404, sitemap, robots")
