import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, User as UserIcon, Home, Compass, Trophy, Settings, LogOut, Image as ImageIcon, MessageSquare, Send, MonitorSmartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';
import { BADGES } from '../data/badges';

export default function WebDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Comments state
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentInput, setCommentInput] = useState('');
  
  // Likes state
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/');
      } else {
        setUser(data.user);
        // Load user profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profileData) setProfile(profileData);
        
        // Load likes
        const { data: likesData } = await supabase.from('post_likes').select('post_id').eq('user_id', data.user.id);
        if (likesData) {
          const likesMap: Record<string, boolean> = {};
          likesData.forEach(l => likesMap[l.post_id] = true);
          setLikedPosts(likesMap);
        }
      }
    };
    checkUser();

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`id, title, image_url, likes, created_at, profiles (id, display_name, is_pro, badge)`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, [navigate]);

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const isLiked = likedPosts[postId];
    
    // Optimistic UI update
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 };
      }
      return p;
    }));

    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
        await supabase.rpc('decrement_likes', { row_id: postId }); // if RPC exists, else manual update
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
        await supabase.rpc('increment_likes', { row_id: postId });
      }
    } catch (e) {
      console.error(e);
      // Revert optimistic update on failure (ignored for brevity)
    }
  };

  const loadComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    if (!comments[postId]) {
      const { data } = await supabase
        .from('comments')
        .select(`id, content, created_at, profiles (display_name, badge, is_pro)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (data) {
        setComments(prev => ({ ...prev, [postId]: data }));
      }
    }
  };

  const submitComment = async (postId: string) => {
    if (!commentInput.trim() || !user) return;
    const newComment = { post_id: postId, user_id: user.id, content: commentInput.trim() };
    const { data, error } = await supabase.from('comments').insert(newComment).select(`id, content, created_at, profiles (display_name, badge, is_pro)`).single();
    if (!error && data) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
      setCommentInput('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#222] h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Logo" className="w-8 h-8 image-pixelated" />
          <span className="font-black tracking-widest text-lg hidden sm:block" style={{ fontFamily: '"Press Start 2P", monospace' }}>
            DRAGONART
          </span>
        </div>
        <div className="flex-1 max-w-xl mx-4 sm:mx-8">
          <input type="text" placeholder="Pesquisar artes..." className="w-full bg-[#111] border border-[#222] rounded-full px-6 py-2 text-sm outline-none focus:border-green-500 transition-colors" />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app')} className="hidden sm:block bg-green-500 text-black font-black uppercase tracking-widest text-xs px-6 py-2.5 rounded-full hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            + Nova Arte
          </button>
          
          {/* Menu de Perfil / Logout */}
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#222] border-2 border-green-500 flex items-center justify-center overflow-hidden">
               {profile?.badge ? (
                 <img src={BADGES.find(b => b.id === profile.badge)?.image || '/badges/free_1.png'} className="w-6 h-6 object-contain" />
               ) : (
                 <UserIcon size={18} />
               )}
            </div>
            <div className="absolute right-0 top-12 w-48 bg-[#111] border border-[#222] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden">
               <button onClick={() => navigate('/profile')} className="p-3 text-sm font-bold hover:bg-white/5 flex items-center gap-2 w-full text-left"><UserIcon size={16}/> Meu Perfil</button>
               <button onClick={() => navigate('/app')} className="p-3 text-sm font-bold hover:bg-white/5 flex items-center gap-2 w-full text-left sm:hidden"><ImageIcon size={16}/> Estúdio</button>
               <button onClick={handleSignOut} className="p-3 text-sm font-bold hover:bg-red-500/10 text-red-400 flex items-center gap-2 w-full text-left border-t border-[#222]"><LogOut size={16}/> Sair</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex gap-6 pt-6 px-4 pb-20">
        
        {/* Left Sidebar */}
        <aside className="w-64 hidden md:flex flex-col gap-2 sticky top-24 h-max">
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-3 flex flex-col gap-1">
            <button className="flex items-center gap-3 p-3 rounded-xl bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-bold w-full text-left">
              <Home size={18} /> Feed Principal
            </button>
            <button className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold w-full text-left transition-colors">
              <Compass size={18} /> Explorar
            </button>
            <button className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-bold w-full text-left transition-colors">
              <Trophy size={18} /> Concursos
            </button>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="flex-1 flex flex-col gap-6 max-w-2xl">
          {/* Post Input Fake */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-4 flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-[#222] flex-shrink-0 flex items-center justify-center">
              {profile?.badge ? <img src={BADGES.find(b => b.id === profile.badge)?.image} className="w-6 h-6 object-contain" /> : <UserIcon size={18} />}
            </div>
            <input type="text" onClick={() => navigate('/app')} placeholder="Crie uma arte no Estúdio para postar aqui..." className="flex-1 bg-[#111] border border-[#222] rounded-full px-4 py-2.5 text-sm outline-none cursor-pointer hover:border-green-500 transition-colors" readOnly />
            <button onClick={() => navigate('/app')} className="p-2.5 bg-[#1a1a2e] text-blue-400 rounded-xl hover:bg-[#2a2a3e] transition-colors"><ImageIcon size={18} /></button>
          </div>

          {/* Feed Loop */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            posts.map(post => {
              const badgeObj = post.profiles?.badge ? BADGES.find(b => b.id === post.profiles.badge) : null;
              
              return (
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} key={post.id} className="bg-[#0a0a0a] rounded-2xl border border-[#222] overflow-hidden">
                  
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center relative border border-[#333]">
                        {/* Dynamic Avatar Badge Render */}
                        {badgeObj ? (
                          <>
                            <div className="absolute inset-0 rounded-full scale-150 blur-md pointer-events-none" style={{ background: badgeObj.glow ? `radial-gradient(circle, ${badgeObj.glow} 0%, transparent 70%)` : 'none', opacity: 0.5 }}></div>
                            <img src={badgeObj.image} className="w-8 h-8 object-contain relative z-10" alt="Selo" style={{ filter: badgeObj.glow ? `drop-shadow(0 0 5px ${badgeObj.glow})` : 'none' }} />
                          </>
                        ) : (
                          <UserIcon size={18} className="text-gray-500" />
                        )}
                      </div>
                      <div className="flex flex-col cursor-pointer" onClick={() => navigate(`/user/${post.profiles?.id}`)}>
                        <div className="font-bold flex items-center gap-2 text-lg">
                          {post.profiles?.display_name || 'Artista'}
                          {post.profiles?.is_pro && <span className="text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded uppercase font-black">PRO</span>}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Image */}
                  <div className="bg-[#111] w-full aspect-square relative flex items-center justify-center p-0 md:p-6 border-y border-[#222]">
                    <img src={post.image_url} className="w-full h-full object-contain drop-shadow-2xl image-pixelated" />
                  </div>
                  
                  {/* Post Actions & Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-xl mb-4">{post.title}</h3>
                    <div className="flex items-center gap-6">
                      <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-2 font-bold transition-colors ${likedPosts[post.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                        <Heart size={22} className={likedPosts[post.id] ? 'fill-red-500' : ''} /> {post.likes}
                      </button>
                      <button onClick={() => loadComments(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 font-bold transition-colors">
                        <MessageSquare size={22} /> Comentar
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {activeCommentPostId === post.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 pt-4 border-t border-[#222] overflow-hidden">
                          <div className="max-h-60 overflow-y-auto pr-2 space-y-3 mb-4 custom-scrollbar">
                            {comments[post.id]?.length > 0 ? comments[post.id].map(comment => {
                               const cBadge = comment.profiles?.badge ? BADGES.find(b => b.id === comment.profiles.badge) : null;
                               return (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center flex-shrink-0 relative">
                                     {cBadge ? <img src={cBadge.image} className="w-5 h-5 object-contain" /> : <UserIcon size={12} className="text-gray-500"/>}
                                  </div>
                                  <div className="bg-[#111] rounded-2xl rounded-tl-none p-3 flex-1 border border-[#222]">
                                    <div className="font-bold text-sm mb-1 flex items-center gap-2">
                                      {comment.profiles?.display_name || 'Usuário'}
                                      {comment.profiles?.is_pro && <span className="text-[8px] bg-green-500 text-black px-1 rounded font-black">PRO</span>}
                                    </div>
                                    <p className="text-sm text-gray-300">{comment.content}</p>
                                  </div>
                                </div>
                               )
                            }) : (
                              <div className="text-sm text-gray-500 text-center py-4">Nenhum comentário ainda. Seja o primeiro!</div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={commentInput} 
                              onChange={(e) => setCommentInput(e.target.value)} 
                              onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                              placeholder="Escreva um comentário..." 
                              className="flex-1 bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500" 
                            />
                            <button onClick={() => submitComment(post.id)} disabled={!commentInput.trim()} className="bg-green-500 text-black p-2 rounded-xl hover:bg-green-400 disabled:opacity-50 transition-colors">
                              <Send size={18} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </motion.div>
              );
            })
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-72 hidden lg:flex flex-col gap-6 sticky top-24 h-max">
          {/* Versão Beta */}
          <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-5 relative overflow-hidden group hover:border-gray-500 transition-colors">
            <h3 className="font-black text-lg mb-2 text-white relative z-10 flex items-center gap-2">
              <MonitorSmartphone size={20} /> Dragon Art Beta
            </h3>
            <p className="text-xs text-gray-400 mb-4 relative z-10">
              Crie pixel arts básicas. Paletas de cores e ferramentas avançadas são limitadas nesta versão.
            </p>
            <button onClick={() => window.open(CONFIG.DOWNLOAD_APK_URL)} className="w-full py-2.5 bg-gray-800 text-white font-black uppercase text-xs rounded-xl hover:bg-gray-700 transition-colors relative z-10 border border-gray-600">
              Baixar Beta (Grátis)
            </button>
          </div>

          {/* Versão PRO */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl border border-green-500/30 p-5 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-2 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform"><Trophy size={100}/></div>
            <h3 className="font-black text-xl mb-2 text-green-400 relative z-10 flex items-center gap-2">
              DRAGON ART <span className="bg-green-500 text-black px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-widest">PRO</span>
            </h3>
            <p className="text-sm text-gray-300 mb-4 relative z-10 font-bold">
              Desbloqueie o potencial máximo!
            </p>
            <ul className="text-xs text-gray-400 mb-6 relative z-10 space-y-2">
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Todas as Paletas Desbloqueadas</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Selos Exclusivos (Fogo, Diamante)</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Sem limites de camadas</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Acesso total à Comunidade Web</li>
            </ul>
            <button onClick={() => window.open(CONFIG.STRIPE_PRO_LINK)} className="w-full py-3 bg-green-500 text-black font-black uppercase text-xs rounded-xl hover:bg-green-400 hover:scale-105 transition-all relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              Desbloquear PRO Agora
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
