/* AFTERLINE 재회 가능성 진단
   - 모든 계산은 브라우저에서만 합니다. 답변은 서버로 보내지 않습니다.
   - 답변은 진행 중에만 localStorage에 임시 저장하고, '진단 다시 하기'로 지웁니다.

   점수 축 (각 0~100으로 정규화)
     F  Relationship Foundation  관계 기반
     O  Contact Openness         이별 강도(높을수록 열려 있음)
     R  Current Response         현재 반응
     C  Change Potential         변화 가능성
     Y  Contact Readiness        재접촉 준비도
     S  SNS (보조, 최종 점수에 ±3점까지만)
   최종 = F 15% + R 25% + C 25% + Y 20% + O 15% (+ SNS 보정 ±3)
*/
(function () {
  'use strict';

  var STEPS = ['Relationship', 'Breakup', 'Last Talk', 'Block', 'Contact', 'SNS', 'Current', 'Pattern', 'You', 'Check'];

  // o: 선택지 [표시 문구, 점수 {축: 값}, 긍정 요소 문구, 주의 요소 문구, 태그]
  function o(label, s, pos, neg, tags) { return { label: label, s: s || {}, pos: pos, neg: neg, tags: tags || [] }; }

  var Q = [
    // STEP 1 관계 기본 정보
    { id: 'duration', step: 0, q: '얼마나 만났나요?', opts: [
      o('3개월 미만', { F: 1 }), o('3~6개월', { F: 2 }), o('6개월~1년', { F: 3 }),
      o('1~3년', { F: 4 }), o('3년 이상', { F: 4 })] },
    { id: 'overall', step: 0, q: '두 사람의 관계는 전반적으로 어땠나요?', opts: [
      o('비교적 안정적이었다', { F: 4 }, '관계가 전반적으로 안정적이었습니다.'),
      o('좋은 시기와 갈등이 반복됐다', { F: 2 }),
      o('갈등이 많은 편이었다', { F: 0 }, null, '관계 안에서 갈등이 많은 편이었습니다.'),
      o('헤어졌다 다시 만난 일이 여러 번 있었다', { F: -2 }, null, '헤어짐과 재회가 여러 번 반복됐습니다.', ['repeat'])] },
    { id: 'prior', step: 0, q: '이번 이별 전에도 헤어진 적이 있나요?', opts: [
      o('없다', { F: 3 }), o('한 번', { F: 1 }),
      o('두 번', { F: 0 }, null, '이전에도 두 번 헤어진 적이 있습니다.', ['repeat']),
      o('세 번 이상', { F: -3 }, null, '이별이 세 번 이상 반복됐습니다.', ['repeat'])] },

    // STEP 2 이별 과정
    { id: 'initiator', step: 1, q: '이별을 먼저 말한 사람은 누구인가요?', hint: '이 항목은 단독으로 점수를 정하지 않고, 마지막 대화와 함께 봅니다.', opts: [
      o('상대'), o('나'), o('거의 동시에'),
      o('명확한 이별 통보 없이 멀어졌다', { O: -1 }, null, '명확한 이별 대화 없이 관계가 멀어졌습니다.')] },
    { id: 'reasons', step: 1, multi: true, cap: { C: [-6, 2], O: [-5, 0] }, q: '이별 이유에 가장 가까운 것은 무엇인가요?', hint: '해당하는 것을 모두 골라 주세요.', opts: [
      o('반복되는 싸움', { C: -2 }, null, '같은 싸움이 반복된 것이 이별 이유에 포함됩니다.'),
      o('연락 문제', { C: 1 }, '연락 방식처럼 조정할 수 있는 문제가 이별 이유에 포함됩니다.'),
      o('신뢰 문제', { C: -4 }, null, '신뢰 문제는 시간이 지나도 회복이 쉽지 않은 요인입니다.'),
      o('권태', { C: -1 }),
      o('장거리', { C: 1 }, '거리나 환경처럼 상황이 바뀌면 달라질 수 있는 요인이 있습니다.'),
      o('결혼/미래 계획', { C: -3 }, null, '미래 계획에 대한 생각이 달랐습니다.'),
      o('경제 문제', { C: -1 }),
      o('가족 문제', { C: -1 }),
      o('업무/환경 문제', { C: 1 }, '업무나 환경처럼 상황적인 요인이 이별 이유에 포함됩니다.'),
      o('다른 사람의 등장', { O: -5 }, null, '이별 과정에 다른 사람이 있었습니다.'),
      o('감정이 식었다고 말함', { O: -3 }, null, '상대가 감정이 식었다고 말했습니다.'),
      o('명확한 이유를 듣지 못함', { O: -1 })] },
    { id: 'clarity', step: 1, q: '상대가 이별 이유를 얼마나 명확하게 설명했나요?', opts: [
      o('상당히 구체적으로 말했다', { C: 2 }, '이별 이유가 구체적이어서 무엇이 달라져야 하는지 알 수 있습니다.'),
      o('어느 정도 말했다', { C: 1 }), o('모호했다', { C: 0 }),
      o('이유를 거의 듣지 못했다', { C: -1 }, null, '이별 이유를 거의 듣지 못해 무엇을 바꿔야 할지 분명하지 않습니다.')] },
    { id: 'before', step: 1, q: '이별 직전까지 애정 표현이나 일상적인 연락이 있었나요?', opts: [
      o('평소와 거의 비슷했다', { F: 3 }, '이별 직전까지 일상적인 연락이 이어졌습니다.'),
      o('조금 줄었다', { F: 2 }), o('상당히 줄었다', { F: 0 }),
      o('이미 오랫동안 관계가 식어 있었다', { F: -3 }, null, '이별 전부터 관계가 오래 식어 있었습니다.')] },

    // STEP 3 마지막 대화
    { id: 'ending', step: 2, q: '마지막 대화는 어떻게 끝났나요?', opts: [
      o('비교적 차분하게 끝났다', { O: 3 }, '마지막 대화가 차분하게 끝났습니다.', null, ['lasttalk']),
      o('서로 미안하다는 말을 했다', { O: 2 }, '마지막 대화에서 서로 사과가 오갔습니다.', null, ['lasttalk']),
      o('한쪽이 감정적으로 매달렸다', { O: -1 }, null, '마지막 대화에서 한쪽이 감정적으로 매달렸습니다.', ['lasttalk']),
      o('큰 싸움이나 욕설로 끝났다', { O: -3 }, null, '마지막 대화가 큰 싸움으로 끝났습니다.', ['lasttalk']),
      o('상대가 연락하지 말라고 분명하게 말했다', { O: -6 }, null, '상대가 마지막 대화에서 연락하지 말라고 분명하게 말했습니다.', ['reject'])] },
    { id: 'lastwords', step: 2, q: '상대가 마지막에 했던 말에 가까운 것은 무엇인가요?', hint: '이 문장 하나로 결론 내리지 않고, 다른 답과 함께 봅니다.', opts: [
      o('“시간이 필요하다”', { O: 1 }, null, null, ['lasttalk']),
      o('“지금은 힘들다”', { O: 0 }, null, null, ['lasttalk']),
      o('“좋은 기억은 있다”', { O: 1 }, null, null, ['lasttalk']),
      o('“친구로 지내자”', { O: 0 }, null, null, ['lasttalk']),
      o('“마음이 없다”', { O: -2 }, null, '상대가 마음이 없다고 말했습니다.'),
      o('“다시 연락하지 말아 달라”', { O: -4 }, null, '상대가 다시 연락하지 말아 달라고 말했습니다.', ['softreject']),
      o('명확한 말을 하지 않았다', { O: 0 })] },
    { id: 'aftermsg', step: 2, q: '이별 직후 긴 메시지를 보내거나 여러 번 연락했나요?', opts: [
      o('보내지 않았다', { Y: 3 }, '이별 직후 반복 연락 없이 공백을 유지했습니다.'),
      o('한두 번 보냈다', { Y: 1 }),
      o('여러 번 보냈다', { Y: -2 }, null, '이별 직후 여러 번 연락했습니다.', ['manymsg', 'ready']),
      o('답이 없는데 계속 보냈다', { Y: -5 }, null, '답이 없는 상태에서 연락을 계속 보냈습니다.', ['repeatmsg', 'ready'])] },

    // STEP 4 차단 상태
    { id: 'channels', step: 3, q: '현재 연락 수단은 어떤 상태인가요?', opts: [
      o('차단되지 않았다', { O: 3 }, '연락 수단이 차단되지 않았습니다.'),
      o('일부 SNS만 차단', { O: 1 }, null, null, ['block']),
      o('카카오톡 또는 전화 차단', { O: -3 }, null, '주요 연락 수단이 차단된 상태입니다.', ['block']),
      o('모든 채널 차단', { O: -5 }, null, '모든 연락 수단이 차단된 상태입니다.', ['block', 'noreach'])] },
    { id: 'blockwhen', step: 3, q: '차단이 있었다면 언제 발생했나요?', hint: '같은 차단이라도 생긴 시점에 따라 다르게 봅니다.', opts: [
      o('이별 직후', { O: -2 }, null, null, ['block']),
      o('한두 차례 연락 이후', { O: -3 }, null, null, ['block']),
      o('반복 연락 이후', { O: -5 }, null, '반복 연락 이후에 차단됐습니다.', ['block', 'repeatmsg']),
      o('싸움 직후', { O: -2 }, null, null, ['block']),
      o('해당 없음', {})] },
    { id: 'unblock', step: 3, q: '차단이 해제된 적이 있나요?', hint: '차단 해제만으로 상대의 마음을 해석하지 않습니다.', opts: [
      o('처음부터 차단되지 않았다', { O: 3 }),
      o('차단 후 다시 해제됐다', { O: 2 }, '차단이 해제되어 지금은 연락이 닿는 상태입니다.', null, ['block', 'unblocked']),
      o('차단과 해제가 반복됐다', { O: 0 }, null, '차단과 해제가 반복됐습니다.', ['block']),
      o('계속 차단 상태다', { O: -3 }, null, null, ['block'])] },

    // STEP 5 현재 연락 흐름
    { id: 'talk', step: 4, q: '지금 상대와 대화가 가능한가요?', opts: [
      o('자연스럽게 대화할 수 있다', { R: 5 }, '지금도 자연스럽게 대화할 수 있습니다.'),
      o('내가 연락하면 답장은 온다', { R: 3 }, '연락하면 답장이 이어집니다.'),
      o('답장이 매우 짧다', { R: 1 }, null, '답장이 매우 짧습니다.'),
      o('읽고 답하지 않는다', { R: -3 }, null, '메시지를 읽고 답하지 않습니다.', ['unanswered', 'gap']),
      o('연락 자체가 불가능하다', { R: -5 }, null, '지금은 연락 자체가 닿지 않습니다.', ['unanswered', 'noreach'])] },
    { id: 'first', step: 4, q: '이별 후 상대가 먼저 연락한 적이 있나요?', opts: [
      o('최근 여러 번 있다', { R: 5 }, '상대가 최근 여러 번 먼저 연락했습니다.'),
      o('한 번 있다', { R: 3 }, '상대가 먼저 연락한 적이 있습니다.'),
      o('물건이나 일 관련 연락만 있었다', { R: 1 }),
      o('없다', { R: 0 }, null, '상대가 먼저 연락한 경우는 아직 없습니다.', ['gap'])] },
    { id: 'questions', step: 4, q: '상대의 답장에 질문이 있나요?', opts: [
      o('자주 있다', { R: 4 }, '상대의 답장에 질문이 자주 있습니다.'),
      o('가끔 있다', { R: 2 }),
      o('거의 없다', { R: 0 }, null, '상대의 답장에 질문이 거의 없습니다.'),
      o('답장이 없다', { R: -3 })] },
    { id: 'length', step: 4, q: '대화 길이는 예전과 비교해 어떻게 변하고 있나요?', opts: [
      o('조금씩 길어지고 있다', { R: 4 }, '대화가 조금씩 길어지고 있습니다.'),
      o('비슷하다', { R: 1 }),
      o('짧아지고 있다', { R: -2 }, null, '대화가 점점 짧아지고 있습니다.'),
      o('대화 자체가 없다', { R: -4 }, null, null, ['gap'])] },

    // STEP 6 SNS
    { id: 'sns', step: 5, q: '지금 SNS에서는 어떤 관계인가요?', hint: 'SNS 행동은 참고 신호일 뿐, 관계 의도를 직접 보여주는 지표로 쓰지 않습니다. 결과에 주는 영향도 작게 제한했습니다.', opts: [
      o('서로 팔로우를 유지하고 있다', { S: 1 }, null, null, ['sns']),
      o('팔로우는 없지만 스토리를 본다', { S: 1 }, null, null, ['sns']),
      o('차단했다가 해제했다', { S: 0 }, null, null, ['sns']),
      o('SNS 교류가 없다', { S: -1 }),
      o('SNS를 사용하지 않는다', { S: 0 })] },

    // STEP 7 상대의 현재 상태
    { id: 'newperson', step: 6, q: '상대가 새로운 사람을 만나고 있는 것으로 확인됐나요?', opts: [
      o('아니다', { O: 2 }),
      o('잘 모르겠다', { O: 0 }),
      o('가볍게 만나는 사람이 있는 것 같다', { O: -3 }, null, '상대에게 새로 만나는 사람이 있는 것 같습니다.'),
      o('새로운 연애를 시작했다', { O: -6 }, null, '상대가 새로운 연애를 시작했습니다.', ['newrel'])] },
    { id: 'issues', step: 6, q: '두 사람 사이에 해결되지 않은 현실적인 문제가 있나요?', opts: [
      o('특별히 없다', { C: 3 }, '두 사람 사이에 남은 현실적인 문제가 크지 않습니다.'),
      o('해결할 수 있는 문제가 있다', { C: 1 }),
      o('해결하기 어려운 문제가 있다', { C: -2 }, null, '해결하기 어려운 현실적인 문제가 남아 있습니다.'),
      o('가치관이나 미래 계획이 크게 다르다', { C: -5 }, null, '가치관이나 미래 계획이 크게 다릅니다.')] },

    // STEP 8 관계 패턴
    { id: 'resolve', step: 7, q: '싸움이 생겼을 때 주로 어떻게 해결했나요?', opts: [
      o('대화로 해결했다', { F: 4 }, '갈등이 생기면 대화로 풀어 왔습니다.'),
      o('시간이 지나면 자연스럽게 풀렸다', { F: 1 }),
      o('한 사람이 계속 양보했다', { F: -1 }, null, '갈등 때마다 한 사람이 양보하는 구조였습니다.'),
      o('차단, 잠수, 이별 이야기가 반복됐다', { F: -4 }, null, '갈등 때마다 차단이나 이별 이야기가 반복됐습니다.', ['repeat'])] },
    { id: 'sameissue', step: 7, q: '같은 문제로 여러 번 싸웠나요?', opts: [
      o('거의 없다', { C: 3 }),
      o('가끔 있다', { C: 1 }),
      o('자주 있다', { C: -2 }, null, '같은 문제로 자주 싸웠습니다.'),
      o('헤어질 때마다 같은 문제였다', { C: -5 }, null, '이별할 때마다 같은 문제가 원인이었습니다.', ['repeat'])] },
    { id: 'changed', step: 7, q: '다시 만난다면, 이전의 이별 원인이 실제로 달라질 수 있나요?', hint: 'AFTERLINE이 가장 무겁게 보는 질문입니다.', opts: [
      o('이미 상당 부분 달라졌다', { C: 12 }, '이별 원인 가운데 일부가 실제로 달라졌습니다.'),
      o('달라질 가능성이 있다', { C: 6 }, '이별 원인이 달라질 가능성이 있습니다.'),
      o('아직 그대로다', { C: -4 }, null, '이별 원인이 아직 그대로입니다.'),
      o('바꾸기 어려운 문제다', { C: -10 }, null, '이별 원인이 구조적으로 바꾸기 어려운 문제입니다.')] },

    // STEP 9 나의 현재 상태
    { id: 'why', step: 8, q: '지금 상대에게 연락하고 싶은 가장 큰 이유는 무엇인가요?', opts: [
      o('관계의 문제를 다시 차분히 이야기하고 싶다', { Y: 3 }, '연락하려는 이유가 관계의 문제를 차분히 이야기하는 데 있습니다.'),
      o('달라진 상황을 알려 주고 싶다', { Y: 4 }, '전할 수 있는 실제 변화가 있습니다.'),
      o('너무 보고 싶어서', { Y: 0 }),
      o('답을 듣지 못해 불안해서', { Y: -2 }, null, '연락하려는 이유가 불안에 가깝습니다.', ['ready']),
      o('다른 사람을 만날까 봐 두려워서', { Y: -3 }, null, '연락하려는 이유가 상실에 대한 두려움에 가깝습니다.', ['ready'])] },
    { id: 'tolerate', step: 8, q: '지금 연락했는데 답장이 오지 않아도 감정적으로 버틸 수 있나요?', opts: [
      o('그렇다', { Y: 4 }, '답이 없어도 감정적으로 버틸 수 있습니다.'),
      o('어느 정도 가능하다', { Y: 2 }),
      o('자신 없다', { Y: -2 }, null, '답이 없을 때 감정적으로 흔들릴 수 있습니다.', ['ready']),
      o('답이 없으면 다시 연락할 것 같다', { Y: -5 }, null, '답이 없으면 다시 연락할 가능성이 큽니다.', ['ready', 'repeatrisk'])] },
    { id: 'life', step: 8, q: '이별 이후 실제 생활에서 달라진 것이 있나요?', opts: [
      o('관계 문제와 관련해 구체적인 변화가 있었다', { C: 5 }, '관계 문제와 관련해 생활에서 구체적인 변화가 있었습니다.'),
      o('조금씩 바꾸고 있다', { C: 3 }),
      o('특별히 달라진 것은 없다', { C: 0 }, null, '이별 이후 생활에서 달라진 것이 아직 없습니다.', ['gap']),
      o('상대를 되찾기 위한 행동만 하고 있다', { C: -2 }, null, '지금의 행동이 관계 변화보다 상대의 반응에 맞춰져 있습니다.', ['ready'])] },

    // STEP 10 마지막 확인
    { id: 'nocontact', step: 9, q: '상대가 명확하게 “연락하지 말아 달라”고 요청했나요?', opts: [
      o('아니다', {}),
      o('비슷한 표현은 있었다', { O: -3 }, null, '연락을 원하지 않는다는 비슷한 표현이 있었습니다.', ['softreject']),
      o('명확히 말했다', { O: -6 }, null, '상대가 연락하지 말아 달라고 명확히 요청했습니다.', ['reject'])] },
    { id: 'safety', step: 9, q: '법적 문제, 신고, 접근 금지 요청, 위협이나 안전과 관련된 문제가 있나요?', opts: [
      o('없다', {}), o('있다', {}, null, null, ['safety'])] }
  ];

  var WEIGHTS = { F: 0.15, R: 0.25, C: 0.25, Y: 0.20, O: 0.15 };
  var AXES = [
    ['F', 'Relationship Foundation', '관계 기반'],
    ['O', 'Contact Openness', '연락의 여지'],
    ['R', 'Current Response', '현재 반응'],
    ['C', 'Change Potential', '변화 가능성'],
    ['Y', 'Contact Readiness', '재접촉 준비도']
  ];

  var BANDS = [
    { min: 0, title: '재접촉보다 거리 두기가 우선입니다.',
      body: ['현재는 상대의 반응이나 관계 조건이 재접촉에 우호적이지 않은 상태입니다.', '추가 연락보다 관계를 더 멀어지게 만드는 행동을 피하는 것이 중요합니다.'],
      cta: ['지금 하지 말아야 할 행동 보기', '../column/index.html#first-days'] },
    { min: 25, title: '지금은 움직이기보다 흐름을 확인할 단계입니다.',
      body: ['재회의 가능성을 단정하기 어렵고, 지금 연락하면 오히려 부담이 될 수 있는 요소가 있습니다.', '공백기 자체보다 무엇이 달라져야 하는지 먼저 확인해 보세요.'],
      cta: ['내 상황 자세히 분석하기', '../index.html#apply'] },
    { min: 45, title: '관계의 가능성과 위험 요소가 함께 있습니다.',
      body: ['연락할 수 있는 여지는 있지만 아직 해결되지 않은 문제도 남아 있습니다.', '연락 여부보다 어떤 방식으로 접근할지를 먼저 정리하는 편이 좋습니다.'],
      cta: ['연락 전 상황 점검하기', '../index.html#apply'] },
    { min: 65, title: '대화를 다시 검토할 수 있는 조건이 일부 있습니다.',
      body: ['현재 상대 반응과 관계 흐름에서 긍정적인 요소가 확인됩니다.', '다만 좋은 신호가 곧 재회를 의미하지는 않습니다. 첫 연락 시점과 대화 방향을 신중하게 정리해 보세요.'],
      cta: ['재접촉 방향 상담하기', '../index.html#apply'] },
    { min: 80, title: '관계를 다시 이야기할 수 있는 조건이 비교적 많이 남아 있습니다.',
      body: ['현재의 연락 흐름과 관계 변화에서 긍정적인 요소가 여러 개 확인됩니다.', '다만 점수가 높아도 상대의 선택과 감정까지 예측할 수는 없습니다. 재회 제안보다 자연스러운 대화를 다시 만드는 것이 우선일 수 있습니다.'],
      cta: ['다음 행동 정리하기', '../index.html#apply'] }
  ];

  var ACTIONS = {
    WAIT: ['Wait', '지금은 기다리는 편이 좋습니다.', '연락을 서두르기보다 공백을 유지하고, 관계를 더 멀어지게 만드는 행동을 피합니다.'],
    REVIEW: ['Review', '연락 전에 관계 흐름을 조금 더 확인하는 것이 좋습니다.', '마지막 대화와 이별 원인을 다시 정리하고, 어떤 방식으로 다가갈지 먼저 정합니다.'],
    CONTACT: ['Contact', '신중한 재접촉을 검토할 수 있습니다.', '부담이 적은 짧은 연락부터 생각해 볼 수 있습니다. 답이 없을 때의 다음 행동도 함께 정해 둡니다.']
  };

  // ── 계산 ───────────────────────────────────────────
  function sumOf(obj, axis) { return obj[axis] || 0; }

  function questionRange(q, axis) {
    var vals = q.opts.map(function (op) { return sumOf(op.s, axis); });
    if (!q.multi) return [Math.min.apply(null, vals), Math.max.apply(null, vals)];
    var neg = vals.filter(function (v) { return v < 0; }).reduce(function (a, b) { return a + b; }, 0);
    var pos = vals.filter(function (v) { return v > 0; }).reduce(function (a, b) { return a + b; }, 0);
    var cap = q.cap && q.cap[axis];
    if (cap) { neg = Math.max(neg, cap[0]); pos = Math.min(pos, cap[1]); }
    return [Math.min(0, neg), Math.max(0, pos)];
  }

  function questionValue(q, ans, axis) {
    if (ans == null) return 0;
    var picks = q.multi ? ans : [ans];
    var v = picks.reduce(function (t, i) { return t + sumOf(q.opts[i].s, axis); }, 0);
    var cap = q.multi && q.cap && q.cap[axis];
    if (cap) v = Math.max(cap[0], Math.min(cap[1], v));
    return v;
  }

  function score(answers) {
    var axes = {}, tags = {}, pos = [], neg = [];
    ['F', 'O', 'R', 'C', 'Y', 'S'].forEach(function (a) {
      var lo = 0, hi = 0, v = 0;
      Q.forEach(function (q) {
        var r = questionRange(q, a); lo += r[0]; hi += r[1];
        v += questionValue(q, answers[q.id], a);
      });
      axes[a] = hi > lo ? Math.round((v - lo) / (hi - lo) * 100) : 50;
    });

    // 조합 규칙: 상대가 먼저 이별을 말했고 '마음이 없다'고 했다면 여지를 조금 더 낮춥니다.
    if (pickLabel('initiator', answers) === '상대' && pickLabel('lastwords', answers) === '“마음이 없다”') axes.O = Math.max(0, axes.O - 5);

    Q.forEach(function (q) {
      var a = answers[q.id]; if (a == null) return;
      (q.multi ? a : [a]).forEach(function (i) {
        var op = q.opts[i], w = Object.keys(op.s).reduce(function (t, k) { return t + Math.abs(op.s[k]); }, 0);
        op.tags.forEach(function (t) { tags[t] = true; });
        if (op.pos) pos.push([w, op.pos]);
        if (op.neg) neg.push([w, op.neg]);
      });
    });

    var total = 0;
    Object.keys(WEIGHTS).forEach(function (k) { total += axes[k] * WEIGHTS[k]; });
    total += (axes.S - 50) / 50 * 3; // SNS는 ±3점까지만
    // 상대의 선택과 감정까지 예측할 수는 없으므로 95를 넘기지 않습니다.
    total = Math.max(0, Math.min(95, Math.round(total)));

    // 반드시 지켜야 하는 조건
    var notes = [], cap = 100, forceWait = false;
    var unanswered = tags.unanswered || tags.noreach;
    if (tags.reject) {
      cap = Math.min(cap, 24); forceWait = true;
      notes.push('현재는 재접촉보다 상대의 경계를 존중하는 것이 우선입니다. 상대가 연락을 원하지 않는다고 분명하게 말했기 때문에, 다른 답과 관계없이 지표를 24 이하로 표시했습니다.');
    }
    if (tags.repeatmsg || (tags.manymsg && unanswered)) {
      cap = Math.min(cap, 44); forceWait = true;
      notes.push('답이 없는 상태에서 연락이 반복됐습니다. 지금은 공백을 두고 연락을 멈추는 것이 먼저입니다.');
    }
    if (tags.newrel) {
      var refuses = tags.softreject || tags.reject || unanswered;
      cap = Math.min(cap, refuses ? 24 : 44); forceWait = true;
      notes.push('상대가 새로운 연애를 시작했습니다. AFTERLINE은 다른 관계에 끼어들거나 경쟁하는 방법을 제안하지 않습니다.');
    }
    var capped = total > cap;
    total = Math.min(total, cap);

    var band = BANDS.filter(function (b) { return total >= b.min; }).pop();
    var action = forceWait || total < 45 ? 'WAIT' : total < 65 ? 'REVIEW' : 'CONTACT';
    pos.sort(function (a, b) { return b[0] - a[0]; });
    neg.sort(function (a, b) { return b[0] - a[0]; });
    return {
      total: total, axes: axes, tags: tags, band: band, action: action, notes: notes, capped: capped,
      pos: pos.slice(0, 4).map(function (x) { return x[1]; }),
      neg: neg.slice(0, 4).map(function (x) { return x[1]; })
    };
  }

  function pickLabel(id, answers) {
    var q = Q.filter(function (x) { return x.id === id; })[0], a = answers[id];
    return q && a != null && !q.multi ? q.opts[a].label : null;
  }

  function recommend(tags) {
    var cols = {};
    try { cols = JSON.parse(document.getElementById('col-data').textContent); } catch (e) {}
    var order = [];
    if (tags.repeat) order.push('third-reunion');
    if (tags.unblocked) order.push('block-lifted-no-contact');
    if (tags.block) order.push('after-block-next-step');
    if (tags.ready) order.push('long-message-next-day');
    if (tags.sns) order.push('sns-story');
    if (tags.lasttalk) order.push('last-message-take-care');
    if (tags.gap) order.push('gap-last-conversation');
    order.push('gap-last-conversation', 'last-message-take-care');
    var seen = {};
    return order.filter(function (s) { if (seen[s] || !cols[s]) return false; seen[s] = true; return true; })
      .slice(0, 3).map(function (s) { return { slug: s, title: cols[s][0], cat: cols[s][1] }; });
  }

  // ── 저장 ───────────────────────────────────────────
  var KEY = 'afterline-check-v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  // ── 화면 ───────────────────────────────────────────
  var root = document.getElementById('check-app');
  var st = load() || { i: -1, answers: {} };
  if (st.i >= Q.length && !st.done) st.i = Q.length - 1;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function h(html) { root.innerHTML = html; window.scrollTo({ top: 0, behavior: 'auto' }); var f = root.querySelector('[data-focus]'); if (f) f.focus({ preventScroll: true }); }

  function renderIntro() {
    var resume = st.i >= 0 && !st.done;
    h('<section class="ck-intro">' +
      '<span class="eyebrow">Relationship Check</span>' +
      '<h1 tabindex="-1" data-focus>다시 연락해도 되는 관계인지<br>먼저 확인해 보세요.</h1>' +
      '<p class="lead">차단 여부 하나나 SNS 행동 하나만으로 재회 가능성을 판단하기는 어렵습니다. 마지막 대화와 이별 이후의 연락 흐름까지 함께 봐야 합니다.</p>' +
      '<dl class="ck-meta"><div><dt>질문</dt><dd>' + Q.length + '개</dd></div><div><dt>소요 시간</dt><dd>약 3~5분</dd></div><div><dt>저장</dt><dd>이 브라우저에만 임시 저장</dd></div></dl>' +
      '<div class="cta-row">' +
      (resume ? '<button class="btn btn-primary" type="button" data-act="resume">이어서 하기 (' + (st.i + 1) + ' / ' + Q.length + ') <span class="arr" aria-hidden="true">→</span></button><button class="btn btn-ghost" type="button" data-act="restart">처음부터 하기</button>'
              : '<button class="btn btn-primary" type="button" data-act="start">진단 시작하기 <span class="arr" aria-hidden="true">→</span></button>') +
      '</div>' +
      '<p class="small">개인정보 입력 없이 진행할 수 있습니다. 답변은 서버로 전송되지 않습니다.</p>' +
      '<p class="small ck-disclaim">이 진단은 미래를 예측하거나 재회를 보장하지 않습니다. 입력한 관계 조건을 기준으로 현재 재접촉 여건을 정리하는 자가진단 도구입니다.</p>' +
      '</section>');
  }

  function renderQuestion() {
    var q = Q[st.i], ans = st.answers[q.id];
    var progress = ((st.i) / Q.length * 100).toFixed(1);
    var steps = STEPS.map(function (s, k) { return '<li' + (k === q.step ? ' aria-current="step"' : '') + (k < q.step ? ' class="done"' : '') + '>' + s + '</li>'; }).join('');
    var opts = q.opts.map(function (op, k) {
      var on = q.multi ? (ans || []).indexOf(k) > -1 : ans === k;
      return '<label class="ck-opt"><input type="' + (q.multi ? 'checkbox' : 'radio') + '" name="ck-' + q.id + '" value="' + k + '"' + (on ? ' checked' : '') + '><span>' + esc(op.label) + '</span></label>';
    }).join('');
    var answered = q.multi ? (ans || []).length > 0 : ans != null;
    h('<section class="ck-q">' +
      '<div class="ck-progress" aria-hidden="true"><span style="width:' + progress + '%"></span></div>' +
      '<div class="ck-head"><ol class="ck-steps" aria-label="진행 단계">' + steps + '</ol><span class="ck-count">' + (st.i + 1) + ' / ' + Q.length + '</span></div>' +
      '<fieldset class="ck-field"><legend><span class="ck-no">Q' + String(st.i + 1).padStart(2, '0') + '</span><span class="ck-text" tabindex="-1" data-focus>' + esc(q.q) + '</span></legend>' +
      (q.hint ? '<p class="ck-hint">' + esc(q.hint) + '</p>' : '') +
      (q.multi && !q.hint ? '<p class="ck-hint">여러 개 고를 수 있습니다.</p>' : '') +
      '<div class="ck-opts">' + opts + '</div></fieldset>' +
      '<div class="ck-nav"><button class="ck-prev" type="button" data-act="prev">← 이전</button>' +
      '<button class="btn btn-primary" type="button" data-act="next"' + (answered ? '' : ' disabled') + '>' + (st.i === Q.length - 1 ? '결과 보기' : '다음') + ' <span class="arr" aria-hidden="true">→</span></button></div>' +
      '</section>');
  }

  function bar(v) { return '<span class="ck-bar" aria-hidden="true"><span style="width:' + v + '%"></span></span>'; }

  function renderSafety() {
    h('<section class="ck-result ck-safety">' +
      '<span class="eyebrow">Safety First</span>' +
      '<h1 tabindex="-1" data-focus>재접촉 시도를 권하지 않습니다.</h1>' +
      '<p class="lead">법적 문제, 신고, 접근 금지 요청이나 안전과 관련된 문제가 있는 경우 AFTERLINE은 점수를 계산하지 않습니다. 이 상황에서는 어떤 방식의 연락도 상대와 본인 모두에게 위험할 수 있습니다.</p>' +
      '<ul class="ck-list"><li>상대에게 직접 또는 다른 사람을 통해 연락하지 않습니다.</li><li>접근 금지나 연락 금지 요청이 있다면 그 내용을 그대로 지킵니다.</li><li>위협이나 위험이 있다면 112에 신고하세요.</li><li>마음이 많이 힘들다면 자살예방상담전화 109에서 언제든 이야기할 수 있습니다.</li></ul>' +
      '<div class="cta-row"><button class="btn btn-ghost" type="button" data-act="restart">진단 다시 하기</button></div>' +
      '</section>');
  }

  function renderResult() {
    if (st.answers.safety === 1) return renderSafety();
    var r = score(st.answers), act = ACTIONS[r.action];
    var axes = AXES.map(function (a) {
      return '<li><div class="ck-axis"><span class="en">' + a[1] + '</span><span class="ko">' + a[2] + '</span></div>' + bar(r.axes[a[0]]) + '<span class="ck-axis-v">' + r.axes[a[0]] + '</span></li>';
    }).join('');
    var list = function (arr, empty) { return arr.length ? '<ul class="ck-list">' + arr.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + empty + '</p>'; };
    var recs = recommend(r.tags).map(function (c) {
      return '<li><a href="../column/' + c.slug + '.html"><span class="col-cat">' + esc(c.cat) + '</span><h3>' + esc(c.title) + '</h3></a></li>';
    }).join('');
    h('<section class="ck-result">' +
      '<span class="eyebrow">Result</span>' +
      (r.notes.length ? '<div class="ck-override" role="note">' + r.notes.map(function (n) { return '<p>' + esc(n) + '</p>'; }).join('') + '</div>' : '') +
      '<div class="ck-score"><p class="ck-num" tabindex="-1" data-focus><span>' + r.total + '</span><small>/ 100</small></p>' +
      '<div><p class="ck-label">현재 관계 가능성 지표</p><p class="small">100점에 가까울수록 현재 관계에서 대화나 재접촉을 검토할 수 있는 조건이 상대적으로 많이 남아 있다는 뜻입니다. 상대의 선택까지 예측할 수는 없으므로 지표는 95를 넘지 않습니다.</p><p class="ck-not">통계적 재회 성공확률이 아닙니다.</p></div></div>' +
      '<div class="ck-band"><h2>' + esc(r.band.title) + '</h2>' + r.band.body.map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('') + '</div>' +
      '<p class="ck-disclaim-box">이 결과는 통계적 재회 성공확률이나 미래 예측이 아닙니다.<br>입력한 관계 조건을 기준으로 현재 재접촉 여건을 정리한 참고 지표입니다.</p>' +

      '<div class="ck-block"><h3 class="ck-h">Next Move</h3><div class="ck-action"><span class="ck-action-en">' + act[0] + '</span><div><p class="ck-action-t">' + act[1] + '</p><p class="muted">' + act[2] + '</p></div></div>' +
      '<a class="btn btn-primary" href="' + r.band.cta[1] + '">' + r.band.cta[0] + ' <span class="arr" aria-hidden="true">→</span></a></div>' +

      '<div class="ck-block"><h3 class="ck-h">왜 이런 결과가 나왔나요?</h3><div class="ck-why"><div><p class="ck-sub">긍정 요소</p>' + list(r.pos, '뚜렷한 긍정 요소는 아직 확인되지 않았습니다.') + '</div><div><p class="ck-sub">주의 요소</p>' + list(r.neg, '뚜렷한 주의 요소는 확인되지 않았습니다.') + '</div></div></div>' +

      '<div class="ck-block"><h3 class="ck-h">세부 지표</h3><ul class="ck-axes">' + axes + '</ul><p class="small">SNS 행동은 참고 신호로만 쓰며, 전체 지표에 주는 영향은 ±3점 이내로 제한했습니다.</p></div>' +

      '<div class="ck-consult"><h2>숫자보다 중요한 건<br>왜 이런 점수가 나왔는지입니다.</h2><p>같은 차단이라도 이별 직후의 차단과 반복 연락 이후의 차단은 의미가 다릅니다. AFTERLINE에서는 마지막 대화와 연락 흐름을 함께 확인합니다.</p>' +
      '<div class="cta-row"><a class="btn btn-primary" href="../index.html#apply">내 상황 상담받기 <span class="arr" aria-hidden="true">→</span></a><a class="btn btn-ghost" href="../index.html#svc-conversation">마지막 대화 분석 상담 보기</a></div></div>' +

      (recs ? '<div class="ck-block"><h3 class="ck-h">함께 읽어 볼 Column</h3><ul class="col-list ck-recs">' + recs + '</ul></div>' : '') +
      '<div class="ck-end"><button class="btn btn-ghost" type="button" data-act="restart">진단 다시 하기</button><p class="small">진단 다시 하기를 누르면 이 브라우저에 임시 저장된 답변이 모두 지워집니다.</p></div>' +
      '</section>');
  }

  function render() {
    if (st.done) return renderResult();
    if (st.i < 0) return renderIntro();
    renderQuestion();
  }

  root.addEventListener('change', function (e) {
    var input = e.target; if (!input.name || input.name.indexOf('ck-') !== 0) return;
    var q = Q[st.i], k = Number(input.value);
    if (q.multi) {
      var arr = (st.answers[q.id] || []).slice(), at = arr.indexOf(k);
      if (input.checked && at < 0) arr.push(k); if (!input.checked && at > -1) arr.splice(at, 1);
      st.answers[q.id] = arr;
    } else {
      st.answers[q.id] = k;
      if (q.id === 'safety' && k === 1) { st.done = true; save(st); return render(); }
    }
    save(st);
    var next = root.querySelector('[data-act="next"]');
    if (next) next.disabled = q.multi ? st.answers[q.id].length === 0 : false;
  });

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'start' || act === 'resume') { if (st.i < 0) st.i = 0; }
    else if (act === 'restart') { clear(); st = { i: act === 'restart' && root.querySelector('.ck-intro') ? 0 : -1, answers: {} }; }
    else if (act === 'prev') { st.i -= 1; }
    else if (act === 'next') {
      if (st.i === Q.length - 1) st.done = true; else st.i += 1;
    }
    save(st); render();
  });

  render();
})();
