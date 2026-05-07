import React, { useState, useEffect } from 'react';
import { HexColorPicker } from "react-colorful";
import { Hash, Sliders, Copy, Clipboard, Check } from 'lucide-react';
import { sound } from '../sound';

interface ProfessionalColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  history?: string[];
}

export const ProfessionalColorPicker = ({ color, onChange, history = [] }: ProfessionalColorPickerProps) => {
  const [hexInput, setHexInput] = useState(color);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHexInput(color);
  }, [color]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const getRGB = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return { r, g, b };
  };

  const rgb = getRGB(color);

  return (
    <div className="flex flex-col gap-6 p-6 bg-black/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-full max-w-[340px] relative overflow-hidden">
      {/* Glossy Overlay Effect */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-[var(--accent-color)]/10 blur-[100px] rounded-full"></div>
      
      {/* Picker Area */}
      <div className="relative z-10">
        <div className="w-full h-44 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-black/40 hover:border-white/10 transition-all duration-500 custom-color-picker">
          <HexColorPicker 
            color={color} 
            onChange={onChange}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
      
      {/* Inputs & Actions */}
      <div className="space-y-4 z-10">
        {/* HEX & Copy */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
              <Hash size={14} />
            </div>
            <input 
              type="text"
              value={hexInput.replace('#', '').toUpperCase()}
              onChange={handleHexChange}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-white font-mono font-bold text-sm tracking-widest outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/10 transition-all"
              placeholder="FFFFFF"
            />
          </div>
          <button 
            onClick={handleCopy}
            className={`px-4 rounded-2xl border transition-all flex items-center justify-center ${
              copied ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* RGB Breakdown */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'R', value: rgb.r, color: 'from-red-500/20 to-red-500/5', text: 'text-red-400' },
            { label: 'G', value: rgb.g, color: 'from-green-500/20 to-green-500/5', text: 'text-green-400' },
            { label: 'B', value: rgb.b, color: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400' }
          ].map((item) => (
            <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-xl p-2 border border-white/5 flex flex-col items-center`}>
              <span className={`text-[8px] font-black uppercase mb-1 ${item.text}`}>{item.label}</span>
              <span className="text-xs font-mono font-bold text-white/90">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Mini History (if provided) */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2 pt-2">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest px-1">Recentes</span>
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
              {history.slice(0, 8).map((c, i) => (
                <button
                  key={`picker-recent-${i}`}
                  onClick={() => onChange(c)}
                  className="w-6 h-6 rounded-lg border border-white/10 shrink-0 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decorative Footer */}
      <div className="flex items-center gap-3 pt-2 opacity-50 z-10">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
        <div className="flex items-center gap-2 text-[7px] font-black text-white/30 uppercase tracking-[0.5em]">
          <Sliders size={8} />
          PRO COLOR SYSTEM
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
      </div>
    </div>
  );
};
