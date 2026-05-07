import React, { useEffect, useRef } from 'react';
import { Frame } from './Editor';
import { ChevronLeft } from 'lucide-react';
import { sound } from './sound';

interface GamePreviewProps {
  frames: Frame[];
  width: number;
  height: number;
  onClose: () => void;
}

export default function GamePreview({ frames, width, height, onClose }: GamePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pre-render frames to offscreen canvases for performance
    const offscreenFrames = frames.map(frame => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = width;
      offCanvas.height = height;
      const offCtx = offCanvas.getContext('2d');
      if (offCtx) {
        frame.layers.forEach(layer => {
          if (!layer.visible) return;
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const color = layer.data[y * width + x];
              if (color) {
                offCtx.fillStyle = color;
                offCtx.fillRect(x, y, 1, 1);
              }
            }
          }
        });
      }
      return offCanvas;
    });

    let animationFrameId: number;
    let lastTime = performance.now();
    
    const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false };
    
    const handleKeyDown = (e: KeyboardEvent) => { if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      speed: 200, // pixels per second
      frameIdx: 0,
      frameTimer: 0,
      facingLeft: false
    };

    const gameLoop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update
      let moving = false;
      if (keys.w || keys.ArrowUp) { player.y -= player.speed * dt; moving = true; }
      if (keys.s || keys.ArrowDown) { player.y += player.speed * dt; moving = true; }
      if (keys.a || keys.ArrowLeft) { player.x -= player.speed * dt; moving = true; player.facingLeft = true; }
      if (keys.d || keys.ArrowRight) { player.x += player.speed * dt; moving = true; player.facingLeft = false; }

      if (moving) {
        player.frameTimer += dt;
        if (player.frameTimer > 0.1) { // 10 fps animation
          player.frameIdx = (player.frameIdx + 1) % offscreenFrames.length;
          player.frameTimer = 0;
        }
      } else {
        player.frameIdx = 0;
      }

      // Draw
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid/ground
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      for(let i = 0; i < canvas.width; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for(let i = 0; i < canvas.height; i += 64) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw player
      const currentFrameCanvas = offscreenFrames[player.frameIdx];
      const scale = 4;
      const drawWidth = width * scale;
      const drawHeight = height * scale;

      ctx.save();
      ctx.translate(player.x, player.y);
      if (player.facingLeft) {
        ctx.scale(-1, 1);
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(currentFrameCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [frames, width, height]);

  return (
    <div className="fixed inset-0 bg-[#111] z-50 flex flex-col font-pixel text-white">
      <div className="p-4 bg-[#2a2a2a] flex items-center gap-4 border-b-4 border-[#4a4a4a]">
        <button onClick={() => { sound.playClick(); onClose(); }} className="p-2 bg-[#3a3a3a] rounded hover:bg-[#4a4a4a] transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl text-[#FFCCAA] drop-shadow-[2px_2px_0px_#FF004D]">GAME PREVIEW</h2>
        <div className="ml-auto text-sm text-[#83769C]">Use WASD or Arrows to move</div>
      </div>
      <div className="flex-1 relative">
        <canvas 
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 70}
          className="block w-full h-full"
        />
      </div>
    </div>
  );
}
