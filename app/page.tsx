'use client';

import SequentialCopy from '@/components/landing/SequentialCopy';
import ShaderBackground from '@/components/landing/ShaderBackground';
import LetterModal from '@/components/letter/LetterModal';
import { useState } from 'react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="relative w-full h-screen">
      <ShaderBackground />
      <SequentialCopy onWriteLetterClick={() => setIsModalOpen(true)} />
      <LetterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
