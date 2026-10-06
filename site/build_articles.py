"""아티클 페이지 생성기. 내용을 고친 뒤 `python3 build_articles.py`로 site/articles/를 다시 만듭니다."""
from html import escape
from pathlib import Path

OUT = Path(__file__).parent / "articles"

CATEGORIES = [
    ("차단 후 재회", [
        ("after-block-next-step", "차단 후 재회, 차단이 풀린 날보다 그다음 행동을 봐야 합니다"),
        (None, "이별 다음 날의 차단과 열 번째 연락 뒤의 차단"),
        (None, "차단된 상태에서 다른 계정으로 연락하고 싶어질 때"),
    ]),
    ("이별 후 연락", [
        ("last-message-take-care", "이별 후 연락, 마지막 카톡이 '잘 지내'였을 때"),
        (None, "새벽 두 시에 쓴 메시지를 보내기 전에"),
        (None, "생일에 연락해도 될까, 날짜보다 마지막 대화를 먼저 봅니다"),
    ]),
    ("재회 공백기", [
        ("gap-last-conversation", "재회 공백기, 한 달보다 중요한 건 마지막 대화입니다"),
        (None, "공백기 중에 상대가 먼저 '좋아요'를 눌렀을 때"),
        (None, "석 달의 공백 뒤, 첫 문장을 어디서 시작할까"),
    ]),
    ("전남친 재회", [
        (None, "전남친이 '친구로 지내자'고 했을 때, 그 말 다음을 봅니다"),
        (None, "헤어진 뒤 전남친이 업무 연락처럼 답할 때"),
        (None, "전남친의 새 연애 소식을 들은 주에 미뤄 둘 일"),
    ]),
    ("전여친 재회", [
        (None, "전여친이 '생각할 시간이 필요해'라고 했을 때"),
        (None, "전여친이 맡겨 둔 짐을 돌려달라고 연락해 왔을 때"),
        (None, "전여친의 답장이 한 단어로 짧아졌을 때"),
    ]),
    ("카톡 분석", [
        (None, "읽고 답하지 않은 마지막 메시지를 다시 열어 볼 때"),
        (None, "'응'과 '응응' 사이에서 의미를 찾고 있다면"),
        (None, "차단 직전 대화를 시간순으로 다시 놓아 보면"),
    ]),
    ("재회 후 관계", [
        (None, "다시 만난 지 석 달, 같은 문제로 다툼이 시작될 때"),
        (None, "재회 후 '예전처럼'이라는 말이 부담이 될 때"),
        (None, "재회 후 신뢰는 약속보다 반복되는 행동으로 쌓입니다"),
    ]),
    ("이별 직후 대응", [
        (None, "이별 첫날 밤, 보내지 않는 편이 나은 메시지"),
        (None, "헤어진 다음 날 아침, 가장 먼저 정할 한 가지"),
        (None, "이별 후 첫 주말, 공통 친구에게 묻고 싶어질 때"),
    ]),
]

