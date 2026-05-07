import React from 'react';
import { Undo, Redo, Layers as LayersIcon, Film, Grid, X, BookOpen, Settings, EyeOff, Eye, Play, Pause, Box, Home, Grid3X3, Circle, Square, ZoomIn, Image as ImageIcon, Trash2, Lock, Unlock, FlipHorizontal, FlipVertical, Plus, Compass, FolderHeart, Trash, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolButton } from './ToolButton';

interface TopBarProps {
  shortcuts: Record<string, string>;
  activePanel: string | null;
  togglePanel: (panel: string) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  uiVisible: boolean;
  setUiVisible: (visible: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showGridSettings: boolean;
  setShowGridSettings: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  gridOpacity: number;
  setGridOpacity: (opacity: number) => void;
  isGridLongPress: React.MutableRefObject<boolean>;
  longPressTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  handleToolPointerUp: () => void;
  setShowTutorials: (show: boolean) => void;
  uiScale: number;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean | ((prev: boolean) => boolean)) => void;
  is3D?: boolean;
  setIs3D?: (v: boolean | ((prev: boolean) => boolean)) => void;
  show3DSettings: boolean;
  setShow3DSettings: (show: boolean) => void;
  rotation: number;
  setRotation: (r: number) => void;
  rotationX: number;
  setRotationX: (r: number) => void;
  rotationY: number;
  setRotationY: (r: number) => void;
  autoRotate3D?: boolean;
  setAutoRotate3D?: (v: boolean | ((prev: boolean) => boolean)) => void;
  autoRotateSpeed?: number;
  setAutoRotateSpeed?: (v: number) => void;
  onBack?: () => void;
  showUiToggle?: boolean;
  gridMode: 'lines' | 'dots' | 'checkerboard';
  setGridMode: (v: 'lines' | 'dots' | 'checkerboard') => void;
  gridOnlyOnZoom: boolean;
  setGridOnlyOnZoom: (v: boolean) => void;
  sound: { playClick: () => void };
  referenceImages: ({
    id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    visible: boolean;
    selected: boolean;
    locked?: boolean;
    flipX?: boolean;
    flipY?: boolean;
  })[];
  setReferenceImages: (images: any[] | ((prev: any[]) => any[])) => void;
  handleImportReference: (e: React.ChangeEvent<HTMLInputElement>) => void;
  guideLines: any[];
  setGuideLines: (lines: any[] | ((prev: any[]) => any[])) => void;
  showGuidePanel: boolean;
  setShowGuidePanel: (show: boolean) => void;
  guideLinesVisible: boolean;
  setGuideLinesVisible: (visible: boolean) => void;
  guideColor: string;
  setGuideColor: (color: string) => void;
  guideOpacity: number;
  setGuideOpacity: (opacity: number) => void;
  guideGroups: any[];
  setGuideGroups: (groups: any[] | ((prev: any[]) => any[])) => void;
  deleteAllFrames: () => void;
  showBatchActions: boolean;
  setShowBatchActions: (show: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  shortcuts,
  activePanel,
  togglePanel,
  handleUndo,
  handleRedo,
  uiVisible,
  setUiVisible,
  showGrid,
  setShowGrid,
  showGridSettings,
  setShowGridSettings,
  gridSize,
  setGridSize,
  gridOpacity,
  setGridOpacity,
  isGridLongPress,
  longPressTimer,
  handleToolPointerUp,
  setShowTutorials,
  uiScale,
  isPlaying,
  setIsPlaying,
  is3D,
  setIs3D,
  show3DSettings,
  setShow3DSettings,
  rotation,
  setRotation,
  rotationX,
  setRotationX,
  rotationY,
  setRotationY,
  onBack,
  showUiToggle = true,
  gridMode,
  setGridMode,
  gridOnlyOnZoom,
  setGridOnlyOnZoom,
  sound,
  referenceImages,
  setReferenceImages,
  handleImportReference,
  autoRotate3D,
  setAutoRotate3D,
  autoRotateSpeed,
  setAutoRotateSpeed,
  guideLines,
  setGuideLines,
  showGuidePanel,
  setShowGuidePanel,
  guideLinesVisible,
  setGuideLinesVisible,
  guideColor,
  setGuideColor,
  guideOpacity,
  setGuideOpacity,
  guideGroups,
  setGuideGroups,
  deleteAllFrames,
  showBatchActions,
  setShowBatchActions,
}) => {
  const [showRefSettings, setShowRefSettings] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <div className={`top-bar absolute top-0 left-0 right-0 h-auto landscape:h-full landscape:w-auto landscape:min-w-[4.5rem] landscape:right-auto flex items-center px-1 py-1 landscape:px-1 landscape:py-2 z-50 transition-all duration-500 landscape:max-h-screen landscape:overflow-y-auto overflow-x-auto hide-scrollbar ${!uiVisible ? '' : 'bg-[var(--bg-panel)]/60 backdrop-blur-xl border-b landscape:border-b-0 landscape:border-r border-white/5'}`}>
        <div className="flex flex-nowrap items-center landscape:flex-col gap-3.5 landscape:gap-2.5 px-6 landscape:px-0 landscape:py-6 w-full justify-start pointer-events-auto landscape:min-h-max pb-8 landscape:pb-0">
            {/* UI Toggle Button - Always Visible and Clickable */}
            {showUiToggle && (
              <ToolButton 
                id="uiToggle" 
                icon={uiVisible ? <EyeOff size={20} /> : <Eye size={20} />} 
                label={uiVisible ? "Ocultar UI" : "Mostrar UI"} 
                tooltip="Esconda ou mostre todos os botões da interface para ver melhor a sua arte."
                active={!uiVisible}
                onClick={() => setUiVisible(!uiVisible)} 
                className={`transition-all duration-300 ${!uiVisible ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/50 scale-110' : ''}`}
              />
            )}

            {/* Action Buttons Group - These hide with uiVisible */}
            <div className={`flex flex-nowrap justify-center items-center landscape:flex-col gap-1.5 transition-all duration-300 ${!uiVisible ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
                {onBack && (
                  <ToolButton id="back" icon={<Home size={20} />} label="Menu" tooltip="Voltar para o menu inicial." onClick={onBack} />
                )}
                <ToolButton id="undo" shortcutKey={`Ctrl+${shortcuts.undo.toUpperCase()}`} icon={<Undo size={20} />} label="Desfazer" tooltip="Volte a ação anterior no histórico de edição." onClick={handleUndo} />
                <ToolButton id="redo" shortcutKey={`Ctrl+${shortcuts.redo.toUpperCase()}`} icon={<Redo size={20} />} label="Refazer" tooltip="Avance para a próxima ação no histórico." onClick={handleRedo} />
                <ToolButton id="layers" icon={<LayersIcon size={20} />} label="Camadas" tooltip="Organize seu desenho em camadas independentes. Trabalhe no fundo sem afetar a frente." active={activePanel === 'layers'} onClick={() => togglePanel('layers')} />
                <ToolButton id="frames" icon={<Film size={20} />} label="Quadros" tooltip="Crie sequências de quadros para montar animações pixel a pixel." active={activePanel === 'frames'} onClick={() => togglePanel('frames')} />
                {setIsPlaying && (
                  <ToolButton 
                    id="playPause" 
                    icon={isPlaying ? <Pause size={20} /> : <Play size={20} />} 
                    label={isPlaying ? "Pausar" : "Tocar"} 
                    tooltip="Visualize a animação rodando diretamente na folha de desenho."
                    active={isPlaying} 
                    onClick={() => setIsPlaying(prev => !prev)} 
                  />
                )}
                <div className="relative">
                  {setIs3D && (
                    <ToolButton 
                      id="3dtoggle" 
                      icon={<Box size={20} />} 
                      label="3D / Girar" 
                      tooltip="Muda a perspectiva. Toque novamente para abrir os controles de rotação."
                      active={is3D || show3DSettings} 
                      onClick={() => {
                        sound.playClick();
                        if (!is3D) {
                          setIs3D(true);
                        } else if (is3D && !show3DSettings) {
                          setShow3DSettings(true);
                        } else {
                          setIs3D(false);
                          setShow3DSettings(false);
                        }
                      }} 
                    />
                  )}
                  

                </div>
                <div className="relative">
                  <ToolButton 
                    id="gridToggle" 
                    shortcutKey={shortcuts.grid}
                    icon={<Grid size={20} />} 
                    label="Malha" 
                    tooltip="1° toque: ativa malha. 2° toque: abre config. 3° toque: desativa tudo."
                    active={showGrid || showGridSettings} 
                    onClick={() => {
                       sound.playClick();
                       if (!showGrid) {
                         // 1st click: activate grid
                         setShowGrid(true);
                         setShowGridSettings(false);
                       } else if (showGrid && !showGridSettings) {
                         // 2nd click: open settings panel
                         setShowGridSettings(true);
                       } else {
                         // 3rd click: close settings and deactivate grid
                         setShowGridSettings(false);
                         setShowGrid(false);
                       }
                    }}
                  />
                </div>
                <div className="relative">
                  <ToolButton 
                    id="guideLines" 
                    icon={<Compass size={20} />} 
                    label="Guias" 
                    tooltip="Linhas de ajuda para proporção e perspectiva."
                    active={showGuidePanel || guideLinesVisible} 
                    onClick={() => {
                      sound.playClick();
                      if (!guideLinesVisible) {
                        setGuideLinesVisible(true);
                        setShowGuidePanel(false);
                      } else if (guideLinesVisible && !showGuidePanel) {
                        setShowGuidePanel(true);
                      } else {
                        setShowGuidePanel(false);
                        setGuideLinesVisible(false);
                      }
                    }}
                  />
                </div>
                  <ToolButton 
                    id="reference" 
                    icon={<ImageIcon size={20} />} 
                    label="Guia" 
                    tooltip="Ative ou gerencie suas imagens de referência (decalque)." 
                    active={referenceImages.some(r => r.visible) || showRefSettings} 
                    onClick={() => {
                      if (referenceImages.length > 0) setShowRefSettings(!showRefSettings);
                      else fileInputRef.current?.click();
                    }} 
                  />
                  <ToolButton id="resize" icon={<Settings size={20} />} label="Ajustes" tooltip="Altere tamanho da folha, imagem de fundo, música e escala da interface." active={activePanel === 'resize'} onClick={() => togglePanel('resize')} />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImportReference} />
            </div>

        </div>
      </div>

      {/* 3D Settings Modal */}
      <AnimatePresence>
        {show3DSettings && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            className="fixed top-20 landscape:top-1/2 left-1/2 -translate-x-1/2 landscape:-translate-y-1/2 bg-[var(--bg-panel)] backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 p-6 w-[280px] z-[101] flex flex-col gap-6 text-[var(--text-primary)] cursor-move"
            style={{ touchAction: 'none' }}
            onPointerDown={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent-color)]/20 rounded-xl text-[var(--accent-color)] shadow-inner">
                  <Box size={20} />
                </div>
                <h3 className="font-bold text-sm text-white tracking-wide uppercase">Visão 3D</h3>
              </div>
              <button 
                onClick={() => setShow3DSettings(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              
              {/* Toggle Rotação Automática */}
              <div 
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border-2 ${autoRotate3D ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' : 'bg-black/40 border-transparent hover:bg-black/60'}`}
                onClick={() => {
                  sound.playClick();
                  const newValue = !autoRotate3D;
                  if (setAutoRotate3D) setAutoRotate3D(newValue);
                  if (newValue) {
                    setRotation(0);
                    setRotationX(0);
                    // O Y vai começar a girar automaticamente a partir da posição atual
                  }
                }}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${autoRotate3D ? 'text-white' : 'text-gray-400'}`}>Giro Automático</span>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${autoRotate3D ? 'bg-[var(--accent-color)]' : 'bg-gray-600'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${autoRotate3D ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Slider de Velocidade */}
              <div className={`flex flex-col gap-3 transition-opacity ${autoRotate3D ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Velocidade</span>
                  <span className="text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-0.5 rounded border border-[var(--accent-color)]/20 text-[10px]">{autoRotateSpeed}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={autoRotateSpeed} 
                  onChange={(e) => setAutoRotateSpeed?.(Number(e.target.value))} 
                  className="w-full accent-[var(--accent-color)]" 
                />
              </div>
              
              <button 
                onClick={() => { setRotation(0); setRotationX(50); setRotationY(-30); setAutoRotate3D?.(false); }}
                className="mt-1 text-[10px] uppercase font-bold tracking-wider py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 active:scale-95 text-gray-300"
              >
                Resetar Posição
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Settings Modal - Centered globally */}
      <AnimatePresence>
        {showGridSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGridSettings(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              drag
              dragMomentum={false}
              initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
              className="fixed top-1/2 left-1/2 -translate-y-1/2 bg-[var(--bg-panel)] backdrop-blur-2xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 p-7 w-85 z-[101] flex flex-col gap-7 text-[var(--text-primary)] cursor-move"
              style={{ touchAction: 'none' }}
              onPointerDown={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[var(--accent-color)]/20 rounded-2xl text-[var(--accent-color)] shadow-inner">
                    <Grid size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tight leading-none">Malha Pro</h4>
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em]">Configuração de Grid</span>
                  </div>
                </div>
                <button onClick={() => setShowGridSettings(false)} className="text-[var(--text-muted)] hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Grid ON/OFF Toggle */}
              <div 
                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border-2 ${showGrid ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]' : 'bg-black/40 border-transparent hover:bg-black/60'}`}
                onClick={() => { sound.playClick(); setShowGrid(!showGrid); }}
              >
                <span className={`text-xs font-bold uppercase tracking-wider ${showGrid ? 'text-white' : 'text-gray-400'}`}>Malha Ativa</span>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${showGrid ? 'bg-[var(--accent-color)]' : 'bg-gray-600'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showGrid ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Estilo da Malha</div>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
                    {[
                      { id: 'lines', label: 'Linhas' },
                      { id: 'dots', label: 'Pontos' },
                      { id: 'checkerboard', label: 'Xadrez' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => { sound.playClick(); setGridMode(mode.id as any); }}
                        className={`py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${gridMode === mode.id ? 'bg-[var(--accent-color)] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                    <span>Calibre</span>
                    <span className="text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-0.5 rounded-lg border border-[var(--accent-color)]/20">{gridSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="128" step="1"
                    value={gridSize} 
                    onChange={e => setGridSize(parseInt(e.target.value))}
                    className="w-full accent-[var(--accent-color)] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                    <span>Visibilidade</span>
                    <span className="text-white bg-white/10 px-3 py-0.5 rounded-lg border border-white/5">{Math.round(gridOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" max="1" step="0.05"
                    value={gridOpacity} 
                    onChange={e => setGridOpacity(parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent-color)] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <button 
                  onClick={() => setShowGridSettings(false)}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-xs"
                >
                  Concluir
                </button>
              </div>
            </motion.div>

          </>
        )}
      </AnimatePresence>
      {/* Reference Image Settings Popover */}
      <AnimatePresence>
        {showRefSettings && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setShowRefSettings(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-16 right-4 w-80 bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[101] overflow-hidden"
              style={{ top: 'calc(4rem + 10px)' }}
            >
              <div className="p-5 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-[var(--accent-color)]" />
                    <span className="text-xs font-black uppercase tracking-tight">Gerenciar Guias</span>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-[var(--accent-color)] text-white rounded-xl shadow-lg shadow-[var(--accent-color)]/20 active:scale-90 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
                  {referenceImages.map((ref) => (
                    <div 
                      key={ref.id} 
                      onClick={() => setReferenceImages(prev => prev.map(r => ({ ...r, selected: r.id === ref.id })))}
                      className={`flex flex-col gap-3 p-3 rounded-2xl border transition-all ${ref.selected ? 'bg-white/10 border-[var(--accent-color)]/50 shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/8'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                          <img src={ref.url} alt="Ref" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-black text-white uppercase truncate">Ref: {ref.id.slice(-4)}</div>
                          <div className="text-[8px] text-gray-500 font-bold uppercase">{ref.width.toFixed(0)}x{ref.height.toFixed(0)}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setReferenceImages(prev => prev.map(r => r.id === ref.id ? { ...r, visible: !r.visible } : r));
                            }}
                            className={`p-2 rounded-lg transition-all ${ref.visible ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white bg-white/5'}`}
                          >
                            {ref.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setReferenceImages(prev => prev.filter(r => r.id !== ref.id));
                              if (referenceImages.length <= 1) setShowRefSettings(false);
                            }}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {ref.selected && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex flex-col gap-3 pt-3 border-t border-white/10"
                        >
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReferenceImages(prev => prev.map(r => r.id === ref.id ? { ...r, locked: !r.locked } : r));
                              }}
                              className={`py-1.5 rounded-lg flex items-center justify-center gap-2 text-[8px] font-black uppercase transition-all border ${ref.locked ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'}`}
                            >
                              {ref.locked ? <Lock size={12} /> : <Unlock size={12} />} 
                              {ref.locked ? "Bloqueada" : "Livre"}
                            </button>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReferenceImages(prev => prev.map(r => r.id === ref.id ? { ...r, flipX: !r.flipX } : r));
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white flex items-center justify-center border border-white/10"
                              >
                                <FlipHorizontal size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReferenceImages(prev => prev.map(r => r.id === ref.id ? { ...r, flipY: !r.flipY } : r));
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white flex items-center justify-center border border-white/10"
                              >
                                <FlipVertical size={12} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[8px] font-black text-gray-500 uppercase tracking-widest">
                              <span>Opacidade</span>
                              <span className="text-[var(--accent-color)]">{Math.round(ref.opacity * 100)}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.05" max="1" step="0.05"
                              value={ref.opacity} 
                              onChange={(e) => {
                                e.stopPropagation();
                                setReferenceImages(prev => prev.map(r => r.id === ref.id ? { ...r, opacity: parseFloat(e.target.value) } : r));
                              }}
                              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--accent-color)]"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-[7px] text-center text-gray-600 font-bold uppercase tracking-widest">
                  Selecione uma imagem para ajustar posição e escala na tela
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Guide Lines Panel */}
      <AnimatePresence>
        {showGuidePanel && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            className="fixed top-24 landscape:top-1/2 left-1/2 -translate-x-1/2 landscape:-translate-y-1/2 bg-[var(--bg-panel)] backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 w-[320px] z-[101] flex flex-col gap-4 text-[var(--text-primary)] cursor-move"
            style={{ touchAction: 'none' }}
            onPointerDown={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 rounded-2xl text-cyan-400">
                  <Compass size={22} />
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase leading-none">Linhas Guia</h4>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Perspectiva & Apoio</span>
                </div>
              </div>
              <button onClick={() => setShowGuidePanel(false)} className="text-[var(--text-muted)] hover:text-white p-2 bg-white/5 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {/* 3-in-1 Unified Batch Management */}
              <button 
                onClick={() => {
                  if (window.confirm("Deseja limpar TODAS as linhas guia da tela?")) {
                    setGuideLines([]);
                    sound.playClick();
                  }
                }}
                className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform">
                    <Compass size={16} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase">Limpar Guias</span>
                    <span className="text-[8px] font-bold text-white/30 uppercase">Remove tudo da tela</span>
                  </div>
                </div>
                <Trash2 size={14} className="text-white/20 group-hover:text-yellow-400" />
              </button>

              {/* Opacity Slider - Moved here */}
              <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase opacity-60">Opacidade Global</span>
                  <span className="text-[10px] font-bold text-cyan-400">{Math.round(guideOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1" step="0.05"
                  value={guideOpacity}
                  onChange={(e) => setGuideOpacity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 rounded-lg bg-white/10"
                />
              </div>

              {guideGroups.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase opacity-60 px-1">Grupos Salvos</span>
                  <div className="flex flex-wrap gap-2">
                    {guideGroups.map(group => (
                      <div key={group.id} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 p-1.5 transition-all">
                        <button 
                          onClick={() => setGuideLines(group.lines)}
                          className="text-[9px] font-bold px-1"
                        >
                          {group.name}
                        </button>
                        <button 
                          onClick={() => setGuideGroups(prev => prev.filter(g => g.id !== group.id))}
                          className="p-1 hover:text-red-400"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-xs font-bold">Visibilidade</span>
                <button 
                  onClick={() => setGuideLinesVisible(!guideLinesVisible)}
                  className={`p-2 rounded-xl transition-all ${guideLinesVisible ? 'bg-cyan-500 text-white' : 'bg-white/10 text-[var(--text-muted)]'}`}
                >
                  {guideLinesVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setGuideLines(prev => [...prev, { id: Date.now().toString(), type: 'horizontal', position: 50, color: guideColor }])}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <div className="w-6 h-[2px] bg-[var(--text-muted)] group-hover:bg-cyan-400" />
                  <span className="text-[10px] font-bold">Hori.</span>
                </button>
                <button 
                  onClick={() => setGuideLines(prev => [...prev, { id: Date.now().toString(), type: 'vertical', position: 50, color: guideColor }])}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <div className="w-[2px] h-6 bg-[var(--text-muted)] group-hover:bg-cyan-400" />
                  <span className="text-[10px] font-bold">Vert.</span>
                </button>
                <button 
                  onClick={() => setGuideLines(prev => [...prev, { id: Date.now().toString(), type: 'angle', position: 45, color: guideColor, originX: 50, originY: 50 }])}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <Compass size={20} className="text-[var(--text-muted)] group-hover:text-cyan-400" />
                  <span className="text-[10px] font-bold">Ângulo</span>
                </button>
              </div>

              {guideLines.map(guide => (
                <div key={guide.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-cyan-400">
                      {guide.type === 'horizontal' ? 'Horizontal' : guide.type === 'vertical' ? 'Vertical' : 'Perspectiva'}
                    </span>
                    <button 
                      onClick={() => setGuideLines(prev => prev.filter(g => g.id !== guide.id))}
                      className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-bold opacity-60 uppercase">
                      <span>{guide.type === 'angle' ? 'Ângulo' : 'Posição'}</span>
                      <span>{guide.position}{guide.type === 'angle' ? '°' : '%'}</span>
                    </div>
                    <input 
                      type="range" min={guide.type === 'angle' ? "0" : "0"} max={guide.type === 'angle' ? "360" : "100"}
                      value={guide.position}
                      onChange={(e) => setGuideLines(prev => prev.map(g => g.id === guide.id ? { ...g, position: parseInt(e.target.value) } : g))}
                      className="w-full accent-cyan-500 h-1.5 rounded-lg bg-white/10"
                    />
                  </div>
                  {guide.type === 'angle' && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <span className="text-[9px] font-bold opacity-60">ORIGEM X</span>
                        <input 
                          type="range" min="0" max="100" value={guide.originX || 50}
                          onChange={(e) => setGuideLines(prev => prev.map(g => g.id === guide.id ? { ...g, originX: parseInt(e.target.value) } : g))}
                          className="w-full accent-cyan-500 h-1"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-[9px] font-bold opacity-60">ORIGEM Y</span>
                        <input 
                          type="range" min="0" max="100" value={guide.originY || 50}
                          onChange={(e) => setGuideLines(prev => prev.map(g => g.id === guide.id ? { ...g, originY: parseInt(e.target.value) } : g))}
                          className="w-full accent-cyan-500 h-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase opacity-60">Cor das Guias</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="color" value={guideColor} 
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setGuideColor(newColor);
                    setGuideLines(prev => prev.map(g => ({ ...g, color: newColor })));
                  }}
                  className="w-full h-8 bg-transparent border-none rounded cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
