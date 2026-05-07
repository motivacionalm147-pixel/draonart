import React, { useState } from 'react';
import { Plus, Trash2, Palette as PaletteIcon, ChevronRight, ChevronDown, Check, Save } from 'lucide-react';
import { sound } from '../../sound';

interface Palette {
  name: string;
  colors: string[];
}

interface PaletteManagerProps {
  currentColor: string;
  selectColor: (color: string) => void;
  userPalettes: Palette[];
  setUserPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
}

const PREDEFINED_PALETTES: Palette[] = [
  { name: "Pele HD", colors: ["#fce1c4", "#f9c9b6", "#f1c27d", "#e0ac69", "#8d5524", "#c68642", "#5c3836", "#3d2b1f"] },
  { name: "Grama & Natureza", colors: ["#2d5a27", "#4f7942", "#7cfc00", "#32cd32", "#00ff00", "#adff2f", "#556b2f", "#228b22"] },
  { name: "Oceano Profundo", colors: ["#002147", "#003366", "#006994", "#0077be", "#00a8cc", "#00d4ff", "#2a52be", "#1e3a8a"] },
  { name: "Fogo & Brasa", colors: ["#3d0000", "#800000", "#ff0000", "#ff4500", "#ff8c00", "#ffa500", "#ffd700", "#fffacd"] },
  { name: "Céu & Nuvens", colors: ["#000033", "#191970", "#000080", "#1e90ff", "#87ceeb", "#add8e6", "#f0f8ff", "#ffffff"] },
  { name: "Deserto Quente", colors: ["#3b2f2f", "#6b4226", "#c19a6b", "#d2b48c", "#edc9af", "#f4a460", "#e3a857", "#ffdead"] },
  { name: "Floresta Mística", colors: ["#013220", "#004020", "#006400", "#228b22", "#556b2f", "#6b8e23", "#8fbc8f", "#9acd32"] },
  { name: "Magma & Vulcão", colors: ["#000000", "#1a0000", "#4a0000", "#800000", "#ff0000", "#ff4500", "#ff8c00", "#ffff00"] },
  { name: "Cyberpunk Night", colors: ["#0d0221", "#240046", "#3c096c", "#5a189a", "#7b2cbf", "#9d4edd", "#c77dff", "#e0aaff"] },
  { name: "Pastel Dreams", colors: ["#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea", "#ff9aa2", "#ffb3ba", "#ffffba"] },
  { name: "Gameboy Retro", colors: ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"] },
  { name: "Horror / Sangue", colors: ["#050000", "#1a0000", "#2b0000", "#4a0000", "#7f0000", "#a50000", "#d40000", "#ff0000"] },
  { name: "Outono Dourado", colors: ["#3e2723", "#5d4037", "#8b4513", "#a0522d", "#d2691e", "#cd853f", "#f4a460", "#daa520"] },
  { name: "Inverno Polar", colors: ["#e0f7fa", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4", "#0097a7", "#006064"] },
  { name: "Metal & Aço", colors: ["#000000", "#212121", "#424242", "#616161", "#757575", "#9e9e9e", "#bdbdbd", "#eeeeee"] },
  { name: "Madeira Nobre", colors: ["#1b1212", "#2d1b1b", "#3d2b1f", "#4e342e", "#5d4037", "#6d4c41", "#795548", "#8d6e63"] },
  { name: "Neon Party", colors: ["#39ff14", "#ff00ff", "#00ffff", "#ffff00", "#ff0000", "#0000ff", "#ff8c00", "#8a2be2"] },
  { name: "Pôr do Sol", colors: ["#001146", "#1a237e", "#311b92", "#4a148c", "#880e4f", "#b71c1c", "#e65100", "#ff6f00"] },
  { name: "Zumbi / Tóxico", colors: ["#1a1a1a", "#2e3b23", "#3d550c", "#4f7405", "#81b622", "#ecf87f", "#3dff00", "#000000"] },
  { name: "Cristal Mágico", colors: ["#ffffff", "#e1f5fe", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#03a9f4", "#0288d1"] },
];

export const PaletteManager: React.FC<PaletteManagerProps> = ({ 
  currentColor, 
  selectColor, 
  userPalettes, 
  setUserPalettes 
}) => {
  const [expandedPalette, setExpandedPalette] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [newPaletteColors, setNewPaletteColors] = useState<string[]>([]);

  const handleAddColorToNewPalette = () => {
    if (newPaletteColors.length >= 24) return;
    if (!newPaletteColors.includes(currentColor)) {
      setNewPaletteColors([...newPaletteColors, currentColor]);
      sound.playClick();
    }
  };

  const handleSavePalette = () => {
    if (!newPaletteName.trim() || newPaletteColors.length === 0) return;
    const newPalette = { name: newPaletteName, colors: newPaletteColors };
    setUserPalettes([newPalette, ...userPalettes]);
    setIsCreating(false);
    setNewPaletteName("");
    setNewPaletteColors([]);
    sound.playClick();
  };

  const handleDeleteUserPalette = (index: number) => {
    const updated = [...userPalettes];
    updated.splice(index, 1);
    setUserPalettes(updated);
    sound.playClick();
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <PaletteIcon size={12} /> Paletas Profissionais
        </h3>
        <button 
          onClick={() => { setIsCreating(!isCreating); sound.playClick(); }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
            isCreating 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] border border-[var(--accent-color)]/30 hover:bg-[var(--accent-color)]/40'
          }`}
        >
          {isCreating ? 'Cancelar' : <><Plus size={10} /> Criar</>}
        </button>
      </div>

      {/* Creation Mode */}
      {isCreating && (
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Nome da Paleta</span>
            <input 
              type="text" 
              placeholder="Ex: Personagem 1..."
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent-color)] transition-colors"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Cores ({newPaletteColors.length}/24)</span>
              <button 
                onClick={handleAddColorToNewPalette}
                className="text-[9px] font-black text-[var(--accent-color)] uppercase hover:opacity-80 flex items-center gap-1"
              >
                <Plus size={10} /> Add Atual
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-black/20 rounded-xl border border-white/5 min-h-[40px]">
              {newPaletteColors.map((c, i) => (
                <div key={i} className="group relative">
                  <div 
                    className="w-6 h-6 rounded-md border border-white/20"
                    style={{ backgroundColor: c }}
                  />
                  <button 
                    onClick={() => setNewPaletteColors(newPaletteColors.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={8} />
                  </button>
                </div>
              ))}
              {newPaletteColors.length === 0 && (
                <div className="text-[9px] text-white/20 italic flex items-center justify-center w-full">Clique em "Add Atual" para adicionar a cor selecionada</div>
              )}
            </div>
          </div>

          <button 
            disabled={!newPaletteName.trim() || newPaletteColors.length === 0}
            onClick={handleSavePalette}
            className="w-full py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:grayscale text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-black/20 transition-all flex items-center justify-center gap-2"
          >
            <Save size={14} /> Salvar Paleta
          </button>
        </div>
      )}

      {/* List of Palettes */}
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {/* User Palettes */}
        {userPalettes.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            <span className="text-[8px] font-black text-[var(--accent-color)] uppercase tracking-widest px-1">Minhas Paletas</span>
            {userPalettes.map((p, idx) => (
              <div key={`user-${idx}`} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedPalette(expandedPalette === `user-${idx}` ? null : `user-${idx}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {p.colors.slice(0, 3).map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-full border border-black/50 shadow-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteUserPalette(idx); }}
                      className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    {expandedPalette === `user-${idx}` ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
                  </div>
                </div>
                {expandedPalette === `user-${idx}` && (
                  <div className="p-3 pt-0 grid grid-cols-8 gap-1.5 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {p.colors.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => { selectColor(c); sound.playColorSound(); }}
                        className={`w-full aspect-square rounded-lg border transition-all hover:scale-110 ${
                          currentColor.toLowerCase() === c.toLowerCase() ? 'border-white scale-110 shadow-lg' : 'border-white/10'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Predefined Palettes */}
        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest px-1">Biblioteca do Editor</span>
        <div className="grid grid-cols-1 gap-2">
          {PREDEFINED_PALETTES.map((p, idx) => (
            <div key={idx} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => { setExpandedPalette(expandedPalette === `pre-${idx}` ? null : `pre-${idx}`); sound.playClick(); }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {p.colors.slice(0, 4).map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-black/50 shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{p.name}</span>
                </div>
                {expandedPalette === `pre-${idx}` ? <ChevronDown size={14} className="text-white/20" /> : <ChevronRight size={14} className="text-white/20" />}
              </div>
              {expandedPalette === `pre-${idx}` && (
                <div className="p-3 pt-0 grid grid-cols-8 gap-1.5 border-t border-white/5 animate-in fade-in slide-in-from-top-1 duration-200">
                  {p.colors.map((c, i) => (
                    <button 
                      key={i} 
                      onClick={() => { selectColor(c); sound.playColorSound(); }}
                      className={`w-full aspect-square rounded-lg border transition-all hover:scale-110 ${
                        currentColor.toLowerCase() === c.toLowerCase() ? 'border-white scale-110 shadow-lg' : 'border-white/10'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
