'use client';

import SequentialCopy from '@/components/landing/SequentialCopy';
import ShaderBackground from '@/components/landing/ShaderBackground';

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      <ShaderBackground />
      <SequentialCopy onWriteLetterClick={() => {}} />
      {/* <LetterForm /> */}
    </main>
  );
}
