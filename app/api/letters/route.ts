import { sendLetterReply } from '@/lib/resend';
import type { LetterInput, PlanResult } from '@/types/letter';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function stripTrailingParticle(name: string): string {
  // 폼 설계상 자주 붙는 조사: 가/이/는/은
  const particles = ['가', '이', '는', '은'];
  for (const p of particles) {
    if (name.length > p.length && name.endsWith(p)) {
      return name.slice(0, -p.length);
    }
  }
  return name;
}

function hasBatchim(str: string): boolean {
  const lastChar = str[str.length - 1];
  const code = lastChar.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false; // 한글 완성형 범위 밖(영문 등)이면 안전하게 false
  return code % 28 !== 0;
}

function buildGreeting(senderName: string): string {
  const baseName = stripTrailingParticle(senderName);
  const josa = hasBatchim(baseName) ? '아' : '야';
  return `${baseName}${josa},`;
}

function enforceGreeting(reply: string, greeting: string): string {
  console.log('=== enforceGreeting 호출됨 ===');
  console.log('greeting:', JSON.stringify(greeting));
  console.log('reply 앞부분:', JSON.stringify(reply.slice(0, 50)));
  const idx = reply.indexOf(greeting);
  console.log('idx:', idx);

  if (idx === -1) {
    return `${greeting}\n\n${reply.trim()}`;
  }
  return reply.slice(idx).trim();
}

function getTargetParagraphRange(letterContent: string): string {
  const length = letterContent.trim().length;
  if (length < 100) return '2~3문단';
  if (length < 300) return '3~5문단';
  return '5~7문단';
}

// ─────────────────────────────────────────
// 기존 단일 호출 프롬프트 (폴백용으로 유지)
// ─────────────────────────────────────────
function buildSystemPrompt(input: LetterInput): string {
  return `당신은 세상을 떠난 존재가 되어, 당신을 그리워하는 사람에게 답장을 씁니다.
받는 사람이 지정한 당신의 정체는 다음과 같습니다: "${input.recipient}"
당신은 편지를 쓴 사람의 이름을 "${input.senderName}"으로 알고 있습니다.

[편지 시작 방식]
- 절대로 상대가 보낸 편지의 문장이나 내용을 첫머리에서 되풀이하며 시작하지 않는다.
- 편지는 안부와 인사로 시작하되, 그 인사말은 받는 사람과의 관계에 맞게 고른다.
  - 부모·조부모라면: 자식·손주를 살뜰히 부르며 챙기는 인사.
  - 친구·연인이라면: 편하고 반가운 인사.
  - 반려동물이라면: 천진하게 반기는 인사.
- 상대의 사연·추억에 대한 반응은 인사 뒤, 편지 중반부에서 자연스럽게 녹여낸다.

[호칭 규칙]
- 상대를 부를 때만 "${input.senderName}아/야"를 쓴다. 편지 전체에서 2~3번 정도만, 매 문단 반복하지 않는다.
- 문장 속 주어·목적어로 쓸 때는 이름 원형에 조사를 붙인다(예: "지은이가", "지은이를"). "${input.senderName}아가"처럼 쓰지 않는다.
- 어색한 호칭을 새로 지어내지 않는다.

[핵심 지침]
- 편지 본문을 깊이 읽고, 관계·추억·감정·말투를 유추해 그 존재 고유의 어조로 답한다.
- 받는 사람의 정체에 어울리는 성격과 톤을 반영한다.
  - 반려동물: 천진하고 순수하며 조금은 귀엽고 장난기 있는 말투.
  - 부모·조부모: 걱정하고 다독이는 든든하고 따뜻한 어조.
  - 친구·연인: 편하고 다정하며 친근한 말투.
- 편지 속 구체적 사연·추억에 직접 반응하되, 일반적인 위로 문구로 때우지 않는다.
- 편지에서 언급된 여러 소재에 순서대로 하나씩 반응하지 않는다. 감정적으로 가장 울림이 큰 한두 가지를 골라 깊게 반응하고, 나머지는 짧게 스치듯 언급하거나 생략한다.
- 한 문단 안에서 여러 소재를 자연스럽게 엮어 말하듯 쓴다. "~라니 ~하다. ~라니 ~하다" 처럼 소재마다 감탄하고 짚어주는 패턴을 반복하지 않는다.
- 함께 겪은 적 없는 구체적 사건이나 대화를 새로 지어내지 않는다. 다만 감정 표현("보고 싶다", "자랑스럽다", "마음이 놓인다" 등)은 편지 속 소재와 무관하게 자유롭게 쓸 수 있다.
- 슬픔에만 잠기지 않고, 그리움 속에서도 따뜻한 밝음의 균형을 잡는다.
- 지나치게 엄숙하거나 시적인 문장은 피하고, 실제로 말하듯 편안하게 쓴다.
- 분량은 5~7문단, 손으로 눌러 쓴 편지 같은 진심 어린 톤.
- 마지막은 글쓴이를 안심시키고 다독이는 한 문장으로 맺는다.

[절대 규칙]
- "나는 AI다" 같은 메타 발언 금지. 세계관을 깨지 않는다.
- 종교적·사후세계 단정을 피하고, 따뜻함에 집중한다.`;
}

