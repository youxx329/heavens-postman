'use client';

import { useState } from 'react';

interface MailboxIconProps {
  onOpen: () => void;
}

export default function MailboxIcon({ onOpen }: MailboxIconProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      role="button"
      aria-label="우체통 열기"
      style={{
        cursor: 'pointer',
        width: 240,
        height: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fdf3e7"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 봉투: 몸통 뒤에서 살짝 보이다가, 호버 시 위로 튀어나옴 */}
        <g
          style={{
            transform: hovered ? 'translateY(-3px)' : 'translateY(1px)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <path
            d="M3 10.5 L8 14.5 L13 10.5 L13 10.5 L13 16 L3 16 Z"
            fill="#fdf3e7"
            fillOpacity="0.12"
          />
        </g>

        {/* 우체통 몸통 (Tabler mailbox 기준) */}
        <path d="M10 21v-6.5a3.5 3.5 0 0 0 -7 0v6.5h18v-6a4 4 0 0 0 -4 -4h-10.5" />
        <path d="M6 15h1" />

        {/* 깃발: 호버 시 아래로 회전 */}
        <g
          style={{
            transformOrigin: '12px 11px',
            transform: hovered ? 'rotate(80deg)' : 'rotate(0deg)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <path d="M12 11v-8h4l2 2l-2 2h-4" />
        </g>
      </svg>
    </div>
  );
}