ARTICLES = [
    {
        "slug": "after-block-next-step",
        "cat": "차단 후 재회",
        "title": "차단 후 재회, 차단이 풀린 날보다 그다음 행동을 봐야 합니다",
        "lead": "차단이 풀렸다는 사실만으로 알 수 있는 것은 많지 않습니다. 판단은 그 이후의 흐름에서 시작합니다.",
        "scene": "이별 6주째 아침. 습관처럼 프로필을 눌렀는데 사진이 다시 보입니다. 차단이 풀렸습니다. 메시지 창을 열었다가, 아무것도 쓰지 못하고 닫습니다.",
        "check": [
            "차단이 언제 시작됐는지. 이별 직후였는지, 여러 번 연락한 뒤였는지.",
            "차단 전 마지막 대화가 어떻게 끝났는지.",
            "차단이 풀린 뒤 상대 쪽에서 먼저 온 연락이 있는지.",
            "해제가 다른 변화와 함께 왔는지. 기기 변경이나 연락처 정리 같은 일입니다.",
        ],
        "check_note": "차단 해제에는 여러 이유가 있습니다. 더 막아 둘 필요가 없어졌을 수도 있고, 앱을 다시 설치했을 수도 있습니다. 해제만으로는 이 가운데 무엇인지 알 수 없습니다.",
        "skip": [
            "해제된 당일에 연락하지 않아도 됩니다. 해제는 연락을 요청하는 신호가 아닙니다.",
            "프로필 변화를 매일 확인하지 않아도 됩니다. 판단에 쓸 수 있는 정보가 거의 없습니다.",
            "해제 이유를 공통 지인에게 묻지 않아도 됩니다. 그런 질문은 상대에게 전해지기 쉽습니다.",
        ],
        "quote": "해제된 날보다, 해제 후 2주 동안 무엇이 달라지는지를 봅니다.",
        "next": [
            "2주 동안 먼저 연락하지 않고 흐름을 봅니다.",
            "그 사이 상대가 먼저 연락해 오면, 짧고 가볍게 답합니다.",
            "변화가 없다면 차단 전 마지막 대화를 기준으로 다시 판단합니다. 반복 연락 뒤의 차단이었다면, 연락하지 않는 편이 맞을 수 있습니다.",
        ],
        "cta": "차단 해제 후 무엇을 할지 정하기 어렵다면, 마지막 대화부터 함께 봅니다.",
    },
    {
        "slug": "last-message-take-care",
        "cat": "이별 후 연락",
        "title": "이별 후 연락, 마지막 카톡이 '잘 지내'였을 때",
        "lead": "'잘 지내'는 짧지만, 어떤 대화 끝에 왔는지에 따라 다르게 읽힙니다.",
        "scene": "긴 대화 끝에 상대가 보낸 마지막 메시지는 '잘 지내'였습니다. 답장을 보내지 못한 채 3주가 지났습니다. 그 세 글자를 하루에도 몇 번씩 다시 엽니다.",
        "check": [
            "'잘 지내' 앞에 어떤 대화가 있었는지. 다툼 끝이었는지, 차분한 정리 끝이었는지.",
            "누가 이별을 먼저 말했는지.",
            "그 메시지에 답했는지, 답했다면 무엇이라고 했는지.",
            "그 뒤로 어느 쪽이든 연락이 있었는지.",
        ],
        "check_note": "차분한 대화 끝의 '잘 지내'는 대화를 닫는 인사에 가깝습니다. 다툼 끝의 '잘 지내'는 그 자리를 벗어나려는 말일 수 있습니다. 같은 세 글자라도 다음 행동은 달라집니다.",
        "skip": [
            "세 글자의 숨은 뜻을 찾지 않아도 됩니다. 메시지 하나보다 대화 전체의 흐름이 더 많은 것을 알려 줍니다.",
            "3주가 지났다고 서둘러 답하지 않아도 됩니다. 답할지는 기간이 아니라 대화의 끝을 보고 정합니다.",
            "그동안의 마음을 긴 메시지로 정리해 보내지 않아도 됩니다.",
        ],
        "quote": "'잘 지내'에 답할지보다, 그 대화가 어떻게 끝났는지를 먼저 정리합니다.",
        "next": [
            "차분한 정리 끝이었다면, 당분간 연락하지 않고 일상을 유지하는 것이 기본입니다.",
            "다툼 끝이었다면, 시간이 지난 뒤 그 대화에 대해 짧게 한 번 말할 기회가 있는지 봅니다.",
            "어느 쪽이든 보내기 전에, 이 메시지에 답이 없어도 괜찮은지 스스로 확인합니다.",
        ],
        "cta": "마지막 메시지를 어떻게 읽어야 할지 모르겠다면, 대화 전체를 함께 봅니다.",
    },
    {
        "slug": "gap-last-conversation",
        "cat": "재회 공백기",
        "title": "재회 공백기, 한 달보다 중요한 건 마지막 대화입니다",
        "lead": "공백기를 날짜로 세면 판단이 쉬워 보입니다. 하지만 같은 한 달도 마지막 대화에 따라 의미가 다릅니다.",
        "scene": "달력에 이별한 날을 표시해 두었습니다. 오늘로 30일입니다. 한 달은 기다려야 한다는 말을 들었고, 그 한 달이 지났습니다. 그런데 무엇이 달라졌는지는 모르겠습니다.",
        "check": [
            "마지막 대화가 어떻게 끝났는지.",
            "그 대화에서 정리되지 않고 남은 문제가 무엇인지.",
            "공백기 동안 그 문제와 관련해 실제로 달라진 것이 있는지.",
            "공백기 동안 어느 쪽이든 연락이 있었는지.",
        ],
        "check_note": "공백기는 시간이 문제를 대신 풀어 주는 기간이 아닙니다. 마지막 대화에서 남은 문제가 그대로라면, 30일 뒤의 연락도 같은 자리에서 다시 시작될 수 있습니다.",
        "skip": [
            "정해진 날짜에 맞춰 연락하지 않아도 됩니다. 30일, 60일 같은 숫자 자체는 판단 기준이 되지 못합니다.",
            "공백기 동안 상대의 SNS 반응을 기록하지 않아도 됩니다.",
            "공백기를 아무것도 하지 않는 기간으로 보내지 않아도 됩니다.",
        ],
        "quote": "공백기가 끝나는 시점은 날짜가 아니라, 마지막 대화의 문제에 대해 다르게 말할 수 있을 때입니다.",
        "next": [
            "마지막 대화를 다시 읽고, 남은 문제를 한 문장으로 적어 봅니다.",
            "그 문제에 대해 지금은 다르게 말할 수 있는지 확인합니다.",
            "아직 같은 말밖에 할 수 없다면, 공백기를 조금 더 이어 갑니다.",
        ],
        "cta": "공백기를 언제 끝낼지 판단이 서지 않는다면, 마지막 대화부터 함께 봅니다.",
    },
]

