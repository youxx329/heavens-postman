'use client';

import LetterForm from '@/components/letter/LetterForm';
import { useEffect, useState } from 'react';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LetterModal({ isOpen, onClose }: LetterModalProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      const exitTimer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(exitTimer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-300
        ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className={`relative z-10 bg-[#FAF8F2] rounded-lg w-[90%] max-w-xl lg:max-w-2xl xl:max-w-2xl max-h-[90vh] overflow-y-auto py-20 px-16
          ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-6 right-6 text-2xl text-[#4A3F35]"
        >
          ✕
        </button>

        <LetterForm onFinish={onClose} />
      </div>
    </div>
  );
}
