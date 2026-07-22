'use client';

import { useState } from 'react';

type Step = 'writing' | 'email' | 'sending' | 'done';

interface FormData {
  recipient: string;
  senderName: string;
  content: string;
  email: string;
}

export default function LetterForm() {
  const [step, setStep] = useState<Step>('writing');
  const [formData, setFormData] = useState<FormData>({
    recipient: '',
    senderName: '',
    content: '',
    email: '',
  });

  const [error, setError] = useState<string | null>(null);

  // "하늘로 보내기" 클릭 → 아직 API 호출 안 함, 그냥 다음 단계로
  const handleProceedToEmail = () => {
    if (!formData.recipient.trim() || !formData.senderName.trim() || !formData.content.trim()) {
      setError('편지가 아직 다 쓰이지 않은 것 같아요.');
      return;
    }
    setError(null);
    setStep('email');
  };

  // "답장 기다리기" 클릭 → 실제 API 호출은 여기서
  const handleSubmit = async () => {
    if (!isValidEmail(formData.email)) {
      setError('이 주소로는 답장이 길을 잃을 것 같아요. 메일 주소를 다시 한 번 확인해 주세요.');
      return;
    }
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
      setStep('email'); // 실패하면 이메일 입력 단계로 되돌림
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="relative min-h-100">
      {step === 'writing' && (
        <div key="writing" className="animate-fade-in space-y-4">
          <div>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => updateField('recipient', e.target.value)}
              placeholder="예: 늘 든든했던 아빠, 무지개 다리를 건넌 몽자, 10년지기 철수"
              className="w-full border-b border-gray-300 bg-transparent py-2 focus:outline-none"
            />
            <p className="mt-1 text-sm text-gray-400">
              우편배달부가 길을 헤매지 않도록, 이 편지를 받을 분이 당신에게 어떤 분이었는지
              알려주세요.
            </p>
          </div>
          <input
            type="text"
            value={formData.senderName}
            onChange={(e) => updateField('senderName', e.target.value)}
            placeholder="보내는 사람"
            className="w-full border-b border-gray-300 bg-transparent py-2 focus:outline-none"
          />
          <textarea
            value={formData.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="편지 내용을 적어주세요"
            className="w-full resize-none border-b border-gray-300 bg-transparent py-2 focus:outline-none"
          ></textarea>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleProceedToEmail}
            className="mt-4 w-full rounded-full bg-amber-600 py-3 text-white"
          >
            📮 하늘로 보내기
          </button>
        </div>
      )}

      {step === 'email' && (
        <div key="email" className="animate-fade-in space-y-4">
          <p className="text-center text-gray-600">
            이 편지가 하늘로 가려면, 답장 받을 곳을 알려주세요.
          </p>
          <p className="text-center text-gray-600">
            답장은 천국의 우편배달부가 당신의 이메일로 전해드립니다.
          </p>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="you@example.com"
            className="w-full border-b border-gray-300 bg-transparent py-2 text-center focus:outline-none"
          />

          {error && <p className="text-center text-sm text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            className="mt-4 w-full rounded-full bg-amber-600 py-3 text-white"
          >
            답장 기다리기
          </button>
        </div>
      )}

      {step === 'sending' && (
        <div key="sending" className="animate-fade-in flex h-full items-center justify-center">
          <p className="text-gray-500">편지를 봉투에 넣는 중...</p>
        </div>
      )}

      {step === 'done' && (
        <div key="done" className="animate-fade-in space-y-2 text-center">
          <p>당신의 편지가 하늘로 전달되었습니다.</p>
          <p className="text-gray-500">약 10분 후, 당신의 메일함으로 전해드릴게요.</p>
        </div>
      )}
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
