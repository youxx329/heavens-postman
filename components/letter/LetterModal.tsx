'use client';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LetterModal({ isOpen, onClose }: LetterModalProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
        transition-opacity duration-300
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* 배경 dim */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 편지지 카드 */}
      <div
        className={`relative z-10 bg-[#F5F3ED] rounded-lg w-[90%] max-w-md p-8
          transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* X 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        {/* 여기에 LetterForm 들어갈 자리 */}
      </div>
    </div>
  );
}
