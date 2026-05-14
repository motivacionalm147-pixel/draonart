import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Star, Shield, ArrowLeft, Crown, CheckCircle2, Lock, Sparkles, Layers, Palette, Image as ImageIcon, Settings, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../config';
import { BADGES } from '../data/badges';
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import BadgeSelectionModal from '../components/BadgeSelectionModal';
import { getAvatarFallback } from '../utils';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async (updates: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
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
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/app')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
            <ArrowLeft size={16} /> Voltar para o Editor
          </button>
          <div className="flex gap-2">
            {profile?.is_admin && (
              <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors">
                <Shield size={14} /> Admin
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card Principal - Header do Perfil */}
          <div className="md:col-span-2 bg-[#0a0a0a] border border-[#222] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            {profile?.is_pro && <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10 relative z-10">
              
              {/* Foto de Perfil com Seleção de Avatar */}
              <div className="relative group/avatar">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAvatarModal(true)}
                  className="w-32 h-32 rounded-full bg-[#111] border-4 border-[#222] overflow-hidden relative shadow-2xl z-10 block"
                >
                  <img 
                    src={getAvatarFallback(profile?.avatar_url, profile?.display_name || 'user')} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                    onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(null, profile?.display_name || 'user'); }}
                  />
                  {/* Overlay de Edição */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                    <Edit3 size={20} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Mudar</span>
                  </div>
                </motion.button>

                {/* Badge/Selo Flutuante */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  onClick={() => setShowBadgeModal(true)}
                  className="absolute -bottom-2 -right-2 w-14 h-14 bg-[#111] border-4 border-[#0a0a0a] rounded-2xl flex items-center justify-center z-20 shadow-xl overflow-hidden group/badge"
                >
                  {badgeObj ? (
                    <>
                      {badgeObj.glow && (
                        <div className="absolute inset-0 blur-md opacity-50" style={{ background: badgeObj.glow }} />
                      )}
                      <img src={badgeObj.image} className="w-8 h-8 object-contain relative z-10" alt="Selo" />
                    </>
                  ) : (
                    <Star size={20} className="text-gray-600" />
                  )}
                  <div className="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                </motion.button>

                {profile?.is_pro && (
                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black p-1.5 rounded-lg border-2 border-[#0a0a0a] z-30 shadow-lg">
                    <Crown size={14} className="fill-black" />
                  </div>
                )}
              </div>

              {/* Informações do Usuário */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-4xl font-black tracking-tighter">
                    {profile?.display_name || 'Artista Criativo'}
                  </h1>
                  <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${profile?.is_pro ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-gray-500'}`}>
                    {profile?.is_pro ? 'PRO' : 'FREE'}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm font-medium mb-6">
                  Apaixonado por pixel art e design digital.
                </p>


                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="px-4 py-2 bg-[#111] border border-[#222] rounded-xl text-xs font-black flex items-center gap-2 text-green-500">
                    <Star size={14} /> NÍVEL {profile?.experience_level || 1}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Lateral - Assinatura PRO */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            {!profile?.is_pro ? (
              <>
                <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center mb-6 rotate-3 group-hover:rotate-6 transition-transform">
                  <Crown size={32} className="text-yellow-500" />
                </div>
                <h3 className="font-black text-xl mb-2">Upgrade PRO</h3>
                <p className="text-xs text-gray-400 mb-8 font-medium">
                  Desbloqueie ferramentas, selos brilhantes e remova todas as limitações.
                </p>
                <button 
                  onClick={() => setShowProModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:scale-105 active:scale-95"
                >
                  Ver Planos
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="font-black text-xl mb-2 text-green-400">Assinatura Ativa</h3>
                <p className="text-xs text-gray-400 font-medium">
                  Você é um artista lendário com acesso total.
                </p>
              </>
            )}
          </div>

          {/* Grid de Funcionalidades */}
          <div className="md:col-span-3 bg-[#0a0a0a] border border-[#222] rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl uppercase tracking-widest text-white flex items-center gap-3">
                Meu Estúdio <Layers size={20} className="text-green-500" />
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {proFeaturesList.map((feat, idx) => {
                const isLocked = !profile?.is_pro;
                return (
                  <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${isLocked ? 'bg-[#0d0d0d] border-[#1a1a1a] opacity-60' : 'bg-[#111] border-[#222] hover:border-green-500/30 group/feat'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${isLocked ? 'bg-[#151515] text-gray-600' : 'bg-green-500/10 text-green-400 group-hover/feat:scale-110 transition-transform'}`}>
                        {feat.icon}
                      </div>
                      {isLocked && <Lock size={14} className="text-gray-700" />}
                    </div>
                    <h4 className="font-black text-sm mb-1 uppercase tracking-tighter">{feat.title}</h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
            
            {/* Opções de Conta */}
            <div className="mt-12 pt-8 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                Dragon Art Studio &copy; 2026 - Todos os direitos reservados
              </p>
              <button onClick={handleSignOut} className="px-8 py-3 bg-[#111] hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-[#222] hover:border-red-500/30 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center gap-2">
                <LogOut size={14} /> Sair da Conta
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <AvatarSelectionModal 
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={profile?.avatar_url}
        onSelect={(avatar) => {
          handleUpdateProfile({ avatar_url: avatar });
          setShowAvatarModal(false);
        }}
      />

      <BadgeSelectionModal 
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        currentBadge={profile?.badge}
        isPro={profile?.is_pro}
        onSelect={(badgeId) => {
          handleUpdateProfile({ badge: badgeId });
          setShowBadgeModal(false);
        }}
      />

      {/* MODAL PRO */}
      <AnimatePresence>
        {showProModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-[#333] rounded-[3rem] max-w-2xl w-full relative shadow-2xl overflow-hidden my-8"
            >
              {/* Header do Modal */}
              <div className="bg-gradient-to-r from-yellow-900/40 via-yellow-600/20 to-orange-900/40 p-10 text-center relative border-b border-[#222]">
                <button onClick={() => setShowProModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white bg-black/40 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] rotate-6">
                  <Crown size={48} className="text-black" />
                </div>
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Dragon Art <span className="text-yellow-500">PRO</span></h2>
                <p className="text-yellow-200/60 font-bold uppercase tracking-widest text-[10px]">Domine a arte do pixel</p>
              </div>

              {/* Lista de Benefícios */}
              <div className="p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                  {proFeaturesList.map((feat, idx) => (
                    <div key={idx} className="flex gap-5 items-start">
                      <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl mt-1">
                        {feat.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-white mb-1 uppercase tracking-tighter">{feat.title}</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botão de Assinatura */}
                <div className="bg-[#0d0d0d] rounded-[2rem] p-8 border border-[#222] text-center">
                  <div className="text-[10px] text-gray-500 mb-6 uppercase tracking-[0.3em] font-black">Pagamento Seguro via Stripe</div>
                  <button 
                    onClick={() => {
                      window.open(CONFIG.STRIPE_PRO_LINK, '_blank');
                      setShowProModal(false);
                    }}
                    className="w-full py-5 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:brightness-110 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:scale-[1.02]"
                  >
                    Ativar Dragon Art PRO
                  </button>
                  <p className="text-[10px] text-gray-600 mt-6 font-bold uppercase">Cancele quando quiser &bull; Suporte 24/7</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
