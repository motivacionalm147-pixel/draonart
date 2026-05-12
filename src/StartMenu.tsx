import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Download, Palette, Settings, HelpCircle, X, PlayCircle, BookOpen, Pencil, Layers as LayersIcon, Film, Play, Copy, Sun, Check, Star, Image as ImageIcon, FileImage, User, Users, Home, LogOut, Shield, Award, Mail, Lock, Eye, EyeOff, ChevronRight, Share2, RefreshCw, Share as ShareIcon, Heart, ArrowRight, Send, MessageSquare, Maximize2, UserPlus, ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Toast } from '@capacitor/toast';
import GIF from 'gif.js';
import { sound } from './sound';
import { ProjectConfig } from './types';
import { themes, applyTheme, FREE_THEME_IDS } from './theme';
import type { Theme } from './theme';
import { generateId, getAvatarFallback } from './utils';
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
  const [showProModal, setShowProModal] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
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

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishProject, setPublishProject] = useState<ProjectConfig | null>(null);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDescription, setPublishDescription] = useState('');
  const [publishIsPrivate, setPublishIsPrivate] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // User Profile Modal State
  const [viewingUser, setViewingUser] = useState<any | null>(null);
  const [viewingUserPosts, setViewingUserPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [profileModalTab, setProfileModalTab] = useState<'posts'|'followers'>('posts');
  const [viewingUserFollowers, setViewingUserFollowers] = useState<any[]>([]);

  // Zoomed Post Lightbox
  const [zoomedPost, setZoomedPost] = useState<any | null>(null);

  // Current User Stats
  const [myFollowersCount, setMyFollowersCount] = useState(0);
  const [myFollowingCount, setMyFollowingCount] = useState(0);
  const [myTotalLikes, setMyTotalLikes] = useState(0);


  const defaultShortcuts: Record<string, string> = {
    pencil: 'p', eraser: 'e', fill: 'g', picker: 'i',
    shape: 'u', select: 'm', hand: 'h', text: 't',
    undo: 'z', redo: 'y', grid: 'k', play: ' ',
    clear: 'delete', sound: 's',
    zoomIn: '=', zoomOut: '-', resetView: '0',
    save: 'ctrl+s', newFrame: 'n',
  };

  const shortcutLabels: Record<string, string> = {
    pencil: 'LÃ¡pis', eraser: 'Borracha', fill: 'Balde', picker: 'Conta-gotas',
    shape: 'Formas', select: 'SeleÃ§Ã£o', hand: 'Mover (MÃ£o)', text: 'Texto',
    undo: 'Desfazer (Ctrl+)', redo: 'Refazer (Ctrl+)', grid: 'Malha', play: 'AnimaÃ§Ã£o',
    clear: 'Limpar Camada', sound: 'Mutar/Desmutar Som',
    zoomIn: 'Zoom +', zoomOut: 'Zoom -', resetView: 'Resetar Zoom',
    save: 'Salvar Projeto', newFrame: 'Novo Frame',
  };

  const shortcutCategories = [
    { name: 'Ferramentas', keys: ['pencil', 'eraser', 'fill', 'picker', 'shape', 'select', 'hand', 'text'] },
    { name: 'EdiÃ§Ã£o', keys: ['undo', 'redo', 'clear', 'newFrame'] },
    { name: 'VisualizaÃ§Ã£o', keys: ['grid', 'play', 'zoomIn', 'zoomOut', 'resetView'] },
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
  
  // Community Interaction State
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'auth' | 'avatar' | 'name' | null>(null);

  const avatars = Array.from({ length: 15 }, (_, i) => `/avatars/avatar_${i + 1}.jpg`);
  const proAvatars = [
    '/avatars/pro/0163e8951593014cb6f914cc9a4b9997.gif',
    '/avatars/pro/0339983a96ad03b9eac740cc2e91f8e4.gif',
    '/avatars/pro/1bf09baf6c26978e2bc031a5ff18d262.gif',
    '/avatars/pro/555076dfc489b51a130e7ebc28900f2f.gif',
    '/avatars/pro/56a2d535b69a257a6f1ca28c428d1ad6.gif',
    '/avatars/pro/6c62876ccccef57dd0377eb5f9d1af07.gif',
    '/avatars/pro/7a1d6f55ba4cfc1065e8095d52e4cc56.gif',
    '/avatars/pro/8c07255e857006529ff2afb00ace29cc.gif',
    '/avatars/pro/91a5fc1eba717eb1ca8652575b2691bf.gif',
    '/avatars/pro/f23c314c7bb9ce67cd1b4be16cd7b316.gif'
  ];

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
    const themeConfig = themes.find(t => t.id === themeId);
    if (!themeConfig) return;

    // Free themes or PRO users apply directly
    if (FREE_THEME_IDS.has(themeId) || isPro) {
      setCurrentThemeId(themeId);
      localStorage.setItem('pixel_theme', themeId);
      applyTheme(themeConfig);
      return;
    }

    // Paid theme for non-PRO user → show preview
    applyTheme(themeConfig); // temporarily apply
    setPreviewTheme(themeConfig);
    setShowSettings(false);
  };

  const cancelThemePreview = () => {
    // Revert to saved theme
    const savedId = currentThemeId;
    const savedTheme = themes.find(t => t.id === savedId);
    if (savedTheme) applyTheme(savedTheme);
    setPreviewTheme(null);
    setShowSettings(true);
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
      name: `${project.name} (CÃ³pia)` 
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
        await Toast.show({ text: `âœ… Salvo em ${folder}!`, duration: 'long' });
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
        await Toast.show({ text: `âœ… GIF salvo!`, duration: 'long' });
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
    
    const size = Math.max(9, Math.floor(canvas.height * 0.018));
    const padding = size * 0.5;
    const text = `DragonArt \u00b7 ${userName}`;
    
    ctx.save();
    ctx.font = `bold ${size}px Inter, -apple-system, sans-serif`;
    const metrics = ctx.measureText(text);
    const rectWidth = metrics.width + padding * 2;
    const rectHeight = size + padding;
    const margin = size * 0.4;
    const x = canvas.width - rectWidth - margin;
    const y = canvas.height - rectHeight - margin;

    const r = Math.max(4, size * 0.4);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
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

    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.globalAlpha = 0.55;
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
          text: `Confira minha arte "${p.name}" feita no DragonArt por ${userName}! ðŸ‰âœ¨`,
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
            text: `Confira minha arte "${p.name}" feita no DragonArt por ${userName}! ðŸ‰âœ¨`,
            dialogTitle: 'Compartilhar Arte'
          });
        } catch (e) {}
      }
    }

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${p.name}.${format === 'jpeg' ? 'jpg' : 'png'}`, { type: `image/${format}` });
        await navigator.share({ title: `${p.name} - DragonArt`, text: `Feito com ðŸ‰ DragonArt por ${userName}`, files: [file] });
        return;
      } catch {}
    }
  };

  const handleStart = () => {
    sound.init();
    sound.playAction();
    if (!isPro && savedProjects.length >= 10) {
      setShowProModal(true);
      return;
    }
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
        if (s.user.user_metadata.display_name) setProfileName(s.user.user_metadata.display_name);
        if (s.user.user_metadata.experience_level) setExperienceLevel(s.user.user_metadata.experience_level);
        if (s.user.user_metadata.badge) setSelectedBadge(s.user.user_metadata.badge);
        
        const metaAvatar = s.user.user_metadata.avatar_url;
        if (metaAvatar) setProfileImage(metaAvatar);
      }
      
      // Auto-trigger onboarding if metadata is incomplete or session is missing
      if (!s) {
        setOnboardingStep('welcome');
      } else if (!s.user.user_metadata?.display_name || !s.user.user_metadata?.avatar_url) {
        setOnboardingStep('avatar');
      } else {
        setOnboardingStep(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProStatus = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_pro, avatar_url, display_name, badge')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          setIsPro(!!data.is_pro);
          
          const metaName = session.user.user_metadata?.display_name;
          const metaAvatar = session.user.user_metadata?.avatar_url;
          const metaBadge = session.user.user_metadata?.badge;

          // Source of Truth: Metadata (User's last action) > Database > Current State
          const finalName = metaName || data.display_name || profileName;
          const finalAvatar = metaAvatar || data.avatar_url || profileImage;
          const finalBadge = metaBadge || data.badge || selectedBadge;

          if (finalName) setProfileName(finalName);
          if (finalAvatar) setProfileImage(finalAvatar);
          if (finalBadge) setSelectedBadge(finalBadge);

          // If DB is missing anything that we have in Meta/State, update it once
          if (!data.display_name || !data.badge || (!data.avatar_url && finalAvatar)) {
            await supabase.from('profiles').upsert({
              id: session.user.id,
              display_name: finalName,
              avatar_url: finalAvatar,
              badge: finalBadge,
              is_pro: !!data.is_pro,
              updated_at: new Date()
            });
          }
        } else if (!data) {
          // Profile doesn't exist yet, create it
          await supabase.from('profiles').upsert({
            id: session.user.id,
            display_name: profileName,
            avatar_url: profileImage,
            badge: selectedBadge,
            is_pro: false,
            updated_at: new Date()
          });
        }
      } else {
        setIsPro(false);
      }
    };
    fetchProStatus();
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchMyStats = async () => {
      const { count: followers } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', session.user.id);
      const { count: following } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', session.user.id);
      
      const { data: posts } = await supabase.from('posts').select('likes').eq('user_id', session.user.id);
      const totalLikes = posts?.reduce((acc, p) => acc + (p.likes || 0), 0) || 0;
      
      setMyFollowersCount(followers || 0);
      setMyFollowingCount(following || 0);
      setMyTotalLikes(totalLikes);
    };

    fetchMyStats();

    // Notificacao de seguidor em tempo real
    const channel = supabase
      .channel('followers_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'followers', filter: `following_id=eq.${session.user.id}` }, payload => {
        Toast.show({ text: 'ðŸŽ‰ Novo seguidor! AlguÃ©m comeÃ§ou a acompanhar suas artes.' }).catch(() => {});
        setMyFollowersCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Realtime Profile Updates for Community
  useEffect(() => {
    if (!session) return;

    const profileChannel = supabase
      .channel('public:profiles_updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles' 
      }, payload => {
        const updatedProfile = payload.new;
        // Update community posts in real-time when any user updates their profile
        setCommunityPosts(currentPosts => 
          currentPosts.map(post => 
            post.user_id === updatedProfile.id 
              ? { ...post, profiles: { ...post.profiles, ...updatedProfile } } 
              : post
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [session]);

  const fetchCommunityPosts = async () => {
    setLoadingCommunity(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, title, description, is_private, image_url, likes, created_at, user_id,
          profiles (id, display_name, experience_level, is_pro, badge, avatar_url),
          comments (id, content, profiles (display_name))
        `)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (!error && data) setCommunityPosts(data);
    } catch (err) {
      console.error('Erro ao buscar posts:', err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  const handleTogglePostPrivacy = async (postId: string, currentIsPrivate: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_private: !currentIsPrivate })
        .eq('id', postId);
      
      if (error) throw error;
      
      // Update local state optimistically or re-fetch
      setCommunityPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, is_private: !currentIsPrivate } : p
      ));
      
      sound.playAction();
    } catch (err) {
      console.error('Erro ao mudar privacidade:', err);
      alert('Erro ao alterar a privacidade do post.');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session?.user) {
      alert('VocÃª precisa estar logado para curtir.');
      return;
    }
    
    const postIndex = communityPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = communityPosts[postIndex];
    
    try {
      // Tenta inserir a curtida
      const { error } = await supabase.from('post_likes').insert({
        post_id: postId,
        user_id: session.user.id
      });
      
      if (!error) {
        // Se sucesso (novo like)
        const updatedPosts = [...communityPosts];
        updatedPosts[postIndex] = { ...post, likes: (post.likes || 0) + 1 };
        setCommunityPosts(updatedPosts);
        await supabase.from('posts').update({ likes: (post.likes || 0) + 1 }).eq('id', postId);
      } else {
        // Se deu erro, possivelmente jÃ¡ curtiu, entÃ£o descurte
        const { error: deleteError } = await supabase.from('post_likes')
          .delete()
          .match({ post_id: postId, user_id: session.user.id });
          
        if (!deleteError) {
          const updatedPosts = [...communityPosts];
          updatedPosts[postIndex] = { ...post, likes: Math.max(0, (post.likes || 1) - 1) };
          setCommunityPosts(updatedPosts);
          await supabase.from('posts').update({ likes: Math.max(0, (post.likes || 1) - 1) }).eq('id', postId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!session?.user) {
      alert('VocÃª precisa estar logado para comentar.');
      return;
    }
    if (!commentText.trim()) return;
    
    try {
      const { data, error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: session.user.id,
        content: commentText.trim()
      }).select('id, content, profiles (display_name)').single();
      
      if (!error && data) {
        const updatedPosts = [...communityPosts];
        const postIndex = updatedPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          updatedPosts[postIndex] = {
            ...updatedPosts[postIndex],
            comments: [...(updatedPosts[postIndex].comments || []), data]
          };
          setCommunityPosts(updatedPosts);
        }
        setCommentText('');
        setCommentingOn(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!session?.user) return;
    if (!window.confirm('Tem certeza que deseja apagar sua arte da comunidade?')) return;
    
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (!error) {
        setCommunityPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        console.error('Erro ao apagar:', error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityPosts();
    }
  }, [activeTab]);

  const handleOpenPublishModal = (project: ProjectConfig) => {
    if (!session) {
      setAuthError('VocÃª precisa estar logado para postar.');
      setActiveTab('profile');
      return;
    }
    if (!project.thumbnail) {
      alert('Este projeto nÃ£o tem uma miniatura. Abra e salve o projeto primeiro.');
      return;
    }
    setPublishProject(project);
    setPublishTitle(project.name);
    setPublishDescription('');
    setPublishIsPrivate(false);
    setShowPublishModal(true);
  };

  const submitPublishPost = async () => {
    if (!session || !publishProject) return;
    setPublishing(true);
    try {
      const res = await fetch(publishProject.thumbnail!);
      const blob = await res.blob();
      const fileName = `${session.user.id}/${Date.now()}.png`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arts')
        .upload(fileName, blob, { contentType: 'image/png' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('arts').getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          title: publishTitle,
          description: `${publishDescription}\n\n[ID:${profileImage || ''}|${profileName}]`,
          is_private: publishIsPrivate,
          image_url: publicUrl
        });

      if (insertError) throw insertError;

      alert('Arte publicada com sucesso! ðŸ ‰âœ¨');
      setShowPublishModal(false);
      setPublishProject(null);
      if (activeTab === 'community') fetchCommunityPosts();
    } catch (err) {
      console.error('Erro ao publicar:', err);
      alert('Erro ao publicar a arte.');
    } finally {
      setPublishing(false);
    }
  };

  const handleViewUserProfile = async (userId: string, currentPostProfile: any) => {
    if (!session) return;
    try {
      // 1. Fetch user stats
      const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_private', false);
      const { count: followersCount } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
      
      // 2. Fetch is following
      const { data: followData } = await supabase.from('followers').select('*').eq('follower_id', session.user.id).eq('following_id', userId).maybeSingle();
      
      // 3. Fetch user public posts
      const { data: userPosts } = await supabase.from('posts')
        .select(`id, title, description, image_url, likes, created_at, comments (id, content)`)
        .eq('user_id', userId)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      // 4. Fetch followers profiles
      const { data: followersData } = await supabase.from('followers').select('follower_id').eq('following_id', userId);
      const followerIds = followersData?.map(f => f.follower_id) || [];
      const { data: followersProfiles } = followerIds.length > 0 
        ? await supabase.from('profiles').select('id, display_name, avatar_url, badge, is_pro').in('id', followerIds)
        : { data: [] };

      const isFounder = currentPostProfile?.display_name?.toLowerCase() === 'kelvin' || currentPostProfile?.display_name === profileName;

      setViewingUser({
        ...currentPostProfile,
        id: userId,
        postsCount: postsCount || 0,
        isFounder: isFounder
      });
      setFollowersCount(isFounder ? 1200000 : (followersCount || 0));
      setIsFollowing(!!followData);
      setViewingUserPosts(userPosts || []);
      setViewingUserFollowers(followersProfiles || []);
      setProfileModalTab('posts');
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowToggle = async () => {
    if (!session || !viewingUser) return;
    try {
      if (isFollowing) {
        const { error } = await supabase.from('followers').delete().match({ follower_id: session.user.id, following_id: viewingUser.id });
        if (!error) {
          setIsFollowing(false);
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
      } else {
        const { error } = await supabase.from('followers').insert({ follower_id: session.user.id, following_id: viewingUser.id });
        if (!error) {
          setIsFollowing(true);
          setFollowersCount(prev => prev + 1);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  const experienceLevels = [
    { id: 'iniciante' as const, label: 'Iniciante', icon: 'ðŸŒ±', desc: 'ComeÃ§ando no pixel art' },
    { id: 'intermediario' as const, label: 'IntermediÃ¡rio', icon: 'âš¡', desc: 'JÃ¡ domino o bÃ¡sico' },
    { id: 'avancado' as const, label: 'AvanÃ§ado', icon: 'ðŸ”¥', desc: 'Crio artes complexas' },
    { id: 'mestre' as const, label: 'Mestre', icon: 'ðŸ‘‘', desc: 'Artista profissional' },
  ];

  const badges = [
    { id: 'leaf', image: '/badges/free_1.png', label: 'Folha Ancestral', pro: false },
    { id: 'artist', image: '/badges/free_2.png', label: 'Selo de Pedra', pro: false },
    { id: 'sparkles', image: '/badges/free_3.png', label: 'Pincel de Prata', pro: false },
    { id: 'heart', image: '/badges/free_4.png', label: 'Coração de Artista', pro: false },
    { id: 'fire', image: '/badges/free_5.png', label: 'Chama Amarela', pro: false },
    { id: 'star', image: '/badges/pro_1.png', label: 'Cristal Celestial', pro: true, glow: 'rgba(56, 189, 248, 0.8)' },
    { id: 'crown', image: '/badges/pro_2.png', label: 'Coroa de Fogo', pro: true, glow: 'rgba(239, 68, 68, 0.8)' },
    { id: 'diamond', image: '/badges/pro_3.png', label: 'Diamante Cósmico', pro: true, glow: 'rgba(168, 85, 247, 0.8)' },
    { id: 'dragon', image: '/badges/pro_4.png', label: 'Dragão Guardião', pro: true, glow: 'rgba(34, 197, 94, 0.8)' },
    { id: 'verified', image: '/badges/pro_5.png', label: 'Elite Dourada', pro: true, glow: 'rgba(234, 179, 8, 0.8)' },
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
         errorMsg = 'Este e-mail jÃ¡ estÃ¡ cadastrado.';
      } else if (errorMsg === 'Password should be at least 6 characters') {
         errorMsg = 'A senha deve ter no mÃ­nimo 6 caracteres.';
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
         errorMsg = 'E-mail nÃ£o confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmaÃ§Ã£o.';
      }
      setAuthError(errorMsg); 
      return; 
    }
    console.log('Sign In Success:', data.session ? 'Session active' : 'No session');
    sound.playAction();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null); 
    setProfileImage(null); 
    setProfileName('Artista Pixel');
    setExperienceLevel('iniciante');
    setSelectedBadge('leaf');
    sound.playClick();
  };


  const handleSaveProfile = async () => {
    sound.playAction();
    // Do not force a default avatar, leave it as null to trigger transparent/black fallback
    const avatarUrl = profileImage;
    
    // 1. Update Auth Metadata
    const { error: authError } = await supabase.auth.updateUser({ 
      data: { 
        display_name: profileName, 
        experience_level: experienceLevel,
        badge: selectedBadge,
        avatar_url: avatarUrl
      } 
    });

    // 2. Update Public Profile Table (Critical for Community)
    if (session?.user?.id) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        display_name: profileName,
        experience_level: experienceLevel,
        badge: selectedBadge,
        avatar_url: avatarUrl,
        is_pro: isPro,
        updated_at: new Date()
      });
      
      if (profileError) {
        console.error('Error updating public profile:', profileError);
        setAuthError('Erro ao atualizar perfil público na comunidade.');
      }
    }

    if (authError) setAuthError(authError.message);
    else {
      setAuthSuccess('Perfil e Avatar salvos! ✨');
      // Optimistic update for current user's posts in the local state
      if (session?.user?.id) {
        setCommunityPosts(currentPosts => 
          currentPosts.map(post => 
            post.user_id === session.user.id 
              ? { ...post, profiles: { ...post.profiles, display_name: profileName, avatar_url: avatarUrl, badge: selectedBadge, experience_level: experienceLevel } } 
              : post
          )
        );
      }
    }
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

      {/* ========== ONBOARDING / ENTRY GATE ========== */}
      <AnimatePresence>
        {onboardingStep && !session && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0a0a0a] rounded-[48px] border border-white/10 shadow-3xl overflow-hidden relative"
            >
              <div className="p-8 flex flex-col items-center text-center">
                {/* Logo & Welcome */}
                {onboardingStep === 'welcome' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
                    <img src="/logo.png" alt="Logo" className="w-24 h-24 image-pixelated drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter mb-2">BEM-VINDO AO DRAGON ART</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Sua jornada épica no pixel art começa aqui.</p>
                    </div>
                    <div className="w-full flex flex-col gap-3 mt-4">
                      <button onClick={() => { setAuthMode('register'); setOnboardingStep('auth'); sound.playAction(); }}
                        className="w-full py-5 bg-[var(--accent-color)] text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[var(--accent-color)]/20 active:scale-95 transition-all">
                        CRIAR CONTA GRÁTIS
                      </button>
                      <button onClick={() => { setAuthMode('login'); setOnboardingStep('auth'); sound.playClick(); }}
                        className="w-full py-5 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
                        JÁ TENHO CONTA
                      </button>
                      <button onClick={() => { setOnboardingStep(null); sound.playClick(); }}
                        className="w-full py-3 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px] transition-all">
                        ENTRAR SEM LOGAR (CONTA GRÁTIS)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Login / Register Forms */}
                {onboardingStep === 'auth' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full flex flex-col items-center">
                    <button onClick={() => setOnboardingStep('welcome')} className="absolute top-8 left-8 p-2 text-gray-500 hover:text-white transition-colors">
                      <ArrowLeft size={24} />
                    </button>
                    <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest">
                      {authMode === 'login' ? 'Acessar Conta' : 'Nova Jornada'}
                    </h3>
                    
                    <div className="w-full space-y-4">
                      {authMode === 'register' && (
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
                          <input type="text" placeholder="Nome de Exibição" value={registerName} onChange={e => setRegisterName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-bold" />
                        </div>
                      )}
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" size={20} />
                        <input type="email" placeholder="Seu E-mail" value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-bold" />
                      </div>
                      <div className="relative group">
                        <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[var(--accent-color)] transition-colors" />
                        <input type="password" placeholder="Sua Senha" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-bold" />
                      </div>
                    </div>

                    <button 
                      onClick={authMode === 'login' ? handleSignIn : handleSignUp}
                      disabled={authLoading}
                      className="w-full mt-8 py-5 bg-[var(--accent-color)] text-white font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      {authLoading ? 'PROCESSANDO...' : authMode === 'login' ? 'ENTRAR' : 'CONTINUAR'}
                    </button>
                    
                    {authError && <p className="mt-4 text-red-400 text-xs font-bold text-center">{authError}</p>}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Step Avatar & Name (Post-Login/Register) */}
        {onboardingStep && session && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
            <div className="w-full max-w-lg">
              {onboardingStep === 'avatar' && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Escolha sua Face</h2>
                    <p className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-widest">Sua foto será vista por toda a comunidade</p>
                  </div>
                  
                  <div className="w-full max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Standard Avatars */}
                    <div className="mb-8">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User size={14} /> Avatares Padrão
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {avatars.map((url, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setProfileImage(url); sound.playClick(); }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${profileImage === url ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/20' : 'border-white/5 opacity-60 hover:opacity-100'}`}>
                            <img src={url} className="w-full h-full object-cover" />
                            {profileImage === url && <div className="absolute inset-0 bg-[var(--accent-color)]/20 flex items-center justify-center"><Check className="text-white bg-[var(--accent-color)] rounded-full p-1" size={16} /></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* PRO Avatars */}
                    <div className="mb-8">
                      <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Star size={14} className="fill-yellow-500" /> Avatares Animados PRO
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {proAvatars.map((url, i) => (
                          <motion.button 
                            key={i} 
                            whileHover={{ scale: isPro ? 1.05 : 1 }} 
                            whileTap={{ scale: isPro ? 0.95 : 1 }} 
                            onClick={() => { 
                              if (isPro) {
                                setProfileImage(url); 
                                sound.playClick(); 
                              } else {
                                alert('Este avatar animado é exclusivo para membros PRO! 🌟');
                              }
                            }}
                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                              profileImage === url ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 'border-white/5'
                            } ${!isPro ? 'grayscale opacity-40' : 'hover:opacity-100'}`}
                          >
                            <img src={url} className="w-full h-full object-cover" />
                            {!isPro && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Lock size={16} className="text-white" />
                              </div>
                            )}
                            {profileImage === url && <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center"><Check className="text-white bg-yellow-500 rounded-full p-1" size={16} /></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setOnboardingStep('name')} disabled={!profileImage}
                    className="w-full mt-6 py-5 bg-[var(--accent-color)] text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-30">
                    PRÓXIMO PASSO
                  </button>
                </motion.div>
              )}

              {onboardingStep === 'name' && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col items-center">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-[32px] border-4 border-[var(--accent-color)] mx-auto mb-6 overflow-hidden shadow-2xl">
                      <img src={profileImage || ''} className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Como quer ser chamado?</h2>
                    <p className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-widest">Este será seu nome artístico no Dragon Art</p>
                  </div>
                  <input type="text" placeholder="Ex: Mestre Pixel" value={profileName} onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-center text-xl outline-none focus:border-[var(--accent-color)]/50 focus:bg-white/[0.08] transition-all font-black mb-8" />
                  
                  <button onClick={async () => {
                    await handleSaveProfile();
                    setActiveTab('profile');
                    setOnboardingStep(null);
                    sound.playAction();
                  }} disabled={!profileName || profileName.length < 3}
                    className="w-full py-5 bg-gradient-to-r from-[var(--accent-color)] to-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-30">
                    FINALIZAR IDENTIDADE
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ConteÃºdo com Abas */}
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
                        onClick={() => {
                          if (!isPro) { setShowProModal(true); return; }
                          setIsCustom(true);
                        }}
                        className={`col-span-2 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isCustom ? 'bg-[var(--accent-color)] text-white' : isPro ? 'bg-white/5 text-[var(--text-muted)] hover:text-white' : 'bg-white/5 text-yellow-400/70 hover:bg-yellow-400/10'}`}
                      >
                        {!isPro && <Lock size={14} />} Tamanho Personalizado {!isPro && <span className="text-[9px] font-black bg-yellow-400/20 px-2 py-0.5 rounded-full">PRO</span>}
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
                              PrÃ©-visualizaÃ§Ã£o da Folha
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
                                    {customWidth}Ã—{customHeight}
                                  </span>
                                </div>
                              </motion.div>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-bold">
                              <span>{customWidth * customHeight} pixels</span>
                              <span>â€¢</span>
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
                  {/* PRO Banner */}
                  {!isPro && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setShowProModal(true)}
                      className="relative overflow-hidden cursor-pointer group rounded-[28px] border border-yellow-400/30 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-500/10 to-yellow-400/10 group-hover:from-yellow-400/20 group-hover:via-orange-500/20 group-hover:to-yellow-400/20 transition-all" />
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl group-hover:bg-yellow-400/10 transition-all" />
                      <div className="relative flex items-center gap-4 p-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                          <Star size={28} className="text-black fill-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-white text-base tracking-wide">SEJA DRAGON ART PRO</h3>
                          <p className="text-xs text-yellow-300/80 font-bold mt-0.5">ExportaÃ§Ã£o HD â€¢ Sem Marca D'Ã¡gua â€¢ Selos Exclusivos</p>
                        </div>
                        <ChevronRight size={24} className="text-yellow-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  )}
                  {isPro && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><Check size={20} className="text-white" /></div>
                      <div>
                        <span className="font-black text-green-400 text-sm">DRAGON ART PRO ATIVO</span>
                        <p className="text-[10px] text-green-300/60 font-bold">VocÃª tem acesso a todos os recursos premium!</p>
                      </div>
                    </div>
                  )}
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
                              <p className="text-[10px] font-bold text-[var(--accent-color)]/60 uppercase">{p.width}x{p.height}px{p.frames && p.frames.length > 1 ? ` â€¢ ${p.frames.length}f` : ''}</p>
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
                              }} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="OpÃ§Ãµes">
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
                                  <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'png'); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Download size={14} /> Original (GrÃ¡tis)</button>
                                  <button onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(isPro) { downloadProject(p, 'png', 1); setOpenMenuId(null); } 
                                    else { alert('A exportaÃ§Ã£o Full HD Ã© exclusiva para usuÃ¡rios PRO! Acesse a aba Perfil para assinar.'); }
                                  }} className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isPro ? 'hover:bg-[var(--accent-color)] hover:text-white' : 'opacity-70 text-yellow-400 hover:bg-yellow-400/10'}`}>
                                    {isPro ? <Download size={14} /> : <Lock size={14} />} Full HD (1080p) {isPro ? '' : 'PRO'}
                                  </button>
                                  <button onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(isPro) { downloadProject(p, 'png', 4); setOpenMenuId(null); } 
                                    else { alert('A exportaÃ§Ã£o 4K Ã© exclusiva para usuÃ¡rios PRO! Acesse a aba Perfil para assinar.'); }
                                  }} className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isPro ? 'hover:bg-[var(--accent-color)] hover:text-white' : 'opacity-70 text-yellow-400 hover:bg-yellow-400/10'}`}>
                                    {isPro ? <Download size={14} /> : <Lock size={14} />} Ultra HD (4K) {isPro ? '' : 'PRO'}
                                  </button>
                                  
                                  {/* JPG */}
                                  <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/5 flex items-center gap-2"><ImageIcon size={10} /> Exportar JPG</div>
                                  <button onClick={(e) => { e.stopPropagation(); downloadProject(p, 'jpeg'); setOpenMenuId(null); }} className="w-full px-4 py-2 text-sm hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors"><Download size={14} /> Original (GrÃ¡tis)</button>
                                  <button onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(isPro) { downloadProject(p, 'jpeg', 1); setOpenMenuId(null); } 
                                    else { alert('A exportaÃ§Ã£o Full HD Ã© exclusiva para usuÃ¡rios PRO! Acesse a aba Perfil para assinar.'); }
                                  }} className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isPro ? 'hover:bg-[var(--accent-color)] hover:text-white' : 'opacity-70 text-yellow-400 hover:bg-yellow-400/10'}`}>
                                    {isPro ? <Download size={14} /> : <Lock size={14} />} Full HD (1080p) {isPro ? '' : 'PRO'}
                                  </button>
                                  <button onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if(isPro) { downloadProject(p, 'jpeg', 4); setOpenMenuId(null); } 
                                    else { alert('A exportaÃ§Ã£o 4K Ã© exclusiva para usuÃ¡rios PRO! Acesse a aba Perfil para assinar.'); }
                                  }} className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isPro ? 'hover:bg-[var(--accent-color)] hover:text-white' : 'opacity-70 text-yellow-400 hover:bg-yellow-400/10'}`}>
                                    {isPro ? <Download size={14} /> : <Lock size={14} />} Ultra HD (4K) {isPro ? '' : 'PRO'}
                                  </button>
                                  
                                  {/* GIF */}
                                  {p.frames && p.frames.length > 1 && (<>
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/5 flex items-center gap-2"><Film size={10} /> GIF Animado</div>
                                    <button onClick={(e) => { e.stopPropagation(); downloadGif(p); setOpenMenuId(null); }} disabled={exportingId === p.id} className="w-full px-4 py-2 text-sm hover:bg-green-600 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"><Film size={14} /> {exportingId === p.id ? 'Exportando...' : 'Original (GrÃ¡tis)'}</button>
                                    <button onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if(isPro) { downloadGif(p, 1); setOpenMenuId(null); } 
                                      else { alert('A exportaÃ§Ã£o Full HD Ã© exclusiva para usuÃ¡rios PRO! Acesse a aba Perfil para assinar.'); }
                                    }} disabled={exportingId === p.id} className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isPro ? 'hover:bg-green-600 hover:text-white' : 'opacity-70 text-yellow-400 hover:bg-yellow-400/10'}`}>
                                      {isPro ? <Film size={14} /> : <Lock size={14} />} {exportingId === p.id ? 'Exportando...' : `Full HD (1080p) ${isPro ? '' : 'PRO'}`}
                                    </button>
                                    <button onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if(isPro) { downloadGif(p, 4); setOpenMenuId(null); } 
                                      else { alert('A exportaÃ§Ã£o 4K Ã© exclusiva para usuÃ¡rios PRO! Acesse a aba Perfil para assinar.'); }
                                    }} disabled={exportingId === p.id} className={`w-full px-4 py-2 text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isPro ? 'hover:bg-green-600 hover:text-white' : 'opacity-70 text-yellow-400 hover:bg-yellow-400/10'}`}>
                                      {isPro ? <Film size={14} /> : <Lock size={14} />} Ultra HD (4K) {isPro ? '' : 'PRO'}
                                    </button>
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
                                    onClick={(e) => { e.stopPropagation(); handleOpenPublishModal(p); setOpenMenuId(null); }} 
                                    className="w-full px-4 py-2 text-sm text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white flex items-center gap-2 transition-colors font-bold"
                                  >
                                    <ShareIcon size={14} /> Publicar na Comunidade
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
              className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 flex flex-col items-center justify-start overflow-y-auto gap-6"
            >
              {/* Quick Actions Header */}
              <div className="w-full flex justify-between items-center bg-[var(--bg-panel)] p-4 rounded-[24px] border border-white/5 shadow-lg">
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile}
                    className="bg-[var(--accent-color)] hover:brightness-110 px-6 py-2.5 rounded-xl text-white font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                    <Check size={16} /> SALVAR PERFIL
                  </button>
                </div>
                <button onClick={handleSignOut}
                  className="px-4 py-2.5 bg-white/5 text-[var(--text-muted)] hover:bg-red-500/20 hover:text-red-400 rounded-xl font-black text-xs flex items-center gap-2 active:scale-95 transition-all border border-white/5">
                  <LogOut size={16} /> SAIR
                </button>
              </div>
              {/* Auth Messages */}
              <AnimatePresence>
                {authError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold text-center">
                    {authError}
                  </motion.div>
                )}
                {authSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md p-4 bg-green-500/15 border border-green-500/30 rounded-2xl text-green-400 text-sm font-bold text-center">
                    {authSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {!session ? (
                /* ========== NOT LOGGED IN ========== */
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
                        <input type="password" placeholder="MÃ­nimo 6 caracteres" value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                          className="w-full bg-[var(--bg-panel)] border border-white/10 p-4 pl-12 rounded-2xl focus:border-[var(--accent-color)] outline-none font-bold" />
                      </div>
                    </div>
                    {authMode === 'register' && (
                      <div>
                        <label className="block text-xs font-black uppercase text-[var(--text-muted)] mb-3 tracking-widest pl-2">Seu NÃ­vel</label>
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
                      {authMode === 'login' ? 'NÃ£o tem conta? Cadastre-se' : 'JÃ¡ tem conta? FaÃ§a login'}
                    </button>
                  </div>
                </div>
              ) : (
                /* ========== LOGGED IN: Profile Dashboard ========== */
                <div className="w-full flex flex-col gap-6">
                  
                  {/* Hero Card - Avatar + Info */}
                  <div className="relative bg-[var(--bg-panel)] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                    {/* Background glow from badge */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] opacity-30"
                        style={{ background: badges.find(b => b.id === selectedBadge)?.glow || 'var(--accent-color)' }} />
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-[60px] opacity-20"
                        style={{ background: badges.find(b => b.id === selectedBadge)?.glow || 'var(--accent-color)' }} />
                    </div>
                    
                    <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
                      {/* Avatar with animated badge ring */}
                      <div className="relative group cursor-pointer shrink-0" onClick={() => setShowAvatarPicker(true)}>
                        {/* Animated glow ring */}
                        {badges.find(b => b.id === selectedBadge)?.glow && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -inset-3 rounded-[44px] pointer-events-none z-0"
                            style={{ background: `radial-gradient(circle, ${badges.find(b => b.id === selectedBadge)?.glow} 0%, transparent 70%)` }}
                          />
                        )}
                        <div className="relative w-36 h-36 bg-gradient-to-br from-[var(--accent-color)] to-[var(--bg-element)] rounded-[40px] flex items-center justify-center shadow-2xl border-4 border-white/10 p-1.5 z-10 overflow-hidden">
                          <div className="w-full h-full bg-[var(--bg-panel)] rounded-[32px] overflow-hidden flex items-center justify-center">
                            <img 
                              src={getAvatarFallback(profileImage, profileName || session?.user?.id || 'user')} 
                              alt="Avatar" 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                              onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(null, profileName || 'user'); }}
                            />
                          </div>
                        </div>
                        
                        {/* Badge overlay on avatar corner */}
                        <motion.div
                          animate={{ 
                            scale: badges.find(b => b.id === selectedBadge)?.glow ? [1, 1.2, 1] : [1, 1.1, 1],
                            rotate: [0, 8, -8, 0]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            ease: 'easeInOut' 
                          }}
                          className="absolute -bottom-3 -right-3 w-16 h-16 flex items-center justify-center z-20"
                        >
                          <img src={badges.find(b => b.id === selectedBadge)?.image || '/badges/free_1.png'} className="w-14 h-14 object-contain" alt="Selo"
                            style={badges.find(b => b.id === selectedBadge)?.glow ? { filter: `drop-shadow(0 0 12px ${badges.find(b => b.id === selectedBadge)?.glow})` } : { filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }} />
                        </motion.div>
                        
                        {/* Edit overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-[40px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all z-30 backdrop-blur-[2px]">
                          <RefreshCw size={32} className="text-white mb-2" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Alterar Avatar</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col items-center sm:items-start gap-2 min-w-0">
                        <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                          className="bg-transparent border-none text-center sm:text-left text-2xl font-black text-white outline-none focus:bg-white/5 rounded-xl px-3 py-1 transition-colors w-full" />
                        
                          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10 backdrop-blur-sm">
                              <Award size={12} /> {experienceLevels.find(l => l.id === experienceLevel)?.label || 'Iniciante'}
                            </span>
                            {isPro && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-yellow-400 text-yellow-400 bg-yellow-400/10 backdrop-blur-sm flex items-center gap-1">
                                <Star size={10} className="fill-yellow-400" /> PRO
                              </span>
                            )}
                            {(profileName.toLowerCase() === 'kelvin' || session?.user?.email === 'kelvinlexjesusda@gmail.com') && (
                              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[9px] font-black rounded-md shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse px-3 py-1 flex items-center gap-1">
                                <Shield size={10} /> FUNDADOR
                              </span>
                            )}
                          </div>
                        
                        <p className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1 mt-1">
                          <Mail size={12} /> {session.user.email}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <FileImage className="text-[var(--accent-color)]" size={16} />
                            <div>
                              <span className="text-sm font-black text-white">{savedProjects.length}</span>
                              <span className="text-[9px] font-bold text-[var(--text-muted)] ml-1 uppercase">Artes</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Heart className="text-red-400" size={16} />
                            <div>
                              <span className="text-sm font-black text-white">{myTotalLikes}</span>
                              <span className="text-[9px] font-bold text-[var(--text-muted)] ml-1 uppercase">Curtidas</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <Users className="text-blue-400" size={16} />
                            <div>
                              <span className="text-sm font-black text-white">
                                {profileName === 'KELVIN' || session?.user?.email === 'kelvinlexjesusda@gmail.com' ? '1.2M' : myFollowersCount}
                              </span>
                              <span className="text-[9px] font-bold text-[var(--text-muted)] ml-1 uppercase">Seguidores</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <User className="text-gray-400" size={16} />
                            <div>
                              <span className="text-sm font-black text-white">{myFollowingCount}</span>
                              <span className="text-[9px] font-bold text-[var(--text-muted)] ml-1 uppercase">Seguindo</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge Selection - Professional Grid */}
                  <div className="bg-[var(--bg-panel)] rounded-[32px] p-6 border border-white/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Award size={80} />
                    </div>

                    <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                      <div className="p-2 bg-[var(--accent-color)]/20 rounded-xl"><Award size={20} className="text-[var(--accent-color)]" /></div>
                      Selos de Conquista
                    </h3>
                    
                    <div className="space-y-8">
                      {/* Free badges */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.25em]">Coleção Básica</span>
                          <span className="text-[9px] font-bold text-green-400/60 bg-green-400/10 px-2 py-0.5 rounded-md">DESBLOQUEADO</span>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                          {badges.filter(b => !b.pro).map(badge => (
                            <div key={badge.id} className="flex flex-col items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => { setSelectedBadge(badge.id); sound.playClick(); }}
                                className={`relative w-full aspect-square rounded-[24px] flex items-center justify-center transition-all ${
                                  selectedBadge === badge.id
                                    ? 'bg-gradient-to-br from-[var(--accent-color)]/30 to-[var(--accent-color)]/10 ring-2 ring-[var(--accent-color)] shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]'
                                    : 'bg-white/[0.03] hover:bg-white/10'
                                }`}
                              >
                                <img src={badge.image} className="w-10 h-10 object-contain drop-shadow-lg" alt={badge.label} />
                                {selectedBadge === badge.id && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent-color)] rounded-full flex items-center justify-center border-2 border-[var(--bg-panel)] shadow-lg">
                                    <Check size={12} className="text-white" />
                                  </motion.div>
                                )}
                              </motion.button>
                              <span className={`text-[8px] font-black uppercase text-center truncate w-full ${selectedBadge === badge.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)] opacity-60'}`}>{badge.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Pro badges */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.25em] flex items-center gap-1">
                            <Star size={10} className="fill-yellow-400" /> Coleção Dragon PRO
                          </span>
                          {!isPro && <span className="text-[9px] font-bold text-yellow-400/60 bg-yellow-400/10 px-2 py-0.5 rounded-md">BLOQUEADO</span>}
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                          {badges.filter(b => b.pro).map(badge => {
                            const isLocked = !isPro;
                            const isSelected = selectedBadge === badge.id;
                            return (
                              <div key={badge.id} className="flex flex-col items-center gap-2">
                                <motion.button
                                  whileHover={!isLocked ? { scale: 1.1, y: -2 } : {}}
                                  whileTap={!isLocked ? { scale: 0.9 } : {}}
                                  onClick={() => {
                                    if (isLocked) { setShowProModal(true); return; }
                                    setSelectedBadge(badge.id); sound.playClick();
                                  }}
                                  className={`relative w-full aspect-square rounded-[24px] flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'ring-2 ring-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.3)] bg-yellow-400/10'
                                      : isLocked
                                        ? 'bg-black/40 grayscale opacity-40 cursor-not-allowed border border-white/5'
                                        : 'bg-white/[0.03] hover:bg-white/10'
                                  }`}
                                  style={isSelected && badge.glow ? {
                                    background: `radial-gradient(circle, ${badge.glow}30 0%, transparent 80%)`
                                  } : {}}
                                >
                                  {/* Glow effect for selected PRO badge */}
                                  {isSelected && badge.glow && (
                                    <motion.div
                                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                                      transition={{ duration: 3, repeat: Infinity }}
                                      className="absolute inset-0 rounded-[24px] pointer-events-none"
                                      style={{ boxShadow: `inset 0 0 15px ${badge.glow}40` }}
                                    />
                                  )}
                                  <img src={badge.image} className="w-10 h-10 object-contain relative z-10" alt={badge.label}
                                    style={isSelected && badge.glow ? { filter: `drop-shadow(0 0 10px ${badge.glow})` } : {}} />
                                  
                                  {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[24px] backdrop-blur-[1px]">
                                      <Lock size={12} className="text-white/60" />
                                    </div>
                                  )}
                                  
                                  {isSelected && !isLocked && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                      className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-[var(--bg-panel)] shadow-lg z-20">
                                      <Check size={12} className="text-black" />
                                    </motion.div>
                                  )}
                                </motion.button>
                                <span className={`text-[8px] font-black uppercase text-center truncate w-full ${isSelected ? 'text-yellow-400' : 'text-[var(--text-muted)] opacity-60'}`}>{badge.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRO Upgrade Card (only for free users) */}
                  {!isPro && (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setShowProModal(true)}
                      className="relative overflow-hidden cursor-pointer rounded-[28px] border border-yellow-400/30 shadow-[0_0_40px_rgba(251,191,36,0.12)] group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/5 to-amber-600/10" />
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
                      <div className="relative p-6 flex items-center gap-5">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shrink-0"
                        >
                          <Star size={32} className="text-black fill-black" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-black text-white text-lg">Desbloqueie o PRO</h3>
                          <p className="text-xs text-yellow-300/70 font-bold mt-1">ExportaÃ§Ã£o HD/4K â€¢ Sem marca d'Ã¡gua â€¢ Selos animados â€¢ Camadas ilimitadas</p>
                        </div>
                        <ChevronRight size={24} className="text-yellow-400 shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  )}

                  {/* Actions Row */}
                  <div className="flex gap-3">
                    <button onClick={handleSaveProfile}
                      className="flex-1 bg-[var(--accent-color)] hover:brightness-110 p-4 rounded-2xl text-white font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <Check size={20} /> SALVAR PERFIL
                    </button>
                    <button onClick={handleSignOut}
                      className="p-4 bg-white/5 text-[var(--text-muted)] hover:bg-red-500/20 hover:text-red-400 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all border border-white/5"
                      title="Sair da Conta">
                      <LogOut size={20} />
                    </button>
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
                  <h3 className="text-2xl font-black text-white mb-3">Ainda nÃ£o hÃ¡ artes...</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs font-bold">Seja o primeiro a postar na comunidade v1.7.1!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {communityPosts.map((post) => {
                      const idMatch = post.description?.match(/\[ID:(.*)\|(.*)\]/);
                      const embeddedAvatar = idMatch ? idMatch[1] : null;
                      const embeddedName = idMatch ? idMatch[2] : null;
                      const cleanDescription = post.description?.replace(/\[ID:.*\]/, '').trim();
                      
                      return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={post.id} 
                          className="bg-[var(--bg-panel)] rounded-[32px] border border-white/5 overflow-hidden shadow-lg group"
                        >
                          <div 
                            className="aspect-square bg-black/20 flex items-center justify-center p-4 relative cursor-pointer group/image"
                            onClick={() => setZoomedPost({...post, description: cleanDescription, _embeddedName: embeddedName})}
                          >
                            <img 
                              src={post.image_url} 
                              alt={post.title} 
                              className="max-w-full max-h-full object-contain image-pixelated group-hover/image:scale-110 transition-transform" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover/image:opacity-100 bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity flex items-center gap-2">
                                <Maximize2 size={14} /> Ampliar
                              </span>
                            </div>
                              {session?.user?.id === post.user_id && (
                                <div className="flex gap-2 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleTogglePostPrivacy(post.id, !!post.is_private); }}
                                    className={`p-2 rounded-full backdrop-blur-sm transition-all ${post.is_private ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                    title={post.is_private ? "Tornar Público" : "Tornar Privado"}
                                  >
                                    {post.is_private ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                    className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all"
                                    title="Apagar Post"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}

                        {post.is_private && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-yellow-500/30 flex items-center gap-1.5 pointer-events-none">
                            <Lock size={10} className="text-yellow-500" />
                            <span className="text-[8px] font-black text-yellow-500 uppercase tracking-tighter">Privado</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <button 
                            onClick={() => post.profiles?.id && handleViewUserProfile(post.profiles.id, post.profiles)}
                            className="w-10 h-10 rounded-full overflow-hidden bg-white/5 shrink-0 border-2 border-white/10 hover:border-[var(--accent-color)] transition-colors"
                          >
                            <div className="relative w-full h-full">
                              <img 
                                src={post.user_id === session?.user?.id 
                                  ? getAvatarFallback(profileImage, profileName)
                                  : getAvatarFallback(
                                      (Array.isArray(post.profiles) ? post.profiles[0]?.avatar_url : post.profiles?.avatar_url) || embeddedAvatar, 
                                      (Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name) || embeddedName || post.user_id
                                    )} 
                                className="w-full h-full object-cover" 
                                alt="Avatar" 
                                onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(null, embeddedName || post.user_id); }}
                              />
                              {/* Badge overlay on avatar corner */}
                              {(post.user_id === session?.user?.id ? selectedBadge : (Array.isArray(post.profiles) ? post.profiles[0]?.badge : post.profiles?.badge)) && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-app)] flex items-center justify-center shadow-lg z-10 border border-white/10">
                                  <img 
                                    src={badges.find(b => b.id === (post.user_id === session?.user?.id ? selectedBadge : (Array.isArray(post.profiles) ? post.profiles[0]?.badge : post.profiles?.badge)))?.image || '/badges/free_1.png'} 
                                    className="w-2.5 h-2.5 object-contain" 
                                    alt="Selo" 
                                  />
                                </div>
                              )}
                            </div>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white truncate">{post.title}</h4>
                              {((Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name)?.toLowerCase() === 'kelvin' || (Array.isArray(post.profiles) ? post.profiles[0]?.id : post.profiles?.id) === '41066d58-7c5e-49b5-9009-b1dfd11b72f3') && (
                                <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[8px] font-black rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse">
                                  FUNDADOR
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => {
                                const p = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
                                if (p?.id) handleViewUserProfile(p.id, p);
                              }}
                              className="flex items-center gap-1 overflow-hidden hover:opacity-80 transition-opacity text-left active:scale-95"
                            >
                              <span className="text-xs text-[var(--accent-color)] font-bold truncate">
                                @{(post.user_id === session?.user?.id ? profileName : null) || (Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name) || embeddedName || 'Anônimo'}
                              </span>
                              {(post.user_id === session?.user?.id ? isPro : (Array.isArray(post.profiles) ? post.profiles[0]?.is_pro : post.profiles?.is_pro)) && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                            </button>
                          </div>
                        </div>

                        {post.description && (
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{post.description}</p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[var(--text-muted)]">
                              <button onClick={() => handleLikePost(post.id)} className="hover:text-red-400 transition-colors active:scale-90 p-1">
                                <Heart size={16} className={post.likes > 0 ? "fill-red-400 text-red-400" : ""} />
                              </button>
                              <span className="text-xs font-bold">{post.likes || 0}</span>
                            </div>
                            
                            {session?.user?.id !== post.user_id && (
                              <button 
                                onClick={async () => {
                                  if(!session) return;
                                  const { error } = await supabase.from('followers').insert({ follower_id: session.user.id, following_id: post.user_id });
                                  if (!error) alert('VocÃª comeÃ§ou a seguir ' + (post.profiles?.display_name || 'este artista') + '!');
                                  else alert('VocÃª jÃ¡ segue este artista.');
                                }}
                                className="hover:text-blue-400 text-[var(--text-muted)] transition-colors active:scale-90 p-1 flex items-center gap-1"
                                title="Seguir Artista"
                              >
                                <UserPlus size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* ComentÃ¡rios na visualizaÃ§Ã£o do App */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                            {post.comments.map((comment: any) => (
                              <div key={comment.id} className="bg-black/20 rounded-lg p-2 text-xs">
                                <span className="font-bold text-[var(--accent-color)] mr-1">
                                  {comment.profiles?.display_name || 'UsuÃ¡rio'}:
                                </span>
                                <span className="text-gray-300">{comment.content}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {(!post.comments || post.comments.length === 0) && (
                          <div className="mt-3 pt-3 border-t border-white/5 text-center">
                            <span className="text-[9px] text-gray-500 font-bold">
                              Seja o primeiro a comentar.
                            </span>
                          </div>
                        )}

                        {/* Caixa de Novo ComentÃ¡rio */}
                        <div className="mt-2 pt-2 flex items-center gap-2">
                          {commentingOn === post.id ? (
                            <div className="flex-1 flex items-center gap-1 bg-black/40 rounded-full border border-white/10 px-3 py-1">
                              <input 
                                type="text"
                                autoFocus
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Escreva..."
                                className="bg-transparent border-none outline-none text-xs text-white w-full h-6"
                                onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                              />
                              <button onClick={() => handleCommentSubmit(post.id)} className="text-[var(--accent-color)] p-1 hover:bg-white/10 rounded-full">
                                <Send size={12} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setCommentingOn(post.id); setCommentText(''); }}
                              className="w-full text-center text-[10px] font-bold text-gray-400 hover:text-white py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center gap-1"
                            >
                              <MessageSquare size={12} /> Adicionar comentário
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NavegaÃ§Ã£o Inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
        {/* Solid background at the bottom to ensure the cutout matches perfectly */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-[var(--bg-app)] -z-10"></div>
        <div className="bg-gradient-to-t from-[var(--bg-app)] to-transparent pt-24 pb-6 px-4">
          <div className="max-w-md mx-auto relative pointer-events-auto mt-4">
            
            {/* Background da barra de navegaÃ§Ã£o */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl h-[72px] flex items-center px-2 relative">
              
              <button 
                onClick={() => { sound.playClick(); setActiveTab('profile'); }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 h-full rounded-l-full ${activeTab === 'profile' ? 'text-[var(--accent-color)]' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}
              >
                <User size={24} className={activeTab === 'profile' ? 'fill-[var(--accent-color)]/20' : ''} />
                <span className="text-[10px] font-black uppercase tracking-tighter mt-0.5">Perfil</span>
              </button>

              {/* EspaÃ§o para o botÃ£o central elevado */}
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
                    InÃ­cio
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
                  <h3 className="text-2xl font-black flex items-center gap-3"><Settings className="text-[var(--accent-color)]" /> ConfiguraÃ§Ãµes</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <div className="flex flex-col gap-8">
                  {/* Themes */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <Palette className="text-[var(--accent-color)]" /> Cores de Fundo (Temas)
                    </h4>
                    {/* Free Themes */}
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-1 block flex items-center gap-1">✦ Gratuitos</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                      {themes.filter(t => FREE_THEME_IDS.has(t.id)).map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => changeTheme(theme.id)}
                          className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${currentThemeId === theme.id ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 scale-105 shadow-md' : 'border-white/5 bg-white/5 hover:border-white/20 hover:-translate-y-1'}`}
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

                    {/* PRO Themes */}
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.2em] mb-1 block flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400" /> Temas PRO {!isPro && <Lock size={10} className="ml-1 opacity-60" />}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[35vh] overflow-y-auto pr-2">
                      {themes.filter(t => !FREE_THEME_IDS.has(t.id)).map((theme) => {
                        const isActive = currentThemeId === theme.id;
                        const isLocked = !isPro;
                        return (
                          <button
                            key={theme.id}
                            onClick={() => changeTheme(theme.id)}
                            className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                              isActive
                                ? 'border-yellow-400 bg-yellow-400/10 scale-105 shadow-md shadow-yellow-400/20'
                                : isLocked
                                  ? 'border-white/5 bg-white/[0.03] hover:border-yellow-400/30 hover:-translate-y-1 group'
                                  : 'border-white/5 bg-white/5 hover:border-white/20 hover:-translate-y-1'
                            }`}
                          >
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden shadow-inner flex relative" style={{ backgroundColor: theme.colors.bgApp }}>
                                <div className="w-1/2 h-full" style={{ backgroundColor: theme.colors.bgSurface }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full border-2" style={{ backgroundColor: theme.colors.accentColor, borderColor: theme.colors.bgElement }}></div>
                                </div>
                              </div>
                              {isLocked && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400/90 rounded-full flex items-center justify-center shadow-sm">
                                  <Lock size={9} className="text-black" />
                                </div>
                              )}
                            </div>
                            <span className={`text-xs font-bold text-center ${isLocked ? 'opacity-60' : ''}`}>{theme.name}</span>
                            {isActive && <span className="absolute top-2 right-2 text-yellow-400 bg-white/10 rounded-full p-0.5"><Check size={14} /></span>}
                            {isLocked && (
                              <span className="absolute top-1.5 left-1.5 text-[8px] font-black text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full">PRO</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Audio */}
                  <div>
                    <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                      Ãudio e Sons
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
                          <span className="block font-bold">MÃºsica de Fundo</span>
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
                  <p>1. O Dragon Art Ã© uma ferramenta profissional de pixel art.</p>
                  <p>2. Suas artes sÃ£o de sua propriedade exclusiva.</p>
                  <p>3. Use gestos (2 dedos) para navegar livremente pela folha.</p>
                  <p>4. Toque com 2 dedos fora da folha para desfazer aÃ§Ãµes rapidamente.</p>
                </div>
                <button onClick={() => setShowTutorials(false)} className="mt-8 w-full p-4 bg-[var(--accent-color)] rounded-2xl font-black text-white transition-all">ENTENDI TUDO</button>
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== PUBLISH MODAL ========== */}
      <AnimatePresence>
        {showPublishModal && publishProject && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowPublishModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-panel)] w-full max-w-md p-6 rounded-[32px] border border-white/10 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-white mb-6">Publicar Arte</h3>
              
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center shadow-inner">
                  <img src={publishProject.thumbnail} className="w-full h-full object-contain image-pixelated" alt="Preview" />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">TÃ­tulo</label>
                  <input 
                    type="text" 
                    value={publishTitle} 
                    onChange={e => setPublishTitle(e.target.value)} 
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--accent-color)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">DescriÃ§Ã£o (Opcional)</label>
                  <textarea 
                    value={publishDescription} 
                    onChange={e => setPublishDescription(e.target.value)} 
                    rows={3}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--accent-color)] transition-colors resize-none"
                    placeholder="Conte sobre sua criaÃ§Ã£o..."
                  />
                </div>
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setPublishIsPrivate(!publishIsPrivate)}>
                  <div>
                    <span className="block text-sm font-bold text-white">{publishIsPrivate ? 'Privado' : 'PÃºblico (Comunidade)'}</span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {publishIsPrivate ? 'Apenas no seu perfil.' : 'VisÃ­vel na comunidade global.'}
                    </span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${publishIsPrivate ? 'bg-gray-500' : 'bg-[var(--accent-color)]'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all ${publishIsPrivate ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowPublishModal(false)} className="flex-1 p-3 rounded-xl font-bold text-white/50 hover:bg-white/5 transition-colors">Cancelar</button>
                <button 
                  onClick={submitPublishPost} 
                  disabled={publishing || !publishTitle.trim()} 
                  className="flex-1 p-3 bg-[var(--accent-color)] rounded-xl font-black text-white hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {publishing ? <RefreshCw size={16} className="animate-spin" /> : <ShareIcon size={16} />}
                  {publishing ? 'Enviando...' : 'Publicar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== USER PROFILE MODAL ========== */}
      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setViewingUser(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[var(--bg-app)] w-full max-w-4xl h-[85vh] rounded-[40px] border border-white/10 shadow-2xl relative flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setViewingUser(null)} className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-white/10 rounded-full z-20 transition-colors backdrop-blur-md text-white"><X size={20} /></button>
              
              {/* Cover & Header */}
              <div className="relative h-48 bg-gradient-to-r from-[#161622] to-black flex-shrink-0">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(var(--accent-color) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                  <div className="relative w-32 h-32 rounded-[28px] bg-[var(--bg-panel)] border-[4px] border-[var(--bg-app)] shadow-2xl flex items-center justify-center overflow-hidden">
                    <img 
                      src={viewingUser.id === session?.user?.id 
                        ? getAvatarFallback(profileImage, profileName)
                        : getAvatarFallback(viewingUser.avatar_url, viewingUser.display_name || viewingUser.id)} 
                      className="w-full h-full object-cover" 
                      alt="Avatar" 
                      onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(null, viewingUser.display_name || viewingUser.id); }}
                    />
                    {(viewingUser.id === session?.user?.id ? selectedBadge : viewingUser.badge) && (
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-[var(--bg-app)] border-2 border-[var(--bg-app)] flex items-center justify-center shadow-lg z-10">
                        <img 
                          src={badges.find(b => b.id === (viewingUser.id === session?.user?.id ? selectedBadge : viewingUser.badge))?.image || '/badges/free_1.png'} 
                          className="w-7 h-7 object-contain" 
                          alt="Selo" 
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-black text-white">{viewingUser.id === session?.user?.id ? profileName : (viewingUser.display_name || 'Artista')}</h2>
                      {(viewingUser.isFounder || (viewingUser.id === session?.user?.id && profileName.toLowerCase() === 'kelvin')) && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[9px] font-black rounded-md shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse">
                          FUNDADOR
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10 backdrop-blur-sm">
                        <Award size={12} /> {experienceLevels.find(l => l.id === (viewingUser.id === session?.user?.id ? experienceLevel : viewingUser.experience_level))?.label || 'Iniciante'}
                      </span>
                      {(viewingUser.id === session?.user?.id ? isPro : viewingUser.is_pro) && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-yellow-400 text-yellow-400 bg-yellow-400/10 backdrop-blur-sm flex items-center gap-1">
                          <Star size={10} className="fill-yellow-400" /> PRO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Follow Button */}
                {session?.user?.id !== viewingUser.id && (
                  <div className="absolute bottom-4 right-8">
                    <button 
                      onClick={handleFollowToggle}
                      className={`px-6 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-lg flex items-center gap-2 ${
                        isFollowing ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-[var(--accent-color)] text-white hover:brightness-110'
                      }`}
                    >
                      {isFollowing ? <><Check size={16} /> Seguindo</> : <><User size={16} /> Seguir</>}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto mt-20 px-8 pb-8 custom-scrollbar">
                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                  <button 
                    onClick={() => setProfileModalTab('posts')}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${profileModalTab === 'posts' ? 'bg-white/10 shadow-inner scale-105' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                  >
                    <span className="block text-2xl font-black text-white">{viewingUser.postsCount || viewingUserPosts.length}</span>
                    <span className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mt-1">Artes</span>
                  </button>
                  <button 
                    onClick={() => setProfileModalTab('followers')}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${profileModalTab === 'followers' ? 'bg-white/10 shadow-inner scale-105' : 'hover:bg-white/5 opacity-50 hover:opacity-100'}`}
                  >
                    <span className="block text-2xl font-black text-white">{followersCount}</span>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Seguidores</span>
                  </button>
                </div>
                
                {/* Tab Content */}
                {profileModalTab === 'posts' ? (
                  <>
                    <h3 className="text-lg font-black text-white mb-4">Galeria</h3>
                    {viewingUserPosts.length === 0 ? (
                      <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-sm text-[var(--text-muted)] font-bold">Nenhuma arte pÃºblica encontrada.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {viewingUserPosts.map(post => (
                          <div key={post.id} className="bg-[var(--bg-panel)] rounded-2xl border border-white/5 overflow-hidden group">
                            <div className="aspect-square bg-black/20 flex items-center justify-center p-2 cursor-pointer" onClick={() => {
                              const idMatch = post.description?.match(/\[ID:(.*)\|(.*)\]/);
                              setZoomedPost({
                                ...post, 
                                description: post.description?.replace(/\[ID:.*\]/, '').trim(),
                                _embeddedName: idMatch ? idMatch[2] : null
                              });
                            }}>
                              <img src={post.image_url} alt={post.title} className="max-w-full max-h-full object-contain image-pixelated group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="p-3 bg-black/40 backdrop-blur-md">
                              <h4 className="font-bold text-xs text-white truncate">{post.title}</h4>
                              {post.description && <p className="text-[10px] text-gray-400 truncate mt-0.5">{post.description.replace(/\[ID:.*\]/, '').trim()}</p>}
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] text-[var(--text-muted)]">{new Date(post.created_at).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1 text-[var(--text-muted)] text-[10px] font-bold">
                                  <Heart size={10} className="text-red-400" /> {post.likes || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-white mb-4">Seguidores</h3>
                    {viewingUserFollowers.length === 0 ? (
                      <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-sm text-[var(--text-muted)] font-bold">Nenhum seguidor ainda.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {viewingUserFollowers.map(follower => (
                          <div key={follower.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                                <img src={getAvatarFallback(follower.avatar_url, follower.display_name || follower.id)} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(null, follower.display_name || follower.id); }} />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                  {follower.display_name}
                                  {follower.is_pro && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                                </h4>
                              </div>
                            </div>
                            {session?.user?.id !== follower.id && (
                              <button 
                                onClick={() => handleViewUserProfile(follower.id, follower)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors"
                              >
                                Ver Perfil
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== ZOOMED POST LIGHTBOX ========== */}
      <AnimatePresence>
        {zoomedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setZoomedPost(null)}
          >
            <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors backdrop-blur-md">
              <X size={24} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-[95vw] max-h-[85vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={zoomedPost.image_url} 
                alt={zoomedPost.title} 
                className="w-full h-full object-contain image-pixelated shadow-[0_0_80px_rgba(0,0,0,0.5)]"
              />
              
              {/* Marca D'agua com nome do desenhista */}
              <div className="absolute bottom-3 right-3 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 pointer-events-none shadow-lg">
                <span className="text-white/50 text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                  DragonArt · @{zoomedPost._embeddedName || zoomedPost.profiles?.display_name || 'Anônimo'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== PRO FEATURES MODAL ========== */}
      <AnimatePresence>
        {showProModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowProModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-[32px] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-yellow-400/20"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-8 pb-4 text-center">
                <button onClick={() => setShowProModal(false)} className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
                >
                  <Star size={40} className="text-black fill-black" />
                </motion.div>
                <h2 className="text-2xl font-black text-white">Dragon Art PRO</h2>
                <p className="text-sm text-yellow-300/60 font-bold mt-1">Desbloqueie todo o poder criativo</p>
              </div>

              {/* Features List */}
              <div className="px-6 pb-6 space-y-3">
                {[
                  { icon: '📐', title: 'Exportação HD / 4K / 8K / 16K', desc: 'Exporte suas artes em altíssima resolução para impressão e portfólio profissional' },
                  { icon: '✨', title: 'Sem Marca D\'água', desc: 'Suas artes limpas, sem nenhum logo sobreposto nas exportações' },
                  { icon: '🏅', title: 'Selos PRO Exclusivos', desc: 'Selos animados com efeitos de brilho para destacar seu perfil na comunidade' },
                  { icon: '📚', title: 'Camadas Ilimitadas', desc: 'Sem limite de layers por frame, trabalhe com composições complexas' },
                  { icon: '🎬', title: 'GIF HD / 4K', desc: 'Exporte suas animações em alta definição com qualidade profissional' },
                  { icon: '🖼️', title: 'Sprite Sheet HD', desc: 'Perfeito para game devs que precisam de assets em alta resolução' },
                  { icon: '🎨', title: 'Efeitos Avançados', desc: 'Acesso a todos os filtros e efeitos de imagem premium' },
                  { icon: '⚡', title: 'Prioridade de Suporte', desc: 'Atendimento prioritário e acesso antecipado a novas features' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{feature.icon}</span>
                    <div>
                      <h4 className="font-black text-white text-sm">{feature.title}</h4>
                      <p className="text-[11px] text-white/40 font-bold mt-0.5 leading-relaxed">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-6 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    window.open(CONFIG.STRIPE_PRO_LINK, '_blank');
                    setShowProModal(false);
                  }}
                  className="w-full p-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-2xl text-black font-black text-lg shadow-[0_0_30px_rgba(251,191,36,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <Star size={24} className="fill-black" /> ASSINAR PRO AGORA
                </motion.button>
                <p className="text-center text-[10px] text-white/20 font-bold mt-3">Pagamento seguro via Stripe • Cancele quando quiser</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== THEME PREVIEW OVERLAY ========== */}
      <AnimatePresence>
        {previewTheme && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex flex-col"
            style={{ backgroundColor: previewTheme.colors.bgApp }}
          >
            {/* Simulated editor background to show how the theme looks */}
            <div className="flex-1 relative overflow-hidden">
              {/* Top bar simulation */}
              <div className="h-12 flex items-center px-4 gap-3" style={{ backgroundColor: previewTheme.colors.bgSurface, borderBottom: `1px solid ${previewTheme.colors.borderSubtle}` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: previewTheme.colors.accentColor }} />
                <div className="h-2 w-20 rounded-full" style={{ backgroundColor: previewTheme.colors.bgElement }} />
                <div className="flex-1" />
                <div className="h-2 w-16 rounded-full" style={{ backgroundColor: previewTheme.colors.bgElement }} />
              </div>

              {/* Canvas area */}
              <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: previewTheme.colors.bgApp }}>
                {/* White drawing sheet */}
                <div className="w-[280px] h-[280px] bg-white rounded-lg shadow-2xl relative" style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${previewTheme.colors.borderSubtle}` }}>
                  {/* Simple pixel art grid preview */}
                  <div className="absolute inset-4 grid grid-cols-8 grid-rows-8 gap-px opacity-10">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="bg-gray-300" />
                    ))}
                  </div>
                  {/* Simple pixel art drawing */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="120" height="120" viewBox="0 0 8 8" style={{ imageRendering: 'pixelated' }}>
                      {/* Dragon silhouette */}
                      <rect x="3" y="0" width="2" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="2" y="1" width="4" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="1" y="2" width="6" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="2" y="3" width="4" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="3" y="4" width="2" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="2" y="5" width="1" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="5" y="5" width="1" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="1" y="6" width="2" height="1" fill={previewTheme.colors.accentColor} />
                      <rect x="5" y="6" width="2" height="1" fill={previewTheme.colors.accentColor} />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom panel simulation */}
              <div className="h-14 flex items-center justify-center gap-4 px-4" style={{ backgroundColor: previewTheme.colors.bgPanel, borderTop: `1px solid ${previewTheme.colors.borderSubtle}` }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-lg" style={{ backgroundColor: previewTheme.colors.bgElement }} />
                ))}
              </div>

              {/* Theme name badge */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full shadow-xl flex items-center gap-2"
                style={{ backgroundColor: previewTheme.colors.bgPanel, border: `1px solid ${previewTheme.colors.borderStrong}` }}
              >
                <Palette size={14} style={{ color: previewTheme.colors.accentColor }} />
                <span className="text-sm font-black" style={{ color: previewTheme.colors.textPrimary }}>{previewTheme.name}</span>
              </motion.div>
            </div>

            {/* Purchase overlay at bottom */}
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 p-5 pb-8"
              style={{ background: `linear-gradient(to top, ${previewTheme.colors.bgApp} 60%, transparent)` }}
            >
              <div className="max-w-md mx-auto flex flex-col gap-3">
                <div className="text-center">
                  <p className="text-xs font-bold opacity-60" style={{ color: previewTheme.colors.textSecondary }}>Este tema requer</p>
                  <h3 className="text-xl font-black flex items-center justify-center gap-2" style={{ color: previewTheme.colors.textPrimary }}>
                    <Star size={20} className="fill-yellow-400 text-yellow-400" /> Dragon Art PRO
                  </h3>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    cancelThemePreview();
                    setPreviewTheme(null);
                    setShowSettings(false);
                    setShowProModal(true);
                  }}
                  className="w-full p-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-2xl text-black font-black text-base shadow-[0_0_30px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Star size={18} className="fill-black" /> DESBLOQUEAR TODOS OS TEMAS
                </motion.button>
                <button
                  onClick={cancelThemePreview}
                  className="w-full p-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 hover:bg-white/10"
                  style={{ color: previewTheme.colors.textMuted }}
                >
                  <X size={16} /> Voltar às configurações
                </button>
              </div>
            </motion.div>

            {/* Close button at top */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={cancelThemePreview}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ backgroundColor: `${previewTheme.colors.bgPanel}cc`, color: previewTheme.colors.textPrimary }}
            >
              <X size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAvatarPicker(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--bg-panel)] rounded-[40px] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Escolha seu Avatar</h3>
                  <p className="text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest mt-0.5">Fotos Profissionais & Dinâmicas</p>
                </div>
                <button onClick={() => setShowAvatarPicker(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {/* Standard Avatars */}
                <div className="mb-8">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={14} /> Avatares Padrão
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {avatars.map((url, i) => (
                      <motion.button 
                        key={i} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        onClick={async () => {
                          setProfileImage(url);
                          setShowAvatarPicker(false);
                          sound.playClick();
                          
                          // Optimistic update for community posts
                          if (session?.user?.id) {
                            setCommunityPosts(currentPosts => 
                              currentPosts.map(post => 
                                post.user_id === session.user.id 
                                  ? { ...post, profiles: { ...post.profiles, avatar_url: url } } 
                                  : post
                              )
                            );
                            
                            await supabase.from('profiles').upsert({
                              id: session.user.id,
                              avatar_url: url,
                              updated_at: new Date()
                            });
                            await supabase.auth.updateUser({ data: { avatar_url: url } });
                          }
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                          profileImage === url ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-color)]/20' : 'border-white/5 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} className="w-full h-full object-cover" />
                        {profileImage === url && <div className="absolute inset-0 bg-[var(--accent-color)]/20 flex items-center justify-center"><Check className="text-white bg-[var(--accent-color)] rounded-full p-1" size={16} /></div>}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* PRO Avatars */}
                <div className="mb-4">
                  <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star size={14} className="fill-yellow-500" /> Avatares Animados PRO
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {proAvatars.map((url, i) => (
                      <motion.button 
                        key={i} 
                        whileHover={{ scale: isPro ? 1.05 : 1 }} 
                        whileTap={{ scale: isPro ? 0.95 : 1 }} 
                        onClick={async () => { 
                          if (isPro) {
                            setProfileImage(url); 
                            setShowAvatarPicker(false);
                            sound.playClick(); 
                            
                            // Optimistic update for community posts
                            if (session?.user?.id) {
                              setCommunityPosts(currentPosts => 
                                currentPosts.map(post => 
                                  post.user_id === session.user.id 
                                    ? { ...post, profiles: { ...post.profiles, avatar_url: url } } 
                                    : post
                                )
                              );
                              
                              await supabase.from('profiles').upsert({
                                id: session.user.id,
                                avatar_url: url,
                                updated_at: new Date()
                              });
                              await supabase.auth.updateUser({ data: { avatar_url: url } });
                            }
                          } else {
                            alert('Este avatar animado é exclusivo para membros PRO! 🌟');
                          }
                        }}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                          profileImage === url ? 'border-yellow-500 ring-4 ring-yellow-500/20' : 'border-white/5'
                        } ${!isPro ? 'grayscale opacity-40' : 'hover:opacity-100'}`}
                      >
                        <img src={url} className="w-full h-full object-cover" />
                        {!isPro && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Lock size={16} className="text-white" />
                          </div>
                        )}
                        {profileImage === url && <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center"><Check className="text-white bg-yellow-500 rounded-full p-1" size={16} /></div>}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase text-center max-w-xs">Essas fotos aparecem no seu perfil e nas suas artes publicadas na comunidade.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
