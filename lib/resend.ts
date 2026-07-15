import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendLetterReplyParams {
  recipientEmail: string;
  senderName: string;
  replyContent: string;
}

export async function sendLetterReply({
  recipientEmail,
  senderName,
  replyContent,
}: SendLetterReplyParams): Promise<void> {
  // 지금부터 10분 뒤 시각을 ISO 8601 형식으로 계산
  const scheduledAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await resend.emails.send({
    from: `천국의 우편배달부 <${process.env.FROM_EMAIL}>`,
    to: recipientEmail,
    subject: `하늘에서 온 편지 한 통이 도착했습니다. 💫`,
    text: replyContent,
    scheduledAt,
  });

  if (error) {
    throw new Error(`Resend 발송 실패: ${error.message}`);
  }
}
