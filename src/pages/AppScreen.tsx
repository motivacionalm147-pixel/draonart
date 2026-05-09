import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, Instagram } from 'lucide-react';
import { themes, applyTheme } from '../theme';
import { ErrorBoundary } from '../ErrorBoundary';
import { ProjectConfig } from '../types';

import StartMenu from '../StartMenu';
import Editor from '../Editor';

// Safe polyfill - dynamic import to avoid crash on mobile
try {
  import("mobile-drag-drop").then((mod) => {
    import("mobile-drag-drop/scroll-behaviour").then((scrollMod) => {
      mod.polyfill({
        dragImageTranslateOverride: scrollMod.scrollBehaviourDragImageTranslateOverride
      });
    });
  }).catch(() => {});
} catch (e) {}
import "mobile-drag-drop/default.css";

// Capacitor plugins (safe import - won't crash on web)
let CapApp: any = null;
let CapStatusBar: any = null;
try {
  import('@capacitor/app').then(m => { CapApp = m.App; }).catch(() => {});
  import('@capacitor/status-bar').then(m => { CapStatusBar = m.StatusBar; }).catch(() => {});
} catch (_) {}

// Simple loading fallback
function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace',
      textAlign: 'center'
    }}>
      <div className="animate-pulse-subtle">
        <img 
          src="/logo.png" 
          alt="Dragon Art" 
          style={{ width: '80px', height: '80px', objectFit: 'contain', imageRendering: 'pixelated', marginBottom: '24px' }} 
        />
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '32px', letterSpacing: '0.2em' }}>DRAGONART</div>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.1em' }}>Carregando Estúdio...</div>
      </div>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [userName, setUserName] = useState('Artista Pixel');
  const [showSplash, setShowSplash] = useState(true);
  const [splashSequence, setSplashSequence] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const editorSavePromptRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    const hideStatusBar = async () => {
      try {
        if (CapStatusBar) {
          await CapStatusBar.setOverlaysWebView({ overlay: true });
          await CapStatusBar.hide();
        }
      } catch (_) {}
    };
    setTimeout(hideStatusBar, 300);
  }, []);

  useEffect(() => {
    const setupBackButton = async () => {
      try {
        if (CapApp) {
          CapApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
            if (editorSavePromptRef.current) {
              editorSavePromptRef.current();
            } else if (!showSplash) {
              setShowExitDialog(true);
            }
          });
        }
      } catch (_) {}
    };
    setupBackButton();
  }, [showSplash]);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('pixel_theme');
      if (savedTheme) {
        const themeConfig = themes.find(t => t.id === savedTheme);
        if (themeConfig) applyTheme(themeConfig);
      } else {
        const defaultTheme = themes.find(t => t.id === 'default');
        if (defaultTheme) applyTheme(defaultTheme);
      }
    } catch (e) {}

    const logoTimer = setTimeout(() => setSplashSequence(1), 3000);
    const instaTimer = setTimeout(() => setSplashSequence(2), 5500);
    const headTimer = setTimeout(() => {
      setSplashSequence(3);
      setShowSplash(false);
    }, 8000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(instaTimer);
      clearTimeout(headTimer);
    };
  }, []);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = 0.1;
        import('../sound').then(({ sound }) => {
          sound.setBgm(audio);
        });
        audio.play().catch(() => {
          const handleInteraction = () => {
            import('../sound').then(({ sound }) => {
              sound.init();
              if (sound.isEnabled()) audio.play().catch(() => {});
            });
            document.removeEventListener('click', handleInteraction);
          };
          document.addEventListener('click', handleInteraction);
        });
      }
    } catch (e) {}
  }, []);

  const handleStartProject = (newConfig: ProjectConfig, userIsPro: boolean, name: string) => {
    setIsPro(userIsPro);
    setUserName(name);
    setConfig(newConfig);
  };

  const handleExitApp = useCallback(() => {
    if (CapApp) CapApp.exitApp();
    else window.close();
  }, []);

  return (
    <>
      <audio ref={audioRef} loop src="/background_music.mp3" />
      
      {showSplash ? (
        <motion.div 
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="fixed inset-0 min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden z-50"
        >
          <AnimatePresence mode="wait">
            {splashSequence === 0 && (
              <motion.div 
                key="logo-seq" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1.5 }}
                className="flex flex-col items-center gap-6"
              >
                <img src="/logo.png" alt="Logo" className="w-32 h-32 md:w-40 md:h-40" style={{ imageRendering: 'pixelated' }} />
                <h1 className="text-3xl md:text-5xl font-black tracking-widest text-white" style={{ fontFamily: '"Press Start 2P", monospace' }}>DRAGONART</h1>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-4">Estúdio de Pixel Art</div>
              </motion.div>
            )}

            {splashSequence === 1 && (
              <motion.div 
                key="insta-seq" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1 }}
                className="flex flex-col items-center gap-5"
              >
                <Instagram size={48} className="text-gray-400" strokeWidth={1.5} />
                <p className="text-sm md:text-base tracking-[0.3em] font-black uppercase text-gray-500">Siga no Instagram</p>
                <p className="text-xl md:text-2xl font-bold tracking-widest text-white">@dragonart_pixel</p>
              </motion.div>
            )}

            {splashSequence === 2 && (
              <motion.div 
                key="head-seq" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <Headphones size={48} className="text-gray-400" />
                <div className="text-center">
                  <p className="text-lg md:text-xl font-bold tracking-widest text-white mb-2">Para uma melhor experiência</p>
                  <p className="text-sm tracking-[0.2em] font-black uppercase text-gray-500">Use Fones de Ouvido</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : !config ? (
          <StartMenu onStart={handleStartProject} />
      ) : (
        <ErrorBoundary>
            <Editor 
              config={config} 
              isPro={isPro}
              userName={userName}
              onBack={() => setConfig(null)} 
              onRegisterBackHandler={(h: () => void) => { editorSavePromptRef.current = h; }} 
              onUnregisterBackHandler={() => { editorSavePromptRef.current = null; }} 
            />
        </ErrorBoundary>
      )}

      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowExitDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full border border-[#333] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white text-center mb-4">Sair do Dragon Art?</h2>
              <div className="flex flex-col gap-3">
                <button onClick={handleExitApp} className="w-full p-3 bg-red-600 text-white font-bold rounded-xl">Sair</button>
                <button onClick={() => setShowExitDialog(false)} className="w-full p-3 bg-[#2a2a3e] text-[#aaa)] font-bold rounded-xl">Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
