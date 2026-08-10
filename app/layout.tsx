import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notoSerifKR } from './fonts';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://heavenspostman.site'),
  title: '천국의 우편배달부',
  description:
    '그리운 이에게, 하늘 너머로 보내는 편지. 세상을 떠난 사람이나 반려동물에게 편지를 쓰면, 우편배달부가 하늘 건너 답장을 전해드립니다.',
  openGraph: {
    title: '천국의 우편배달부',
    description: '그리운 이에게, 하늘 너머로 보내는 편지',
    locale: 'ko_KR',
    type: 'website',
    images: ['/opengraph-image.png'], // 추가
  },
  twitter: {
    card: 'summary_large_image',
    title: '천국의 우편배달부',
    description: '그리운 이에게, 하늘 너머로 보내는 편지',
    images: ['/opengraph-image.png'], // 추가
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSerifKR.variable}>
      <body>{children}</body>
    </html>
  );
}
