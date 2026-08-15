import React from 'react';

interface Props {
  className?: string;
  variant?: 'dark' | 'light' | 'mauve' | 'gold';
  showText?: boolean;
}

export const HRALogo: React.FC<Props> = ({
  className = 'w-auto h-12',
  variant = 'dark',
  showText = true,
}) => {
  const arcColor =
    variant === 'light'
      ? '#F3EAE2'
      : variant === 'gold'
      ? '#CBAF87'
      : variant === 'mauve'
      ? '#92798B'
      : '#302112';

  const textColor =
    variant === 'light'
      ? '#F3EAE2'
      : variant === 'gold'
      ? '#CBAF87'
      : variant === 'mauve'
      ? '#92798B'
      : '#302112';

  const arcGradientEnd =
    variant === 'light'
      ? 'rgba(243, 234, 226, 0.15)'
      : 'rgba(90, 70, 59, 0.08)';

  return (
    <div className={`flex items-center select-none ${className}`} id="hra-logo-container">
      <svg
        viewBox="0 0 420 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        aria-label="HRA Logo"
      >
        <defs>
          <linearGradient id={`hraArcGrad-${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={arcColor} stopOpacity="1" />
            <stop offset="65%" stopColor={arcColor} stopOpacity="0.85" />
            <stop offset="100%" stopColor={arcGradientEnd} stopOpacity="0.1" />
          </linearGradient>
          <filter id={`hraSubtleGlow-${variant}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#B19CAD" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* SWOOPING ARCH/ARC CURVE */}
        <path
          d="M 28 152 C 55 75 140 18 350 42 C 300 32 165 24 52 112 C 40 128 32 142 28 152 Z"
          fill={`url(#hraArcGrad-${variant})`}
        />

        {/* MAIN HRA TYPOGRAPHY */}
        {showText && (
          <text
            x="50"
            y="142"
            fill={textColor}
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            fontWeight="900"
            fontSize="148"
            letterSpacing="-4px"
          >
            HRA
          </text>
        )}
      </svg>
    </div>
  );
};
