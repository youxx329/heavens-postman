import LetterReplyEmail from '@/emails/letter-reply';
import { render } from '@react-email/components';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendLetterReplyParams {
  senderEmail: string;
  senderName: string;
  replyContent: string;
}

export async function sendLetterReply({
  senderEmail,
  senderName,
  replyContent,
}: SendLetterReplyParams): Promise<void> {
  // 지금부터 10분 뒤 시각을 ISO 8601 형식으로 계산
  const scheduledAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // 편지지 템플릿을 HTML 문자열로 변환
  const emailHtml = await render(
    LetterReplyEmail({
      senderName,
      body: replyContent,
    })
  );

  const { error } = await resend.emails.send({
    from: `천국의 우편배달부 <${process.env.FROM_EMAIL}>`,
    to: senderEmail,
    subject: `하늘에서 온 편지 한 통이 도착했습니다. 💫`,
    html: emailHtml,
    scheduledAt,
  });

  if (error) {
    throw new Error(`Resend 발송 실패: ${error.message}`);
  }
}
