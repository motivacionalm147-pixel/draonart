import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Lock, Crown } from 'lucide-react';
import { BADGES } from '../data/badges';

interface BadgeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (badgeId: string) => void;
  currentBadge?: string;
  isPro: boolean;
}

export default function BadgeSelectionModal({ isOpen, onClose, onSelect, currentBadge, isPro }: BadgeSelectionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0a0a0a] border border-[#222] rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-[#222] flex items-center justify-between bg-gradient-to-r from-yellow-500/5 to-transparent">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  Seus Selos <Crown className="text-yellow-500" size={24} />
                </h2>
                <p className="text-gray-500 text-sm font-medium">Exiba suas conquistas no seu perfil</p>
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-[#111] hover:bg-[#222] text-gray-400 hover:text-white rounded-full transition-all border border-[#222]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid */}
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {BADGES.map((badge) => {
                  const isSelected = currentBadge === badge.id;
                  const isLocked = badge.pro && !isPro;

                  return (
                    <motion.button
                      key={badge.id}
                      whileHover={isLocked ? {} : { scale: 1.02, y: -4 }}
                      whileTap={isLocked ? {} : { scale: 0.98 }}
                      onClick={() => !isLocked && onSelect(badge.id)}
                      className={`relative p-4 rounded-3xl border-2 transition-all text-left flex flex-col items-center gap-3 ${
                        isSelected 
                          ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
                          : isLocked 
                            ? 'border-[#1a1a1a] bg-[#0d0d0d] opacity-60 cursor-not-allowed'
                            : 'border-[#222] bg-[#111] hover:border-[#444]'
                      }`}
                    >
                      {/* Badge Image Container */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        {badge.glow && !isLocked && (
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 rounded-full blur-xl pointer-events-none" 
                            style={{ background: badge.glow }}
                          />
                        )}
                        <img 
                          src={badge.image} 
                          alt={badge.label} 
                          className={`w-12 h-12 object-contain relative z-10 ${isLocked ? 'grayscale' : ''}`}
                        />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <Lock size={20} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <div className="text-center">
                        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-yellow-500' : isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                          {badge.label}
                        </span>
                        {badge.pro && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="text-[10px] font-black bg-yellow-500 text-black px-1.5 py-0.5 rounded uppercase tracking-tighter">PRO</span>
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-yellow-500 p-1 rounded-full">
                          <Check size={12} className="text-black" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#050505] border-t border-[#222] flex justify-center">
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:brightness-110 transition-all hover:scale-105 active:scale-95"
              >
                Confirmar Selo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
