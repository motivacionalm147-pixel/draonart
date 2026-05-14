import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Star, Pencil, Layers, Film, Box, Download, Check, PaintBucket, Droplet, Zap } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  color: string;
}

const MENU_STEPS: TutorialStep[] = [
  {
    title: 'Bem-vindo ao Dragon Art',
    description: 'O seu novo estúdio profissional de pixel art. Tudo o que você precisa para criar artes incríveis e animações fluidas diretamente no seu celular.',
    icon: <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/20"><Pencil size={32} className="text-white" /></div>,
    color: '#ef4444'
  },
  {
    title: 'Gerencie seus Projetos',
    description: 'Toque no "+" para começar um novo canvas. Segure em um projeto existente para abrir o menu de opções: Renomear, Duplicar ou Deletar.',
    icon: <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Layers size={32} className="text-white" /></div>,
    color: '#3b82f6'
  },
  {
    title: 'Seu Perfil de Artista',
    description: 'Personalize seu avatar, escolha seu selo de conquista e acompanhe seu nível de experiência na aba Perfil.',
    icon: <div className="w-16 h-16 bg-purple-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20"><Check size={32} className="text-white" /></div>,
    color: '#a855f7'
  }
];

const EDITOR_STEPS: TutorialStep[] = [
  {
    title: 'Interface do Editor',
    description: 'As ferramentas principais ficam à esquerda. Painéis de cores, camadas e frames podem ser abertos nos botões flutuantes ou na barra inferior.',
    icon: <div className="w-16 h-16 bg-red-500 rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/20"><Pencil size={32} className="text-white" /></div>,
    color: '#ef4444'
  },
  {
    title: 'Navegação por Gestos',
    description: 'Use dois dedos para dar zoom e mover a tela. Toque com dois dedos fora do desenho para Desfazer (Undo) rapidamente.',
    icon: <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Check size={32} className="text-white" /></div>,
    color: '#3b82f6'
  },
  {
    title: 'Traço Perfeito (AI)',
    description: 'Ative o Perfect Stroke nas configurações para que a IA corrija automaticamente seus traços, eliminando tremores e criando linhas perfeitas.',
    icon: <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><Pencil size={32} className="text-white" /></div>,
    color: '#10b981'
  },
  {
    title: 'Animação e Timeline',
    description: 'Crie frames na barra inferior. Use o botão de Play para visualizar sua animação e o Onion Skin para ver referências de outros frames.',
    icon: <div className="w-16 h-16 bg-purple-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20"><Film size={32} className="text-white" /></div>,
    color: '#a855f7'
  },
  {
    title: 'Sistema de Camadas',
    description: 'Use camadas para separar o fundo dos seus personagens. Você pode bloquear, esconder ou mudar a opacidade de cada camada individualmente.',
    icon: <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20"><Layers size={32} className="text-white" /></div>,
    color: '#f97316'
  },
  {
    title: 'Cores e Paletas',
    description: 'Acesse centenas de paletas prontas ou crie a sua própria. O Dragon Art sugere cores que combinam entre si para facilitar seu trabalho.',
    icon: <div className="w-16 h-16 bg-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-500/20"><Star size={32} className="text-white" /></div>,
    color: '#ec4899'
  },
  {
    title: 'Ferramentas Avançadas',
    description: 'Experimente o Balde de Tinta, Seleção, Desfoque (Blur) e o Aerógrafo (Airbrush) para adicionar texturas e efeitos profissionais à sua arte.',
    icon: <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/20"><Pencil size={32} className="text-white" /></div>,
    color: '#2563eb'
  },
  {
    title: 'Exportação Profissional',
    description: 'Salve seu trabalho como PNG, GIF ou MP4 no menu superior. No PRO, você tem resoluções de até 16K sem marca d\'água.',
    icon: <div className="w-16 h-16 bg-yellow-500 rounded-3xl flex items-center justify-center shadow-lg shadow-yellow-500/20"><Download size={32} className="text-white" /></div>,
    color: '#eab308'
  }
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'menu' | 'editor';
}

