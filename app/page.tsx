'use client';

import MailboxIcon from '@/components/landing/MailboxIcon';
import SequentialCopy from '@/components/landing/SequentialCopy';
import ShaderBackground from '@/components/landing/ShaderBackground';
import LetterModal from '@/components/letter/LetterModal';
import { useState } from 'react';

type IntroState = 'idle' | 'closing' | 'started';

export default function Home() {
  const [introState, setIntroState] = useState<IntroState>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMailboxOpen = () => {
    setIntroState('closing'); // 1단계: fade-out 시작
    setTimeout(() => {
      setIntroState('started'); // 2단계: 애니메이션 끝난 후 실제 전환
      // audioRef.current?.play(); // BGM도 여기서 트리거
    }, 600); // MailboxIcon의 fade-out 시간과 맞춰야 함
  };

  return (
    <main className="relative w-full h-screen">
      <ShaderBackground />

      {introState !== 'started' && (
        <MailboxIcon onOpen={handleMailboxOpen} isClosing={introState === 'closing'} />
      )}

      {introState === 'started' && (
        <SequentialCopy onWriteLetterClick={() => setIsModalOpen(true)} />
      )}

      <LetterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
