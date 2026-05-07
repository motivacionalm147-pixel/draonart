import React, { useState, useRef, useEffect } from 'react';
import { motion, Reorder, useDragControls, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Film, GripVertical, Clock, ChevronLeft, ChevronRight, Copy, FastForward, Layers, X } from 'lucide-react';
import { sound } from '../../sound';
import { generateId } from '../../utils';

interface Frame {
  id?: string;
  layers: any[];
  texts?: any[];
}

interface FramePanelProps {
  frames: Frame[];
  setFrames?: (frames: Frame[]) => void;
  currentFrame: number;
  setCurrentFrame: (idx: number) => void;
  addFrame: () => void;
  deleteFrame: (idx: number) => void;
  reorderFrames: (newFrames: Frame[]) => void;
  width: number;
  height: number;
  fps?: number;
  setFps?: (fps: number) => void;
  onionSkin?: boolean;
  setOnionSkin?: (onion: boolean) => void;
  onionSkinPast?: number;
  setOnionSkinPast?: (val: number) => void;
  onionSkinFuture?: number;
  setOnionSkinFuture?: (val: number) => void;
  deleteAllFrames?: () => void;
}

export const FramePanel: React.FC<FramePanelProps> = ({
  frames,
  setFrames,
  currentFrame,
  setCurrentFrame,
  addFrame,
  deleteFrame,
  reorderFrames,
  width,
  height,
  fps = 8,
  setFps,
  onionSkin,
  setOnionSkin,
  onionSkinPast = 1,
  setOnionSkinPast,
  onionSkinFuture = 0,
  setOnionSkinFuture,
  deleteAllFrames
}) => {
  // Functions for context menu
  const moveFrame = (idx: number, direction: 'left' | 'right') => {
    if (!setFrames) return;
    sound.playClick();
    const newFrames = [...frames];
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newFrames.length) return;
    
    // Swap
    const temp = newFrames[idx];
    newFrames[idx] = newFrames[targetIdx];
    newFrames[targetIdx] = temp;
    setFrames(newFrames);
    if (currentFrame === idx) setCurrentFrame(targetIdx);
    else if (currentFrame === targetIdx) setCurrentFrame(idx);
  };

  const cloneFrame = (idx: number) => {
    if (!setFrames) return;
    sound.playClick();
    const newFrames = [...frames];
    const frameToClone = frames[idx];
    
    const clonedLayers = frameToClone.layers.map(l => ({ ...l, id: generateId(), data: [...l.data] }));
    const clonedTexts = frameToClone.texts ? frameToClone.texts.map(t => ({ ...t, id: generateId() })) : undefined;
    
    newFrames.splice(idx + 1, 0, {
      id: generateId(),
      layers: clonedLayers,
      texts: clonedTexts,
    });
    setFrames(newFrames);
    setCurrentFrame(idx + 1);
  };

  const insertFrameAt = (idx: number) => {
    if (!setFrames) return;
    sound.playClick();
    const newFrames = [...frames];
    newFrames.splice(idx, 0, {
      id: generateId(),
      layers: [
        {
          id: generateId(),
          name: "Camada 1",
          data: new Array(width * height).fill(""),
          visible: true,
          opacity: 1,
        },
      ],
    });
    setFrames(newFrames);
    setCurrentFrame(idx);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header Panel - More professional */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[var(--accent-color)]">
            <Film size={16} />
            <span className="text-xs font-black uppercase tracking-tight">Timeline</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
            {frames.length} {frames.length !== 1 ? 'Quadros' : 'Quadro'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {deleteAllFrames && (
            <button 
              onClick={deleteAllFrames}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all active:scale-95 group"
              title="Apagar TODOS os frames"
            >
              <Trash2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-tight">Limpar Tudo</span>
            </button>
          )}
          <button 
            onClick={() => { sound.playClick(); addFrame(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-lg shadow-lg shadow-[var(--accent-color)]/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={14} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-tight">Novo</span>
          </button>
        </div>
      </div>

      {/* Animation Controls Grid */}
      <div className="grid grid-cols-1 gap-2">
        {/* Row 1: FPS and Onion Toggle */}
        <div className="grid grid-cols-2 gap-2">
          {setFps && (
            <div className="flex flex-col gap-1 bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 opacity-60">
                  <FastForward size={12} className="text-yellow-500" />
                  <span className="text-[9px] font-black uppercase">FPS</span>
                </div>
                <span className="text-[10px] font-black text-yellow-500">{fps}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="24" 
                value={fps} 
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
          )}

          {setOnionSkin && onionSkin !== undefined && (
            <button
              onClick={() => { sound.playClick(); setOnionSkin(!onionSkin); }}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                onionSkin 
                  ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                  : 'bg-white/5 border-white/5 text-white/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Layers size={12} />
                <span className="text-[9px] font-black uppercase">Onion Skin</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${onionSkin ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
            </button>
          )}
        </div>

        {/* Row 2: Granular Onion Skin Controls (Visible only if onionSkin is active) */}
        {onionSkin && setOnionSkinPast && setOnionSkinFuture && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded-xl border border-white/5"
          >
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter opacity-50">
                <span>Passado</span>
                <span className="text-[var(--accent-color)]">{onionSkinPast}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={onionSkinPast} 
                onChange={(e) => setOnionSkinPast(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
              />
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-2">
              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tighter opacity-50">
                <span>Futuro</span>
                <span className="text-purple-400">{onionSkinFuture}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={onionSkinFuture} 
                onChange={(e) => setOnionSkinFuture(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Timeline Track - Professional look */}
      <div className="relative bg-black/40 border border-white/5 rounded-2xl p-2 overflow-hidden shadow-inner">
        <Reorder.Group 
          axis="x" 
          values={frames} 
          onReorder={reorderFrames}
          className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar scroll-smooth relative z-10 items-end min-h-[140px]"
        >
          {frames.map((frame, idx) => (
            <FrameItem 
              key={frame.id || idx}
              frame={frame}
              idx={idx}
              currentFrame={currentFrame}
              setCurrentFrame={setCurrentFrame}
              width={width}
              height={height}
              deleteFrame={deleteFrame}
              framesLength={frames.length}
              moveFrame={moveFrame}
              cloneFrame={cloneFrame}
              insertFrameAt={insertFrameAt}
              hasSetFrames={!!setFrames}
            />
          ))}
        </Reorder.Group>
        
        {/* Track UI Guides */}
        <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-20" />
        <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-20" />
      </div>
      
      {/* Footer Info */}
      <div className="text-[8px] font-bold text-white/20 uppercase tracking-widest flex items-center justify-center gap-4 mt-1">
        <span className="flex items-center gap-1"><GripVertical size={10}/> Reordenar</span>
        <span className="flex items-center gap-1"><Clock size={10}/> Segure p/ Opções</span>
      </div>
    </div>
  );
};

function FrameItem({ 
  frame, idx, currentFrame, setCurrentFrame, width, height, deleteFrame, framesLength,
  moveFrame, cloneFrame, insertFrameAt, hasSetFrames
}: { 
  key?: number | string, frame: any, idx: number, currentFrame: number, setCurrentFrame: (idx: number) => void, 
  width: number, height: number, deleteFrame: (idx: number) => void, framesLength: number,
  moveFrame: (idx: number, dir: 'left' | 'right') => void, cloneFrame: (idx: number) => void, insertFrameAt: (idx: number) => void, hasSetFrames: boolean
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isReadyToDrag, setIsReadyToDrag] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const controls = useDragControls();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const isActive = currentFrame === idx;

  const handlePointerDown = (e: React.PointerEvent) => {
    sound.playClick();
    setCurrentFrame(idx);
    timerRef.current = setTimeout(() => {
      setIsReadyToDrag(true);
      controls.start(e);
      if (window.navigator.vibrate) window.navigator.vibrate(40);
    }, 200); 
  };

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsReadyToDrag(false);
  };

  return (
    <Reorder.Item 
      value={frame}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => { setIsDragging(true); setIsReadyToDrag(false); }}
      onDragEnd={() => { setIsDragging(false); setIsReadyToDrag(false); }}
      style={{ touchAction: isReadyToDrag || isDragging ? 'none' : 'auto' }}
      className="relative shrink-0 cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerUp={clearTimers}
      onPointerLeave={clearTimers}
    >
      <motion.div 
        animate={{ 
          scale: isDragging || isReadyToDrag ? 1.05 : 1, 
          y: isDragging || isReadyToDrag ? -5 : 0 
        }}
        className={`w-28 flex flex-col items-center gap-1.5 transition-all ${isDragging || isReadyToDrag ? 'z-50' : 'z-10'}`}
      >
        {/* Frame Number */}
        <div className={`w-full flex justify-between items-center px-1 transition-colors ${isActive ? 'text-[var(--accent-color)]' : 'text-white/30'}`}>
          <span className="text-[9px] font-black uppercase tracking-widest">#{idx + 1}</span>
          {isActive && <motion.div layoutId="active-frame-indicator" className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] shadow-[0_0_8px_var(--accent-color)]" />}
        </div>

        {/* Thumbnail Box - Preview Only */}
        <div className={`relative w-full aspect-square rounded-xl border-2 transition-all overflow-hidden ${
          isDragging || isReadyToDrag 
            ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)] shadow-xl scale-105' 
            : isActive 
              ? 'bg-white border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20' 
              : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}>
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <MiniCanvas frame={frame} width={width} height={height} isActive={isActive} />
          </div>
        </div>

        {/* Quick Actions Bar (Refined & More organized below) */}
        <AnimatePresence>
          {isActive && !isDragging && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-[110%] left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 z-50 shadow-2xl"
              style={{ minWidth: '100px', justifyContent: 'center' }}
            >
              {/* Pixel Label Animation */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
                <AnimatePresence mode="wait">
                  {hoveredAction && (
                    <motion.span 
                      key={hoveredAction}
                      initial={{ opacity: 0, y: 3, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -3, scale: 0.9 }}
                      className="text-[7px] font-black text-white uppercase tracking-[0.2em] bg-[var(--accent-color)] px-2 py-0.5 rounded-sm border border-white/30 whitespace-nowrap shadow-lg shadow-[var(--accent-color)]/20"
                      style={{ fontFamily: "'Press Start 2P', cursive, monospace" }}
                    >
                      {hoveredAction}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onMouseEnter={() => setHoveredAction('Antes')}
                  onMouseLeave={() => setHoveredAction(null)}
                  onClick={(e) => { e.stopPropagation(); insertFrameAt(idx); }}
                  className="w-9 h-9 bg-white/5 hover:bg-blue-500/40 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/5"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
                
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onMouseEnter={() => setHoveredAction('Depois')}
                  onMouseLeave={() => setHoveredAction(null)}
                  onClick={(e) => { e.stopPropagation(); insertFrameAt(idx + 1); }}
                  className="w-9 h-9 bg-white/5 hover:bg-green-500/40 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/5"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
                
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onMouseEnter={() => setHoveredAction('Clonar')}
                  onMouseLeave={() => setHoveredAction(null)}
                  onClick={(e) => { e.stopPropagation(); cloneFrame(idx); }}
                  className="w-9 h-9 bg-white/5 hover:bg-yellow-500/40 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 border border-white/5"
                >
                  <Copy size={14} strokeWidth={3} />
                </button>
                
                <div className="w-px h-6 bg-white/10 mx-0.5" />

                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onMouseEnter={() => setHoveredAction('Excluir')}
                  onMouseLeave={() => setHoveredAction(null)}
                  onClick={(e) => { e.stopPropagation(); deleteFrame(idx); }}
                  disabled={framesLength <= 1}
                  className="w-9 h-9 bg-white/5 hover:bg-red-500/40 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-20 border border-white/5"
                >
                  <Trash2 size={14} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movement Buttons (Refined style) */}
        {isActive && hasSetFrames && (
          <>
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => { e.stopPropagation(); moveFrame(idx, 'left'); }}
                disabled={idx === 0}
                className="w-6 h-10 bg-black/80 hover:bg-[var(--accent-color)] disabled:opacity-20 text-white rounded-l-xl flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md"
              >
                <ChevronLeft size={12} strokeWidth={3} />
              </button>
            </div>
            <div className="absolute -right-7 top-1/2 -translate-y-1/2 z-40 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => { e.stopPropagation(); moveFrame(idx, 'right'); }}
                disabled={idx === framesLength - 1}
                className="w-6 h-10 bg-black/80 hover:bg-[var(--accent-color)] disabled:opacity-20 text-white rounded-r-xl flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md"
              >
                <ChevronRight size={12} strokeWidth={3} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </Reorder.Item>
  );
}

export function MiniCanvas({ frame, width, height, isActive }: { frame: any, width: number, height: number, isActive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationFrameId: number;

    // Real-time rendering for active frame
    if (isActive) {
      const mainCanvas = document.getElementById("main-drawing-canvas") as HTMLCanvasElement | null;
      
      const renderRealTime = () => {
        if (mainCanvas) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(mainCanvas, 0, 0, width, height);
        }
        animationFrameId = requestAnimationFrame(renderRealTime);
      };
      
      renderRealTime();
      
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }

    // Static rendering for inactive frames
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Fill transparent (0 alpha)
    for (let i = 0; i < width * height * 4; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }

    frame.layers.forEach((layer: any) => {
      if (!layer.visible) return;
      const layerOpacity = layer.opacity ?? 1;
      
      for (let i = 0; i < layer.data.length; i++) {
        const color = layer.data[i];
        if (color && color !== '#FFFFFF' && color !== 'transparent') {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          const a = color.length === 9 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
          const finalAlpha = a * layerOpacity;
          
          if (finalAlpha === 1) {
            data[i * 4] = r;
            data[i * 4 + 1] = g;
            data[i * 4 + 2] = b;
            data[i * 4 + 3] = 255;
          } else if (finalAlpha > 0) {
            // Alpha blending formula over current pixel
            const outA = finalAlpha + (data[i * 4 + 3]/255) * (1 - finalAlpha);
            if (outA > 0) {
              data[i * 4] = Math.round((r * finalAlpha + data[i * 4] * (data[i * 4 + 3]/255) * (1 - finalAlpha)) / outA);
              data[i * 4 + 1] = Math.round((g * finalAlpha + data[i * 4 + 1] * (data[i * 4 + 3]/255) * (1 - finalAlpha)) / outA);
              data[i * 4 + 2] = Math.round((b * finalAlpha + data[i * 4 + 2] * (data[i * 4 + 3]/255) * (1 - finalAlpha)) / outA);
              data[i * 4 + 3] = Math.round(outA * 255);
            }
          }
        }
      }
    });
    
    ctx.putImageData(imgData, 0, 0);

    if (frame.texts) {
      frame.texts.forEach((t: any) => {
        const fontStyle = `${t.italic ? 'italic ' : ''}${t.bold ? 'bold ' : ''}${t.size}px ${t.font}`;
        ctx.font = fontStyle;
        ctx.fillStyle = t.color;
        ctx.textBaseline = 'top';
        ctx.fillText(t.text, t.x, t.y);
      });
    }
  }, [frame, width, height, isActive]);

  return (
    <canvas ref={canvasRef} width={width} height={height} className="w-full h-full pixelated" />
  );
}
