import React from 'react';
import { Pencil, Eraser, PaintBucket, Palette, Pipette, Video, Folder, Minus, Square, Circle, Hand, Type, Trash2, Droplet, Wind, Cloud, Sun, Moon, Wand2, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolButton } from './ToolButton';
import { sound } from '../../sound';

interface BottomBarProps {
  shortcuts: Record<string, string>;
  currentTool: string;
  selectTool: (tool: any) => void;
  activePanel: string | null;
  togglePanel: (panel: string) => void;
  closePanelsExceptFrames: () => void;
  handleToolPointerDown: (tool: any) => void;
  handleToolPointerUp: () => void;
  currentColor: string;
  currentShape: 'line' | 'rect' | 'circle';
  selectType: 'rect' | 'magic-wand' | 'lasso';
  clearCurrentLayer: () => void;
  isTrashLongPress: React.MutableRefObject<boolean>;
  trashLongPressTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  setShowDeletedHistory: (show: boolean) => void;
  uiVisible: boolean;
  isToolLongPress: React.MutableRefObject<boolean>;
  uiScale: number;
  brushSize: number;
  setBrushSize: (size: number | ((prev: number) => number)) => void;
  lightingEffect: 'none' | 'lighten' | 'darken';
  selectEffect: (effect: 'none' | 'lighten' | 'darken') => void;
  lightingIntensity: number;
  selectIntensity: (val: number) => void;
  showLightingMenu: boolean;
  setShowLightingMenu: (val: boolean) => void;
  lightingLongPress: React.MutableRefObject<NodeJS.Timeout | null>;
  toggleBatchActions: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  shortcuts,
  currentTool,
  selectTool,
  activePanel,
  togglePanel,
  closePanelsExceptFrames,
  handleToolPointerDown,
  handleToolPointerUp,
  currentColor,
  currentShape,
  selectType,
  clearCurrentLayer,
  isTrashLongPress,
  trashLongPressTimer,
  setShowDeletedHistory,
  uiVisible,
  isToolLongPress,
  uiScale,
  brushSize,
  setBrushSize,
  lightingEffect,
  selectEffect,
  lightingIntensity,
  selectIntensity,
  showLightingMenu,
  setShowLightingMenu,
  lightingLongPress,
  toggleBatchActions,
}) => {
  const [draggingTool, setDraggingTool] = React.useState<string | null>(null);
  const [showEffectsGroup, setShowEffectsGroup] = React.useState(false);
  const dragStartY = React.useRef<number | null>(null);
  const dragStartPos = React.useRef<{ x: number, y: number } | null>(null);
  const dragStartSize = React.useRef<number>(1);
  const isDraggingSize = React.useRef<boolean>(false);

  const handleSizeDragStart = (id: string, e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartSize.current = brushSize;
    isDraggingSize.current = false;
    setDraggingTool(id);
  };

  const handleSizeDragMove = (e: React.PointerEvent) => {
    if (dragStartPos.current === null) return;
    
    // Calculate delta based on orientation
    const isLandscape = window.innerWidth > window.innerHeight;
    const delta = isLandscape 
      ? e.clientX - dragStartPos.current.x 
      : dragStartPos.current.y - e.clientY;

    if (Math.abs(delta) > 10) {
      isDraggingSize.current = true;
      isToolLongPress.current = true; // Prevent click action
      
      const sizeChange = Math.floor(delta / 12); // Change size every 12px
      const newSize = Math.max(1, Math.min(64, dragStartSize.current + sizeChange));
      
      if (newSize !== brushSize) {
        setBrushSize(newSize);
        if (window.navigator.vibrate) window.navigator.vibrate(5);
      }
    }
  };

  const handleSizeDragEnd = () => {
    dragStartY.current = null;
    dragStartPos.current = null;
    setDraggingTool(null);
    // We keep isToolLongPress as true for a short moment to prevent the onClick from firing
    setTimeout(() => {
      isDraggingSize.current = false;
    }, 50);
  };

  return (
    <div className={`bottom-bar absolute bottom-0 left-0 right-0 landscape:left-auto landscape:h-full landscape:w-auto landscape:min-w-[4.5rem] landscape:flex-col bg-[var(--bg-panel)]/60 backdrop-blur-xl border-t landscape:border-t-0 landscape:border-l border-white/5 flex items-center px-1 py-1.5 landscape:px-1 landscape:py-2 z-50 overflow-x-auto hide-scrollbar transition-all duration-300 ${!uiVisible ? 'opacity-20 pointer-events-none' : ''}`}>
      <div className="flex flex-nowrap items-center landscape:flex-col gap-3 landscape:gap-5 px-6 landscape:px-0 landscape:py-6 min-w-max w-full justify-start pointer-events-auto landscape:min-h-max pb-[env(safe-area-inset-bottom)] landscape:pb-2 pt-6 landscape:pt-2 relative">

        <ToolButton 
          id="pencil" 
          shortcutKey={shortcuts.pencil}
          icon={<Pencil size={20} />} 
          label="Lápis" 
          tooltip="Desenhe pixel a pixel. Segure o dedo na tela enquanto desenha para alternar entre Lápis e Borracha. Toque novamente para abrir pincéis."
          active={currentTool === 'pencil'} 
          onClick={() => { 
            if (currentTool === 'pencil') togglePanel('pencil'); 
            else { selectTool('pencil'); closePanelsExceptFrames(); } 
          }} 
        />
        <ToolButton 
          id="eraser" 
          shortcutKey={shortcuts.eraser}
          icon={<Eraser size={20} />} 
          label="Borracha" 
          tooltip="Apague pixels da camada atual. Toque novamente para ajustar o tamanho da borracha."
          active={currentTool === 'eraser'} 
          onClick={() => { 
            if (currentTool === 'eraser') togglePanel('pencil'); 
            else { selectTool('eraser'); closePanelsExceptFrames(); } 
          }} 
        />
        <ToolButton 
          id="fill" 
          shortcutKey={shortcuts.fill} 
          icon={<PaintBucket size={20} />} 
          label="Balde" 
          tooltip="Preenche áreas inteiras com a cor selecionada. Toque novamente para opções de preenchimento."
          active={currentTool === 'fill' || currentTool === 'erase-fill'} 
          onClick={() => { if (currentTool === 'fill' || currentTool === 'erase-fill') togglePanel('fill'); else { selectTool('fill'); closePanelsExceptFrames(); } }} 
        />

        <ToolButton 
          id="colors" 
          icon={<Palette size={22} />} 
          label="Cores" 
          tooltip="Abra a roda de cores e paletas temáticas. Crie e salve suas combinações exclusivas."
          active={activePanel === 'colors'} 
          onClick={() => togglePanel('colors')} 
          color={currentColor} 
        />

        <ToolButton 
          id="pipette" 
          shortcutKey={shortcuts.picker} 
          icon={<Pipette size={20} />} 
          label="Conta-gotas" 
          tooltip="Capture qualquer cor diretamente da sua arte para reutilizar."
          active={currentTool === 'picker'} 
          onClick={() => { selectTool('picker'); closePanelsExceptFrames(); }} 
        />

        {/* Grouped Effects Tools */}
        <div className="relative">
          <ToolButton 
            id="effects-group" 
            icon={currentTool === 'smudge' ? <Wind size={20} /> : currentTool === 'airbrush' ? <Cloud size={20} /> : <Droplet size={20} />} 
            label="Efeitos" 
            tooltip="Ferramentas de suavização: Borrão, Mesclar e Aerógrafo."
            active={['blur', 'smudge', 'airbrush'].includes(currentTool)} 
            onClick={() => {
              sound.playClick();
              if (draggingTool === 'effects-group') return;
              setShowEffectsGroup(!showEffectsGroup);
            }} 
          />

          <AnimatePresence>
            {showEffectsGroup && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -70, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-2 p-2 bg-[var(--bg-panel)]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl z-[100]"
                onClick={(e) => e.stopPropagation()}
              >
                <ToolButton 
                  id="blur" 
                  icon={<Droplet size={20} />} 
                  label="Borrão" 
                  tooltip="Suavize as cores."
                  active={currentTool === 'blur'} 
                  onClick={() => { selectTool('blur'); setShowEffectsGroup(false); closePanelsExceptFrames(); }} 
                />
                <ToolButton 
                  id="smudge" 
                  icon={<Wind size={20} />} 
                  label="Mesclar" 
                  tooltip="Misture as cores."
                  active={currentTool === 'smudge'} 
                  onClick={() => { selectTool('smudge'); setShowEffectsGroup(false); closePanelsExceptFrames(); }} 
                />
                <ToolButton 
                  id="airbrush" 
                  icon={<Cloud size={20} />} 
                  label="Aerógrafo" 
                  tooltip="Pinte com spray."
                  active={currentTool === 'airbrush'} 
                  onClick={() => { selectTool('airbrush'); setShowEffectsGroup(false); closePanelsExceptFrames(); }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ToolButton 
          id="shape" 
          shortcutKey={shortcuts.shape} 
          icon={currentShape === 'line' ? <Minus size={20} /> : currentShape === 'rect' ? <Square size={20} /> : <Circle size={20} />} 
          label="Formas" 
          tooltip="Desenhe linhas, retângulos ou círculos perfeitos. Toque novamente para alternar o tipo de forma."
          active={currentTool === 'shape'} 
          onClick={() => { if (currentTool === 'shape') togglePanel('shape'); else { selectTool('shape'); closePanelsExceptFrames(); } }} 
        />

        <ToolButton 
          id="select" 
          shortcutKey={shortcuts.select}
          icon={
            selectType === 'rect' ? <div className="w-4 h-4 border-2 border-dashed border-current rounded-sm" /> :
            selectType === 'magic-wand' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-9-9"/><path d="M18 6h.01"/><path d="M6 18h.01"/><path d="M22 12h.01"/><path d="M2 12h.01"/><path d="M12 2h.01"/><path d="M12 22h.01"/><path d="M18 18h.01"/><path d="M6 6h.01"/></svg> :
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v-4a4 4 0 1 0-8 0v4"/><path d="M12 22a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 14v-2"/></svg>
          } 
          label="Selecionar" 
          tooltip="Selecione uma área para mover ou copiar. Toque novamente para alternar entre Retângulo, Varinha Mágica e Laço."
          active={currentTool === 'select'} 
          onClick={() => { 
            if (window.navigator.vibrate) window.navigator.vibrate(10);
            if (currentTool === 'select') togglePanel('select'); else { selectTool('select'); closePanelsExceptFrames(); } 
          }} 
        />

        <ToolButton 
          id="text" 
          shortcutKey={shortcuts.text} 
          icon={<Type size={20} />} 
          label="Texto" 
          tooltip="Insira textos e diálogos com fontes pixeladas no seu desenho."
          active={currentTool === 'text'} 
          onClick={() => { if (currentTool === 'text') togglePanel('text'); else { selectTool('text'); closePanelsExceptFrames(); } }} 
        />
        
        {/* Lighting Controls moved to Bottom Bar */}
        <ToolButton 
          id="sun" 
          icon={<Sun size={20} />} 
          label="Luz" 
          tooltip="Cria um efeito de claridade e brilho sobre a arte. Segure para ajustar a intensidade."
          active={lightingEffect === 'lighten'} 
          onClick={() => { sound.playClick(); selectEffect(lightingEffect === 'lighten' ? 'none' : 'lighten'); }}
        />
        <ToolButton 
          id="moon" 
          icon={<Moon size={20} />} 
          label="Sombra" 
          tooltip="Cria um efeito de escuridão e profundidade. Segure para ajustar a intensidade."
          active={lightingEffect === 'darken'} 
          onClick={() => { sound.playClick(); selectEffect(lightingEffect === 'darken' ? 'none' : 'darken'); }}
        />

        <ToolButton 
          id="effects" 
          icon={<Wand2 size={20} />} 
          label="FX" 
          tooltip="Efeitos especiais: Contorno, Brilho, Contraste e mais."
          active={activePanel === 'effects'} 
          onClick={() => { togglePanel('effects'); }} 
        />

        <ToolButton 
          id="batch" 
          icon={<Zap size={20} className="fill-current" />} 
          label="Ações" 
          tooltip="Ações em lote: Agrupar guias, limpar guias e gerenciamento inteligente (2-in-1)."
          active={activePanel === 'batch'} 
          onClick={() => { toggleBatchActions(); }} 
        />


      </div>
    </div>
  );
};
