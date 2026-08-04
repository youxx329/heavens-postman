'use client';

import AudioToggle from '@/components/landing/AudioToggle';
import EnvelopeIcon from '@/components/landing/Envelope';
import SequentialCopy from '@/components/landing/SequentialCopy';
import ShaderBackground from '@/components/landing/ShaderBackground';
import LetterModal from '@/components/letter/LetterModal';
import { useRef, useState } from 'react';

type IntroState = 'idle' | 'closing' | 'started';

export default function Home() {
  const [introState, setIntroState] = useState<IntroState>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEnvelopeIconOpen = () => {
    setIntroState('closing');
    setTimeout(() => {
      setIntroState('started');
      audioRef.current?.play();
      setIsPlaying(true);
    }, 600);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <main className="relative w-full h-screen">
      <audio ref={audioRef} src="/landing-bgm.mp3" loop />
      {introState === 'started' && <AudioToggle isPlaying={isPlaying} onToggle={toggleAudio} />}
      <ShaderBackground />

      {introState !== 'started' && (
        <EnvelopeIcon onOpen={handleEnvelopeIconOpen} isClosing={introState === 'closing'} />
      )}

      {introState === 'started' && (
        <SequentialCopy onWriteLetterClick={() => setIsModalOpen(true)} />
      )}

      <LetterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
