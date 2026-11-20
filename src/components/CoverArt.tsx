import React from 'react';

interface CoverArtProps {
  variant: number;
  code: string;
  title: string;
  accent?: 'crimson' | 'amber';
  className?: string;
}

export const CoverArt: React.FC<CoverArtProps> = ({
  variant,
  code,
  title,
  accent = 'crimson',
  className = '',
}) => {
  const primary = accent === 'crimson' ? '#dc2626' : '#f59e0b';
  const secondary = accent === 'crimson' ? '#f59e0b' : '#dc2626';
  const safeId = `${code.replace(/[^a-zA-Z0-9]/g, '')}-${variant}`;

  return (
    <div
      className={`relative w-full aspect-square bg-[#08080a] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full block"
        role="img"
        aria-label={`${code} ${title} cover artwork`}
      >
        <defs>
          <pattern
            id={`grid-${safeId}`}
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#1f2024"
              strokeWidth="1"
            />
          </pattern>
          <pattern
            id={`hazard-${safeId}`}
            width="16"
            height="16"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="16" fill={primary} fillOpacity="0.88" />
            <rect x="8" width="8" height="16" fill="#050506" />
          </pattern>
          <pattern
            id={`dots-${safeId}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect x="1" y="1" width="2" height="2" fill="#27272a" />
          </pattern>
        </defs>

        {/* Base concrete matte */}
        <rect width="400" height="400" fill="#0a0a0c" />
        <rect width="400" height="400" fill={`url(#grid-${safeId})`} />

        {/* Variant-specific brutalist architecture */}
        {variant === 1 && (
          <>
            <rect x="28" y="28" width="344" height="344" fill="#121316" stroke="#27272a" strokeWidth="2" />
            <rect x="28" y="28" width="220" height="220" fill={primary} />
            <rect x="150" y="150" width="222" height="222" fill="#050506" stroke="#f4f4f5" strokeWidth="2" />
            <rect x="172" y="172" width="178" height="36" fill={`url(#hazard-${safeId})`} />
            <line x1="28" y1="310" x2="372" y2="310" stroke="#27272a" strokeWidth="2" />
            <rect x="48" y="264" width="72" height="14" fill="#f4f4f5" />
          </>
        )}

        {variant === 2 && (
          <>
            <rect x="0" y="0" width="400" height="400" fill={`url(#dots-${safeId})`} />
            <polygon points="40,360 200,40 360,360" fill="#121316" stroke={primary} strokeWidth="3" />
            <polygon points="105,320 200,125 295,320" fill={primary} />
            <rect x="30" y="30" width="120" height="28" fill="#050506" stroke="#27272a" strokeWidth="1" />
            <rect x="260" y="340" width="110" height="24" fill={secondary} />
          </>
        )}

        {variant === 3 && (
          <>
            <rect x="24" y="24" width="352" height="352" fill="#050506" stroke="#27272a" strokeWidth="2" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x={44 + i * 40}
                y={60 + ((i % 3) * 32)}
                width="26"
                height={240 - (i % 3) * 48}
                fill={i % 2 === 0 ? primary : '#27272a'}
              />
            ))}
            <rect x="24" y="24" width="352" height="22" fill={`url(#hazard-${safeId})`} />
            <rect x="44" y="320" width="160" height="28" fill="#050506" stroke="#f4f4f5" strokeWidth="1.5" />
          </>
        )}

        {variant === 4 && (
          <>
            <rect x="32" y="32" width="336" height="336" fill="#121316" stroke="#27272a" strokeWidth="2" />
            <rect x="64" y="64" width="272" height="272" fill="#050506" stroke={primary} strokeWidth="2" />
            <rect x="108" y="108" width="184" height="184" fill={primary} fillOpacity="0.18" stroke="#f4f4f5" strokeWidth="2" />
            <line x1="32" y1="200" x2="368" y2="200" stroke={primary} strokeWidth="3" />
            <line x1="200" y1="32" x2="200" y2="368" stroke="#f4f4f5" strokeWidth="1.5" />
            <rect x="184" y="184" width="32" height="32" fill={primary} />
          </>
        )}

        {variant === 5 && (
          <>
            <rect x="20" y="20" width="360" height="360" fill="#0e0e10" stroke="#27272a" strokeWidth="2" />
            <rect x="20" y="120" width="360" height="160" fill={primary} />
            <rect x="40" y="40" width="140" height="320" fill="#050506" stroke="#f4f4f5" strokeWidth="2" />
            <rect x="60" y="60" width="100" height="18" fill={`url(#hazard-${safeId})`} />
            <rect x="210" y="150" width="150" height="100" fill="#050506" />
          </>
        )}

        {variant >= 6 && (
          <>
            <rect x="0" y="0" width="400" height="400" fill="#08080a" />
            <rect x="30" y="30" width="340" height="340" fill={`url(#dots-${safeId})`} stroke="#27272a" strokeWidth="2" />
            <rect x="30" y="30" width="340" height="90" fill={primary} />
            <rect x="30" y="140" width="160" height="230" fill="#121316" stroke="#27272a" strokeWidth="2" />
            <rect x="210" y="140" width="160" height="230" fill="#050506" stroke={secondary} strokeWidth="2" />
            <rect x="230" y="290" width="120" height="48" fill={`url(#hazard-${safeId})`} />
          </>
        )}

        {/* Corner registration marks */}
        <path d="M 12 24 L 12 12 L 24 12" fill="none" stroke="#f4f4f5" strokeWidth="2" />
        <path d="M 388 24 L 388 12 L 376 12" fill="none" stroke="#f4f4f5" strokeWidth="2" />
        <path d="M 12 376 L 12 388 L 24 388" fill="none" stroke="#f4f4f5" strokeWidth="2" />
        <path d="M 388 376 L 388 388 L 376 388" fill="none" stroke="#f4f4f5" strokeWidth="2" />

        {/* Serial Stamp */}
        <rect x="26" y="346" width="96" height="26" fill="#050506" stroke={primary} strokeWidth="1.5" />
        <text
          x="36"
          y="364"
          fill="#f4f4f5"
          fontFamily="JetBrains Mono, monospace"
          fontSize="13"
          fontWeight="700"
          letterSpacing="1.5"
        >
          {code}
        </text>
      </svg>
    </div>
  );
};