export default function OnboardingTutorial({ isOpen, onClose, mode }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = mode === 'menu' ? MENU_STEPS : EDITOR_STEPS;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finish();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finish = () => {
    localStorage.setItem(`dragonart_tutorial_${mode}_completed`, 'true');
    onClose();
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col relative"
          >
            {/* Header / Progress */}
            <div className="absolute top-8 left-8 right-8 flex gap-2 z-10">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden"
                >
                  <motion.div 
                    initial={false}
                    animate={{ width: index <= currentStep ? '100%' : '0%' }}
                    className="h-full bg-gradient-to-r from-white to-white/60"
                  />
                </div>
              ))}
            </div>


            {/* Skip Button */}
            <button 
              onClick={finish}
              className="absolute top-12 right-8 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest z-10"
            >
              Pular
            </button>

            {/* Content Container */}
            <div className="pt-24 pb-12 px-8 flex flex-col items-center text-center min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="mb-8">
                    {step.icon}
                  </div>
                  
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
                    {step.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>


            {/* Visual Example Area */}
            <div className="px-8 flex-1 flex items-center justify-center overflow-hidden">
              <div className="w-full aspect-video rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden flex items-center justify-center group shadow-2xl">
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')] mix-blend-overlay" />
                 
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={`${mode}-${currentStep}`}
                     initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                     animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                     exit={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                     className="relative z-10 w-full h-full flex items-center justify-center p-6"
                   >
                     {mode === 'menu' ? (
                       <>
                         {currentStep === 0 && (
                           <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                             <img src="/logo.png" className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
                           </motion.div>
                         )}
                         {currentStep === 1 && (
                           <div className="grid grid-cols-2 gap-3 w-full max-w-[240px]">
                             {[1, 2, 3, 4].map(i => (
                               <motion.div 
                                 key={i}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: i * 0.1 }}
                                 className="h-16 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center"
                               >
                                 <Box size={24} className="text-white/20" />
                               </motion.div>
                             ))}
                           </div>
                         )}
                         {currentStep === 2 && (
                           <div className="flex flex-col items-center gap-4">
                             <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-xl">
                               <Star size={40} className="text-white fill-white" />
                             </div>
                             <div className="h-2 w-24 bg-white/20 rounded-full" />
                             <div className="h-2 w-16 bg-white/10 rounded-full" />
                           </div>
                         )}
                       </>
                     ) : (
                       <>
                         {currentStep === 0 && (
                           <div className="flex gap-4">
                             <motion.div animate={{ x: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }} className="p-4 bg-white/10 rounded-2xl border border-white/20"><Pencil size={32} /></motion.div>
                             <div className="p-4 bg-white/10 rounded-2xl border border-white/20"><Layers size={32} /></div>
                             <div className="p-4 bg-white/10 rounded-2xl border border-white/20"><Film size={32} /></div>
                           </div>
                         )}
                         {currentStep === 1 && (
                           <div className="relative w-full h-full flex items-center justify-center">
                             <motion.div 
                               animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="absolute w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 -translate-x-8"
                             />
                             <motion.div 
                               animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="absolute w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 translate-x-8"
                             />
                             <span className="text-[10px] font-black uppercase text-white/40 mt-20">PINCH TO ZOOM</span>
                           </div>
                         )}
                         {currentStep === 2 && (
                           <div className="flex flex-col items-center gap-6">
                             <svg width="200" height="80" viewBox="0 0 200 80">
                               <motion.path 
                                 d="M 20 60 Q 50 10 100 40 T 180 20"
                                 fill="none"
                                 stroke="rgba(255,255,255,0.1)"
                                 strokeWidth="4"
                                 strokeDasharray="4 4"
                               />
                               <motion.path 
                                 d="M 20 60 Q 50 10 100 40 T 180 20"
                                 fill="none"
                                 stroke="#10b981"
                                 strokeWidth="4"
                                 strokeLinecap="round"
                                 initial={{ pathLength: 0 }}
                                 animate={{ pathLength: 1 }}
                                 transition={{ duration: 2, repeat: Infinity }}
                               />
                             </svg>
                             <div className="flex items-center gap-2 text-[#10b981] font-black text-[10px] uppercase">
                               <div className="w-2 h-2 bg-[#10b981] rounded-full animate-ping" /> IA ACTIVE
                             </div>
                           </div>
                         )}
                         {currentStep === 3 && (
                           <div className="flex flex-col items-center gap-4">
                             <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map(i => (
                                 <motion.div 
                                   key={i}
                                   animate={{ 
                                     backgroundColor: (i === 1 || i === 3) ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255,255,255,0.05)',
                                     scale: (i === 1 || i === 3) ? 1.1 : 1
                                   }}
                                   className="w-10 h-10 rounded-lg border border-white/10"
                                 />
                               ))}
                             </div>
                             <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                               <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                                 <Film size={24} className="text-purple-500" />
                               </motion.div>
                             </div>
                           </div>
                         )}
                         {currentStep === 4 && (
                           <div className="flex flex-col gap-2 w-full max-w-[180px]">
                             <motion.div animate={{ x: [0, 10, 0] }} className="h-8 bg-orange-500/20 border border-orange-500/40 rounded-lg flex items-center px-3 gap-2">
                               <Layers size={14} className="text-orange-500" /> <div className="h-1 w-12 bg-white/20 rounded-full" />
                             </motion.div>
                             <motion.div animate={{ x: [0, -10, 0] }} className="h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-3 gap-2 opacity-50">
                               <Layers size={14} /> <div className="h-1 w-16 bg-white/10 rounded-full" />
                             </motion.div>
                             <div className="h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-3 gap-2 opacity-30">
                               <Layers size={14} /> <div className="h-1 w-10 bg-white/10 rounded-full" />
                             </div>
                           </div>
                         )}
                         {currentStep === 5 && (
                           <div className="flex flex-col items-center gap-4">
                             <div className="grid grid-cols-5 gap-2">
                               {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080', '#ffffff', '#000000'].map((c, i) => (
                                 <motion.div 
                                   key={i}
                                   animate={{ scale: [1, 1.2, 1] }}
                                   transition={{ delay: i * 0.1, duration: 2, repeat: Infinity }}
                                   className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                   style={{ backgroundColor: c }}
                                 />
                               ))}
                             </div>
                             <div className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-500 text-[8px] font-black uppercase">Paletas Sugeridas</div>
                           </div>
                         )}
                         {currentStep === 6 && (
                           <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex flex-col items-center gap-2">
                               <PaintBucket size={24} className="text-blue-400" />
                               <span className="text-[8px] font-bold text-white/40">BALDE</span>
                             </div>
                             <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col items-center gap-2">
                               <Droplet size={24} className="text-purple-400" />
                               <span className="text-[8px] font-bold text-white/40">BLUR</span>
                             </div>
                             <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center gap-2">
                               <Box size={24} className="text-emerald-400" />
                               <span className="text-[8px] font-bold text-white/40">SHAPE</span>
                             </div>
                             <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex flex-col items-center gap-2">
                               <Zap size={24} className="text-orange-400" />
                               <span className="text-[8px] font-bold text-white/40">EFEITOS</span>
                             </div>
                           </div>
                         )}
                         {currentStep === 7 && (
                           <div className="flex flex-col items-center gap-4">
                             <motion.div 
                               animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
                               transition={{ duration: 2, repeat: Infinity }}
                               className="w-24 h-24 bg-yellow-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                             >
                               <Download size={48} className="text-black" />
                             </motion.div>
                             <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                               <motion.div 
                                 animate={{ x: ['-100%', '100%'] }}
                                 transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                 className="w-1/2 h-full bg-yellow-500"
                               />
                             </div>
                           </div>
                         )}
                       </>
                     )}
                   </motion.div>
                 </AnimatePresence>

                 <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] animate-pulse">Dragon Art Preview Simulation</span>
                 </div>
              </div>
            </div>


            {/* Footer Actions */}
            <div className="p-8 flex items-center justify-between gap-4">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0' : 'text-white/40 hover:text-white'}`}
              >
                <ChevronLeft size={16} /> Anterior
              </button>

              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                {currentStep === steps.length - 1 ? (
                  <>Começar <Check size={16} /></>
                ) : (
                  <>Próximo <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
