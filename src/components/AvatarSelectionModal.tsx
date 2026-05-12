import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { AVATARS } from '../data/avatars';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
  currentAvatar?: string;
}

export default function AvatarSelectionModal({ isOpen, onClose, onSelect, currentAvatar }: AvatarSelectionModalProps) {
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
            <div className="p-8 border-b border-[#222] flex items-center justify-between bg-gradient-to-r from-green-500/5 to-transparent">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Escolha seu Avatar</h2>
                <p className="text-gray-500 text-sm font-medium">Selecione uma identidade visual para sua conta</p>
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
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {AVATARS.map((avatar, index) => {
                  const isSelected = currentAvatar === avatar;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onSelect(avatar)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${
                        isSelected 
                          ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                          : 'border-[#222] hover:border-[#444]'
                      }`}
                    >
                      <img 
                        src={avatar} 
                        alt={`Avatar ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : ''}`}>
                        {isSelected && (
                          <div className="bg-green-500 p-1.5 rounded-full shadow-lg">
                            <Check size={16} className="text-black" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-[#050505] border-t border-[#222] flex justify-center">
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-green-500 transition-all hover:scale-105 active:scale-95"
              >
                Confirmar Seleção
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
