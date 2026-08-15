import React from 'react';

interface Props {
  className?: string;
  variant?: 'dark' | 'light' | 'mauve' | 'gold';
  showText?: boolean;
  showSubtitle?: boolean;
}

export const HRALogo: React.FC<Props> = ({
  className = 'w-auto h-12',
  variant = 'dark',
  showText = true,
  showSubtitle = true,
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

  const subtextColor =
    variant === 'light'
      ? '#CBAF87'
      : variant === 'gold'
      ? '#F3EAE2'
      : variant === 'mauve'
      ? '#302112'
      : '#92798B';

  const arcGradientEnd =
    variant === 'light'
      ? 'rgba(243, 234, 226, 0.15)'
      : 'rgba(90, 70, 59, 0.08)';

  return (
    <div className={`flex items-center select-none ${className}`} id="hra-logo-container">
      <svg
        viewBox="0 0 460 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
        aria-label="HRA Accountant Logo"
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
          d="M 28 148 C 55 65 145 16 380 36 C 320 26 175 20 54 105 C 42 122 33 138 28 148 Z"
          fill={`url(#hraArcGrad-${variant})`}
        />

        {/* MAIN HRA TYPOGRAPHY */}
        {showText && (
          <>
            <text
              x="42"
              y="132"
              fill={textColor}
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
              fontWeight="900"
              fontSize="132"
              letterSpacing="-3px"
            >
              HRA
            </text>
            {showSubtitle && (
              <text
                x="46"
                y="180"
                fill={subtextColor}
                fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
                fontWeight="900"
                fontSize="36"
                letterSpacing="10px"
              >
                ACCOUNTANT
              </text>
            )}
          </>
        )}
      </svg>
    </div>
  );
};
