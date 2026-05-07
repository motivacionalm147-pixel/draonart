import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Merge, ChevronDown, Sun, Moon, X, ZoomIn, Maximize, ZoomOut, Sparkles, Wand2, Zap, Hand, Trash2, Eye, EyeOff } from 'lucide-react';
import { sound } from '../../sound';
import { useTooltip } from '../../contexts/TooltipContext';

interface FloatingControlsProps {
  uiVisible: boolean;
  symmetryX: boolean;
  setSymmetryX: (val: boolean) => void;
  symmetryY: boolean;
  setSymmetryY: (val: boolean) => void;
  symmetryDiag1: boolean;
  setSymmetryDiag1: (val: boolean) => void;
  symmetryDiag2: boolean;
  setSymmetryDiag2: (val: boolean) => void;
  primarySymmetry: 'x' | 'y' | 'diag1' | 'diag2';
  setPrimarySymmetry: (val: 'x' | 'y' | 'diag1' | 'diag2') => void;
  showSymmetryMenu: boolean;
  setShowSymmetryMenu: (val: boolean) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleResetView: () => void;
  shortcuts: Record<string, string>;
  currentTool: string;
  selectTool: (tool: string) => void;
  clearCurrentLayer: () => void;
  isTrashLongPress: React.MutableRefObject<boolean>;
  trashLongPressTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  setShowDeletedHistory: (show: boolean) => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  uiVisible,
  symmetryX,
  setSymmetryX,
  symmetryY,
  setSymmetryY,
  symmetryDiag1,
  setSymmetryDiag1,
  symmetryDiag2,
  setSymmetryDiag2,
  primarySymmetry,
  setPrimarySymmetry,
  showSymmetryMenu,
  setShowSymmetryMenu,
  handleZoomIn,
  handleZoomOut,
  handleResetView,
  shortcuts,
  currentTool,
  selectTool,
  clearCurrentLayer,
  isTrashLongPress,
  trashLongPressTimer,
  setShowDeletedHistory
}) => {
  const { show: showTooltip, hide: hideTooltip } = useTooltip();
  const isSymmetryActive = symmetryX || symmetryY || symmetryDiag1 || symmetryDiag2;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSymmetryLongPress = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      showTooltip(
        "Simetria (SPL)", 
        "Desenhe simultaneamente em vários lados da tela usando a simetria horizontal, vertical ou diagonal.",
        rect
      );
    }, 500);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    hideTooltip();
  };

  return (
    <>
      {/* Draggable Floating Controls */}
      <motion.div 
        drag
        dragMomentum={false}
        initial={{ x: 0, y: 0 }}
        className={`fixed right-3 top-20 z-[60] flex flex-col items-center gap-3 transition-opacity duration-300 ${!uiVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.05, opacity: 0.9 }}
      >
        {/* Toggle Button (Eye) */}
        <button 
          onClick={() => { sound.playClick(); setIsCollapsed(!isCollapsed); }}
          className="w-11 h-11 bg-[var(--bg-panel)]/90 backdrop-blur-2xl border border-[var(--border-strong)] rounded-full flex items-center justify-center text-gray-300 hover:text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          {isCollapsed ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="flex flex-col items-center gap-3"
            >
              {/* FX Group: Symmetry */}
              <div className="flex flex-col items-center gap-2 bg-[var(--bg-panel)]/90 backdrop-blur-2xl p-2 rounded-[2rem] border border-[var(--border-strong)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Symmetry Control (SPL) */}
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Pixel Animated Label */}
            <AnimatePresence>
              {(isHovered || showSymmetryMenu) && (
                <motion.div
                  initial={{ opacity: 0, x: -10, scale: 0.8 }}
                  animate={{ opacity: 1, x: -2, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.8 }}
                  className="absolute right-full mr-3 top-1/2 -translate-y-1/2 z-[100] pointer-events-none"
                >
                  <div 
                    className="bg-black/90 text-[7px] font-black text-white px-2 py-1 rounded-sm border border-white/20 whitespace-nowrap shadow-xl uppercase tracking-widest"
                    style={{ 
                      fontFamily: "'Press Start 2P', cursive, monospace",
                      textShadow: "0 0 5px var(--accent-color)" 
                    }}
                  >
                    Simetria
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onPointerDown={handleSymmetryLongPress}
              onPointerUp={clearLongPress}
              onPointerLeave={clearLongPress}
              onClick={() => { sound.playClick(); setShowSymmetryMenu(!showSymmetryMenu); }}
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-lg border-2 transition-all active:scale-95 ${
                showSymmetryMenu 
                  ? 'bg-[var(--bg-panel)] border-[var(--accent-color)] text-[var(--accent-color)]' 
                  : isSymmetryActive
                    ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Merge size={20} className={`transform transition-transform duration-500 ${
                primarySymmetry === 'x' ? 'rotate-90' : 
                primarySymmetry === 'y' ? 'rotate-0' : 
                primarySymmetry === 'diag1' ? 'rotate-45' : '-rotate-45'
              }`} />
              <span className="text-[7px] font-black uppercase tracking-tighter">SPL</span>
            </button>

            {/* Symmetry Menu Expansion */}
            <AnimatePresence>
              {showSymmetryMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.9 }}
                  className="absolute right-[120%] landscape:right-auto landscape:bottom-[130%] top-0 landscape:top-auto bg-[var(--bg-panel)]/95 backdrop-blur-2xl border border-[var(--border-strong)] rounded-2xl shadow-2xl p-2 flex flex-col landscape:flex-row gap-1.5 min-w-[140px] landscape:min-w-0"
                  onPointerDown={e => e.stopPropagation()}
                >
                  {[
                    { id: 'x', label: 'Hor.', active: symmetryX, toggle: () => setSymmetryX(!symmetryX), icon: <Merge size={14} className="rotate-90" /> },
                    { id: 'y', label: 'Ver.', active: symmetryY, toggle: () => setSymmetryY(!symmetryY), icon: <Merge size={14} /> },
                    { id: 'diag1', label: 'D1', active: symmetryDiag1, toggle: () => setSymmetryDiag1(!symmetryDiag1), icon: <Merge size={14} className="rotate-45" /> },
                    { id: 'diag2', label: 'D2', active: symmetryDiag2, toggle: () => setSymmetryDiag2(!symmetryDiag2), icon: <Merge size={14} className="-rotate-45" /> }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { sound.playClick(); opt.toggle(); setPrimarySymmetry(opt.id as any); }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                        opt.active 
                          ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' 
                          : 'text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {opt.icon} <span className="landscape:hidden">{opt.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

              {/* Expanded Tools Group (Zoom + Move + Trash) */}
              <div className="bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-strong)] rounded-[2rem] p-2 flex flex-col gap-2 shadow-2xl scale-95 hover:scale-100 transition-all pointer-events-auto">
                <button 
                  onClick={() => { sound.playClick(); selectTool('hand'); }} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${currentTool === 'hand' ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Hand size={18} />
                </button>
                <div className="w-8 h-[1px] bg-white/10 mx-auto" />
                <button onClick={() => { sound.playClick(); handleZoomIn(); }} className="w-10 h-10 bg-white/5 hover:bg-[var(--accent-color)]/20 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                  <ZoomIn size={18} />
                </button>
                <button onClick={() => { sound.playClick(); handleResetView(); }} className="w-10 h-10 bg-white/5 hover:bg-[var(--accent-color)]/20 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                  <Maximize size={18} />
                </button>
                <button onClick={() => { sound.playClick(); handleZoomOut(); }} className="w-10 h-10 bg-white/5 hover:bg-[var(--accent-color)]/20 text-gray-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:scale-90">
                  <ZoomOut size={18} />
                </button>
                <div className="w-8 h-[1px] bg-white/10 mx-auto" />
                <button 
                  onClick={() => { 
                    sound.playErase();
                    if (isTrashLongPress.current) { isTrashLongPress.current = false; return; }
                    clearCurrentLayer(); 
                  }} 
                  onPointerDown={() => {
                    isTrashLongPress.current = false;
                    trashLongPressTimer.current = setTimeout(() => {
                      isTrashLongPress.current = true;
                      setShowDeletedHistory(true);
                      trashLongPressTimer.current = null;
                    }, 500);
                  }} 
                  onPointerUp={() => { if (trashLongPressTimer.current) { clearTimeout(trashLongPressTimer.current); trashLongPressTimer.current = null; } }} 
                  onPointerMove={() => { if (trashLongPressTimer.current) { clearTimeout(trashLongPressTimer.current); trashLongPressTimer.current = null; } }} 
                  className="w-10 h-10 bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl flex items-center justify-center transition-all active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};
