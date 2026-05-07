import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Sun, Contrast, Droplet, Palette, X, Check, Layers, Square, Maximize2, Pipette } from 'lucide-react';
import { HexColorPicker } from "react-colorful";
import { ProfessionalColorPicker } from '../ProfessionalColorPicker';
import { sound } from '../../sound';

interface EffectsPanelProps {
  layerData: string[];
  width: number;
  height: number;
  currentColor: string;
  onApply: (newData: string[]) => void;
  onClose: () => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  layerData,
  width,
  height,
  currentColor,
  onApply,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'color' | 'filters'>('outline');
  
  // Outline States
  const [outlineColor, setOutlineColor] = useState(currentColor);
  const [outlineInside, setOutlineInside] = useState(false);
  const [outline8Dir, setOutline8Dir] = useState(false);
  const [showOutlinePicker, setShowOutlinePicker] = useState(false);

  // Color Adjustment States
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0);   // -100 to 100
  const [saturation, setSaturation] = useState(0); // -100 to 100

  const handleApplyOutline = () => {
    sound.playClick();
    const newData = [...layerData];
    const source = [...layerData];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const isFilled = source[idx] && source[idx] !== 'transparent' && source[idx] !== '';
        
        const checkNeighbors = () => {
          const neighbors = [];
          // 4 directions
          if (y > 0) neighbors.push(source[(y-1)*width + x]);
          if (y < height-1) neighbors.push(source[(y+1)*width + x]);
          if (x > 0) neighbors.push(source[y*width + (x-1)]);
          if (x < width-1) neighbors.push(source[y*width + (x+1)]);
          
          if (outline8Dir) {
            if (y > 0 && x > 0) neighbors.push(source[(y-1)*width + (x-1)]);
            if (y > 0 && x < width-1) neighbors.push(source[(y-1)*width + (x+1)]);
            if (y < height-1 && x > 0) neighbors.push(source[(y+1)*width + (x-1)]);
            if (y < height-1 && x < width-1) neighbors.push(source[(y+1)*width + (x+1)]);
          }
          return neighbors;
        };

        if (outlineInside) {
          if (isFilled) {
            const neighbors = checkNeighbors();
            const hasEmpty = neighbors.length < (outline8Dir ? 8 : 4) || neighbors.some(n => !n || n === 'transparent' || n === '');
            if (hasEmpty) newData[idx] = outlineColor;
          }
        } else {
          if (!isFilled) {
            const neighbors = checkNeighbors();
            const hasFilled = neighbors.some(n => n && n !== 'transparent' && n !== '');
            if (hasFilled) newData[idx] = outlineColor;
          }
        }
      }
    }
    onApply(newData);
    onClose();
  };

  const handleApplyColorAdjust = () => {
    sound.playClick();
    const newData = layerData.map(color => {
      if (!color || color === 'transparent' || color === '') return color;
      
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      let a = color.length === 9 ? color.slice(7, 9) : "";

      // Apply Brightness
      if (brightness !== 0) {
        const factor = brightness / 100;
        r = Math.min(255, Math.max(0, r + 255 * factor));
        g = Math.min(255, Math.max(0, g + 255 * factor));
        b = Math.min(255, Math.max(0, b + 255 * factor));
      }

      // Apply Contrast
      if (contrast !== 0) {
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
      }

      // Apply Saturation (Simple Grayscale weighted conversion)
      if (saturation !== 0) {
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        const factor = (saturation + 100) / 100;
        r = Math.min(255, Math.max(0, gray + (r - gray) * factor));
        g = Math.min(255, Math.max(0, gray + (g - gray) * factor));
        b = Math.min(255, Math.max(0, gray + (b - gray) * factor));
      }

      const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${a}`;
    });
    onApply(newData);
    onClose();
  };

  const handleApplyGrayscale = () => {
    sound.playClick();
    const newData = layerData.map(color => {
      if (!color || color === 'transparent' || color === '') return color;
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      let a = color.length === 9 ? color.slice(7, 9) : "";
      const gray = Math.round(0.2989 * r + 0.5870 * g + 0.1140 * b);
      const hex = gray.toString(16).padStart(2, '0').toUpperCase();
      return `#${hex}${hex}${hex}${a}`;
    });
    onApply(newData);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Tabs */}
      <div className="flex p-2 gap-1 bg-black/10">
        {[
          { id: 'outline', icon: <Square size={14} />, label: 'Contorno' },
          { id: 'color', icon: <Palette size={14} />, label: 'Ajuste Cor' },
          { id: 'filters', icon: <Droplet size={14} />, label: 'Filtros' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { sound.playClick(); setActiveTab(tab.id as any); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === tab.id 
                ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20' 
                : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {/* Drag Handle */}
      <div className="h-2 w-12 bg-white/10 rounded-full mx-auto mb-2 cursor-grab active:cursor-grabbing shrink-0" />

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar">
        {activeTab === 'outline' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Professional Color Picker Integration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Pipette size={12} className="text-[var(--accent-color)]" /> Configuração de Cor
                </label>
                <button 
                  onClick={() => { sound.playClick(); setOutlineColor(currentColor); }}
                  className="text-[9px] font-black text-[var(--accent-color)] hover:text-white transition-colors uppercase tracking-wider"
                >
                  Sincronizar com Pincel
                </button>
              </div>

              <div className="flex justify-center">
                <ProfessionalColorPicker 
                  color={outlineColor} 
                  onChange={setOutlineColor} 
                />
              </div>

              {/* Enhanced Quick Presets */}
              <div className="bg-black/20 p-4 rounded-[2rem] border border-white/5">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] block mb-3 text-center">Paleta de Referência</span>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { hex: '#000000', name: 'Black' },
                    { hex: '#FFFFFF', name: 'White' },
                    { hex: '#FF0000', name: 'Red' },
                    { hex: '#00FF00', name: 'Green' },
                    { hex: '#0000FF', name: 'Blue' },
                    { hex: '#FFFF00', name: 'Yellow' },
                    { hex: '#FF00FF', name: 'Magenta' },
                    { hex: '#00FFFF', name: 'Cyan' }
                  ].map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => { sound.playClick(); setOutlineColor(c.hex); }}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 group hover:scale-110 active:scale-95 ${
                        outlineColor.toLowerCase() === c.hex.toLowerCase() 
                          ? 'border-white ring-4 ring-white/10 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      <div className={`absolute inset-0 rounded-full border-2 border-black/20 ${outlineColor.toLowerCase() === c.hex.toLowerCase() ? 'opacity-100' : 'opacity-0'}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options Panel */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { sound.playClick(); setOutlineInside(!outlineInside); }}
                className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${
                  outlineInside 
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                    : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                }`}
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Maximize2 size={64} />
                </div>
                <Maximize2 size={24} />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Posição</span>
                  <span className="text-[8px] font-bold opacity-60 uppercase">{outlineInside ? 'Interno' : 'Externo'}</span>
                </div>
              </button>

              <button 
                onClick={() => { sound.playClick(); setOutline8Dir(!outline8Dir); }}
                className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${
                  outline8Dir 
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' 
                    : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                }`}
              >
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Layers size={64} />
                </div>
                <Layers size={24} />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Densidade</span>
                  <span className="text-[8px] font-bold opacity-60 uppercase">{outline8Dir ? '8 Direções' : '4 Direções'}</span>
                </div>
              </button>
            </div>

            <button 
              onClick={handleApplyOutline}
              className="w-full py-5 bg-gradient-to-r from-red-600/90 via-red-950/90 to-black text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-red-500/20 group"
            >
              <Wand2 size={22} className="group-hover:rotate-12 transition-transform" /> 
              Aplicar Efeito de Contorno
            </button>
          </div>
        )}

        {activeTab === 'color' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-yellow-500">
                  <Sun size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Brilho</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { sound.playClick(); setBrightness(0); }}
                    className="text-[8px] font-black text-white/30 hover:text-white uppercase"
                  >
                    Reset
                  </button>
                  <span className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded-md min-w-[40px] text-center">{brightness}%</span>
                </div>
              </div>
              <input 
                type="range" min="-100" max="100" value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-500">
                  <Contrast size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Contraste</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { sound.playClick(); setContrast(0); }}
                    className="text-[8px] font-black text-white/30 hover:text-white uppercase"
                  >
                    Reset
                  </button>
                  <span className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded-md min-w-[40px] text-center">{contrast}%</span>
                </div>
              </div>
              <input 
                type="range" min="-100" max="100" value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-pink-500">
                  <Palette size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Saturação</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { sound.playClick(); setSaturation(0); }}
                    className="text-[8px] font-black text-white/30 hover:text-white uppercase"
                  >
                    Reset
                  </button>
                  <span className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded-md min-w-[40px] text-center">{saturation}%</span>
                </div>
              </div>
              <input 
                type="range" min="-100" max="100" value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <button 
              onClick={handleApplyColorAdjust}
              className="w-full py-4 bg-[var(--accent-color)] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[var(--accent-color)]/30 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} /> Confirmar Ajustes
            </button>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button 
              onClick={handleApplyGrayscale}
              className="group relative flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
            >
              <div className="p-3 bg-gray-500/20 text-gray-400 rounded-xl group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-[11px] font-black text-white uppercase tracking-tight">Tons de Cinza</h3>
                <p className="text-[9px] text-white/40 font-medium">Remove todas as cores da camada mantendo a luminosidade.</p>
              </div>
            </button>
            
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
              <p className="text-[9px] text-yellow-500/80 font-bold uppercase leading-relaxed text-center">
                Mais filtros em breve: Blur dinâmico, Ruído e Solarização.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
