import React from 'react';

export default function AppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Dark Background */}
      <rect width="100" height="120" fill="#1a1c23" />
      
      {/* Grid Square */}
      <rect x="10" y="10" width="80" height="80" fill="#8fa3a0" stroke="#333" strokeWidth="2" />
      <path d="M10 30h80M10 50h80M10 70h80M30 10v80M50 10v80M70 10v80" stroke="#a8b5b2" strokeWidth="1" />
      
      {/* Mouse Cursor (Left) */}
      <path d="M20 45 l10 10 -4 2 4 6 -2 2 -4 -6 -2 4 z" fill="#333" />
      <path d="M21 47 l6 6 -2 1 3 4 -1 1 -3 -4 -1 2 z" fill="#fff" />
      
      {/* Hand Cursor (Right) */}
      <path d="M75 45 v10 h4 v10 h-12 v-5 h-4 v15 h16 v-20 h4 v-10 z" fill="#fff" stroke="#333" strokeWidth="1" />
      
      {/* Pencil (Top Left to Bottom Right) */}
      <g transform="translate(50, 50) rotate(45) translate(-50, -50)">
        {/* Body */}
        <rect x="45" y="20" width="10" height="50" fill="#2d3748" stroke="#1a202c" strokeWidth="1" />
        <rect x="45" y="20" width="5" height="50" fill="#4a5568" />
        {/* Wood Tip */}
        <polygon points="45,20 55,20 50,10" fill="#d6bc97" stroke="#1a202c" strokeWidth="1" />
        {/* Lead */}
        <polygon points="48,14 52,14 50,10" fill="#1a202c" />
        {/* Metal Band */}
        <rect x="45" y="70" width="10" height="5" fill="#a0aec0" stroke="#1a202c" strokeWidth="1" />
        {/* Eraser */}
        <rect x="45" y="75" width="10" height="10" fill="#c53030" stroke="#1a202c" strokeWidth="1" />
        <rect x="45" y="75" width="5" height="10" fill="#e53e3e" />
      </g>

      {/* Pen (Bottom Left to Top Right) */}
      <g transform="translate(50, 50) rotate(-45) translate(-50, -50)">
        {/* Body */}
        <rect x="45" y="20" width="10" height="60" fill="#2d3748" stroke="#1a202c" strokeWidth="1" />
        <rect x="45" y="20" width="5" height="60" fill="#4a5568" />
        {/* Button */}
        <rect x="47" y="40" width="6" height="15" fill="#2b6cb0" stroke="#1a202c" strokeWidth="1" />
        {/* Tip */}
        <polygon points="45,20 55,20 50,10" fill="#a0aec0" stroke="#1a202c" strokeWidth="1" />
        <polygon points="48,14 52,14 50,10" fill="#718096" />
      </g>

      {/* "STUDIO" Text */}
      <text x="50" y="105" fontFamily="monospace" fontSize="20" fontWeight="bold" fill="#e2e8f0" textAnchor="middle" style={{ textShadow: '0 4px 0 #9b2c2c, 0 5px 0 #1a202c' }}>
        STUDIO
      </text>
    </svg>
  );
}
