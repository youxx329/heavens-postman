'use client';

import { useState } from 'react';

interface EnvelopeIconProps {
  onOpen: () => void;
  isClosing?: boolean;
}

export default function EnvelopeIcon({ onOpen, isClosing }: EnvelopeIconProps) {
  const [hovered, setHovered] = useState(false);

  const speedLines = [
    {
      d: 'M68.631,253.999H10c-5.523,0-10,4.478-10,10c0,5.522,4.477,10,10,10h58.631c5.523,0,10-4.477,10-10C78.631,258.477,74.154,253.999,68.631,253.999z',
      delay: 0,
    },
    {
      d: 'M98.446,253.999h-0.15c-5.523,0-10,4.478-10,10s4.477,10,10,10h0.15c5.523,0,10-4.478,10-10S103.969,253.999,98.446,253.999z',
      delay: 0.03,
    },
    {
      d: 'M42.016,149.002H10.013c-5.523,0-10,4.478-10,10s4.477,10,10,10h32.003c5.523,0,10-4.478,10-10S47.539,149.002,42.016,149.002z',
      delay: 0.06,
    },
    {
      d: 'M112.51,149.002H74.682c-5.523,0-10,4.478-10,10s4.477,10,10,10h37.828c5.523,0,10-4.478,10-10S118.033,149.002,112.51,149.002z',
      delay: 0.09,
    },
    {
      d: 'M134.282,308.998H78.283c-5.523,0-10,4.478-10,10s4.477,10,10,10h55.999c5.523,0,10-4.478,10-10S139.804,308.998,134.282,308.998z',
      delay: 0.12,
    },
    {
      d: 'M178.008,372.996H37.009c-5.523,0-10,4.478-10,10s4.477,10,10,10h140.999c5.523,0,10-4.478,10-10S183.531,372.996,178.008,372.996z',
      delay: 0.15,
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        width="400"
        height="400"
        viewBox="0 0 512 512"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onOpen}
        role="button"
        strokeWidth={3}
        stroke="#fff"
        fill="#3E2723
        "
        aria-label="편지 보내기"
        style={{
          cursor: 'pointer',
          opacity: isClosing ? 0 : 1,
          overflow: 'visible',
          transition: 'opacity 0.6s ease',
        }}
      >
        <g
          style={{
            transform: isClosing
              ? 'translateX(60px)'
              : hovered
                ? 'translateY(-4px) scale(1.05)'
                : 'translateY(0) scale(1)',
            opacity: isClosing ? 0 : 1,
            transformOrigin: 'center',
            transition: isClosing
              ? 'transform 0.5s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.5s ease'
              : 'transform 0.3s ease',
          }}
        >
          <path d="M388.816,169.245c-3.89-3.92-10.221-3.946-14.142-0.057c-3.92,3.89-3.946,10.222-0.056,14.143l0.06,0.062c1.947,1.963,4.499,2.941,7.054,2.941c2.548,0,5.1-0.974,7.058-2.916C392.711,179.528,392.706,173.166,388.816,169.245z" />
          <path d="M509.071,289.501l-92.878-92.878c-3.905-3.904-10.237-3.904-14.143,0c-3.905,3.905-3.905,10.237,0,14.143l73.732,73.731H299.957c-14.586,0-26.451-11.866-26.451-26.451V82.222l71.183,71.182c3.905,3.904,10.237,3.904,14.143,0c3.905-3.905,3.905-10.237,0-14.143l-90.33-90.329c-3.905-3.904-10.237-3.904-14.142,0L94.94,208.355c-3.905,3.905-3.905,10.237,0,14.143l240.569,240.568c1.875,1.875,4.419,2.929,7.071,2.929c2.652,0,5.196-1.054,7.071-2.929l159.421-159.422c1.875-1.876,2.929-4.419,2.929-7.071C512,293.921,510.946,291.377,509.071,289.501z M253.508,78.071v127.356H126.152L253.508,78.071z M332.58,431.852L126.152,225.426h127.356v32.62c0,25.613,20.838,46.451,46.451,46.451h32.621V431.852z M352.579,431.853V304.497h127.355L352.579,431.853z" />
        </g>

        {speedLines.map((line, i) => (
          <path
            key={i}
            d={line.d}
            style={{
              transform: isClosing ? 'translateX(40px) scaleX(1.6)' : 'translateX(0) scaleX(1)',
              transformOrigin: 'left center',
              opacity: isClosing ? 0 : hovered ? 0.5 : 1,
              transition: isClosing
                ? `transform 0.4s ease ${line.delay}s, opacity 0.4s ease ${line.delay}s`
                : `opacity 0.3s ease ${line.delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
