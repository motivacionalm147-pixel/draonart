import React, { useRef, useCallback } from 'react';
import { sound } from '../../sound';
import { useTooltip } from '../../contexts/TooltipContext';

interface ToolButtonProps {
  id: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  color?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  label?: string;
  shortcutKey?: string;
  tooltip?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ 
  id, 
  icon, 
  active, 
  onClick, 
  color, 
  onPointerDown, 
  onPointerMove, 
  onPointerUp, 
  label, 
  shortcutKey,
  tooltip
}) => {
  const { show, hide } = useTooltip();
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const clearTimer = useCallback(() => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
      tooltipTimer.current = null;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    clearTimer();
    if (tooltip && label) {
      tooltipTimer.current = setTimeout(() => {
        tooltipTimer.current = null;
        if (btnRef.current) {
          const rect = btnRef.current.getBoundingClientRect();
          show(label, tooltip, rect);
        }
      }, 700);
    }
    if (onPointerDown) onPointerDown(e);
  }, [tooltip, label, show, onPointerDown, clearTimer]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    clearTimer();
    hide(); // Auto-dismiss tooltip when finger lifts
    if (onPointerUp) onPointerUp(e);
  }, [clearTimer, hide, onPointerUp]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    clearTimer();
    hide();
    if (onPointerUp) onPointerUp(e);
  }, [clearTimer, hide, onPointerUp]);

  const btnSize = 'calc(44px * var(--ui-scale))';

  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0 relative" style={{ width: btnSize }}>
      {active && label && (
        <div className="active-label-container pointer-events-none z-[100] animate-in fade-in duration-200">
          <div className="bg-[var(--accent-color)] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
            {label}
          </div>
          <div className="active-label-arrow" />
        </div>
      )}
      <button 
        ref={btnRef}
        onClick={(e) => { sound.playClick(); if (onClick) onClick(e); }}
        onPointerDown={handlePointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
        className={`pixel-icon-btn ${active ? 'active' : ''} relative`}
        style={{ 
          width: btnSize, 
          height: btnSize,
          minWidth: btnSize,
          minHeight: btnSize
        }}
      >
        <div style={{ transform: 'scale(var(--ui-scale))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        {color && <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 border-2 border-[#000]" style={{ backgroundColor: color }} />}
        {shortcutKey && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-[var(--bg-surface)] text-[var(--text-primary)] text-[8px] font-bold px-0.5 rounded-sm border border-[var(--border-strong)] z-20 shadow-sm pointer-events-none uppercase hidden lg:block">
            {shortcutKey}
          </div>
        )}
      </button>
    </div>
  );
};