HEAD = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600&display=swap">
<link rel="stylesheet" href="../styles.css">
</head>
<body>

<header class="site-header">
  <div class="wrap">
    <a class="wordmark" href="../index.html">Afterline</a>
    <nav class="nav" aria-label="주요 메뉴">
      <a href="../index.html#services">상담 안내</a>
      <a href="../index.html#process">진행 방식</a>
      <a href="../index.html#cases">상담 예시</a>
      <a href="index.html">아티클</a>
      <a class="btn btn-primary" href="../index.html#apply">상담 시작하기</a>
    </nav>
    <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav">메뉴</button>
  </div>
  <nav class="mobile-nav wrap" id="mobile-nav" hidden aria-label="모바일 메뉴">
    <ul>
      <li><a href="../index.html#services">상담 안내</a></li>
      <li><a href="../index.html#process">진행 방식</a></li>
      <li><a href="../index.html#cases">상담 예시</a></li>
      <li><a href="../index.html#faq">자주 묻는 질문</a></li>
      <li><a href="index.html">아티클</a></li>
    </ul>
  </nav>
</header>
"""

FOOT = """
<footer>
  <div class="wrap">
    <a class="wordmark" href="../index.html">Afterline</a>
    <p>이별 이후의 흐름을 봅니다.</p>
    <ul>
      <li><a href="../index.html#services">상담 안내</a></li>
      <li><a href="index.html">아티클</a></li>
      <li><a href="../index.html#apply">개인정보처리방침</a></li>
      <li><a href="../index.html#apply">이용약관</a></li>
    </ul>
    <p>[상호] · [대표자] · [사업자등록번호] · [문의 채널]</p>
    <p>Afterline은 재회를 보장하지 않으며, 상대의 차단과 거절 의사를 존중합니다.</p>
  </div>
</footer>

<div class="bottom-bar" id="bottom-bar">
  <a class="btn btn-primary" href="../index.html#apply">상담 시작하기</a>
</div>

<script>
(function () {
  var b = document.getElementById('menu-btn'), n = document.getElementById('mobile-nav');
  b.addEventListener('click', function () {
    var open = n.hidden; n.hidden = !open;
    b.setAttribute('aria-expanded', String(open)); b.textContent = open ? '닫기' : '메뉴';
  });
})();
</script>
</body>
</html>
"""


def ul(items):
    return "<ul>\n" + "\n".join(f"          <li>{escape(i)}</li>" for i in items) + "\n        </ul>"


def article_page(a):
    others = [o for o in ARTICLES if o["slug"] != a["slug"]]
    related = "\n".join(
        f'          <li><a href="{o["slug"]}.html"><span class="cat">{escape(o["cat"])}</span>'
        f'<span class="t">{escape(o["title"])}</span></a></li>'
        for o in others
    )
    body = f"""
<main>
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="index.html">아티클</a><span aria-hidden="true">/</span><span>{escape(a["cat"])}</span></p>
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
    return HEAD.format(title=f'{escape(a["title"])} | Afterline', desc=escape(a["lead"])) + body + FOOT


def index_page():
    groups = []
    for cat, items in CATEGORIES:
        rows = []
        for slug, title in items:
            if slug:
                rows.append(f'          <li><a href="{slug}.html"><span class="cat">{escape(cat)}</span>'
                            f'<span class="t">{escape(title)}</span></a></li>')
            else:
                rows.append(f'          <li class="soon"><span><span class="cat">{escape(cat)}</span>'
                            f'<span class="t">{escape(title)}</span></span></li>')
        groups.append(f"""      <div class="cat-group">
        <h2>{escape(cat)}</h2>
        <ul class="articles">
{chr(10).join(rows)}
        </ul>
      </div>""")
    body = f"""
<main>
  <section class="article-head">
    <div class="wrap">
      <p class="crumbs"><a href="../index.html">홈</a><span aria-hidden="true">/</span><span>아티클</span></p>
      <h1>이별 이후의 장면들</h1>
      <p class="lead">자주 마주치는 장면을 하나씩 정리합니다. 각 글은 먼저 확인할 것, 하지 않아도 되는 것, 다음 행동 순서로 씁니다.</p>
    </div>
  </section>

  <section class="article-body page-plain">
    <div class="wrap">
{chr(10).join(groups)}
    </div>
  </section>
</main>
"""
    return HEAD.format(title="아티클 | Afterline", desc="이별 이후 자주 마주치는 장면을 하나씩 정리한 Afterline의 아티클입니다.") + body + FOOT


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for a in ARTICLES:
        (OUT / f'{a["slug"]}.html').write_text(article_page(a), encoding="utf-8")
    (OUT / "index.html").write_text(index_page(), encoding="utf-8")
    print("wrote", len(ARTICLES) + 1, "pages")
