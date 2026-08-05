'use client';

import type { LetterInput } from '@/types/letter';
import { useRef, useState } from 'react';

type Step = 'writing' | 'email' | 'confirm' | 'sending' | 'done';

interface LetterFormProps {
  onFinish: () => void;
}

export default function LetterForm({ onFinish }: LetterFormProps) {
  const [step, setStep] = useState<Step>('writing');
  const [formData, setFormData] = useState<LetterInput>({
    recipient: '',
    senderName: '',
    letterContent: '',
    senderEmail: '',
  });

  const [error, setError] = useState<string | null>(null);

  // "하늘로 보내기" 클릭 → 아직 API 호출 안 함, 그냥 다음 단계로
  const handleProceedToEmail = () => {
    if (
      !formData.recipient.trim() ||
      !formData.senderName.trim() ||
      !formData.letterContent.trim()
    ) {
      setError('편지가 아직 다 쓰이지 않은 것 같아요.');
      return;
    }
    setError(null);
    setStep('email');
  };

  // email 단계 → confirm 단계 (형식 검증만, API 호출 없음)
  const handleProceedToConfirm = () => {
    if (!isValidEmail(formData.senderEmail)) {
      setError('이 주소로는 답장이 길을 잃을 것 같아요. 메일 주소를 다시 한 번 확인해주세요.');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  // confirm 단계 → 실제 전송 (API 호출)
  const handleConfirmSend = async () => {
    setError(null);
    setStep('sending');
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('failed');
      setStep('done');
    } catch {
      setError('편지가 길을 잃은 것 같아요. 다시 한 번 보내볼까요?');
      setStep('confirm'); // email이 아니라 confirm으로
    }
  };

  // confirm 단계 → "다시 확인할게요" 클릭
  const handleBackToEmail = () => {
    setError(null);
    setStep('email');
  };

  // "또 다른 편지 쓰기" 클릭 -> 첫 단계로 돌아가기
  const handleResetForm = () => {
    setFormData({
      recipient: '',
      senderName: '',
      letterContent: '',
      senderEmail: '',
    });
    setStep('writing');
  };

  const updateField = (field: keyof LetterInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const LINE_HEIGHT = '2.8rem';

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField('letterContent', e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  return (
    <div className="relative h-full font-letter text-[#4A3F35] will-change-transform transform-gpu">
      {step === 'writing' && (
        <div key="writing" className="animate-fade-in space-y-6 flex flex-col">
          <div>
            <p className="text-2xl text-[#4A3F35]">
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => updateField('recipient', e.target.value)}
                placeholder="무지개 다리 건넌 몽자"
                className="inline border-b border-dotted border-[#4A3F35]/30 bg-transparent px-1 text-center placeholder:text-[#4A3F35]/40 focus:outline-none"
                style={{ width: `${Math.max(formData.recipient.length, 10)}em` }}
              />{' '}
              에게
            </p>
            <p className="mt-2 text-[15px] italic text-[#4A3F35]/60 break-keep">
              ↳ 우편배달부가 헤매지 않도록, 관계를 짧게 알려주세요. 예: 무지개 다리 건넌 몽자,{' '}
              <br />늘 든든했던 아빠
            </p>
          </div>

          <textarea
            ref={textareaRef}
            value={formData.letterContent}
            onChange={handleContentChange}
            placeholder="편지 내용을 적어주세요"
            rows={7}
            className="w-full overflow-hidden resize-none bg-transparent py-2 placeholder:text-[#4A3F35]/40 focus:outline-none text-[20px] italic"
            style={{
              lineHeight: LINE_HEIGHT,
              backgroundImage: `repeating-linear-gradient(transparent, transparent calc(${LINE_HEIGHT} - 1px), rgba(74,63,53,0.25) calc(${LINE_HEIGHT} - 1px), rgba(74,63,53,0.25) ${LINE_HEIGHT})`,
              backgroundAttachment: 'local',
            }}
          ></textarea>

          <div className="flex items-end my-8 flex-col">
            <p className="text-2xl">
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => updateField('senderName', e.target.value)}
                placeholder="보내는 사람"
                className="inline border-b border-dotted border-[#4A3F35]/30 bg-transparent px-1 text-center placeholder:text-[#4A3F35]/40 focus:outline-none"
                style={{ width: `${Math.max(formData.senderName.length, 6)}em` }}
              />{' '}
              , 마음을 담아
            </p>
            <p className="mt-2 text-[15px] italic text-[#4A3F35]/60">
              ↳ 성을 뺀 이름만 적어주세요. 예: 민준, 수지
            </p>
          </div>

          {error && <p className="text-[16px] text-red-400 text-center">{error}</p>}

          <div className="flex justify-center">
            <button
              onClick={handleProceedToEmail}
              className="cursor-pointer font-letter text-[16px] tracking-[0.04em] text-[#FBF6ED] px-[54px] py-[15px] rounded-full shadow-[0_8px_20px_rgba(216,140,90,0.32)] hover:shadow-[0_10px_24px_rgba(216,140,90,0.42)] hover:-translate-y-px transition-[transform,box-shadow] duration-300 ease-out flex justify-center items-center font-bold"
              style={{
                backgroundImage: 'linear-gradient(100deg, #D8A657 0%, #E8926B 50%, #D8A657 100%)',
              }}
            >
              하늘로 보내기
            </button>
          </div>
        </div>
      )}

      {step === 'email' && (
        <div
          key="email"
          className="animate-fade-in space-y-6 flex flex-col items-center justify-center h-full"
        >
          <p className="text-center text-[#4A3F35] text-lg">
            이 편지가 하늘로 가려면, 답장 받을 곳을 알려주세요.
          </p>
          <p className="text-center text-[#4A3F35] text-lg">
            답장은 천국의 우편배달부가 당신의 이메일로 전해드립니다.
          </p>
          <input
            type="email"
            value={formData.senderEmail}
            onChange={(e) => updateField('senderEmail', e.target.value)}
            placeholder="you@example.com"
            className="w-full border-b border-dotted border-[#4A3F35]/30 bg-transparent py-2 text-center placeholder:text-[#4A3F35]/40 focus:outline-none"
          />

          {error && <p className="text-center text-[16px] text-red-400 break-keep">{error}</p>}

          <button
            onClick={handleProceedToConfirm}
            className="cursor-pointer font-letter text-[16px] tracking-[0.04em] text-[#FBF6ED] px-[54px] py-[15px] rounded-full shadow-[0_8px_20px_rgba(216,140,90,0.32)] hover:shadow-[0_10px_24px_rgba(216,140,90,0.42)] hover:-translate-y-px transition-[transform,box-shadow] duration-300 ease-out flex justify-center items-center font-bold mt-5"
            style={{
              backgroundImage: 'linear-gradient(100deg, #D8A657 0%, #E8926B 50%, #D8A657 100%)',
            }}
          >
            주소 보내기
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div
          key="confirm"
          className="animate-fade-in space-y-6 flex flex-col items-center justify-center h-full"
        >
          <p className="text-center text-[#4A3F35] text-lg">이 주소로 답장을 보내드릴게요.</p>
          <p className="text-center text-[#4A3F35] text-xl font-bold break-all">
            {formData.senderEmail}
          </p>
          <p className="text-center text-[#4A3F35]/60 text-[16px] italic">
            편지가 무사히 도착할 수 있도록 수신 이메일 주소를 다시 한번 살펴봐 주세요.
          </p>

          {error && <p className="text-center text-[16px] text-red-400 break-keep">{error}</p>}

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleBackToEmail}
              className="cursor-pointer font-letter text-[16px] tracking-[0.04em] text-[#3A2F26] px-[54px] py-[15px] rounded-full shadow-[0_8px_20px_rgba(216,140,90,0.22)] hover:shadow-[0_10px_24px_rgba(216,140,90,0.32)] hover:-translate-y-px transition-[transform,box-shadow] duration-300 ease-out flex justify-center items-center font-bold"
              style={{
                backgroundImage: 'linear-gradient(100deg, #F6E7C7 0%, #F0D4A8 50%, #F6E7C7 100%)',
              }}
            >
              다시 확인하기
            </button>
            <button
              onClick={handleConfirmSend}
              className="cursor-pointer font-letter text-[16px] tracking-[0.04em] text-[#FBF6ED] px-[54px] py-[15px] rounded-full shadow-[0_8px_20px_rgba(216,140,90,0.32)] hover:shadow-[0_10px_24px_rgba(216,140,90,0.42)] hover:-translate-y-px transition-[transform,box-shadow] duration-300 ease-out flex justify-center items-center font-bold"
              style={{
                backgroundImage: 'linear-gradient(100deg, #D8A657 0%, #E8926B 50%, #D8A657 100%)',
              }}
            >
              답장 기다리기
            </button>
          </div>
        </div>
      )}

      {step === 'sending' && (
        <div key="sending" className="animate-fade-in flex h-full items-center justify-center">
          <p className="text-[#4A3F35] text-lg">우편배달부가 하늘 길을 나설 준비를 해요...</p>
        </div>
      )}

      {step === 'done' && (
        <div key="done" className="animate-fade-in space-y-4 text-center">
          <p className="text-[#4A3F35] text-lg">당신의 편지가 하늘로 전달되었습니다.</p>
          <p className="text-[#4A3F35] text-lg">약 10분 후, 당신의 메일함으로 전해드릴게요.</p>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={handleResetForm}
              className="cursor-pointer font-letter text-[16px] tracking-[0.04em] text-[#3A2F26] px-[54px] py-[15px] rounded-full shadow-[0_8px_20px_rgba(216,140,90,0.22)] hover:shadow-[0_10px_24px_rgba(216,140,90,0.32)] hover:-translate-y-px transition-[transform,box-shadow] duration-300 ease-out flex justify-center items-center font-bold mt-5"
              style={{
                backgroundImage: 'linear-gradient(100deg, #F6E7C7 0%, #F0D4A8 50%, #F6E7C7 100%)',
              }}
            >
              또 다른 편지 쓰기
            </button>
            <button
              onClick={onFinish}
              className="cursor-pointer font-letter text-[16px] tracking-[0.04em] text-[#FBF6ED] px-[54px] py-[15px] rounded-full shadow-[0_8px_20px_rgba(216,140,90,0.32)] hover:shadow-[0_10px_24px_rgba(216,140,90,0.42)] hover:-translate-y-px transition-[transform,box-shadow] duration-300 ease-out flex justify-center items-center font-bold mt-5"
              style={{
                backgroundImage: 'linear-gradient(100deg, #D8A657 0%, #E8926B 50%, #D8A657 100%)',
              }}
            >
              마치기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
