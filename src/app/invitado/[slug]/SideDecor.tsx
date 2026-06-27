'use client';

import React from 'react';

interface SideDecorProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function SideDecor({ className = "pointer-events-none absolute top-0 h-full w-24 hidden lg:block", style }: SideDecorProps) {
  // We'll define a clean vertical vine of height 800px.
  // We place leaves and flowers at different y coordinates: y = 80, 240, 400, 560, 720.
  return (
    <svg viewBox="0 0 120 800" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true" preserveAspectRatio="none">
      {/* Central Vine Stem */}
      <path d="M 40 0 Q 90 200 30 400 T 50 800" stroke="oklch(0.55 0.10 145)" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <path d="M 45 0 Q 20 180 60 380 T 35 800" stroke="oklch(0.55 0.10 145)" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />

      {/* Cluster at y = 80 */}
      <g transform="translate(60, 80)">
        {/* Leaves */}
        <g transform="rotate(30) scale(1.1)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="rotate(-40) scale(0.9)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        {/* Flowers */}
        <g transform="translate(10, -5) scale(1.1)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.45" fill="var(--gold)" />
        </g>
        <g transform="translate(-12, 10) scale(0.85)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--secondary)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--secondary)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--secondary)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--secondary)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.09" fill="var(--gold)" />
        </g>
      </g>

      {/* Cluster at y = 240 */}
      <g transform="translate(45, 240)">
        <g transform="rotate(70) scale(1)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="rotate(-10) scale(1.1)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="translate(15, 10) scale(1)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.45" fill="var(--gold)" />
        </g>
      </g>

      {/* Cluster at y = 400 */}
      <g transform="translate(35, 400)">
        <g transform="rotate(-20) scale(1.05)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="rotate(110) scale(0.95)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="translate(-10, -8) scale(1.1)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.45" fill="var(--gold)" />
        </g>
        <g transform="translate(12, 12) scale(0.85)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--primary)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--primary)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--primary)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--primary)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.09" fill="var(--gold)" />
        </g>
      </g>

      {/* Cluster at y = 560 */}
      <g transform="translate(50, 560)">
        <g transform="rotate(45) scale(1)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="rotate(-60) scale(0.9)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="translate(8, -12) scale(0.95)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.45" fill="var(--gold)" />
        </g>
      </g>

      {/* Cluster at y = 720 */}
      <g transform="translate(40, 720)">
        <g transform="rotate(-15) scale(1.1)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="rotate(80) scale(1)">
          <path d="M0 0 Q 12 -8 28 -2 Q 16 8 0 0 Z" fill="oklch(0.62 0.11 145)" opacity="0.65" />
        </g>
        <g transform="translate(-12, 5) scale(1)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--accent)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.45" fill="var(--gold)" />
        </g>
        <g transform="translate(10, -10) scale(0.9)">
          <ellipse cx="0" cy="-3.85" rx="3.5" ry="4.9" fill="var(--secondary)" opacity="0.88" />
          <ellipse cx="0" cy="3.85" rx="3.5" ry="4.9" fill="var(--secondary)" opacity="0.88" />
          <ellipse cx="-3.85" cy="0" rx="4.9" ry="3.5" fill="var(--secondary)" opacity="0.88" />
          <ellipse cx="3.85" cy="0" rx="4.9" ry="3.5" fill="var(--secondary)" opacity="0.88" />
          <circle cx="0" cy="0" r="2.09" fill="var(--gold)" />
        </g>
      </g>
    </svg>
  );
}
