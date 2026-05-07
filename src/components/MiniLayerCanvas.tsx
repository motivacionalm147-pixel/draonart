import React, { useEffect, useRef } from 'react';

interface MiniLayerCanvasProps {
  layerData: string[];
  width: number;
  height: number;
  className?: string;
}

export const MiniLayerCanvas = ({ layerData, width, height, className }: MiniLayerCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < layerData.length; i++) {
      const color = layerData[i];
      if (color && color !== 'transparent') {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const a = color.length === 9 ? parseInt(color.slice(7, 9), 16) : 255;
        const idx = i * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = a;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [layerData, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
