import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, X, Download, BookOpen, Maximize, Image as ImageIcon, 
  Volume2, Monitor, Layout, Paintbrush, ChevronLeft, ChevronRight, 
  Eye, EyeOff, Trash2, MousePointer2, Grid3X3, Circle, Square, 
  Lock, Unlock, FlipHorizontal, FlipVertical, ZoomIn
} from 'lucide-react';

interface AjustesPanelProps {
  setActivePanel: (p: string | null) => void;
  setShowExportModal: (v: boolean) => void;
  setShowTutorials: (v: boolean) => void;
  resizeInput: { w: number, h: number };
  setResizeInput: (v: { w: number, h: number }) => void;
  applyResize: (w: number, h: number) => void;
  appBackground: string;
  setAppBackground: (v: string) => void;
  bgBlur: number;
  setBgBlur: (v: number) => void;
  bgBrightness: number;
  setBgBrightness: (v: number) => void;
  bgmEnabled: boolean;
  toggleBgm: () => void;
  sfxEnabled: boolean;
  toggleSfx: () => void;
  sound: {
    playClick: () => void;
  };
  uiScale: number;
  setUiScale: (v: number) => void;
  showUiToggle: boolean;
  setShowUiToggle: (v: boolean) => void;
  showCanvasBorder: boolean;
  setShowCanvasBorder: (v: boolean) => void;
  gridMode: 'lines' | 'dots' | 'checkerboard';
  setGridMode: (v: 'lines' | 'dots' | 'checkerboard') => void;
  gridOnlyOnZoom: boolean;
  setGridOnlyOnZoom: (v: boolean) => void;
  gridSize: number;
  setGridSize: (v: number) => void;
}

