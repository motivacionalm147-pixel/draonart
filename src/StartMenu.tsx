import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Download, Palette, Settings, HelpCircle, X, PlayCircle, BookOpen, Pencil, Eraser, PaintBucket, Pipette, Square, Move, Hand, Type, Layers as LayersIcon, Film, Undo, Grid, ZoomIn, Play, Copy, Sun, Moon, Check, Keyboard, Star, FolderOpen, Video, Image as ImageIcon, FileImage, FileVideo, Eye, Expand, User, Users, Home, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import GIF from 'gif.js';
import { sound } from './sound';
import { ProjectConfig } from './types';
import { themes, applyTheme } from './theme';
import { generateId } from './utils';

export default function StartMenu({ onStart }: { onStart: (config: ProjectConfig) => void }) {
  const [name, setName] = useState('My Pixel Art');
  const [size, setSize] = useState(16);
  const [customWidth, setCustomWidth] = useState(16);
  const [customHeight, setCustomHeight] = useState(16);
  const [isCustom, setIsCustom] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ProjectConfig[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectOptionsModal, setProjectOptionsModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'community'>('home');
  
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const carouselImages = [
    '/63b2de4429b84bb6e1cc632f2b8b9361.webp',
    '/d8395ee034cea71454588d9427dfcbcd.gif',
    '/e4278f35dfc32b3970459ea2e25e066e.gif',
    '/eac26181f6a03a98c7828992be7e346a.gif'
  ];
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);


  const defaultShortcuts: Record<string, string> = {
    pencil: 'p', eraser: 'e', fill: 'g', picker: 'i',
    shape: 'u', select: 'm', hand: 'h', text: 't',
    undo: 'z', redo: 'y', grid: 'k', play: ' ',
    clear: 'delete', sound: 's',
    zoomIn: '=', zoomOut: '-', resetView: '0',
    save: 'ctrl+s', newFrame: 'n',
  };

  const shortcutLabels: Record<string, string> = {
    pencil: 'Lápis', eraser: 'Borracha', fill: 'Balde', picker: 'Conta-gotas',
    shape: 'Formas', select: 'Seleção', hand: 'Mover (Mão)', text: 'Texto',
    undo: 'Desfazer (Ctrl+)', redo: 'Refazer (Ctrl+)', grid: 'Malha', play: 'Animação',
    clear: 'Limpar Camada', sound: 'Mutar/Desmutar Som',
    zoomIn: 'Zoom +', zoomOut: 'Zoom -', resetView: 'Resetar Zoom',
    save: 'Salvar Projeto', newFrame: 'Novo Frame',
  };

  const shortcutCategories = [
    { name: 'Ferramentas', keys: ['pencil', 'eraser', 'fill', 'picker', 'shape', 'select', 'hand', 'text'] },
    { name: 'Edição', keys: ['undo', 'redo', 'clear', 'newFrame'] },
    { name: 'Visualização', keys: ['grid', 'play', 'zoomIn', 'zoomOut', 'resetView'] },
    { name: 'Sistema', keys: ['save', 'sound'] },
  ];

  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('pixel_shortcuts');
    const parsed = saved ? JSON.parse(saved) : {};
    return { ...defaultShortcuts, ...parsed };
  });
  const [shortcutConfigMode, setShortcutConfigMode] = useState<string | null>(null);

  // Theming state
  const [currentThemeId, setCurrentThemeId] = useState<string>('default');

  // Sound state
  const [sfxEnabled, setSfxEnabled] = useState(() => sound.isSfxEnabled());
  const [bgmEnabled, setBgmEnabled] = useState(() => sound.isBgmEnabled());

  const toggleSfx = () => {
    const newVal = !sfxEnabled;
    sound.setSfxEnabled(newVal);
    setSfxEnabled(newVal);
  };

  const toggleBgm = () => {
    const newVal = !bgmEnabled;
    sound.setBgmEnabled(newVal);
    setBgmEnabled(newVal);
  };

  // Global click sound for the menu
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) {
        sound.playClick();
      }
    };
    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => document.removeEventListener('click', handleGlobalClick, { capture: true });
  }, []);

  useEffect(() => {
    if (!shortcutConfigMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.key === 'Escape') {
        setShortcutConfigMode(null);
        return;
      }

      const newKey = e.key.toLowerCase();
      if (['shift', 'control', 'alt', 'meta'].includes(newKey)) return;

      setShortcuts(prev => {
        const updated = { ...prev, [shortcutConfigMode]: newKey };
        localStorage.setItem('pixel_shortcuts', JSON.stringify(updated));
        return updated;
      });
      setShortcutConfigMode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutConfigMode]);

  useEffect(() => {
    // Load Projects
    try {
      const projectsStr = localStorage.getItem('pixel_projects');
      if (projectsStr) {
        const projects = JSON.parse(projectsStr) as ProjectConfig[];
        // Sort by updatedAt descending
        projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setSavedProjects(projects);
      } else {
        const testProject: ProjectConfig = {
          id: generateId(),
          name: 'Projeto de Teste',
          width: 16,
          height: 16,
          updatedAt: Date.now()
        };
        setSavedProjects([testProject]);
        localStorage.setItem('pixel_projects', JSON.stringify([testProject]));
      }
    } catch (e) {
      console.warn('Failed to load projects:', e);
      setSavedProjects([]);
    }

    // Load Theme
    try {
      const savedTheme = localStorage.getItem('pixel_theme');
      if (savedTheme) {
        setCurrentThemeId(savedTheme);
        const themeConfig = themes.find(t => t.id === savedTheme);
        if (themeConfig) applyTheme(themeConfig);
      } else {
        const defaultTheme = themes.find(t => t.id === 'default');
        if (defaultTheme) {
          applyTheme(defaultTheme);
          setCurrentThemeId('default');
        }
      }
    } catch (e) {
      console.warn('Failed to load theme:', e);
      const defaultTheme = themes.find(t => t.id === 'default');
      if (defaultTheme) applyTheme(defaultTheme);
    }
  }, []);

  const changeTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    localStorage.setItem('pixel_theme', themeId);
    const themeConfig = themes.find(t => t.id === themeId);
    if (themeConfig) applyTheme(themeConfig);
  };

  const deleteProject = (id: string) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    setSelectedProjects(prev => prev.filter(pid => pid !== id));
    try {
      localStorage.setItem('pixel_projects', JSON.stringify(updated));
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  };

  const deleteSelectedProjects = () => {
    const updated = savedProjects.filter(p => !selectedProjects.includes(p.id));
    setSavedProjects(updated);
    setSelectedProjects([]);
    try {
      localStorage.setItem('pixel_projects', JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleSelectAll = () => {
    if (selectedProjects.length === savedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(savedProjects.map(p => p.id));
    }
  };

  const duplicateProject = (id: string) => {
    const project = savedProjects.find(p => p.id === id);
    if (!project) return;
    
    const newProject = { 
      ...project, 
      id: generateId(), 
      name: `${project.name} (Cópia)` 
    };
    
    const updated = [...savedProjects, newProject];
    setSavedProjects(updated);
    localStorage.setItem('pixel_projects', JSON.stringify(updated));
    sound.playAction();
  };

  const renameProject = (id: string) => {
    const project = savedProjects.find(p => p.id === id);
    if (!project) return;
    
    const newName = prompt("Novo nome para o projeto:", project.name);
    if (!newName || newName === project.name) return;
    
    const updated = savedProjects.map(p => p.id === id ? { ...p, name: newName } : p);
    setSavedProjects(updated);
    localStorage.setItem('pixel_projects', JSON.stringify(updated));
    sound.playClick();
  };

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!selectedProjects.includes(id)) {
        setSelectedProjects(prev => [...prev, id]);
        sound.playClick();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePointerUp = (id: string, p: ProjectConfig) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isLongPress.current) return;

    if (selectedProjects.length > 0) {
      if (selectedProjects.includes(id)) {
        setSelectedProjects(prev => prev.filter(pid => pid !== id));
      } else {
        setSelectedProjects(prev => [...prev, id]);
      }
    } else {
      sound.init();
      sound.playAction();
      onStart(p);
    }
  };

  const [exportingId, setExportingId] = useState<string | null>(null);

  const saveToGallery = async (dataUrl: string, fileName: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = dataUrl.split(',')[1];
        const folder = fileName.endsWith('.gif') ? 'DCIM/DragonArt' : 'Pictures/DragonArt';
        await Filesystem.writeFile({
          path: `${folder}/${fileName}`,
          data: base64,
          directory: Directory.ExternalStorage,
          recursive: true,
        });
        await Toast.show({ text: `✅ Salvo em ${folder}!`, duration: 'long' });
      } catch {
        const link = document.createElement('a');
        link.download = fileName; link.href = dataUrl; link.click();
      }
    } else {
      const link = document.createElement('a');
      link.download = fileName; link.href = dataUrl; link.click();
    }
  };

  const saveBlobToGallery = async (blob: Blob, fileName: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(blob);
        });
        await Filesystem.writeFile({
          path: `DCIM/DragonArt/${fileName}`,
          data: base64,
          directory: Directory.ExternalStorage,
          recursive: true,
        });
        await Toast.show({ text: `✅ GIF salvo!`, duration: 'long' });
      } catch {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderProjectToCanvas = (p: ProjectConfig, frameIdx: number, scale: number, format: 'png' | 'jpeg' = 'png'): HTMLCanvasElement | null => {
    const canvas = document.createElement('canvas');
    canvas.width = p.width * scale;
    canvas.height = p.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;

    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (!p.frames || p.frames.length === 0) return canvas;

    const frame = p.frames[frameIdx] || p.frames[0];
    frame.layers?.forEach((layer: any) => {
      if (!layer.visible) return;
      for (let y = 0; y < p.height; y++) {
        for (let x = 0; x < p.width; x++) {
          const color = layer.data[y * p.width + x];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
    });

    frame.texts?.forEach((t: any) => {
      ctx.font = `${t.italic ? 'italic ' : ''}${t.bold ? 'bold ' : ''}${t.size * scale}px ${t.font}`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = 'top';
      ctx.fillText(t.text, t.x * scale, t.y * scale);
    });

    return canvas;
  };

  const downloadProject = async (p: ProjectConfig, format: 'png' | 'jpeg' = 'png', scaleResolution?: number) => {
    let targetHeight = p.height;
    if (scaleResolution === 1) targetHeight = 1080;
    else if (scaleResolution === 4) targetHeight = 2160;
    const scale = Math.max(1, Math.floor(targetHeight / p.height));

    const canvas = renderProjectToCanvas(p, 0, scale, format);
    if (!canvas) return;

    const fileName = `${p.name}-${targetHeight}p.${format === 'jpeg' ? 'jpg' : 'png'}`;
    const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
    await saveToGallery(dataUrl, fileName);
  };

  const downloadGif = async (p: ProjectConfig, scaleResolution?: number) => {
    if (!p.frames || p.frames.length < 2) return;
    setExportingId(p.id);
    try {
      let targetHeight = p.height;
      if (scaleResolution === 1) targetHeight = 1080;
      else if (scaleResolution === 4) targetHeight = 2160;
      const scale = Math.max(1, Math.floor(targetHeight / p.height));
      const gif = new GIF({ workers: 2, quality: 10, workerScript: 'gif.worker.js', width: p.width * scale, height: p.height * scale });
      const delay = 1000 / (p.fps || 8);
      for (let i = 0; i < p.frames.length; i++) {
        const canvas = renderProjectToCanvas(p, i, scale);
        if (canvas) gif.addFrame(canvas, { delay });
      }
      gif.on('finished', async (blob: Blob) => {
        await saveBlobToGallery(blob, `${p.name}-animation.gif`);
        setExportingId(null);
      });
      gif.render();
    } catch (err) {
      console.error('GIF export failed', err);
      setExportingId(null);
    }
  };

  const handleStart = () => {
    sound.init();
    sound.playAction();
    const newConfig = { id: generateId(), name, width: isCustom ? customWidth : size, height: isCustom ? customHeight : size };
    const updatedProjects = [...savedProjects, newConfig];
    setSavedProjects(updatedProjects);
    localStorage.setItem('pixel_projects', JSON.stringify(updatedProjects));
    onStart(newConfig);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] font-sans text-[var(--text-primary)] relative transition-colors duration-300 pb-24 overflow-x-hidden">

      {/* Conteúdo com Abas */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              {/* Top Navigation */}
              <div className="bg-[var(--bg-panel)] p-4 sm:p-6 border-b border-[var(--border-subtle)] shadow-md">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 group">
                    <motion.img 
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      src="/logo.png" 
                      alt="Logo" 
                      className="w-16 h-16 md:w-20 md:h-20 object-contain image-pixelated"
                      style={{ filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.5))' }}
                    />
                    <div className="flex flex-col">
                      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: '"Press Start 2P", monospace', textShadow: '4px 4px 0 #000' }}>
                        DRAGONART
                      </h1>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">Studio v1.6.17</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                      <button onClick={() => setShowTutorials(true)} className="w-12 h-12 flex items-center justify-center bg-[var(--bg-element)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--accent-color)] rounded-xl transition-all shadow-sm">
                        <BookOpen size={24} />
                      </button>
                      <button onClick={() => setShowSettings(true)} className="w-12 h-12 flex items-center justify-center bg-[var(--bg-element)] text-[var(--text-muted)] hover:text-white hover:bg-[var(--accent-color)] rounded-xl transition-all shadow-sm">
                        <Settings size={24} />
                      </button>
                  </div>
                </div>
              </div>

              {/* Carousel */}
              <div className="w-full bg-[var(--bg-element)] border-y border-[var(--border-subtle)] py-6 overflow-hidden relative flex flex-col gap-4 mt-2">
                <div className="max-w-6xl mx-auto w-full px-6 flex items-center gap-2">
                  <Star className="text-yellow-400 animate-pulse" size={16} />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Galeria Dragon Art</h3>
                </div>
                <div className="flex animate-scroll gap-4 px-4 w-max">
                  {[...carouselImages, ...carouselImages].map((src, i) => (
                    <img key={i} src={src} alt="Art" onClick={() => setZoomedImage(src)} className="h-40 object-cover cursor-pointer border-4 border-black rounded-xl hover:scale-105 transition-transform" />
                  ))}
                </div>
              </div>

              {/* Main Grid */}
              <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 bg-[var(--bg-panel)] p-6 rounded-[32px] border border-white/5 shadow-xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400"><Plus size={20} /></div>
                    Novo Desenho
                  </h2>
                  <div className="space-y-5">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-cyan-500 outline-none font-bold" />
                    <div className="grid grid-cols-2 gap-2">
                      {[16, 32, 64, 120].map(s => (
                        <button key={s} onClick={() => { setSize(s); setIsCustom(false); }} className={`py-3 rounded-xl font-bold transition-all ${!isCustom && size === s ? 'bg-cyan-500 text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}>{s}x{s}</button>
                      ))}
                      <button
                        onClick={() => setIsCustom(true)}
                        className={`col-span-2 py-3 rounded-xl font-bold transition-all ${isCustom ? 'bg-cyan-500 text-white' : 'bg-white/5 text-[var(--text-muted)] hover:text-white'}`}
                      >
                        Tamanho Personalizado
                      </button>
                    </div>

                    <AnimatePresence>
                      {isCustom && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-4"
                        >
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">Largura (px)</label>
                              <input 
                                type="number" 
                                min="1" max="512"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))}
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none font-bold text-center"
                              />
                            </div>
                            <div className="flex items-end pb-3 font-bold text-[var(--text-muted)]">x</div>
                            <div className="flex-1">
                              <label className="block text-xs font-bold mb-1 text-[var(--text-muted)]">Altura (px)</label>
                              <input 
                                type="number" 
                                min="1" max="512"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(Math.max(1, Math.min(512, parseInt(e.target.value) || 1)))}
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-cyan-500 outline-none font-bold text-center"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={handleStart} className="w-full bg-cyan-500 hover:bg-cyan-400 p-4 rounded-2xl text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Palette size={24} /> CRIAR AGORA
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                  <h2 className="text-xl font-black flex items-center gap-3">
                    <LayersIcon className="text-cyan-400" size={24} /> Meus Projetos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedProjects.length === 0 ? (
                      <div className="col-span-full py-20 text-center opacity-30 font-bold">Nenhum projeto salvo.</div>
                    ) : (
                      savedProjects.map(p => (
                        <div key={p.id} onClick={() => onStart(p)} className="bg-[var(--bg-panel)] p-4 rounded-[28px] border border-white/5 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 shadow-lg">
                          <div className="aspect-square bg-white/5 rounded-2xl mb-3 flex items-center justify-center overflow-hidden">
                             {p.thumbnail ? <img src={p.thumbnail} className="w-full h-full object-contain image-pixelated" /> : <Palette className="opacity-20" size={40} />}
                          </div>
                          <h4 className="font-bold truncate text-sm">{p.name}</h4>
                          <p className="text-[10px] font-bold text-cyan-400/60 uppercase">{p.width}x{p.height} Pixels</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col items-center justify-center text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl mb-6 border-4 border-white/10 p-1">
                <div className="w-full h-full bg-[var(--bg-panel)] rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-4xl font-black text-white" style={{ fontFamily: '"Press Start 2P", monospace' }}>?</span>
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Meu Perfil</h2>
              <p className="text-[var(--text-muted)] font-bold mb-8">Faça login para salvar suas artes na nuvem e interagir com a comunidade.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-6 bg-[var(--bg-panel)] rounded-3xl border border-white/5 flex flex-col items-center gap-3 shadow-xl">
                  <Star className="text-yellow-400" size={32} />
                  <span className="text-xl font-bold">0</span>
                  <span className="text-xs font-black uppercase opacity-40">Curtidas</span>
                </div>
                <div className="p-6 bg-[var(--bg-panel)] rounded-3xl border border-white/5 flex flex-col items-center gap-3 shadow-xl">
                  <FileImage className="text-cyan-400" size={32} />
                  <span className="text-xl font-bold">{savedProjects.length}</span>
                  <span className="text-xs font-black uppercase opacity-40">Artes</span>
                </div>
              </div>

              <button className="mt-12 px-12 py-5 bg-cyan-500 rounded-2xl text-white font-black text-lg shadow-xl shadow-cyan-500/20 hover:scale-105 transition-transform active:scale-95">
                ENTRAR / CRIAR CONTA
              </button>
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col gap-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white" style={{ textShadow: '2px 2px 0 #000' }}>Comunidade</h2>
                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mt-1">Galeria Global de Artistas</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-[var(--bg-panel)] rounded-[32px] border border-white/5 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-white/5" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-white/10 rounded-full w-3/4" />
                      <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[48px] border border-dashed border-white/10">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6">
                  <Sun className="text-cyan-400 animate-spin-slow" size={40} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Conectando ao DragonCloud...</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-xs font-bold">A comunidade online está sendo preparada para a v2.0! Em breve você poderá compartilhar suas artes.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegação Inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        {/* Solid background at the bottom to ensure the cutout matches perfectly */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[var(--bg-app)] -z-10"></div>
        <div className="bg-gradient-to-t from-[var(--bg-app)] to-transparent pt-24 pb-6 px-4">
          <div className="max-w-md mx-auto relative pointer-events-auto mt-4">
            
            {/* Background da barra de navegação */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl h-[72px] flex items-center px-2 relative">
              
              <button 
                onClick={() => { sound.playClick(); setActiveTab('profile'); }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full rounded-l-full ${activeTab === 'profile' ? 'text-cyan-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <User size={24} className={activeTab === 'profile' ? 'fill-cyan-400/20' : ''} />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-0.5">Perfil</span>
              </button>

              {/* Espaço para o botão central elevado */}
              <div className="w-[88px] shrink-0 h-full relative flex items-center justify-center pointer-events-none">
                 <div className="absolute -top-[34px] flex flex-col items-center pointer-events-auto">
                    <button 
                      onClick={() => { sound.playClick(); setActiveTab('home'); }}
                      className={`w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all duration-300 border-[8px] shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95 z-10 ${activeTab === 'home' ? 'bg-cyan-500 text-white shadow-cyan-500/40' : 'bg-[var(--bg-element)] text-white/50 hover:text-white'}`}
                      style={{ borderColor: 'var(--bg-app)' }}
                    >
                      <Home size={32} className={activeTab === 'home' ? 'fill-white/20' : ''} />
                    </button>
                    {/* The label can be absolute to not affect button centering */}
                 </div>
                 <span className={`absolute bottom-2 text-[10px] font-black uppercase tracking-tighter ${activeTab === 'home' ? 'text-cyan-400' : 'text-white/40'}`}>
                    Início
                 </span>
              </div>

              <button 
                onClick={() => { sound.playClick(); setActiveTab('community'); }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full rounded-r-full ${activeTab === 'community' ? 'text-cyan-400' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <Users size={24} className={activeTab === 'community' ? 'fill-cyan-400/20' : ''} />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-0.5">Comunidade</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* Modais fora das abas */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setZoomedImage(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={zoomedImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl image-pixelated" />
          </motion.div>
        )}
        
        {showSettings && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={() => setShowSettings(false)}>
             <div className="bg-[var(--bg-panel)] w-full max-w-4xl p-8 rounded-[40px] border border-white/5 relative my-auto flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <h3 className="text-2xl font-black flex items-center gap-3"><Settings className="text-cyan-400" /> Configurações</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex flex-col gap-8">
                  {/* Themes */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Palette className="text-cyan-400" /> Cores de Fundo (Temas)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => changeTheme(theme.id)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${currentThemeId === theme.id ? 'border-cyan-500 bg-cyan-500/10 scale-105 shadow-md' : 'border-white/5 bg-white/5 hover:border-white/20 hover:-translate-y-1'}`}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden shadow-inner flex relative" style={{ backgroundColor: theme.colors.bgApp }}>
                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors.bgSurface }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: theme.colors.accentColor, borderColor: theme.colors.bgElement }}></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-center">{theme.name}</span>
                          {currentThemeId === theme.id && <span className="absolute top-2 right-2 text-cyan-400 bg-white/10 rounded-full p-0.5"><Check size={14} /></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Audio */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      Áudio e Sons
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="block font-bold">Efeitos Sonoros</span>
                          <span className="text-xs opacity-40 font-bold">Sons de interface</span>
                        </div>
                        <button onClick={toggleSfx} className={`w-14 h-7 rounded-full relative transition-colors ${sfxEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${sfxEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="block font-bold">Música de Fundo</span>
                          <span className="text-xs opacity-40 font-bold">Ambiente relaxante</span>
                        </div>
                        <button onClick={toggleBgm} className={`w-14 h-7 rounded-full relative transition-colors ${bgmEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${bgmEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {showTutorials && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowTutorials(false)}>
             <div className="bg-[var(--bg-panel)] w-full max-w-2xl p-8 rounded-[40px] border border-white/5 relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><BookOpen className="text-cyan-400" /> Diretrizes</h3>
                <div className="space-y-4 text-sm opacity-70 leading-relaxed font-bold">
                  <p>1. O Dragon Art é uma ferramenta profissional de pixel art.</p>
                  <p>2. Suas artes são de sua propriedade exclusiva.</p>
                  <p>3. Use gestos (2 dedos) para navegar livremente pela folha.</p>
                  <p>4. Toque com 2 dedos fora da folha para desfazer ações rapidamente.</p>
                </div>
                <button onClick={() => setShowTutorials(false)} className="mt-8 w-full p-4 bg-cyan-500 rounded-2xl font-black text-white transition-all">ENTENDI TUDO</button>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
