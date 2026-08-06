'use client';

import { Feather } from 'lucide-react';
import { useEffect, useState } from 'react';
interface StepConfig {
  lines: string[];
  visibleDuration: number; // ms 단위
}

interface SequentialCopyProps {
  onWriteLetterClick: () => void;
}

const STEPS: StepConfig[] = [
  {
    lines: ['하늘에 있는 당신의 소중한 이에게,', '전하지 못한 마음이 있나요?'],
    visibleDuration: 4200,
  },
  {
    lines: ['천국의 우편배달부가', '그 마음을 대신 전해드립니다.'],
    visibleDuration: 4200,
  },
  {
    lines: ['어쩌면,', '하늘에서 답장이 도착할지도 몰라요.'],
    visibleDuration: 4200,
  },
  {
    lines: ['편지를 써보시겠어요?'],
    visibleDuration: 0,
  },
];

type Phase = 'enter' | 'visible' | 'exit';

const FADE_DURATION = 600;
const BUTTON_DELAY = 300; // ms, 문구 페이드인 끝난 후 버튼 뜨기까지 텀
const INITIAL_DELAY = 500; // ms, 페이지 로드 후 첫 문구가 뜨기까지의 딜레이

export default function SequentialCopy({ onWriteLetterClick }: SequentialCopyProps) {
  const [phase, setPhase] = useState<Phase>('enter');
  const [currentStep, setCurrentStep] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const isLastStep = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  useEffect(() => {
    const enterDelay = currentStep === 0 ? INITIAL_DELAY : 20;

    // 마지막 단계면 여기서 멈춤 (더 이상 다음 단계로 안 넘어감)
    if (currentStep === STEPS.length - 1) {
      // enter -> visible로만 전환하고 끝
      const enterTimer = setTimeout(() => setPhase('visible'), enterDelay);
      return () => clearTimeout(enterTimer);
    }

    // enter -> visible 전환
    const enterTimer = setTimeout(() => {
      setPhase('visible');
    }, enterDelay);

    // visible 유지 후 -> exit 전환
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, enterDelay + STEPS[currentStep].visibleDuration);

    // exit 끝나면 -> 다음 단계로 넘어가면서 phase 리셋
    const nextStepTimer = setTimeout(
      () => {
        setCurrentStep((prev) => prev + 1);
        setPhase('enter');
      },
      enterDelay + STEPS[currentStep].visibleDuration + FADE_DURATION
    );

    // cleanup: 이 effect가 재실행되기 전에 이전 타이머들 다 정리
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextStepTimer);
    };
  }, [currentStep]);

  useEffect(() => {
    const isLastStep = currentStep === STEPS.length - 1;
    if (!isLastStep) return;

    // 문구가 "visible" phase로 바뀌는 시점(20ms) + 페이드인 끝나는 시간(600ms) + 추가 텀(300ms)
    const buttonTimer = setTimeout(
      () => {
        setShowButton(true);
      },
      20 + FADE_DURATION + BUTTON_DELAY
    );

    return () => clearTimeout(buttonTimer);
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-8 absolute inset-0 px-4">
      <div
        className={`font-letter transition-all duration-600 ease-out
          ${phase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
          ${phase === 'exit' ? 'ease-in' : ''}
        `}
      >
        {step.lines.map((line, i) => (
          <p
            key={i}
            className="text-2xl md:text-[32px] text-[#4A3F35] leading-relaxed text-shadow-lg break-keep"
          >
            {line}
          </p>
        ))}
      </div>

      {isLastStep && (
        <button
          onClick={onWriteLetterClick}
          className={`cursor-pointer font-letter md:text-[20px] text-[14px] tracking-[0.04em] text-[#FBF6ED] md:px-[45px] md:py-[15px] px-[38px] py-[12px] rounded-full hover:shadow-[0_10px_24px_rgba(216,140,90,0.42)] hover:-translate-y-px transition-[transform,box-shadow] duration-400 ease-out flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,246,237,0.8),0_0_40px_rgba(251,246,237,0.4),0_8px_20px_rgba(216,140,90,0.32)] font-bold 
            ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
          style={{ backgroundImage: 'linear-gradient(100deg, #D8A657 0%, #E8926B 100%)' }}
        >
          편지 쓰기 <Feather className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