export const AjustesPanel: React.FC<AjustesPanelProps> = ({
  setActivePanel,
  setShowExportModal,
  setShowTutorials,
  resizeInput,
  setResizeInput,
  applyResize,
  appBackground,
  setAppBackground,
  bgBlur,
  setBgBlur,
  bgBrightness,
  setBgBrightness,
  bgmEnabled,
  toggleBgm,
  sfxEnabled,
  toggleSfx,
  sound,
  uiScale,
  setUiScale,
  showUiToggle,
  setShowUiToggle,
  showCanvasBorder,
  setShowCanvasBorder,
  gridMode,
  setGridMode,
  gridOnlyOnZoom,
  setGridOnlyOnZoom,
  gridSize,
  setGridSize
}) => {
  const [activeTab, setActiveTab] = useState<'tela' | 'ambiente' | 'sistema'>('tela');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAmbienteTab = activeTab === 'ambiente';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-auto" onClick={() => setActivePanel(null)}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute inset-0 transition-colors duration-300 ${isAmbienteTab ? 'bg-black/40' : 'bg-black/75 backdrop-blur-md'}`}
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isAmbienteTab 
            ? 'bg-[#1a1a1a]/95 backdrop-blur-2xl max-h-[75vh] sm:max-h-[80vh]' 
            : 'bg-[#121212] max-h-[85vh] sm:max-h-[80vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings size={16} className="text-[var(--accent-color)]" /> CONFIGURAÇÕES
          </h2>
          <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-white p-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-white/5 bg-white/5">
          {[
            { id: 'tela', label: 'Tela', icon: <Layout size={12} /> },
            { id: 'ambiente', label: 'Ambiente', icon: <Paintbrush size={12} /> },
            { id: 'sistema', label: 'Sistema', icon: <Monitor size={12} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sound.playClick(); setActiveTab(tab.id as any); }}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase transition-all ${activeTab === tab.id ? 'text-[var(--accent-color)] border-b-2 border-[var(--accent-color)] bg-[var(--accent-color)]/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {activeTab === 'tela' && (
              <motion.div key="tela" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <button 
                  onClick={() => { sound.playClick(); setShowExportModal(true); setActivePanel(null); }}
                  className="w-full bg-[var(--accent-color)] text-white font-black py-4 rounded-2xl shadow-xl shadow-[var(--accent-color)]/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                >
                  <Download size={18} /> SALVAR / EXPORTAR
                </button>

                <div className="flex flex-col gap-3">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Maximize size={12} /> DIMENSÕES DA FOLHA
                  </div>
                  <div className="flex gap-4 items-center justify-center bg-black/30 p-4 rounded-2xl border border-white/5">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest text-center">Larg.</label>
                      <input 
                        type="number" 
                        value={resizeInput.w} 
                        onChange={e => setResizeInput({ ...resizeInput, w: Math.min(512, Math.max(1, parseInt(e.target.value) || 1)) })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            applyResize(resizeInput.w, resizeInput.h);
                          }
                        }}
                        className="w-full bg-black/40 border border-white/10 text-white p-2.5 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                      />
                    </div>
                    <div className="text-gray-600 font-bold text-sm mt-5">×</div>
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest text-center">Alt.</label>
                      <input 
                        type="number" 
                        value={resizeInput.h} 
                        onChange={e => setResizeInput({ ...resizeInput, h: Math.min(512, Math.max(1, parseInt(e.target.value) || 1)) })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            applyResize(resizeInput.w, resizeInput.h);
                          }
                        }}
                        className="w-full bg-black/40 border border-white/10 text-white p-2.5 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-[var(--accent-color)] transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      applyResize(resizeInput.w, resizeInput.h);
                    }}
                    className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[var(--accent-color)]/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Aplicar Tamanho
                  </button>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[16, 32, 64, 128].map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          sound.playClick();
                          setResizeInput({ w: size, h: size });
                          applyResize(size, size);
                        }}
                        className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${resizeInput.w === size && resizeInput.h === size ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ambiente' && (
              <motion.div key="ambiente" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                
                {/* --- CENÁRIOS DE FUNDO --- */}
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Paintbrush size={12} className="text-purple-500" /> AMBIENTE E ILUMINAÇÃO
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {[
                      { id: '/backgrounds/bg_anime_train.png', name: 'Trem Anime' },
                      { id: '/backgrounds/bg_anime_rooftop.png', name: 'Neo Tokyo' },
                      { id: '/backgrounds/bg_anime_school.png', name: 'Escola' },
                      { id: '/backgrounds/bg_anime_ramen.png', name: 'Cyber Ramen' },
                      { id: '/backgrounds/dragon.png', name: 'Dragão' },
                      { id: '/backgrounds/ocean.png', name: 'Oceano' },
                      { id: '/backgrounds/room.png', name: 'Quarto' },
                      { id: '/backgrounds/wood.png', name: 'Estúdio' },
                      { id: '/backgrounds/leaves.png', name: 'Selva' },
                      { id: '/backgrounds/cyberpunk.png', name: 'Cyber' },
                      { id: '/backgrounds/bg_woodhouse.png', name: 'Casa Relax' },
                      { id: '/backgrounds/bg_floral.png', name: 'Jardim' },
                      { id: '/backgrounds/bg_pixelvillage.png', name: 'Vila Pixel' },
                      { id: '/backgrounds/bg_magicforest.png', name: 'Floresta' },
                      { id: '/backgrounds/zen_garden.png', name: 'Zen' },
                      { id: '/backgrounds/sakura.png', name: 'Sakura' },
                      { id: '/backgrounds/mountain.png', name: 'Montanha' },
                      { id: '/backgrounds/calm_nature.png', name: 'Natureza' },
                      { id: '/backgrounds/sunset_clouds.png', name: 'Nuvens' },
                    ].map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => { sound.playClick(); setAppBackground(bg.id); }}
                        className={`relative h-16 rounded-2xl overflow-hidden border-2 transition-all ${appBackground === bg.id ? 'border-[var(--accent-color)] shadow-xl shadow-[var(--accent-color)]/30 scale-[1.05]' : 'border-transparent hover:border-white/20'}`}
                      >
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bg.id}')` }} />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white uppercase drop-shadow-md px-1 text-center">{bg.name}</div>
                      </button>
                    ))}
                  </div>

                  {/* Blur */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Desfoque</span>
                      <span className="text-[10px] font-black text-[var(--accent-color)]">{bgBlur}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="40" step="1"
                      value={bgBlur} 
                      onChange={(e) => setBgBlur(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
                    />
                  </div>

                  {/* Brightness */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Brilho</span>
                      <span className="text-[10px] font-black text-[var(--accent-color)]">{Math.round(bgBrightness * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.1" max="2" step="0.05"
                      value={bgBrightness} 
                      onChange={(e) => setBgBrightness(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sistema' && (
              <motion.div key="sistema" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                <div className="flex flex-col gap-3">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Monitor size={12} /> INTERFACE
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col p-4 bg-black/30 rounded-2xl border border-white/5 gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white uppercase">Tamanho da Interface</span>
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Aumentar ícones ({uiScale.toFixed(1)}x)</span>
                        </div>
                        <ZoomIn size={18} className="text-gray-400" />
                      </div>
                      <input 
                        type="range" 
                        min="0.5" max="3.0" step="0.1" 
                        value={uiScale} 
                        onChange={(e) => setUiScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">Menu de Ocultar UI</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Mostrar botão de visibilidade</span>
                      </div>
                      <button
                        onClick={() => { sound.playClick(); setShowUiToggle(!showUiToggle); }}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${showUiToggle ? 'bg-[var(--accent-color)]' : 'bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showUiToggle ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Volume2 size={12} /> ÁUDIO
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase">Música Ambiente</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Lo-Fi Relaxante</span>
                      </div>
                      <button
                        onClick={() => { sound.playClick(); toggleBgm(); }}
                        className={`w-12 h-6 rounded-full p-1 transition-all ${bgmEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${bgmEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button 
                    onClick={() => { sound.playClick(); setShowTutorials(true); setActivePanel(null); }}
                    className="w-full bg-white/5 text-gray-400 hover:text-white font-bold py-4 rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                  >
                    <BookOpen size={18} /> MANUAL DO USUÁRIO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