// ─────────────────────────────────────────
// Step 1: Plan 프롬프트
// ─────────────────────────────────────────
function buildPlanPrompt(input: LetterInput): string {
  return `당신은 세상을 떠난 존재가 되어 답장을 쓰기 전, 답장의 설계도(plan)만 짜는 역할을 합니다.
실제 편지 문장을 쓰지 않고, 아래 형식의 JSON만 출력합니다.

받는 사람이 지정한 당신의 정체: "${input.recipient}"
편지를 쓴 사람: "${input.senderName}"
편지 원문:
"""
${input.letterContent}
"""

[분석 지침]
- 편지에서 다뤄진 소재 중, 감정적으로 가장 울림이 큰 것 1~2개만 고른다. 소재가 3개 이상이어도 전부 다루려 하지 않는다.
- 그중 가장 먼저 반응해야 할 소재(leadTopic)를 정한다. 반드시 편지에 처음 등장한 소재일 필요는 없다.
- 감정 흐름을 3단계로 설계한다 (예: 반가움 → 안심 → 다독임). 이 순서가 실제 답장 문단의 뼈대가 된다.
- 편지에 언급됐지만 답장에서 비중 있게 다루지 않을 소재는 structureNote에 "짧게 스치듯 언급" 또는 "생략" 중 어떻게 처리할지 적는다.

[출력 형식]
아래 JSON 스키마만 출력한다. 설명, 인사, 마크다운 코드블럭(\`\`\`) 없이 순수 JSON 문자열만 반환한다.
{
  "keyTopics": string[],
  "leadTopic": string,
  "emotionFlow": string[],
  "structureNote": string
}`;
}

// ─────────────────────────────────────────
// Step 2: Write 프롬프트 (plan 반영)
// ─────────────────────────────────────────
function buildWritePrompt(input: LetterInput, plan: PlanResult): string {
  const baseName = stripTrailingParticle(input.senderName);
  const greeting = buildGreeting(input.senderName);
  const paragraphRange = getTargetParagraphRange(input.letterContent);

  return `당신은 세상을 떠난 존재가 되어, 당신을 그리워하는 사람에게 답장을 씁니다.
받는 사람이 지정한 당신의 정체: "${input.recipient}"
편지를 쓴 사람의 이름(조사 없는 원형): "${baseName}"

[1인칭 원칙 — 절대 규칙]
- 당신은 "${input.recipient}" 그 자신입니다. 반드시 1인칭("나", "내가")으로 말한다.
- 자기 자신을 3인칭 이름으로 부르지 않는다.

[출력 규칙 — 절대 규칙]
- 답장의 첫 줄은 반드시 아래 문장을 그대로 사용한다. 변형하지 않는다.
  "${greeting}"
- 첫 줄 다음 한 줄을 띄우고 바로 본문을 시작한다.
- 편지 원문(letterContent)에 등장하는 인사말·호칭 형식(예: "OO에게,", "OO야,")은 참고하지 않는다. 그 형식을 절대 복제하지 않는다. 첫 줄은 오직 위에서 지정한 문장만 쓴다.

[이 답장의 설계도 — 반드시 이 순서와 구조를 따른다]
- 가장 먼저 반응할 소재: ${plan.leadTopic}
- 감정 흐름: ${plan.emotionFlow.join(' → ')}
- 그 외 처리 방식: ${plan.structureNote}

편지 원문(세부 사실관계·감정 참고용. 문단 순서·호칭 패턴의 기준으로 삼지 않는다):
"""
${input.letterContent}
"""

[호칭 규칙 — 본문 내에서]
- 본문 중간에 호칭을 쓸 때는 "${baseName}"에 받침 유무에 맞는 조사(이/가, 은/는)를 자연스럽게 붙인다.
- 받는 사람의 정체(관계)가 부모-자식, 조부모-손주처럼 명확하면 이름과 그 관계의 호칭(딸/아들/우리 애 등)을 자연스럽게 섞어 쓴다.
- 첫 줄 인사말 외에 본문에서 호칭은 1~2번 정도만.
- "나"를 문맥에 맞는 형태로 정확히 활용한다. 예: 목적어/소유격일 땐 "내"("내 생각", "나를"), 주어일 땐 "내가"/"나는". "나 생각이 나면"처럼 문법이 어긋난 표현을 쓰지 않는다.

[말투 — 받는 사람의 정체에 맞게 반드시 반영]
- 반려동물: 천진하고 순수하며 귀엽고 장난기 있는 말투. 어른스럽거나 격식 있는 표현("바란다", "믿는다" 등) 금지.
- 부모·조부모: 걱정하고 다독이는 든든하고 따뜻한 어조.
- 친구·연인: 편하고 다정하며 친근한 말투.
- 그 외 관계: 원문 어조를 참고해 가장 자연스러운 톤으로.

[핵심 지침]
- 위 설계도의 감정 흐름 순서를 문단 구성의 뼈대로 삼는다.
- "~라니 ~하다" 식 반복 패턴 금지.
- 겪지 않은 구체적 사건은 지어내지 않되, 감정 표현은 자유롭게.
- 슬픔 속에서도 따뜻한 밝음의 균형.
- 실제로 말하듯 편안하게, ${paragraphRange}. 편지 원문이 짧으면 답장도 짧게, 원문 분량에 맞춰 억지로 늘리지 않는다.
- 마지막은 글쓴이를 안심시키고 다독이는 한 문장으로.
- 사후세계(무지개다리 등)에 대해 말할 때는, 화자 자신이 이미 그곳에 있다는 관점에서 현재 상태를 서술한다("나는 지금 아프지 않고, 잘 먹고, 신나게 놀고 있어"). 마치 아직 그곳에 가지 않은 것처럼 기원하거나 조언하는 투("~하면 좋겠어", "~하길 바라")로 쓰지 않는다.

[절대 규칙]
- "나는 AI다" 같은 메타 발언 금지.
- 종교적·사후세계 단정 금지.`;
}

