import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Shield } from 'lucide-react';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        navigate('/profile');
        return;
      }

      setIsAdmin(true);

      const { data } = await supabase
        .from('posts')
        .select('id, title, image_url, created_at, profiles(display_name)')
        .order('created_at', { ascending: false });
        
      if (data) setPosts(data);
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [navigate]);

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm("Certeza que deseja apagar este post?")) return;

    try {
      // Deletar a imagem do Storage
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('arts').remove([fileName]);
      }
      
      // Deletar do banco de dados
      await supabase.from('posts').delete().eq('id', id);
      setPosts(posts.filter(p => p.id !== id));
      alert("Post deletado.");
    } catch (e) {
      alert("Erro ao deletar post.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505]" />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} /> Voltar
          </button>
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-lg">
            <Shield size={20} /> Painel de Administração
          </div>
        </header>

        <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1a1a1a] border-b border-[#333]">
              <tr>
                <th className="p-4 font-bold text-gray-400">Arte</th>
                <th className="p-4 font-bold text-gray-400">Título</th>
                <th className="p-4 font-bold text-gray-400">Autor</th>
                <th className="p-4 font-bold text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-[#222] hover:bg-[#151515]">
                  <td className="p-4">
                    <img src={post.image_url} alt="Arte" className="w-16 h-16 object-contain bg-[#000] rounded border border-[#333]" style={{ imageRendering: 'pixelated' }} />
                  </td>
                  <td className="p-4 font-bold">{post.title}</td>
                  <td className="p-4 text-gray-400">{post.profiles?.display_name || 'Desconhecido'}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleDelete(post.id, post.image_url)}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Nenhum post encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
