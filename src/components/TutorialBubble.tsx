import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTutorial } from '../contexts/TutorialContext';

interface TutorialBubbleProps {
  step: string;
  title: string;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  targetId?: string;
  onNext?: () => void;
  showNext?: boolean;
}

export function TutorialBubble({ step, title, content, position = 'bottom', targetId, onNext, showNext = true }: TutorialBubbleProps) {
  const { currentStep, setEnabled, nextStep } = useTutorial();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [bubbleSize, setBubbleSize] = useState({ width: 224, height: 120 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep !== step) return;

    const updatePosition = () => {
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        }
      } else {
        // Find parent element if no targetId provided
        // Note: Since we use createPortal, parentElement of bubbleRef will be document.body.
        // If targetId is not provided, we can't reliably find the intended parent.
        // It's highly recommended to always provide targetId.
      }
      
      if (bubbleRef.current) {
        setBubbleSize({
          width: bubbleRef.current.offsetWidth,
          height: bubbleRef.current.offsetHeight
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    // Small delay to ensure layout is complete
    const timeout = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearTimeout(timeout);
    };
  }, [currentStep, step, targetId]);

  // Calculate position styles
  let style: React.CSSProperties = {};
  let arrowStyle: React.CSSProperties = {};
  let arrowClass = '';
  let ArrowIcon = ArrowUp;

  if (position === 'center' || !targetRect) {
    style = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
    };
  } else if (targetRect) {
    const gap = 16; // Space between target and bubble
    const bubbleWidth = bubbleSize.width;
    const bubbleHeight = bubbleSize.height;
    const padding = 16; // Padding from screen edge
    
    style = {
      position: 'fixed',
      zIndex: 1000,
    };

    let targetCenterX = targetRect.left + targetRect.width / 2;
    let targetCenterY = targetRect.top + targetRect.height / 2;

    switch (position) {
      case 'top':
      case 'bottom':
        let left = targetCenterX - bubbleWidth / 2;
        // Clamp to screen edges
        if (left < padding) left = padding;
        if (left + bubbleWidth > window.innerWidth - padding) left = window.innerWidth - padding - bubbleWidth;
        
        style.left = left;
        
        // Calculate arrow position relative to bubble
        let arrowLeft = targetCenterX - left;
        // Clamp arrow so it doesn't go outside bubble
        arrowLeft = Math.max(16, Math.min(bubbleWidth - 16, arrowLeft));
        
        arrowStyle = { left: arrowLeft, transform: 'translateX(-50%)' };

        if (position === 'top') {
          style.bottom = window.innerHeight - targetRect.top + gap;
          arrowClass = 'absolute bottom-[-12px] text-[#2a2a2a]';
          ArrowIcon = ArrowDown;
        } else {
          style.top = targetRect.bottom + gap;
          arrowClass = 'absolute top-[-12px] text-[#2a2a2a]';
          ArrowIcon = ArrowUp;
        }
        break;

      case 'left':
      case 'right':
        let top = targetCenterY - bubbleHeight / 2;
        // Clamp to screen edges
        if (top < padding) top = padding;
        if (top + bubbleHeight > window.innerHeight - padding) top = window.innerHeight - padding - bubbleHeight;
        
        style.top = top;
        
        // Calculate arrow position relative to bubble
        let arrowTop = targetCenterY - top;
        // Clamp arrow so it doesn't go outside bubble
        arrowTop = Math.max(16, Math.min(bubbleHeight - 16, arrowTop));
        
        arrowStyle = { top: arrowTop, transform: 'translateY(-50%)' };

        if (position === 'left') {
          let right = window.innerWidth - targetRect.left + gap;
          // Clamp to screen edges
          if (right < padding) right = padding;
          if (right + bubbleWidth > window.innerWidth - padding) right = window.innerWidth - padding - bubbleWidth;
          style.right = right;
          arrowClass = 'absolute right-[-12px] text-[#2a2a2a]';
          ArrowIcon = ArrowRight;
        } else {
          let left = targetRect.right + gap;
          // Clamp to screen edges
          if (left < padding) left = padding;
          if (left + bubbleWidth > window.innerWidth - padding) left = window.innerWidth - padding - bubbleWidth;
          style.left = left;
          arrowClass = 'absolute left-[-12px] text-[#2a2a2a]';
          ArrowIcon = ArrowLeft;
        }
        break;
    }
  }

  const contentNode = (
    <AnimatePresence>
      {currentStep === step && position === 'center' && (
        <motion.div
          key={`backdrop-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm"
        />
      )}
      {currentStep === step && (
        position === 'center' ? (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <motion.div
              key={`bubble-${step}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-64 bg-[#2a2a2a] text-white p-4 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-4 border-black pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-sm text-[#3b82f6] uppercase tracking-wider font-sans">
                  {title}
                </h3>
                <button 
                  onClick={() => setEnabled(false)}
                  className="text-gray-400 hover:text-white transition-colors -mt-1 -mr-1"
                  title="Pular Tutorial"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="text-xs text-gray-300 mb-4 leading-relaxed font-sans">
                {content}
              </div>

              {showNext && (
                <div className="flex justify-end">
                  <button 
                    onClick={onNext || nextStep}
                    className="pixel-btn px-4 py-1.5 text-xs"
                  >
                    Ok!
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          <motion.div
            key={`bubble-${step}`}
            ref={bubbleRef}
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0, 
              x: position === 'left' ? 10 : position === 'right' ? -10 : 0 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0, 
              x: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: 0, 
              x: 0 
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{ ...style, transform: undefined }}
            className="w-56 bg-[#2a2a2a] text-white p-3 rounded-none shadow-[4px_4px_0px_rgba(0,0,0,1)] border-4 border-black absolute"
          >
            {/* Pixel Art Arrow */}
            {targetRect && (
              <div className={arrowClass} style={arrowStyle}>
                <ArrowIcon size={20} className="drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" fill="currentColor" />
              </div>
            )}

            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-xs text-[#3b82f6] uppercase tracking-wider font-sans">
                {title}
              </h3>
              <button 
                onClick={() => setEnabled(false)}
                className="text-gray-400 hover:text-white transition-colors -mt-1 -mr-1"
                title="Pular Tutorial"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="text-[10px] text-gray-300 mb-3 leading-relaxed font-sans">
              {content}
            </div>

            {showNext && (
              <div className="flex justify-end">
                <button 
                  onClick={onNext || nextStep}
                  className="pixel-btn px-3 py-1 text-[10px]"
                >
                  Ok!
                </button>
              </div>
            )}
          </motion.div>
        )
      )}
    </AnimatePresence>
  );

  return createPortal(contentNode, document.body);
}
