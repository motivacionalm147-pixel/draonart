import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipData {
  title: string;
  description: string;
  rect: DOMRect;
}

interface TooltipContextType {
  show: (title: string, description: string, rect: DOMRect) => void;
  hide: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback((title: string, description: string, rect: DOMRect) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setTooltip({ title, description, rect });
    if (window.navigator.vibrate) window.navigator.vibrate(20);
  }, []);

  const hide = useCallback(() => {
    // Fade out with a tiny delay so animation can play
    hideTimer.current = setTimeout(() => {
      setTooltip(null);
    }, 80);
  }, []);

  return (
    <TooltipContext.Provider value={{ show, hide }}>
      {children}
      {createPortal(<TooltipOverlay tooltip={tooltip} onDismiss={() => setTooltip(null)} />, document.body)}
    </TooltipContext.Provider>
  );
}

function TooltipOverlay({ tooltip, onDismiss }: { tooltip: TooltipData | null; onDismiss: () => void }) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  const data = tooltip;
  if (!data) return null;

  const { title, description, rect } = data;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const showAbove = centerY > vh / 2;
  const tooltipWidth = Math.min(260, vw - 32);
  let left = centerX - tooltipWidth / 2;
  if (left < 16) left = 16;
  if (left + tooltipWidth > vw - 16) left = vw - 16 - tooltipWidth;
  let arrowLeft = centerX - left;
  arrowLeft = Math.max(20, Math.min(tooltipWidth - 20, arrowLeft));

  const style: React.CSSProperties = {
    position: 'fixed',
    left,
    width: tooltipWidth,
    zIndex: 9999,
    pointerEvents: 'none',
  };

  if (showAbove) {
    style.bottom = vh - rect.top + 12;
  } else {
    style.top = rect.bottom + 12;
  }

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="tooltip-card"
          initial={{ opacity: 0, scale: 0.85, y: showAbove ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: showAbove ? 10 : -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400, duration: 0.2 }}
          style={style}
        >
          {/* Arrow */}
          <div
            className={`absolute ${showAbove ? 'bottom-[-6px]' : 'top-[-6px]'}`}
            style={{ left: arrowLeft, transform: 'translateX(-50%)' }}
          >
            <div
              className={`w-3 h-3 bg-[#1e1e2e] border border-[#3b82f6]/40 ${showAbove ? 'rotate-45 border-t-0 border-l-0' : 'rotate-45 border-b-0 border-r-0'}`}
            />
          </div>

          {/* Content */}
          <div className="bg-[#1e1e2e] border border-[#3b82f6]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(59,130,246,0.15)] overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <h4 className="text-sm font-black text-[#3b82f6] uppercase tracking-wider">{title}</h4>
            </div>
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}