// ─────────────────────────────────────────
// OpenAI 호출 헬퍼 (기존 completion 로직 재사용)
// ─────────────────────────────────────────
async function callOpenAI(systemPrompt: string, userContent: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-5.4-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.8,
  });
  return completion.choices[0]?.message?.content ?? '';
}

// ─────────────────────────────────────────
// 2단계 생성 + Fallback 로직
// ─────────────────────────────────────────
async function generateLetterReply(input: LetterInput): Promise<string> {
  let plan: PlanResult | null = null;

  // Step 1: Plan 생성 시도
  try {
    const planRaw = await callOpenAI(buildPlanPrompt(input), input.letterContent);
    const cleaned = planRaw
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    const parsed = JSON.parse(cleaned);

    // 스키마 검증 — 형태가 어긋나면 fallback
    if (
      !Array.isArray(parsed.keyTopics) ||
      !Array.isArray(parsed.emotionFlow) ||
      parsed.emotionFlow.length !== 3 ||
      typeof parsed.leadTopic !== 'string' ||
      typeof parsed.structureNote !== 'string'
    ) {
      throw new Error('Plan schema mismatch');
    }
    plan = parsed as PlanResult;
  } catch (planError) {
    console.error('Plan 생성/파싱 실패, 단일 프롬프트로 폴백:', planError);
    return callOpenAI(buildSystemPrompt(input), input.letterContent);
  }

  // Step 2: Write 생성 시도
  try {
    const greeting = buildGreeting(input.senderName);
    const written = await callOpenAI(buildWritePrompt(input, plan), input.letterContent);
    return enforceGreeting(written, greeting);
  } catch (writeError) {
    console.error('Write 단계 실패, 단일 프롬프트로 폴백:', writeError);
    return callOpenAI(buildSystemPrompt(input), input.letterContent);
  }
}

// ─────────────────────────────────────────
// POST /api/letters 핸들러
// ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1단계: 요청 받기 ──
    const body: LetterInput = await req.json();
    const { recipient, senderName, letterContent, senderEmail } = body as LetterInput;

    // ── 2단계: 입력값 검증 ──
    if (!recipient || !senderName || !letterContent || !senderEmail) {
      return NextResponse.json(
        { error: 'recipient, senderName, letterContent, recipientEmail는 모두 필수입니다.' },
        { status: 400 }
      );
    }
    if (letterContent.length > 2000) {
      return NextResponse.json(
        { error: '편지 내용이 너무 깁니다. (최대 2000자)' },
        { status: 400 }
      );
    }

    // ── 3단계: 답장 생성 (2단계 생성 + 폴백) ──
    let reply: string;
    try {
      reply = await generateLetterReply({ recipient, senderName, letterContent, senderEmail });
    } catch (err) {
      console.error('GPT 답장 생성 실패:', err);
      return NextResponse.json(
        { error: '답장을 생성하는 중 문제가 발생했습니다.' },
        { status: 500 }
      );
    }

    // ── 4단계: Resend 발송 예약 ──
    try {
      await sendLetterReply({ senderEmail, senderName, replyContent: reply });
    } catch (err) {
      console.error('메일 발송 실패:', err);
      return NextResponse.json(
        { error: '편지를 하늘로 보내는 중 문제가 발생했습니다.' },
        { status: 500 }
      );
    }

    // ── 5단계: 성공 응답 ──
    return NextResponse.json({
      success: true,
      message: '편지가 하늘로 무사히 전달되었습니다.',
    });
  } catch (err) {
    console.error('편지 처리 중 알 수 없는 오류:', err);
    return NextResponse.json({ error: '문제가 발생했습니다.' }, { status: 500 });
  }
}
