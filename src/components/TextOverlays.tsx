import React from 'react';

export interface TextObject {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
}

interface TextLayerOverlayProps {
  width: number;
  height: number;
  texts: TextObject[];
  onTextClick?: (index: number) => void;
}

export const TextLayerOverlay = ({ width, height, texts, onTextClick }: TextLayerOverlayProps) => {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full z-20" viewBox={`0 0 ${width} ${height}`}>
      {texts.map((t, i) => (
        <text
          key={t.id}
          x={t.x}
          y={t.y}
          fill={t.color}
          fontFamily={t.font}
          fontSize={t.size}
          fontWeight={t.bold ? 'bold' : 'normal'}
          fontStyle={t.italic ? 'italic' : 'normal'}
          onPointerDown={(e) => {
            if (onTextClick) {
              e.stopPropagation();
              onTextClick(i);
            }
          }}
          className={onTextClick ? "pointer-events-auto cursor-pointer hover:stroke-blue-500 hover:stroke-2" : ""}
          style={{
            dominantBaseline: 'hanging',
            whiteSpace: 'pre',
          }}
        >
          {t.text}
        </text>
      ))}
    </svg>
  );
};

export const getTextMetrics = (text: string, font: string, size: number, bold: boolean, italic: boolean) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { width: size * text.length * 0.6, height: size };
  ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${font}`;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    height: size
  };
};

interface TextPreviewCanvasProps {
  width: number;
  height: number;
  text: string;
  x: number;
  y: number;
  color: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
}

export const TextPreviewCanvas = ({ width, height, text, x, y, color, font, size, bold, italic }: TextPreviewCanvasProps) => {
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible w-full h-full" viewBox={`0 0 ${width} ${height}`}>
      <text
        x={x}
        y={y}
        fill={color}
        fontFamily={font}
        fontSize={size}
        fontWeight={bold ? 'bold' : 'normal'}
        fontStyle={italic ? 'italic' : 'normal'}
        style={{
          dominantBaseline: 'hanging',
          whiteSpace: 'pre',
        }}
      >
        {text}
      </text>
    </svg>
  );
};
