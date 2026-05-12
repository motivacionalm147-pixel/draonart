import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Heart, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAvatarFallback } from '../utils';

interface Post {
  id: string;
  title: string;
  image_url: string;
  likes: number;
  created_at: string;
  profiles?: {
    display_name: string;
    experience_level: number;
    is_pro: boolean;
    avatar_url: string;
  };
}

export default function WebGallery() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            image_url,
            likes,
            created_at,
            profiles (
              display_name,
              experience_level,
              is_pro,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setPosts((data as any) || []);
      } catch (err) {
        console.error("Erro ao buscar posts da galeria:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 hidden md:block">
          Galeria da Comunidade
        </h1>
        <button 
          onClick={() => navigate('/app')}
          className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm uppercase rounded-lg"
        >
          Postar Arte
        </button>
      </header>

      <main className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 text-gray-500">
            <img src="/logo.png" alt="Vazio" className="w-24 h-24 mx-auto mb-6 opacity-20 grayscale" style={{ imageRendering: 'pixelated' }} />
            <p className="text-xl font-bold">A comunidade está vazia.</p>
            <p>Seja o primeiro a postar uma arte usando o aplicativo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={post.id}
                className="bg-[#111] border border-[#222] rounded-xl overflow-hidden hover:border-green-500/50 transition-colors group cursor-pointer"
              >
                <div className="aspect-square bg-[#0a0a0a] relative flex items-center justify-center overflow-hidden p-4">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="max-w-full max-h-full object-contain relative z-10 group-hover:scale-105 transition-transform" 
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                
                <div className="p-4 border-t border-[#222]">
                  <h3 className="font-bold text-lg mb-1 truncate">{post.title}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center overflow-hidden border border-white/10 shadow-sm">
                        <img 
                          src={getAvatarFallback(post.profiles?.avatar_url, post.profiles?.display_name || post.id)} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(null, post.profiles?.display_name || post.id); }}
                        />
                      </div>
                      <span className="truncate max-w-[100px]">{post.profiles?.display_name || 'Usuário'}</span>
                      {post.profiles?.is_pro && (
                        <span className="text-[10px] bg-green-500 text-black font-black px-1.5 py-0.5 rounded uppercase">PRO</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                      <Heart size={16} />
                      <span className="text-xs font-bold">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
