import React from 'react';

interface AppointexoLogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark' | 'auto';
}

export function AppointexoLogo({ 
  className = '', 
  size = 32,
  variant = 'auto' 
}: AppointexoLogoProps) {
  // Determine if we should use dark theme based on variant
  const isDark = variant === 'dark' || 
    (variant === 'auto' && typeof window !== 'undefined' && 
     window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Appointexo logo"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <style>
          {`
            .accent {
              fill: var(--appointexo-accent, #84cc16);
            }
            @media (prefers-color-scheme: dark) {
              .accent {
                fill: var(--appointexo-accent, #a3e635);
              }
            }
          `}
        </style>
      </defs>
      {/* Outer "exo" ring - even larger (+4 units) */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      {/* Calendar main shape - even larger (+4 units) */}
      <rect
        x="14"
        y="12"
        width="36"
        height="38"
        rx="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeOpacity="1"
      />
      {/* Calendar rings on top - even larger */}
      <line
        x1="20"
        y1="8"
        x2="20"
        y2="13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="1"
      />
      <line
        x1="44"
        y1="8"
        x2="44"
        y2="13"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="1"
      />
      {/* Calendar slots: 3x3 grid - even larger (+4 units) */}
      {/* Top row */}
      <rect x="18" y="20" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      <rect x="27" y="20" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      <rect x="36" y="20" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      {/* Middle row */}
      <rect x="18" y="29" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      <rect x="27" y="29" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      <rect x="36" y="29" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      {/* Bottom row: two regular + one branded slot */}
      <rect x="18" y="38" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      <rect x="27" y="38" width="7" height="7" rx="1.2"
            fill="currentColor" fillOpacity="0.6" />
      {/* Highlighted Appointexo slot - larger and more visible */}
      <rect x="36" y="38" width="7" height="7" rx="1.2"
            className="accent" />
    </svg>
  );
}

