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

  const handleProceedToEmail = () => {
    if (!formData.recipient.trim() || !formData.senderName.trim() || !formData.content.trim()) {
      setError('편지가 아직 다 쓰이지 않은 것 같아요.');
      return;
    }
    setError(null);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={formData.recipient}
          onChange={(e) => updateField('recipient', e.target.value)}
          placeholder="예: 늘 든든했던 아빠, 무지개 다리를 건넌 몽자"
          className="w-full border-b border-gray-300 bg-transparent py-2 focus:outline-none"
        />
        <p>
          우편배달부가 길을 헤매지 않도록, 이 편지를 받을 분이 당신에게 어떤 분이었는지 알려주세요.
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
  );
}
