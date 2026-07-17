import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface LetterReplyEmailProps {
  senderName: string;
  body: string; // AI가 생성한 답장 본문
}

export default function LetterReplyEmail({ senderName, body }: LetterReplyEmailProps) {
  return (
    <Html lang="ko">
      <Head>
        <Font
          fontFamily="Noto Serif KR"
          fallbackFontFamily="serif"
          webFont={{
            url: 'https://fonts.gstatic.com/s/notoserifkr/v31/3Jn7SDn90Gmq2mr3blnHaTZXduUBwuF9Wxop-KlAZIoTrf6uFZh_9Q.0.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      {/* 받은편지함 목록에 뜨는 미리보기 텍스트 */}
      <Preview>{senderName}에게.</Preview>

      <Tailwind>
        <Body className=" font-serif m-0 p-0 bg-white">
          <Container className="mx-auto max-w-120 py-20 px-8 bg-[#fdfbf7]">
            <Section>
              <Text className="break-keep text-[15px] leading-loose text-[#3A3630] whitespace-pre-line m-0">
                {senderName}에게,
                {'\n\n'}
                {body}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

LetterReplyEmail.PreviewProps = {
  senderName: '지은',
  body: '그동안 잘 지내고 있었니. 네 편지 잘 받았어. 힘든 일이 있어도 씩씩하게 견뎌내는 모습이 참 대견하구나...',
};
