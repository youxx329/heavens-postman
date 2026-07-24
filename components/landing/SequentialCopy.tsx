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
    visibleDuration: 3600,
  },
  {
    lines: ['천국의 우편배달부가', '그 마음을 대신 전해드립니다.'],
    visibleDuration: 3600,
  },
  {
    lines: ['어쩌면,', '하늘에서 답장이 도착할지도 몰라요.'],
    visibleDuration: 3800,
  },
  {
    lines: ['편지를 써보시겠어요?'],
    visibleDuration: 0,
  },
];

type Phase = 'enter' | 'visible' | 'exit';

const FADE_DURATION = 600; //
const BUTTON_DELAY = 300; // ms, 문구 페이드인 끝난 후 버튼 뜨기까지 텀
const INITIAL_DELAY = 1000; // ms, 페이지 로드 후 첫 문구가 뜨기까지의 딜레이

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
    <div className="flex flex-col items-center justify-center text-center gap-8 absolute inset-0">
      <div
        className={`font-letter transition-all duration-600 ease-out
          ${phase === 'visible' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
          ${phase === 'exit' ? 'ease-in' : ''}
        `}
      >
        {step.lines.map((line, i) => (
          <p
            key={i}
            className="text-lg md:text-[32px] text-[#4A3F35] leading-relaxed text-shadow-lg"
          >
            {line}
          </p>
        ))}
      </div>

      {isLastStep && (
        <button
          onClick={onWriteLetterClick}
          className={`font-sans text-[#4A3E3D] text-base md:text-[20px] font-bold
    px-8 py-3 rounded-full
    bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]
    bg-[length:200%_auto] bg-left
    hover:bg-right
    transition-all duration-500 ease-out cursor-pointer shadow-lg flex justify-center items-center
    ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
  `}
        >
          편지 쓰기 <Feather className="w-4 h-4 ml-1" />
        </button>
      )}
    </div>
  );
}
