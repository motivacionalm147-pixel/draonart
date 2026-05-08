import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Layers as LayersIcon, 
  ChevronUp, 
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Copy,
  Zap,
  Edit2,
  Check,
  X,
  Paintbrush,
  Image
} from 'lucide-react';
import { MiniLayerCanvas } from '../MiniLayerCanvas';
import { sound } from '../../sound';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
  opacity?: number;
  data: string[];
}

interface LayerPanelProps {
  layers: Layer[];
  currentLayer: number;
  setCurrentLayer: (idx: number) => void;
  addLayer: () => void;
  deleteLayer: (idx: number) => void;
  toggleLayerVisibility: (idx: number) => void;
  toggleLayerLock: (idx: number) => void;
  reorderLayers: (newLayers: Layer[]) => void;
  renameLayer: (idx: number, newName: string) => void;
  duplicateLayer: (idx: number) => void;
  updateLayerOpacity: (idx: number, opacity: number) => void;
  moveLayer: (idx: number, direction: 'up' | 'down') => void;
  moveToLimit: (idx: number, limit: 'top' | 'bottom') => void;
  triggerLayerFlash: (layerId: string) => void;
  width: number;
  height: number;
  transparentBackground?: boolean;
  setTransparentBackground?: (val: boolean) => void;
  canvasBackgroundColor?: string;
  setCanvasBackgroundColor?: (color: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  currentLayer,
  setCurrentLayer,
  addLayer,
  deleteLayer,
  toggleLayerVisibility,
  toggleLayerLock,
  reorderLayers,
  renameLayer,
  duplicateLayer,
  updateLayerOpacity,
  moveLayer,
  moveToLimit,
  triggerLayerFlash,
  width,
  height,
  transparentBackground = false,
  setTransparentBackground,
  canvasBackgroundColor = '#ffffff',
  setCanvasBackgroundColor
}) => {
  const displayLayers = [...layers].reverse();
  const bgPresetColors = [
    '#ffffff', '#f5f5f5', '#e0e0e0', '#1a1a2e', '#0d1117', '#000000',
    '#fdf6e3', '#f0e6d3', '#d4edda', '#cce5ff', '#f8d7da', '#fff3cd'
  ];

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Background Settings Section */}
      {setTransparentBackground && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 p-4 rounded-3xl border-2 border-white/5 bg-white/5"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Image size={18} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white uppercase tracking-tighter">Fundo do Projeto</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                {transparentBackground ? 'PNG · Transparente' : 'JPG · Cor sólida'}
              </span>
            </div>
          </div>

          {/* Transparent Toggle */}
          <button
            onClick={() => { sound.playClick(); setTransparentBackground(!transparentBackground); }}
            className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:scale-[0.98] ${
              transparentBackground
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.1)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl border-2 overflow-hidden shrink-0 ${
                transparentBackground ? 'border-emerald-500/40' : 'border-white/20'
              }`}>
                {transparentBackground ? (
                  <div className="w-full h-full" style={{
                    backgroundImage: 'conic-gradient(#666 90deg, #999 90deg 180deg, #666 180deg 270deg, #999 270deg)',
                    backgroundSize: '8px 8px'
                  }} />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: canvasBackgroundColor }} />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs font-black uppercase tracking-tight">
                  {transparentBackground ? 'Fundo Transparente' : 'Fundo Sólido'}
                </span>
                <span className="text-[9px] opacity-60 font-bold">
                  {transparentBackground ? 'Salva como PNG' : 'Salva como JPG'}
                </span>
              </div>
            </div>
            <div className={`w-12 h-7 rounded-full p-1 transition-all ${
              transparentBackground ? 'bg-emerald-500' : 'bg-white/10'
            }`}>
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-lg"
                animate={{ x: transparentBackground ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </button>

          {/* Background Color Picker (only when NOT transparent) */}
          {!transparentBackground && setCanvasBackgroundColor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <Paintbrush size={12} className="text-white/40" />
                <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Cor do Fundo</span>
              </div>

              {/* Color Presets Grid */}
              <div className="grid grid-cols-6 gap-2">
                {bgPresetColors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => { e.stopPropagation(); sound.playClick(); setCanvasBackgroundColor(color); }}
                    className={`w-full aspect-square rounded-xl border-2 transition-all active:scale-90 hover:scale-105 ${
                      canvasBackgroundColor === color
                        ? 'border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20 scale-110'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                <div className="relative">
                  <input
                    type="color"
                    value={canvasBackgroundColor}
                    onChange={(e) => setCanvasBackgroundColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-white/20"
                    style={{ padding: 0 }}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">Cor Personalizada</span>
                  <span className="text-sm font-black text-white uppercase tracking-wider">{canvasBackgroundColor}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--accent-color)]/10 rounded-xl">
            <LayersIcon size={20} className="text-[var(--accent-color)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white uppercase tracking-tighter">Camadas</span>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{layers.length} no total</span>
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); addLayer(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white rounded-xl shadow-lg shadow-[var(--accent-color)]/20 transition-all active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-xs font-black uppercase tracking-tight">Nova</span>
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {displayLayers.map((layer) => {
              const actualIdx = layers.findIndex(l => l.id === layer.id);
              if (actualIdx === -1) return null;

              return (
                <LayerItem 
                  key={layer.id}
                  layer={layer}
                  idx={actualIdx}
                  active={currentLayer === actualIdx}
                  onClick={() => { 
                    sound.playClick(); 
                    setCurrentLayer(actualIdx); 
                    triggerLayerFlash(layer.id);
                  }}
                  onToggleVisibility={() => { sound.playClick(); toggleLayerVisibility(actualIdx); }}
                  onToggleLock={() => { sound.playClick(); toggleLayerLock(actualIdx); }}
                  onDelete={() => { sound.playClick(); deleteLayer(actualIdx); }}
                  onRename={(newName) => renameLayer(actualIdx, newName)}
                  onDuplicate={() => { sound.playClick(); duplicateLayer(actualIdx); }}
                  onOpacityChange={(opacity) => updateLayerOpacity(actualIdx, opacity)}
                  onMove={(dir) => moveLayer(actualIdx, dir)}
                  onMoveLimit={(limit) => moveToLimit(actualIdx, limit)}
                  onFlash={() => { sound.playClick(); triggerLayerFlash(layer.id); }}
                  width={width}
                  height={height}
                  layersLength={layers.length}
                  isTop={actualIdx === layers.length - 1}
                  isBottom={actualIdx === 0}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

interface LayerItemProps {
  layer: Layer;
  idx: number;
  active: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onDuplicate: () => void;
  onOpacityChange: (opacity: number) => void;
  onMove: (dir: 'up' | 'down') => void;
  onMoveLimit: (limit: 'top' | 'bottom') => void;
  onFlash: () => void;
  width: number;
  height: number;
  layersLength: number;
  isTop: boolean;
  isBottom: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  idx,
  active,
  onClick,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onRename,
  onDuplicate,
  onOpacityChange,
  onMove,
  onMoveLimit,
  onFlash,
  width,
  height,
  layersLength,
  isTop,
  isBottom
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(layer.name || `Camada ${idx + 1}`);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (tempName.trim()) {
      onRename(tempName.trim());
    } else {
      setTempName(layer.name || `Camada ${idx + 1}`);
    }
    setIsRenaming(false);
    sound.playClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setTempName(layer.name || `Camada ${idx + 1}`);
      setIsRenaming(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
      className={`relative group flex flex-col gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden ${
        active 
          ? 'bg-[var(--bg-element)] border-[var(--accent-color)] shadow-2xl shadow-[var(--accent-color)]/10' 
          : 'bg-white/5 border-white/5 hover:border-white/10'
      }`}
      onClick={onClick}
    >
      {/* Background Pulse Effect when active */}
      {active && (
        <motion.div 
          layoutId={`active-pulse-${layer.id}`}
          className="absolute inset-0 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent pointer-events-none"
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Top Row: Preview, Info, and Arrows */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative group/preview">
          <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl shrink-0 relative group-hover:scale-105 transition-transform">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'conic-gradient(#f0f0f0 90deg, #fff 90deg 180deg, #f0f0f0 180deg 270deg, #fff 270deg)', backgroundSize: '8px 8px' }} />
            <MiniLayerCanvas 
              layerData={layer.data} 
              width={width} 
              height={height} 
              className="w-full h-full object-contain relative z-10" 
            />
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onFlash(); }}
            className="absolute -top-2 -right-2 p-1.5 bg-[var(--accent-color)] text-white rounded-lg shadow-lg opacity-0 group-hover/preview:opacity-100 transition-opacity hover:scale-110 active:scale-90 z-20"
          >
            <Zap size={12} fill="currentColor" />
          </button>
        </div>

        {/* Info & Rename */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/10 border border-[var(--accent-color)] rounded-lg px-2 py-1 text-sm font-bold text-white outline-none"
              />
              <button onClick={handleRenameSubmit} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 group/name"
              onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
            >
              <div className={`text-sm font-black uppercase tracking-tight truncate ${active ? 'text-white' : 'text-white/60'}`}>
                {layer.name || `Camada ${idx + 1}`}
              </div>
              <Edit2 size={12} className="text-white/20 group-hover/name:text-[var(--accent-color)] transition-colors shrink-0" />
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${layer.locked ? 'text-orange-400' : 'text-white/30'}`}>
              {layer.locked ? 'Bloqueada' : 'Editável'}
            </span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
              {Math.round((layer.opacity ?? 1) * 100)}% Opaco
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex gap-1">
            <button 
              disabled={isTop}
              onClick={(e) => { e.stopPropagation(); onMoveLimit('top'); }}
              className={`p-1.5 rounded-lg transition-all ${isTop ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-[var(--accent-color)] active:scale-90'}`}
            >
              <ChevronsUp size={16} />
            </button>
            <button 
              disabled={isTop}
              onClick={(e) => { e.stopPropagation(); onMove('up'); }}
              className={`p-1.5 rounded-lg transition-all ${isTop ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white active:scale-90 active:-translate-y-0.5'}`}
            >
              <ChevronUp size={18} />
            </button>
          </div>
          <div className="flex gap-1">
            <button 
              disabled={isBottom}
              onClick={(e) => { e.stopPropagation(); onMoveLimit('bottom'); }}
              className={`p-1.5 rounded-lg transition-all ${isBottom ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-[var(--accent-color)] active:scale-90'}`}
            >
              <ChevronsDown size={16} />
            </button>
            <button 
              disabled={isBottom}
              onClick={(e) => { e.stopPropagation(); onMove('down'); }}
              className={`p-1.5 rounded-lg transition-all ${isBottom ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white active:scale-90 active:translate-y-0.5'}`}
            >
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </div>

      {active && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 py-2 border-t border-white/5 relative z-10" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Ajuste de Opacidade</span>
            <span className="px-2 py-0.5 bg-[var(--accent-color)] text-white text-[10px] font-black rounded-md">{Math.round((layer.opacity ?? 1) * 100)}%</span>
          </div>
          <div className="relative h-8 flex items-center">
            <div className="absolute inset-0 h-3 bg-white/5 rounded-full my-auto" />
            <div 
              className="absolute inset-y-0 left-0 h-3 bg-[var(--accent-color)] rounded-full my-auto" 
              style={{ width: `${(layer.opacity ?? 1) * 100}%` }} 
            />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.opacity ?? 1}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-[10px] uppercase transition-all ${
              layer.locked 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'bg-white/5 text-white/40 hover:text-white border border-transparent'
            }`}
          >
            {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
            <span>{layer.locked ? 'Bloqueada' : 'Bloquear'}</span>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-[10px] uppercase transition-all ${
              !layer.visible 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-white/5 text-white/40 hover:text-white border border-transparent'
            }`}
          >
            {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>{layer.visible ? 'Visível' : 'Oculta'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-3 text-white/40 hover:text-[var(--accent-color)] bg-white/5 hover:bg-[var(--accent-color)]/10 rounded-xl transition-all active:scale-90"
          >
            <Copy size={18} />
          </button>
          
          {layersLength > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-3 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
