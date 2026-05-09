import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Heart, User as UserIcon, Home, Compass, Trophy, Settings, LogOut, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

export default function WebDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/'); // Redireciona para a Home se não estiver logado
      } else {
        setUser(data.user);
      }
    });

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`id, title, image_url, likes, created_at, profiles (display_name, is_pro)`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#222] h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Logo" className="w-8 h-8 image-pixelated" />
          <span className="font-black tracking-widest text-lg" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            DRAGONART
          </span>
        </div>
        <div className="flex-1 max-w-xl mx-8">
          <input type="text" placeholder="Pesquisar artes, artistas..." className="w-full bg-[#111] border border-[#222] rounded-full px-6 py-2 text-sm outline-none focus:border-green-500 transition-colors" />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app')} className="bg-green-500 text-black font-black uppercase tracking-widest text-xs px-6 py-2.5 rounded-full hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            + Nova Arte
          </button>
          <div className="w-10 h-10 rounded-full bg-[#222] border-2 border-green-500 flex items-center justify-center cursor-pointer" onClick={() => navigate('/profile')}>
            <UserIcon size={18} />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex gap-6 pt-6 px-4">
        
        {/* Left Sidebar */}
        <aside className="w-64 hidden md:flex flex-col gap-2 sticky top-24 h-max">
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-3 flex flex-col gap-1">
            <button className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white font-bold w-full text-left">
              <Home size={18} /> Feed
            </button>
            <button className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold w-full text-left transition-colors">
              <Compass size={18} /> Explorar
            </button>
            <button className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold w-full text-left transition-colors">
              <Trophy size={18} /> Concursos
            </button>
          </div>
          
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-4 mt-4">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Suas Artes</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-white cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-[#222] flex items-center justify-center"><ImageIcon size={14} /></div>
                Projetos Locais
              </div>
            </div>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="flex-1 flex flex-col gap-6 max-w-2xl">
          {/* Post Input Fake */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-4 flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-[#222] flex-shrink-0"></div>
            <input type="text" placeholder="O que você está desenhando hoje?" className="flex-1 bg-[#111] border border-[#222] rounded-full px-4 py-2.5 text-sm outline-none focus:border-green-500" />
            <button onClick={() => navigate('/app')} className="p-2.5 bg-[#1a1a2e] text-blue-400 rounded-xl hover:bg-[#2a2a3e] transition-colors"><ImageIcon size={18} /></button>
          </div>

          {/* Feed Loop */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            posts.map(post => (
              <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} key={post.id} className="bg-[#0a0a0a] rounded-2xl border border-[#222] overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center"><UserIcon size={16} /></div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {post.profiles?.display_name || 'Artista'}
                        {post.profiles?.is_pro && <span className="text-[9px] bg-green-500 text-black px-1.5 py-0.5 rounded uppercase font-black">PRO</span>}
                      </div>
                      <div className="text-xs text-gray-500">Há pouco tempo</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#111] w-full aspect-square relative flex items-center justify-center p-6 border-y border-[#222]">
                  <img src={post.image_url} className="max-w-full max-h-full object-contain drop-shadow-2xl" style={{ imageRendering: 'pixelated' }} />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-4">{post.title}</h3>
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-red-400 font-bold transition-colors">
                      <Heart size={20} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 font-bold hover:text-white transition-colors text-sm">
                      Compartilhar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-72 hidden lg:flex flex-col gap-6 sticky top-24 h-max">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl border border-green-500/20 p-5">
            <h3 className="font-black text-lg mb-2 text-green-400">Desenhe no Celular</h3>
            <p className="text-sm text-gray-400 mb-4">Instale o Dragon Art no seu Android e sincronize suas artes.</p>
            <button onClick={() => window.open(CONFIG.DOWNLOAD_APK_URL)} className="w-full py-2.5 bg-green-500 text-black font-black uppercase text-xs rounded-xl hover:bg-green-400 transition-colors">
              Baixar APK
            </button>
          </div>

          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-5">
            <h3 className="font-black mb-4">Artistas em Destaque</h3>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#222]"></div>
                    <div className="text-sm font-bold">Pixel Master</div>
                  </div>
                  <button className="text-xs bg-[#111] border border-[#333] hover:border-green-500 px-3 py-1.5 rounded-full font-bold transition-colors">Seguir</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
