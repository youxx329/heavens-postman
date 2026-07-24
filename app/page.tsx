'use client';

import SequentialCopy from '@/components/landing/SequentialCopy';
import ShaderBackground from '@/components/landing/ShaderBackground';

export default function Home() {
  return (
    <main className="relative w-full h-screen z-10">
      <ShaderBackground />
      <SequentialCopy onWriteLetterClick={() => {}} />
      {/* <LetterForm /> */}
    </main>
  );
}
