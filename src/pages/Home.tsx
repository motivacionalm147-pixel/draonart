import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Palette, Users, Play, MonitorSmartphone, Star, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MOCK_BG_IMAGES = [
  '/63b2de4429b84bb6e1cc632f2b8b9361.webp',
  '/d8395ee034cea71454588d9427dfcbcd.gif',
  '/e4278f35dfc32b3970459ea2e25e066e.gif',
  '/eac26181f6a03a98c7828992be7e346a.gif'
];

export default function Home() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        navigate('/dashboard');
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative selection:bg-[var(--accent-color)] selection:text-white">
      
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        {/* Blurred floating pixel arts */}
        <motion.div 
          animate={{ x: mousePosition.x * -2, y: mousePosition.y * -2 }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className="absolute inset-0 opacity-20"
        >
          {MOCK_BG_IMAGES.map((src, i) => (
            <motion.img 
              key={i} src={src} 
              animate={{ 
                y: [0, -20, 0], 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i }}
              className="absolute object-cover rounded-3xl blur-[4px]"
              style={{
                imageRendering: 'pixelated',
                width: `${200 + i * 50}px`, height: `${200 + i * 50}px`,
                top: `${20 + (i * 25)}%`, left: `${10 + (i * 20)}%`,
                filter: 'drop-shadow(0 0 30px rgba(34,197,94,0.3))'
              }}
            />
          ))}
          {/* Duplicates to fill screen */}
          {MOCK_BG_IMAGES.map((src, i) => (
            <motion.img 
              key={`dup-${i}`} src={src} 
              animate={{ y: [0, 20, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i + 1 }}
              className="absolute object-cover rounded-3xl blur-[8px]"
              style={{
                imageRendering: 'pixelated',
                width: `${150 + i * 50}px`, height: `${150 + i * 50}px`,
                top: `${10 + (i * 15)}%`, right: `${10 + (i * 25)}%`,
                filter: 'drop-shadow(0 0 40px rgba(34,197,94,0.2))'
              }}
            />
          ))}
        </motion.div>
        
        {/* Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      </div>

      {/* Top Navbar - Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <motion.img 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              src="/logo.png" alt="Logo" className="w-12 h-12 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              style={{ imageRendering: 'pixelated' }} 
            />
            <span className="font-black text-2xl tracking-widest text-white drop-shadow-md" style={{ fontFamily: '"Press Start 2P", monospace' }}>
              DRAGONART
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
            <button onClick={() => navigate('/app')} className="px-6 py-2.5 rounded-full font-black text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-2">
              <Users size={16} /> Entrar / Cadastrar
            </button>
            <button onClick={() => navigate('/app')} className="px-6 py-2.5 rounded-full font-black text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] hover:scale-105 transition-all uppercase tracking-widest flex items-center gap-2">
              <Palette size={16} /> Desenhar Agora
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 flex flex-col items-center justify-center text-center">
        
        {/* Floating App Logo Main */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-green-500 blur-[80px] opacity-30 rounded-full" />
          <img src="/logo.png" alt="Dragon Art" className="w-40 h-40 md:w-56 md:h-56 relative z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]" style={{ imageRendering: 'pixelated' }} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-gray-300 text-sm font-bold uppercase tracking-widest mb-8 shadow-xl"
        >
          <MonitorSmartphone size={16} className="text-green-400" /> Jogue. Desenhe. Compartilhe.
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-black leading-tight max-w-5xl tracking-tighter"
          style={{ textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
        >
          CRIE <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">PIXEL ART</span> ONLINE
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mt-6 mb-12 font-medium"
        >
          A plataforma definitiva para artistas. Crie animações complexas, salve na nuvem, colecione selos e publique na nossa galeria global. Tudo direto do navegador.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 items-center w-full max-w-2xl justify-center"
        >
          <button 
            onClick={() => navigate('/app')}
            className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-b from-green-400 to-green-600 text-black font-black text-xl uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
            <Play size={24} className="fill-black" /> COMEÇAR AGORA
          </button>
          
          <button 
            onClick={() => navigate('/gallery')}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-black/40 backdrop-blur-md hover:bg-white/10 text-white font-black text-xl uppercase tracking-widest rounded-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shadow-xl"
          >
            <Users size={24} /> EXPLORAR
          </button>
        </motion.div>
        
      </main>

      {/* Testimonials Section */}
      <section className="relative z-10 py-12 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Lucas 'PixelMaster' Silva",
                role: "Ilustrador Freelancer",
                text: "Mano, o Perfect Stroke é bizarro! Eu sempre sofri com traço tremido no tablet, mas com a IA do Dragon Art parece que o desenho flui sozinho. O melhor app de pixel art que já usei.",
                stars: 5,
                verified: true,
                color: "from-blue-500 to-cyan-500"
              },
              {
                name: "Beatriz Oliveira",
                role: "Game Designer",
                text: "Eu precisava de uma ferramenta rápida pra fazer sprites pros meus jogos e o sistema de animação aqui é perfeito. Valeu cada centavo do PRO!",
                stars: 5,
                verified: true,
                color: "from-purple-500 to-pink-500"
              },
              {
                name: "Thiago 'IndieDev'",
                role: "Desenvolvedor de Jogos",
                text: "A qualidade da exportação é o que mais me impressionou. Consegui tirar artes em 4K sem perder um pixel de nitidez. Recomendo demais!",
                stars: 5,
                verified: true,
                color: "from-green-500 to-emerald-500"
              }
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] relative overflow-hidden group hover:bg-white/[0.05] transition-all"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${review.color} opacity-50`} />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${review.color} flex items-center justify-center text-black font-black text-sm shadow-lg`}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-black text-xs text-white flex items-center gap-2">
                      {review.name}
                      {review.verified && <Check size={10} className="bg-green-500 text-black rounded-full p-0.5" />}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{review.role}</div>
                  </div>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed font-medium italic">
                  "{review.text}"
                </p>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-1.5 py-0.5 rounded-md">Verificado</span>
                  <div className="flex gap-0.5">
                    {[...Array(review.stars)].map((_, i) => (
                      <Star key={i} size={10} className="fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats/Features Banner */}
      <div className="relative z-10 w-full bg-black/60 backdrop-blur-xl border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-white mb-2">100%</div>
            <div className="text-xs text-green-400 font-bold uppercase tracking-widest">Gratuito na Web</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">PRO</div>
            <div className="text-xs text-purple-400 font-bold uppercase tracking-widest">Selos e Perfis</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">GIF</div>
            <div className="text-xs text-blue-400 font-bold uppercase tracking-widest">Animações 60fps</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">NUVEM</div>
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Salva seus projetos</div>
          </div>
        </div>
      </div>
      

      {/* Final CTA */}
      <section className="relative z-10 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-500/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-[48px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter">PRONTO PARA CRIAR SUA <span className="text-green-500">PRÓXIMA OBRA?</span></h2>
            <p className="text-xl text-gray-400 mb-10 font-medium max-w-2xl mx-auto">Junte-se a milhares de artistas e comece a transformar seus pixels em arte profissional hoje mesmo.</p>
            <button 
              onClick={() => navigate('/app')}
              className="px-12 py-6 bg-white text-black font-black text-2xl uppercase tracking-widest rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
            >
              CRIAR CONTA GRÁTIS
            </button>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
