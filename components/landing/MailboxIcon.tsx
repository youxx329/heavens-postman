'use client';

import { useState } from 'react';

interface MailboxIconProps {
  onOpen: () => void;
  isClosing?: boolean;
}

export default function MailboxIcon({ onOpen, isClosing }: MailboxIconProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        width="500"
        height="500"
        viewBox="0 0 64 64"
        fill="none"
        stroke="#2a1f2e"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={2}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onOpen}
        role="button"
        aria-label="우체통 열기"
        style={{
          cursor: 'pointer',
          opacity: isClosing ? 0 : 1,
          transform: isClosing ? 'scale(1.15)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* 구름/언덕 베이스: 호버 시 살짝 위로 */}
        <path
          d="m31 52c-4-5-11-2-12.069.312-2.931-2.312-5.406-2.312-7.931-2.312-3 0-7 2-7 3v6h56v-8.317c-.91-.433-1.925-.683-3-.683-.948 0-1.852.19-2.676.532-.861-1.506-2.465-2.532-4.324-2.532-2.525 0-4.592 1.879-4.931 4.312-1.069-2.312-5.069-2.312-6.069-.312"

          stroke="#2a1f2e"
          style={{
            transform: hovered ? 'translateY(.2125rem)' : 'translateY(.4375rem)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* 기둥 */}
        <path d="m36 35v24h-5v-27" />

        {/* 돔 지붕 */}
        <path d="m31 32v-12c0-4.418-3.582-8-8-8s-8 3.582-8 8v12z" />

        {/* 열린 덮개/옆판 */}
        <path d="m31 32-3.987 7c-2.518 4.418-8.094 8-12.453 8-4.36 0-5.854-3.582-3.337-8l3.988-7z" />

        {/* 몸통 + 편지 라인 (고정) */}
        <g>
          <path d="m35 12h-12" />
          <path d="m31 32h18v-12c0-4.418-3.582-8-8-8h-3" />
          <path d="m23 20h-4l4 12h8" />
          <path d="m30 19h-7l4 13h4" />
        </g>

        {/* 깃발+깃대: 호버 시 접힘 */}
        <g
          style={{
            transformOrigin: '2.1875rem 1.375rem',
            transform: hovered ? 'rotate(70deg)' : 'rotate(0deg)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          stroke="#2a1f2e"
        >
          <path d="m35 5v17" />
          <path d="m35 5h7v4h-7z" />
        </g>
      </svg>
    </div>
  );
}
