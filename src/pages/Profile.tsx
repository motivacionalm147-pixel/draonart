import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Star, Shield, ArrowLeft } from 'lucide-react';
import { CONFIG } from '../config';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-3xl mx-auto mt-10">
        <button onClick={() => navigate('/app')} className="flex items-center gap-2 text-gray-400 mb-8 hover:text-white">
          <ArrowLeft size={20} /> Voltar para o Editor
        </button>

        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 shadow-xl relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-[#222] border-4 border-[#333] flex items-center justify-center">
              <User size={48} className="text-gray-500" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl font-black">{profile?.display_name || 'Sem Nome'}</h1>
                <p className="text-gray-400 mt-1">Conta Gratuita</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="px-3 py-1.5 bg-[#222] rounded-lg text-sm font-bold flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  Nível {profile?.experience_level || 1}
                </div>
                {profile?.is_pro && (
                  <div className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                    <Star size={16} /> PRO
                  </div>
                )}
                {profile?.is_admin && (
                  <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2 uppercase tracking-widest cursor-pointer hover:bg-blue-500/30" onClick={() => navigate('/admin')}>
                    <Shield size={16} /> Painel Admin
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#222] flex flex-col gap-4">
            {!profile?.is_pro && (
              <button 
                onClick={() => window.open(CONFIG.STRIPE_PRO_LINK, '_blank')}
                className="w-full px-6 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:brightness-110 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-3"
              >
                <Star size={24} className="fill-black" /> Assinar Dragon Art PRO
              </button>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleSignOut} className="flex-1 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                <LogOut size={20} /> Sair da Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
