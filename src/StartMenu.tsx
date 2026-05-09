import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Download, Palette, Settings, HelpCircle, X, PlayCircle, BookOpen, Pencil, Layers as LayersIcon, Film, Play, Copy, Sun, Check, Star, Image as ImageIcon, FileImage, User, Users, Home, LogOut, Shield, Award, Mail, Lock, ChevronRight, Share2, RefreshCw, Share as ShareIcon, Heart, ArrowRight } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import GIF from 'gif.js';
import { sound } from './sound';
import { ProjectConfig } from './types';
import { themes, applyTheme } from './theme';
import { generateId } from './utils';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { CONFIG } from './config';

export default function StartMenu({ onStart }: { onStart: (config: ProjectConfig, isPro: boolean, userName: string) => void }) {
  const [name, setName] = useState('My Pixel Art');
  const [size, setSize] = useState(16);
  const [customWidth, setCustomWidth] = useState(16);
  const [customHeight, setCustomHeight] = useState(16);
  const [isCustom, setIsCustom] = useState(false);
  const [savedProjects, setSavedProjects] = useState<ProjectConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'community'>('home');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [profileName, setProfileName] = useState('Artista Pixel');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Supabase Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'iniciante' | 'intermediario' | 'avancado' | 'mestre'>('iniciante');
  const [selectedBadge, setSelectedBadge] = useState('leaf');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);  
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [projectGridSize, setProjectGridSize] = useState(() => {
    const saved = localStorage.getItem('pixel_grid_size');
    return saved ? parseInt(saved, 10) : 3;
  });

  useEffect(() => {
    localStorage.setItem('pixel_grid_size', projectGridSize.toString());
  }, [projectGridSize]);
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
    sound.playAction();
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
      onStart(p, isPro, profileName);
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

    if (!isPro) {
      addWatermark(canvas, session?.user?.user_metadata?.display_name || profileName);
    }

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
        if (canvas) {
          if (!isPro) {
            addWatermark(canvas, session?.user?.user_metadata?.display_name || profileName);
          }
          gif.addFrame(canvas, { delay });
        }
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



  const addWatermark = (canvas: HTMLCanvasElement, userName: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    
    const size = Math.max(14, Math.floor(canvas.height * 0.035));
    const padding = size * 0.8;
    const text = `🐉 DragonArt • ${userName}`;
    
    ctx.save();
    ctx.font = `bold ${size}px "Press Start 2P", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const metrics = ctx.measureText(text);
    const rectWidth = metrics.width + padding * 2;
    const rectHeight = size + padding;
    const x = canvas.width - rectWidth - padding;
    const y = canvas.height - rectHeight - padding;

    // Draw glassmorphism-style pill background
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#000000';
    // Rounded rect
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + rectWidth - r, y);
    ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
    ctx.lineTo(x + rectWidth, y + rectHeight - r);
    ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
    ctx.lineTo(x + r, y + rectHeight);
    ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Subtle white border
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw text with shadow
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padding, y + rectHeight / 2);
    
    ctx.restore();
    return canvas;
  };

  const shareProject = async (p: ProjectConfig, format: 'png' | 'jpeg' = 'png') => {
    console.log('Share Project triggered for:', p.name, format);
    const scale = Math.max(1, Math.floor(1080 / p.height));
    const canvas = renderProjectToCanvas(p, 0, scale, format);
    if (!canvas) {
      console.error('Failed to render project to canvas for sharing');
      return;
    }
    const userName = session?.user?.user_metadata?.display_name || profileName;
    if (!isPro) {
      addWatermark(canvas, userName);
    }
    const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : undefined);
    
    if (Capacitor.isNativePlatform()) {
      try {
        const fileName = `DragonArt_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
        const base64Data = dataUrl.split(',')[1];
        
        // Ensure the directory exists or just use a simpler path
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        
        console.log('File written for sharing:', writeResult.uri);

        await Share.share({
          title: p.name,
          text: `Confira minha arte "${p.name}" feita no DragonArt por ${userName}! 🐉✨`,
          url: writeResult.uri,
          dialogTitle: 'Compartilhar Arte'
        });
        return;
      } catch (err) {
        console.error('Native share failed:', err);
        // Fallback to simpler share if URI fails
        try {
          await Share.share({
            title: p.name,
            text: `Confira minha arte "${p.name}" feita no DragonArt por ${userName}! 🐉✨`,
            dialogTitle: 'Compartilhar Arte'
          });
        } catch (e) {}
      }
    }

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${p.name}.${format === 'jpeg' ? 'jpg' : 'png'}`, { type: `image/${format}` });
        await navigator.share({ title: `${p.name} - DragonArt`, text: `Feito com 🐉 DragonArt por ${userName}`, files: [file] });
        return;
      } catch {}
    }
  };

  const handleStart = () => {
    sound.init();
    sound.playAction();
    const newConfig = { id: generateId(), name, width: isCustom ? customWidth : size, height: isCustom ? customHeight : size };
    const updatedProjects = [...savedProjects, newConfig];
    setSavedProjects(updatedProjects);
    localStorage.setItem('pixel_projects', JSON.stringify(updatedProjects));
    onStart(newConfig, isPro, profileName);
  };

  // Supabase session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.user_metadata) {
        setProfileName(s.user.user_metadata.display_name || 'Artista Pixel');
        setExperienceLevel(s.user.user_metadata.experience_level || 'iniciante');
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('Auth State Change:', event, s ? 'Session found' : 'No session');
      setSession(s);
      if (s?.user?.user_metadata) {
        setProfileName(s.user.user_metadata.display_name || 'Artista Pixel');
        setExperienceLevel(s.user.user_metadata.experience_level || 'iniciante');
        setSelectedBadge(s.user.user_metadata.badge || 'leaf');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProStatus = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', session.user.id)
          .single();
        if (!error && data) {
          setIsPro(!!data.is_pro);
        }
      } else {
        setIsPro(false);
      }
    };
    fetchProStatus();
  }, [session]);

  const fetchCommunityPosts = async () => {
    setLoadingCommunity(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, image_url, likes, created_at,
          profiles (display_name, experience_level, is_pro),
          comments (id, content, profiles (display_name))
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) setCommunityPosts(data);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityPosts();
    }
  }, [activeTab]);

  const handlePostToCommunity = async (project: ProjectConfig) => {
    if (!session) {
      setAuthError('Você precisa estar logado para postar na comunidade.');
      setActiveTab('profile');
      return;
    }

    if (!project.thumbnail) {
      alert('Este projeto não tem uma miniatura. Abra e salve o projeto primeiro.');
      return;
    }

    setIsPosting(true);
    try {
      // 1. Converter base64 da thumbnail para Blob
      const res = await fetch(project.thumbnail);
      const blob = await res.blob();
      const fileName = `${session.user.id}/${Date.now()}.png`;

      // 2. Upload para o storage do Supabase (bucket 'arts')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arts')
        .upload(fileName, blob, { contentType: 'image/png' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('arts').getPublicUrl(fileName);

      // 3. Inserir na tabela 'posts'
      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          title: project.name,
          image_url: publicUrl
        });

      if (insertError) throw insertError;

      alert('Arte postada com sucesso na comunidade! 🐉✨');
      if (activeTab === 'community') fetchCommunityPosts();
    } catch (err: any) {
      console.error('Erro ao postar:', err);
      alert('Erro ao postar: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsPosting(false);
    }
  };

  const experienceLevels = [
    { id: 'iniciante' as const, label: 'Iniciante', icon: '🌱', desc: 'Começando no pixel art' },
    { id: 'intermediario' as const, label: 'Intermediário', icon: '⚡', desc: 'Já domino o básico' },
    { id: 'avancado' as const, label: 'Avançado', icon: '🔥', desc: 'Crio artes complexas' },
    { id: 'mestre' as const, label: 'Mestre', icon: '👑', desc: 'Artista profissional' },
  ];

  const badges = [
    { id: 'leaf', image: '/badges/free_1.png', label: 'Folha', pro: false },
    { id: 'artist', image: '/badges/free_2.png', label: 'Pedra', pro: false },
    { id: 'sparkles', image: '/badges/free_3.png', label: 'Lápis', pro: false },
    { id: 'heart', image: '/badges/free_4.png', label: 'Coração', pro: false },
    { id: 'fire', image: '/badges/free_5.png', label: 'Selo Amarelo', pro: false },
    { id: 'star', image: '/badges/pro_1.png', label: 'Cristal Pro', pro: true, glow: 'rgba(56, 189, 248, 0.8)' },
    { id: 'crown', image: '/badges/pro_2.png', label: 'Fogo Pro', pro: true, glow: 'rgba(239, 68, 68, 0.8)' },
    { id: 'diamond', image: '/badges/pro_3.png', label: 'Cósmico Pro', pro: true, glow: 'rgba(168, 85, 247, 0.8)' },
    { id: 'dragon', image: '/badges/pro_4.png', label: 'Game Pro', pro: true, glow: 'rgba(34, 197, 94, 0.8)' },
    { id: 'verified', image: '/badges/pro_5.png', label: 'Dourado Pro', pro: true, glow: 'rgba(234, 179, 8, 0.8)' },
  ];

  const handleSignUp = async () => {
    console.log('Attempting Sign Up:', authEmail);
    setAuthLoading(true); setAuthError(null); setAuthSuccess(null);
    const { data, error } = await supabase.auth.signUp({
      email: authEmail, password: authPassword,
      options: { data: { display_name: registerName, experience_level: experienceLevel } }
    });
    setAuthLoading(false);
    if (error) { 
      console.error('Sign Up Error:', error.message);
      let errorMsg = error.message;
      if (errorMsg === 'Email signups are disabled') {
         errorMsg = 'Cadastro por e-mail desativado no Supabase. Ative em: Authentication > Providers > Email.';
      } else if (errorMsg === 'User already registered') {
         errorMsg = 'Este e-mail já está cadastrado.';
      } else if (errorMsg === 'Password should be at least 6 characters') {
         errorMsg = 'A senha deve ter no mínimo 6 caracteres.';
      }
      setAuthError(errorMsg); 
      return; 
    }
    console.log('Sign Up Success:', data);
    if (data.session) {
      setAuthSuccess('Conta criada com sucesso!');
    } else {
      setAuthSuccess('Conta criada! Verifique sua caixa de entrada (e-mail) para confirmar a conta antes de entrar.');
      setAuthMode('login');
    }
  };

  const handleSignIn = async () => {
    console.log('Attempting Sign In:', authEmail);
    setAuthLoading(true); setAuthError(null); setAuthSuccess(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    setAuthLoading(false);
    if (error) { 
      console.error('Sign In Error:', error.message);
      let errorMsg = error.message;
      if (errorMsg === 'Invalid login credentials') {
         errorMsg = 'E-mail ou senha incorretos.';
      } else if (errorMsg === 'Email not confirmed') {
         errorMsg = 'E-mail não confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação.';
      }
      setAuthError(errorMsg); 
      return; 
    }
    console.log('Sign In Success:', data.session ? 'Session active' : 'No session');
    sound.playAction();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setProfileImage(null); setProfileName('Artista Pixel');
    sound.playClick();
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    sound.playAction();
    const { error } = await supabase.auth.updateUser({ 
      data: { 
        display_name: profileName, 
        experience_level: experienceLevel,
        badge: selectedBadge
      } 
    });
    if (error) setAuthError(error.message);
    else setAuthSuccess('Perfil salvo!');
    setTimeout(() => setAuthSuccess(null), 3000);
  };

  const handleChangePassword = async () => {
    sound.playAction(); setAuthError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setAuthError(error.message); return; }
    setCurrentPassword(''); setNewPassword('');
    setAuthSuccess('Senha alterada com sucesso!');
    setTimeout(() => setAuthSuccess(null), 3000);
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
                        <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest bg-[var(--accent-color)]/10 px-2 py-1 rounded-md border border-[var(--accent-color)]/20">Studio v{CONFIG.VERSION}</span>
                        {isPro && <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[9px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 animate-pulse">PRO <Check size={10} /></span>}
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
                    <div className="p-2 bg-[var(--accent-color)]/20 rounded-xl text-[var(--accent-color)]"><Plus size={20} /></div>
                    Novo Desenho
                  </h2>
                  <div className="space-y-5">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                    <div className="grid grid-cols-2 gap-2">
                      {[16, 32, 64, 120].map(s => (
                        <button key={s} onClick={() => { setSize(s); setIsCustom(false); }} className={`py-3 rounded-xl font-bold transition-all ${!isCustom && size === s ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}>{s}x{s}</button>
                      ))}
                      <button
                        onClick={() => setIsCustom(true)}
                        className={`col-span-2 py-3 rounded-xl font-bold transition-all ${isCustom ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 text-[var(--text-muted)] hover:text-white'}`}
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
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--accent-color)] outline-none font-bold text-center"
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
                                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-[var(--accent-color)] outline-none font-bold text-center"
                              />
                            </div>
                          </div>


                          {/* Dynamic Canvas Preview */}
                          <motion.div 
                            layout
                            className="flex flex-col items-center gap-3 p-4 bg-black/20 rounded-2xl border border-white/5"
                          >
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em]">
                              Pré-visualização da Folha
                            </div>
                            <div className="relative flex items-center justify-center w-full" style={{ minHeight: '120px', maxHeight: '180px' }}>
                              <motion.div
                                layout
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="border-2 border-[var(--accent-color)] shadow-lg  rounded-sm overflow-hidden"
                                style={{
                                  width: `${Math.min(160, Math.max(32, (customWidth / Math.max(customWidth, customHeight)) * 160))}px`,
                                  height: `${Math.min(160, Math.max(32, (customHeight / Math.max(customWidth, customHeight)) * 160))}px`,
                                  backgroundImage: 'conic-gradient(rgba(255,255,255,0.05) 90deg, transparent 90deg 180deg, rgba(255,255,255,0.05) 180deg 270deg, transparent 270deg)',
                                  backgroundSize: '12px 12px',
                                  backgroundColor: 'rgba(0,0,0,0.2)'
                                }}
                              >
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-[10px] font-black text-[var(--accent-color)] drop-shadow-md" style={{ fontFamily: '"Press Start 2P", monospace' }}>
                                    {customWidth}×{customHeight}
                                  </span>
                                </div>
                              </motion.div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-bold">
                              <span>{customWidth * customHeight} pixels</span>
                              <span>•</span>
                              <span>{customWidth > customHeight ? 'Paisagem' : customWidth < customHeight ? 'Retrato' : 'Quadrado'}</span>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={handleStart} className="w-full bg-[var(--accent-color)] hover:brightness-110 p-4 rounded-2xl text-white font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Palette size={24} /> CRIAR AGORA
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-black flex items-center gap-3">
                      <LayersIcon className="text-[var(--accent-color)]" size={24} /> Meus Projetos
                    </h2>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Ver:</span>
                      <input 
                        type="range" 
                        min="1" max="5" 
                        value={projectGridSize} 
                        onChange={(e) => setProjectGridSize(Number(e.target.value))}
                        className="w-24 md:w-32 accent-[var(--accent-color)]"
                      />
                    </div>
                  </div>
                  <div className={`grid gap-4 ${
                    {
                      1: "grid-cols-1",
                      2: "grid-cols-2",
                      3: "grid-cols-2 sm:grid-cols-3",
                      4: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5",
                      5: "grid-cols-4 sm:grid-cols-5 lg:grid-cols-6",
                    }[projectGridSize] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  }`}>
                    {savedProjects.length === 0 ? (
                      <div className="col-span-full py-20 text-center opacity-30 font-bold">Nenhum projeto salvo.</div>
                    ) : (
                      savedProjects.map(p => (
                        <div key={p.id} className="bg-[var(--bg-panel)] rounded-[28px] border border-white/5 hover:border-[var(--accent-color)]/50 transition-all hover:-translate-y-1 shadow-lg relative">
                          <div className="cursor-pointer" onClick={() => onStart(p, isPro, profileName)}>
                            <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden rounded-t-[28px]">
                              {p.thumbnail ? <img src={p.thumbnail} className="w-full h-full object-contain image-pixelated" /> : <Palette className="opacity-20" size={40} />}
                            </div>
                          </div>
                          <div className="p-3 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1" onClick={() => onStart(p, isPro, profileName)}>
                              <h4 className="font-bold truncate text-sm cursor-pointer">{p.name}</h4>
                              <p className="text-[10px] font-bold text-[var(--accent-color)]/60 uppercase">{p.width}x{p.height}px{p.frames && p.frames.length > 1 ? ` • ${p.frames.length}f` : ''}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={(e) => { 
                                e.stopPropagation(); 
                                console.log('Direct Share button clicked for:', p.id);
                                shareProject(p); 
                              }} className="p-2 text-white/40 hover:text-[var(--accent-color)] hover:bg-white/5 rounded-xl transition-colors" title="Compartilhar">
                                <Share2 size={16} />
                              </button>
                              <button onClick={(e) => { 
                                e.stopPropagation(); 
                                console.log('Toggle Options Menu for:', p.id, 'Current state:', openMenuId);
                                setOpenMenuId(openMenuId === p.id ? null : p.id); 
                              }} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Opções">
                                <Settings size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Dropdown Options Menu */}
                          <AnimatePresence>
                            {openMenuId === p.id && (
                              <>
                                <motion.div 
                                  key="menu-backdrop"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 z-[998]" 
                                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} 
                                />
                                <motion.div 
                                  key="menu-content"
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-1 bg-[var(--bg-panel)] rounded-2xl shadow-2xl border border-white/10 z-[999] overflow-hidden min-w-[220px]"
                                  style={{ position: 'absolute', top: '100%', right: 0 }}
                                >
                                  {/* PNG */}
                                  <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/5 flex items-center gap-2"><FileImage size={10} /> Exportar PNG</div>
                                  <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'png', 1); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Download size={14} /> Full HD (1080p)</button>
                                  <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'png', 4); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Download size={14} /> Ultra HD (4K)</button>
                                  {/* JPG */}
                                  <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/5 flex items-center gap-2"><ImageIcon size={10} /> Exportar JPG</div>
                                  <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'jpeg', 1); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Download size={14} /> Full HD (1080p)</button>
                                  <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'jpeg', 4); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Download size={14} /> Ultra HD (4K)</button>
                                  {/* GIF */}
                                  {p.frames && p.frames.length > 1 && (<>
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/5 flex items-center gap-2"><Film size={10} /> GIF Animado</div>
                                    <button onClick={(e) => { e.stopPropagation(); downloadGif(p, 1); setOpenMenuId(null); }} disabled={exportingId === p.id} className="w-full px-4 py-2 text-sm hover:bg-green-600 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"><Film size={14} /> {exportingId === p.id ? 'Exportando...' : 'Full HD (1080p)'}</button>
                                    <button onClick={(e) => { e.stopPropagation(); downloadGif(p, 4); setOpenMenuId(null); }} disabled={exportingId === p.id} className="w-full px-4 py-2 text-sm hover:bg-green-600 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"><Film size={14} /> Ultra HD (4K)</button>
                                  </>)}
                                  {/* Share */}
                                  <div className="h-px bg-white/10 mx-2" />
                                  <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/5 flex items-center gap-2"><Share2 size={10} /> Compartilhar</div>
                                  <button onClick={(e) => { e.stopPropagation(); shareProject(p, 'png'); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"><FileImage size={14} /> PNG</button>
                                  <button onClick={(e) => { e.stopPropagation(); shareProject(p, 'jpeg'); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"><ImageIcon size={14} /> JPG</button>
                                  {/* Project actions */}
                                  <div className="h-px bg-white/10 mx-2" />
                                  <button onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Copy size={14} /> Duplicar</button>
                                  <button onClick={(e) => { e.stopPropagation(); renameProject(p.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Pencil size={14} /> Renomear</button>
                                  <button onClick={(e) => { e.stopPropagation(); deleteProject(p.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2 transition-colors"><Trash2 size={14} /> Excluir</button>
                                  <div className="h-px bg-white/10 mx-2" />
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handlePostToCommunity(p); setOpenMenuId(null); }} 
                                    disabled={isPosting}
                                    className="w-full px-4 py-2 text-sm text-green-400 hover:bg-green-500 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                                  >
                                    <ShareIcon size={14} /> {isPosting ? 'Postando...' : 'Postar na Comunidade'}
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
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
              className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col items-center justify-start overflow-y-auto"
            >
              {/* Auth Messages */}
              <AnimatePresence>
                {authError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md mb-4 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold text-center">
                    {authError}
                  </motion.div>
                )}
                {authSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md mb-4 p-4 bg-green-500/15 border border-green-500/30 rounded-2xl text-green-400 text-sm font-bold text-center">
                    {authSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {!session ? (
                /* ========== NOT LOGGED IN: Login / Register ========== */
                <div className="w-full max-w-md flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[var(--accent-color)] to-[var(--bg-panel)] rounded-[28px] flex items-center justify-center shadow-2xl border-4 border-white/10 mb-6">
                    <User size={48} className="text-white/40" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1">
                    {authMode === 'login' ? 'Entrar na Conta' : 'Criar Conta'}
                  </h2>
                  <p className="text-[var(--text-muted)] text-sm font-bold mb-8">
                    {authMode === 'login' ? 'Acesse seu perfil de artista' : 'Cadastre-se e mostre suas artes'}
                  </p>

                  <div className="w-full space-y-4">
                    {/* Register-only: Name */}
                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest pl-2">Nome de Artista</label>
                        <div className="relative">
                          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                          <input type="text" placeholder="Seu nome criativo" value={registerName} onChange={e => setRegisterName(e.target.value)}
                            className="w-full bg-[var(--bg-panel)] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest pl-2">E-mail</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type="email" placeholder="seu@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                          className="w-full bg-[var(--bg-panel)] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-2 tracking-widest pl-2">Senha</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type="password" placeholder="Mínimo 6 caracteres" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                          className="w-full bg-[var(--bg-panel)] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                      </div>
                    </div>

                    {/* Register-only: Experience Level */}
                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-3 tracking-widest pl-2">Seu Nível</label>
                        <div className="grid grid-cols-2 gap-3">
                          {experienceLevels.map(lvl => (
                            <button key={lvl.id} onClick={() => setExperienceLevel(lvl.id)}
                              className={`p-4 rounded-2xl border-2 transition-all text-left ${experienceLevel === lvl.id ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 scale-[1.02]' : 'border-white/5 bg-[var(--bg-panel)] hover:border-white/20'}`}>
                              <span className="text-2xl">{lvl.icon}</span>
                              <div className="font-black text-sm mt-1">{lvl.label}</div>
                              <div className="text-[10px] opacity-50 font-bold">{lvl.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={authMode === 'login' ? handleSignIn : handleSignUp} disabled={authLoading || !authEmail || !authPassword}
                      className="w-full p-5 bg-[var(--accent-color)] rounded-2xl text-white font-black text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {authLoading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>{authMode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'} <ChevronRight size={20} /></>
                      )}
                    </button>

                    <button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(null); }}
                      className="w-full text-center text-sm font-bold text-[var(--text-muted)] hover:text-white transition-colors py-2">
                      {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                    </button>
                  </div>
                </div>
              ) : (
                /* ========== LOGGED IN: Dashboard ========== */
                <div className="w-full flex flex-col md:flex-row gap-8 items-start justify-center">
                  {/* Left Column: Avatar & Info */}
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="relative group cursor-pointer mb-4" onClick={() => document.getElementById('profile-upload')?.click()}>
                      <div className="w-36 h-36 bg-gradient-to-br from-[var(--accent-color)] to-[var(--bg-panel)] rounded-[36px] flex items-center justify-center shadow-2xl border-4 border-white/10 p-1 transition-transform group-hover:scale-105">
                        <div className="w-full h-full bg-[var(--bg-panel)] rounded-[28px] overflow-hidden flex items-center justify-center relative">
                          {profileImage ? (
                            <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl">{experienceLevels.find(l => l.id === experienceLevel)?.icon || '🌱'}</span>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon size={28} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                      <div className="absolute -bottom-2 -right-2 bg-[var(--accent-color)] p-2 rounded-xl shadow-lg">
                        <Pencil size={14} className="text-white" />
                      </div>
                      {/* Badge Seal on Avatar */}
                      <div className="absolute top-0 right-0 bg-black/80 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/20 z-10 translate-x-2 -translate-y-2 overflow-visible"
                           style={{ boxShadow: badges.find(b => b.id === selectedBadge)?.glow ? `0 0 15px ${badges.find(b => b.id === selectedBadge)?.glow}` : '0 4px 6px rgba(0,0,0,0.3)' }}>
                        <div className="absolute inset-0 rounded-full" style={{ background: badges.find(b => b.id === selectedBadge)?.glow ? `radial-gradient(circle, ${badges.find(b => b.id === selectedBadge)?.glow} 0%, transparent 70%)` : 'none', opacity: 0.6 }}></div>
                        <img src={badges.find(b => b.id === selectedBadge)?.image || '/badges/free_1.png'} className="w-10 h-10 object-contain relative z-10" alt="Selo" style={{ filter: badges.find(b => b.id === selectedBadge)?.glow ? `drop-shadow(0 0 5px ${badges.find(b => b.id === selectedBadge)?.glow})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-3">
                      <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                        className="bg-transparent border-none text-center text-2xl font-black text-white outline-none focus:bg-[var(--bg-panel)] rounded-2xl p-2 transition-colors" />
                      <div className="relative flex items-center justify-center w-10 h-10">
                        <div className="absolute inset-0 scale-150 blur-md rounded-full pointer-events-none" style={{ background: badges.find(b => b.id === selectedBadge)?.glow ? `radial-gradient(circle, ${badges.find(b => b.id === selectedBadge)?.glow} 0%, transparent 70%)` : 'none', opacity: 0.7 }}></div>
                        <img src={badges.find(b => b.id === selectedBadge)?.image} className="w-full h-full object-contain relative z-10" alt="Selo" style={{ filter: badges.find(b => b.id === selectedBadge)?.glow ? `drop-shadow(0 0 8px ${badges.find(b => b.id === selectedBadge)?.glow})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                      </div>
                    </div>

                    {/* Experience Badge */}
                    <div className="mt-1 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                      style={{ background: 'var(--accent-color)', color: 'white', opacity: 0.9 }}>
                      <Award size={14} />
                      {experienceLevels.find(l => l.id === experienceLevel)?.label || 'Iniciante'}
                    </div>

                    {/* Email display */}
                    <p className="text-xs text-[var(--text-muted)] font-bold mt-3 flex items-center gap-1">
                      <Mail size={12} /> {session.user.email}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 w-full mt-5">
                      <div className="p-3 bg-[var(--bg-panel)] rounded-2xl border border-white/5 flex flex-col items-center gap-1 shadow-md">
                        <Star className="text-yellow-400" size={20} />
                        <span className="text-lg font-black leading-none">0</span>
                        <span className="text-[9px] font-bold uppercase opacity-50">Curtidas</span>
                      </div>
                      <div className="p-3 bg-[var(--bg-panel)] rounded-2xl border border-white/5 flex flex-col items-center gap-1 shadow-md">
                        <FileImage className="text-[var(--accent-color)]" size={20} />
                        <span className="text-lg font-black leading-none">{savedProjects.length}</span>
                        <span className="text-[9px] font-bold uppercase opacity-50">Artes</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Security & Actions */}
                  <div className="w-full md:w-2/3 flex flex-col gap-5">
                    {/* Badge Selection Card */}
                    <div className="bg-[var(--bg-panel)] rounded-[28px] p-6 border border-white/5 shadow-xl">
                      <h3 className="text-lg font-black mb-5 flex items-center gap-3">
                        <div className="p-2 bg-[var(--accent-color)]/20 rounded-xl"><Award size={18} className="text-[var(--accent-color)]" /></div>
                        Seus Selos
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest pl-1">Selos Gratuitos</div>
                          <div className="grid grid-cols-5 gap-3">
                            {badges.filter(b => !b.pro).map(badge => {
                              const isLocked = badge.pro && !isPro;
                              return (
                                <button
                                  key={badge.id}
                                  disabled={isLocked}
                                  onClick={() => {
                                    setSelectedBadge(badge.id);
                                    sound.playClick();
                                  }}
                                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all relative ${
                                    selectedBadge === badge.id 
                                      ? 'bg-[var(--accent-color)] scale-110 shadow-lg border-2 border-white/20' 
                                      : 'bg-white/5 hover:bg-white/10 grayscale-[0.5] opacity-50'
                                  } ${isLocked ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}`}
                                  title={badge.label}
                                >
                                  <div className="absolute inset-0 w-full h-full rounded-2xl blur-md scale-110 pointer-events-none transition-opacity" style={{ background: badge.glow ? `radial-gradient(circle, ${badge.glow} 0%, transparent 80%)` : 'none', opacity: selectedBadge === badge.id ? 0.8 : 0 }}></div>
                                  <img src={badge.image} className="w-10 h-10 object-contain relative z-10" alt={badge.label} style={{ filter: badge.glow && selectedBadge === badge.id ? `drop-shadow(0 0 5px ${badge.glow})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                  {isLocked && <Lock size={10} className="absolute bottom-1 right-1 text-white/50" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest pl-1">Selos PRO</div>
                          <div className="grid grid-cols-5 gap-3">
                            {badges.filter(b => b.pro).map(badge => {
                              const isLocked = badge.pro && !isPro;
                              return (
                                <button
                                  key={badge.id}
                                  disabled={isLocked}
                                  onClick={() => {
                                    setSelectedBadge(badge.id);
                                    sound.playClick();
                                  }}
                                  className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all relative ${
                                    selectedBadge === badge.id 
                                      ? 'bg-[var(--accent-color)] scale-110 shadow-lg border-2 border-white/20' 
                                      : 'bg-white/5 hover:bg-white/10 grayscale-[0.5] opacity-50'
                                  } ${isLocked ? 'cursor-not-allowed opacity-20' : 'cursor-pointer'}`}
                                  title={badge.label}
                                >
                                  <div className="absolute inset-0 w-full h-full rounded-2xl blur-md scale-110 pointer-events-none transition-opacity" style={{ background: badge.glow ? `radial-gradient(circle, ${badge.glow} 0%, transparent 80%)` : 'none', opacity: selectedBadge === badge.id ? 0.8 : 0 }}></div>
                                  <img src={badge.image} className="w-10 h-10 object-contain relative z-10" alt={badge.label} style={{ filter: badge.glow && selectedBadge === badge.id ? `drop-shadow(0 0 5px ${badge.glow})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                  {isLocked && <Lock size={10} className="absolute bottom-1 right-1 text-white/50" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-[var(--bg-panel)] rounded-[28px] p-6 border border-white/5 shadow-xl">
                      <h3 className="text-lg font-black mb-5 flex items-center gap-3">
                        <div className="p-2 bg-[var(--accent-color)]/20 rounded-xl"><Shield size={18} className="text-[var(--accent-color)]" /></div>
                        Segurança
                      </h3>
                      <div className="space-y-3">
                        <input type="password" placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                        <input type="password" placeholder="Senha atual (confirmação)" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                        <button onClick={handleChangePassword} disabled={!newPassword || !currentPassword}
                          className="w-full p-4 rounded-2xl font-black border-2 border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          ATUALIZAR SENHA
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                      {!session?.user?.user_metadata?.is_pro && (
                        <button 
                          onClick={() => window.open(CONFIG.STRIPE_PRO_LINK, '_blank')}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:brightness-110 p-5 rounded-[20px] text-black font-black shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all mb-2"
                        >
                          <Star size={24} className="fill-black" /> SEJA DRAGON ART PRO
                        </button>
                      )}
                      <div className="flex gap-3">
                        <button onClick={handleSaveProfile}
                          className="flex-1 bg-[var(--accent-color)] hover:brightness-110 p-4 rounded-[20px] text-white font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                          <Check size={20} /> SALVAR
                        </button>
                        <button onClick={handleSignOut}
                          className="p-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-[20px] font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                          title="Sair da Conta">
                          <LogOut size={20} /> SAIR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                  <p className="text-xs font-bold text-[var(--accent-color)] uppercase tracking-widest mt-1">Galeria Global de Artistas</p>
                </div>
                <button 
                  onClick={fetchCommunityPosts}
                  disabled={loadingCommunity}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-[var(--accent-color)] transition-all active:rotate-180"
                >
                  <RefreshCw size={20} className={loadingCommunity ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingCommunity && communityPosts.length === 0 ? (
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
              ) : communityPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[48px] border border-dashed border-white/10">
                  <div className="w-20 h-20 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center mb-6">
                    <Sun size={40} className="text-[var(--accent-color)]" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Ainda não há artes...</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs font-bold">Seja o primeiro a postar na comunidade v1.7.1!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Banner redirecionamento WebDashboard */}
                  <div onClick={() => window.open(`${CONFIG.WEB_URL}/dashboard`, '_blank')} className="bg-gradient-to-br from-[var(--accent-color)] to-emerald-600 rounded-[32px] overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] transition-transform shadow-lg group relative border border-white/20">
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-black/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Star size={32} className="text-yellow-300" />
                      </div>
                      <h3 className="font-black text-black uppercase tracking-widest text-lg mb-2">Painel Web</h3>
                      <p className="text-black/80 font-bold text-xs">Curta, comente e veja selos na nossa rede social!</p>
                    </div>
                    <div className="bg-black/20 p-4 text-center font-black text-white text-xs tracking-widest flex justify-center items-center gap-2">
                      ACESSAR REDE SOCIAL <ArrowRight size={14} />
                    </div>
                  </div>

                  {/* Banner do Discord */}
                  <div onClick={() => window.open('https://discord.gg/gFvckFY5', '_blank')} className="bg-gradient-to-br from-[#5865F2] to-[#4752C4] rounded-[32px] overflow-hidden flex flex-col cursor-pointer hover:scale-[1.02] transition-transform shadow-lg group relative border border-white/20">
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users size={32} className="text-white" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-widest text-lg mb-2">Discord</h3>
                      <p className="text-white/80 font-bold text-xs">Participe do nosso servidor oficial do Dragon Art!</p>
                    </div>
                    <div className="bg-black/20 p-4 text-center font-black text-white text-xs tracking-widest flex justify-center items-center gap-2">
                      ENTRAR NO DISCORD <ArrowRight size={14} />
                    </div>
                  </div>
                  {communityPosts.map((post) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={post.id} 
                      className="bg-[var(--bg-panel)] rounded-[32px] border border-white/5 overflow-hidden shadow-lg group"
                    >
                      <div className="aspect-square bg-black/20 flex items-center justify-center p-4 relative">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="max-w-full max-h-full object-contain image-pixelated group-hover:scale-110 transition-transform" 
                        />
                      </div>
                      <div className="p-4 border-t border-white/5">
                        <h4 className="font-bold text-sm truncate">{post.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-xs text-[var(--text-muted)] truncate max-w-[80px]">
                              @{post.profiles?.display_name || 'Anônimo'}
                            </span>
                            {post.profiles?.is_pro && <Star size={10} className="text-green-400 fill-green-400" />}
                          </div>
                          <div className="flex items-center gap-1 text-[var(--text-muted)]">
                            <Heart size={14} />
                            <span className="text-[10px] font-bold">{post.likes || 0}</span>
                          </div>
                        </div>

                        {/* Comentários na visualização do App */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                            {post.comments.slice(0, 3).map((comment: any) => (
                              <div key={comment.id} className="bg-black/20 rounded-lg p-2 text-xs">
                                <span className="font-bold text-[var(--accent-color)] mr-1">
                                  {comment.profiles?.display_name || 'Usuário'}:
                                </span>
                                <span className="text-gray-300">{comment.content}</span>
                              </div>
                            ))}
                            {post.comments.length > 3 && (
                              <div className="text-[9px] text-gray-500 font-bold text-center mt-1 cursor-pointer hover:text-white" onClick={() => window.open(`${CONFIG.WEB_URL}/dashboard`, '_blank')}>
                                Ver mais {post.comments.length - 3} comentários na Web...
                              </div>
                            )}
                          </div>
                        )}
                        
                        {(!post.comments || post.comments.length === 0) && (
                          <div className="mt-3 pt-3 border-t border-white/5 text-center">
                            <span className="text-[9px] text-gray-500 font-bold cursor-pointer hover:text-[var(--accent-color)]" onClick={() => window.open(`${CONFIG.WEB_URL}/dashboard`, '_blank')}>
                              Seja o primeiro a comentar na Web!
                            </span>
                          </div>
                        )}
                        
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full rounded-l-full ${activeTab === 'profile' ? 'text-[var(--accent-color)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <User size={24} className={activeTab === 'profile' ? 'fill-[var(--accent-color)]/20' : ''} />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-0.5">Perfil</span>
              </button>

              {/* Espaço para o botão central elevado */}
              <div className="w-[88px] shrink-0 h-full relative flex items-center justify-center pointer-events-none">
                 <div className="absolute -top-[34px] flex flex-col items-center pointer-events-auto">
                    <button 
                      onClick={() => { sound.playClick(); setActiveTab('home'); }}
                      className={`w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all duration-300 border-[8px] shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95 z-10 ${activeTab === 'home' ? 'bg-[var(--accent-color)] text-white ' : 'bg-[var(--bg-element)] text-white/50 hover:text-white'}`}
                      style={{ borderColor: 'var(--bg-app)' }}
                    >
                      <Home size={32} className={activeTab === 'home' ? 'fill-white/20' : ''} />
                    </button>
                    {/* The label can be absolute to not affect button centering */}
                 </div>
                 <span className={`absolute bottom-2 text-[10px] font-black uppercase tracking-tighter ${activeTab === 'home' ? 'text-[var(--accent-color)]' : 'text-white/40'}`}>
                    Início
                 </span>
              </div>

              <button 
                onClick={() => { sound.playClick(); setActiveTab('community'); }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full rounded-r-full ${activeTab === 'community' ? 'text-[var(--accent-color)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <Users size={24} className={activeTab === 'community' ? 'fill-[var(--accent-color)]/20' : ''} />
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
                  <h3 className="text-2xl font-black flex items-center gap-3"><Settings className="text-[var(--accent-color)]" /> Configurações</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex flex-col gap-8">
                  {/* Themes */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Palette className="text-[var(--accent-color)]" /> Cores de Fundo (Temas)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                      {themes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => changeTheme(theme.id)}
                          className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${currentThemeId === theme.id ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 scale-105 shadow-md' : 'border-white/5 bg-white/5 hover:border-white/20 hover:-translate-y-1'}`}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden shadow-inner flex relative" style={{ backgroundColor: theme.colors.bgApp }}>
                            <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors.bgSurface }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: theme.colors.accentColor, borderColor: theme.colors.bgElement }}></div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-center">{theme.name}</span>
                          {currentThemeId === theme.id && <span className="absolute top-2 right-2 text-[var(--accent-color)] bg-white/10 rounded-full p-0.5"><Check size={14} /></span>}
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
                        <button onClick={toggleSfx} className={`w-14 h-7 rounded-full relative transition-colors ${sfxEnabled ? 'bg-[var(--accent-color)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${sfxEnabled ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="block font-bold">Música de Fundo</span>
                          <span className="text-xs opacity-40 font-bold">Ambiente relaxante</span>
                        </div>
                        <button onClick={toggleBgm} className={`w-14 h-7 rounded-full relative transition-colors ${bgmEnabled ? 'bg-[var(--accent-color)]' : 'bg-white/10'}`}>
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
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><BookOpen className="text-[var(--accent-color)]" /> Diretrizes</h3>
                <div className="space-y-4 text-sm opacity-70 leading-relaxed font-bold">
                  <p>1. O Dragon Art é uma ferramenta profissional de pixel art.</p>
                  <p>2. Suas artes são de sua propriedade exclusiva.</p>
                  <p>3. Use gestos (2 dedos) para navegar livremente pela folha.</p>
                  <p>4. Toque com 2 dedos fora da folha para desfazer ações rapidamente.</p>
                </div>
                <button onClick={() => setShowTutorials(false)} className="mt-8 w-full p-4 bg-[var(--accent-color)] rounded-2xl font-black text-white transition-all">ENTENDI TUDO</button>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
