import React from 'react';
import { motion } from 'motion/react';
import { Download, Palette, Users, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10" style={{ imageRendering: 'pixelated' }} />
          <span className="font-black text-xl tracking-widest" style={{ fontFamily: '"Press Start 2P", monospace' }}>{CONFIG.APP_NAME.toUpperCase()}</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-400 uppercase tracking-widest">
          <button onClick={() => navigate('/gallery')} className="hover:text-white transition-colors">Galeria</button>
          <button onClick={() => navigate('/app')} className="hover:text-white transition-colors">Abrir App Web</button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold uppercase tracking-widest"
          >
            <Star size={14} className="fill-green-400" /> Versão {CONFIG.VERSION} Disponível
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight"
          >
            O Melhor <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Estúdio de Pixel Art</span> Para o Seu Celular.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-xl"
          >
            Crie animações complexas, desenhe sprites para seus jogos e compartilhe na maior comunidade de pixel art do Brasil.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button 
              onClick={() => window.open(CONFIG.DOWNLOAD_APK_URL, '_blank')}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105"
            >
              <Download size={20} /> Baixar APK (Grátis)
            </button>
            <button 
              onClick={() => navigate('/gallery')}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1a1a2e] hover:bg-[#2a2a3e] text-white font-black uppercase tracking-widest rounded-xl border border-[#333] transition-all"
            >
              <Users size={20} /> Ver Comunidade
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 relative w-full max-w-md aspect-[9/16] bg-[#111] rounded-3xl border-8 border-[#222] overflow-hidden shadow-2xl"
        >
          {/* Simulação da tela do App */}
          <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
            <img src="/logo.png" alt="Dragon Art App" className="w-32 h-32 mb-8 animate-pulse-subtle" style={{ imageRendering: 'pixelated' }} />
            <h2 className="text-xl font-bold mb-4">Dragon Art Editor</h2>
            <button onClick={() => navigate('/app')} className="px-6 py-3 bg-[#1a1a2e] rounded-lg text-sm font-bold border border-[#333] flex items-center gap-2">
              Abrir Web Editor <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section className="border-t border-[#111] bg-[#020202]">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Palette size={24} />
            </div>
            <h3 className="text-xl font-bold">Camadas Profissionais</h3>
            <p className="text-gray-400">Trabalhe com múltiplas camadas, opacidade, modos de mesclagem e onion skinning para animação.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Download size={24} />
            </div>
            <h3 className="text-xl font-bold">Exportação Flexível</h3>
            <p className="text-gray-400">Exporte em PNG, JPG ou GIF. Tamanho customizável e controle total sobre a transparência.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold">Comunidade Viva</h3>
            <p className="text-gray-400">Publique suas artes direto do aplicativo para nossa galeria online e receba curtidas e feedback.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
