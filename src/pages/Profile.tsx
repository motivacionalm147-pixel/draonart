import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Star, Shield, ArrowLeft, Crown, CheckCircle2, Lock, Sparkles, Layers, Palette, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { BADGES } from '../data/badges';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/'); // Redirect to home if not logged in
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;
  }

  const badgeObj = profile?.badge ? BADGES.find(b => b.id === profile.badge) : null;

  const proFeaturesList = [
    { icon: <Layers size={18} />, title: 'Camadas Ilimitadas', desc: 'Crie artes complexas sem restrições' },
    { icon: <Palette size={18} />, title: 'Paletas Premium', desc: 'Acesso a todas as paletas de cores avançadas' },
    { icon: <Sparkles size={18} />, title: 'Selos Animados', desc: 'Selos de perfil com efeitos brilhantes' },
    { icon: <ImageIcon size={18} />, title: 'Exportação PRO', desc: 'Exporte GIFs e Spritesheets em alta qualidade' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-green-500 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/app')} className="flex items-center gap-2 text-gray-400 mb-6 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
          <ArrowLeft size={16} /> Voltar para o Editor
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card Principal - Header do Perfil */}
          <div className="md:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            {profile?.is_pro && <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
              
              {/* Foto de Perfil Dinâmica com Selo */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-[#111] border-4 border-[#222] flex items-center justify-center relative shadow-2xl z-10">
                  {badgeObj ? (
                    <>
                      {badgeObj.glow && (
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 rounded-full blur-xl pointer-events-none" 
                          style={{ background: `radial-gradient(circle, ${badgeObj.glow} 0%, transparent 70%)` }}
                        />
                      )}
                      <img src={badgeObj.image} className="w-24 h-24 object-contain relative z-20 drop-shadow-2xl" alt="Selo" />
                    </>
                  ) : (
                    <User size={48} className="text-gray-600" />
                  )}
                </div>
                {profile?.is_pro && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-2 rounded-full border-4 border-[#0a0a0a] z-30 shadow-lg"
                  >
                    <Crown size={20} className="fill-black" />
                  </motion.div>
                )}
              </div>

              {/* Informações do Usuário */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-black mb-2 flex items-center justify-center sm:justify-start gap-3">
                  {profile?.display_name || 'Artista Criativo'}
                </h1>
                
                <p className={`text-sm font-bold uppercase tracking-widest mb-6 ${profile?.is_pro ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {profile?.is_pro ? 'Membro PRO ✨' : 'Conta Gratuita'}
                </p>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="px-4 py-2 bg-[#111] border border-[#333] rounded-xl text-sm font-bold flex items-center gap-2">
                    <Star size={16} className="text-green-500" />
                    Nível {profile?.experience_level || 1}
                  </div>
                  {profile?.is_admin && (
                    <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                      <Shield size={16} /> Painel Admin
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card Lateral - Assinatura PRO */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {!profile?.is_pro ? (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                  <Crown size={32} className="text-yellow-500" />
                </div>
                <h3 className="font-black text-xl mb-2">Seja um Artista PRO</h3>
                <p className="text-xs text-gray-400 mb-6 font-medium">
                  Desbloqueie ferramentas avançadas, selos brilhantes e remova todas as limitações.
                </p>
                <button 
                  onClick={() => setShowProModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95"
                >
                  Conhecer Benefícios
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="font-black text-xl mb-2 text-green-400">Assinatura Ativa</h3>
                <p className="text-xs text-gray-400 font-medium">
                  Você já possui acesso a todas as funcionalidades profissionais do Dragon Art.
                </p>
              </>
            )}
          </div>

          {/* Grid de Funcionalidades */}
          <div className="md:col-span-3 bg-[#0a0a0a] border border-[#222] rounded-3xl p-8">
            <h3 className="font-black text-xl mb-6 uppercase tracking-widest text-gray-300">Meu Estúdio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {proFeaturesList.map((feat, idx) => {
                const isLocked = !profile?.is_pro;
                return (
                  <div key={idx} className={`p-5 rounded-2xl border transition-all ${isLocked ? 'bg-[#111]/50 border-[#222] grayscale opacity-70' : 'bg-[#111] border-[#333] hover:border-green-500/50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${isLocked ? 'bg-[#222] text-gray-500' : 'bg-green-500/10 text-green-400'}`}>
                        {feat.icon}
                      </div>
                      {isLocked && <Lock size={16} className="text-gray-600" />}
                    </div>
                    <h4 className="font-bold text-sm mb-1">{feat.title}</h4>
                    <p className="text-xs text-gray-500">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
            
            {/* Opções de Conta */}
            <div className="mt-8 pt-8 border-t border-[#222] flex justify-end">
              <button onClick={handleSignOut} className="px-6 py-3 bg-[#111] hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-[#222] hover:border-red-500/30 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2">
                <LogOut size={16} /> Desconectar
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL PRO */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-[#333] rounded-3xl max-w-2xl w-full relative shadow-2xl overflow-hidden my-8"
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-yellow-900/40 via-yellow-600/20 to-orange-900/40 p-8 text-center relative">
                <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/20 p-2 rounded-full">
                  ✕
                </button>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                  <Crown size={40} className="text-black" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Dragon Art <span className="text-yellow-500">PRO</span></h2>
                <p className="text-yellow-200/80 font-medium">Eleve sua arte pixelada para o próximo nível.</p>
              </div>

              {/* Lista de Benefícios */}
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {proFeaturesList.map((feat, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl mt-1">
                        {feat.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{feat.title}</h4>
                        <p className="text-sm text-gray-400">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão de Assinatura */}
                <div className="bg-[#111] rounded-2xl p-6 border border-[#222] text-center">
                  <div className="text-sm text-gray-400 mb-4 uppercase tracking-widest font-bold">Assinatura Mensal via Stripe</div>
                  <button 
                    onClick={() => {
                      window.open(CONFIG.STRIPE_PRO_LINK, '_blank');
                      setShowProModal(false);
                    }}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:brightness-110 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105"
                  >
                    Desbloquear Acesso PRO
                  </button>
                  <p className="text-xs text-gray-500 mt-4">Cancele quando quiser. Pagamento 100% seguro.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
