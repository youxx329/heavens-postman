import { sendLetterReply } from '@/lib/resend';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 입력값 구조
interface LetterInput {
  recipient: string;
  senderName: string;
  letterContent: string;
  recipientEmail: string;
}

// 시스템 프롬프트 생성 함수
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

// POST /api/letters 핸들러
export async function POST(req: NextRequest) {
  try {
    // ── 1단계: 요청 받기 ──
    const body = await req.json();
    const { recipient, senderName, letterContent, recipientEmail } = body as LetterInput;

    // ── 2단계: 입력값 검증 ──
    if (!recipient || !senderName || !letterContent || !recipientEmail) {
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

    // ── 3단계: OpenAI 호출 ──
    let reply: string;
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-5.4-mini',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt({ recipient, senderName, letterContent, recipientEmail }),
          },
          { role: 'user', content: letterContent },
        ],
        temperature: 0.8,
      });
      reply = completion.choices[0]?.message?.content ?? '';
    } catch (err) {
      console.error('GPT 답장 생성 실패:', err);
      return NextResponse.json(
        { error: '답장을 생성하는 중 문제가 발생했습니다.' },
        { status: 500 }
      );
    }

    // ── 4단계: Resend 발송 예약 ──
    try {
      await sendLetterReply({ recipientEmail, senderName, replyContent: reply });
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
