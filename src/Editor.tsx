import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";
import React, { useState, useRef, useEffect, useCallback } from "react";

import {
  Play,
  Pause,
  Plus,
  Trash2,
  Download,
  Undo,
  Redo,
  PaintBucket,
  Eraser,
  Pencil,
  ChevronLeft,
  Copy,
  ClipboardPaste,
  Video,
  Layers as LayersIcon,
  Palette,
  Circle,
  Film,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Pipette,
  Minus,
  Square,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Merge,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  ImagePlus,
  Move,
  Maximize2,
  ArrowRight,
  X,
  Hand,
  Brush,
  Type,
  HelpCircle,
  PlayCircle,
  BookOpen,
  FolderOpen,
  Star,
  Droplet,
  Sun,
  Moon,
  Folder,
  MonitorCheck,
  Save,
  Scissors,
  Volume2,
  VolumeX,
  Keyboard,
  GripVertical,
  Share2,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Zap,
  Gamepad,
  Compass,
  FolderHeart,
  Trash,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  Reorder,
  useDragControls,
} from "motion/react";
import { AjustesPanel } from "./components/editor/AjustesPanel";
import { HexColorPicker } from "react-colorful";
import { ProjectConfig } from "./types";
import { sound } from "./sound";

import { TopBar } from "./components/editor/TopBar";
import { BottomBar } from "./components/editor/BottomBar";
import { FloatingControls } from "./components/editor/FloatingControls";
import { LayerPanel } from "./components/editor/LayerPanel";
import { FramePanel, MiniCanvas } from "./components/editor/FramePanel";
import { videoStorage, SavedVideo } from "./services/videoStorage";
import { generateId } from "./utils";
import { PaletteManager } from "./components/editor/PaletteManager";
import { EffectsPanel } from "./components/editor/EffectsPanel";

// New Imports
import {
  DEFAULT_PALETTE,
  PREDEFINED_PALETTES,
  THEMED_PALETTES,
  ColorPalette,
} from "./constants/Palettes";
import { ProfessionalColorPicker } from "./components/ProfessionalColorPicker";
import GIF from "gif.js";
import {
  TextObject,
  TextLayerOverlay,
  TextPreviewCanvas,
  getTextMetrics,
} from "./components/TextOverlays";
import { MiniLayerCanvas } from "./components/MiniLayerCanvas";

type Tool =
  | "pencil"
  | "eraser"
  | "fill"
  | "erase-fill"
  | "picker"
  | "shape"
  | "select"
  | "hand"
  | "text"
  | "blur"
  | "smudge"
  | "airbrush"
  | "batch";
type LightingEffect = "none" | "lighten" | "darken";
type PanelType =
  | "colors"
  | "pencil"
  | "fill"
  | "shape"
  | "layers"
  | "frames"
  | "ajustes"
  | "text"
  | "select"
  | "resize"
  | "effects"
  | "batch"
  | null;
type ShapeType = "line" | "rect" | "circle" | "rope";
type BrushType =
  | "solid-square"
  | "solid-circle"
  | "soft"
  | "spray"
  | "dither"
  | "cross"
  | "diagonal"
  | "horizontal"
  | "vertical"
  | "noise"
  | "gradient"
  | "hatch-right"
  | "hatch-left"
  | "hatch-cross"
  | "dots-dense"
  | "dots-sparse"
  | "checker"
  | "zigzag"
  | "weave"
  | "bricks"
  | "stars"
  | "diamond"
  | "star"
  | "heart"
  | "hexagon"
  | "triangle"
  | "cross-thick"
  | "ring"
  | "dots-random"
  | "splatter"
  | "marker"
  | "grid"
  | "grid-diagonal"
  | "waves"
  | "scales"
  | "wood"
  | "marble"
  | "clouds"
  | "leaves"
  | "hatch-diagonal-right"
  | "hatch-diagonal-left";

export interface Layer {
  id: string;
  name: string;
  data: string[];
  visible: boolean;
  locked?: boolean;
  alphaLock?: boolean;
  opacity?: number;
}

export interface Frame {
  id: string;
  layers: Layer[];
  texts?: TextObject[];
}

interface SelectionState {
  x: number;
  y: number;
  w: number;
  h: number;
  data: string[];
  originalW: number;
  originalH: number;
}

export default function Editor({
  config,
  onBack,
  onRegisterBackHandler,
  onUnregisterBackHandler,
}: {
  config: ProjectConfig;
  onBack: () => void;
  onRegisterBackHandler?: (handler: () => void) => void;
  onUnregisterBackHandler?: () => void;
}) {
  const [width, setWidth] = useState(() => Math.max(1, Number(config.width) || 32));
  const [height, setHeight] = useState(() => Math.max(1, Number(config.height) || 32));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // State
  const containerRef = useRef<HTMLDivElement>(null);

  const [frames, setFrames] = useState<Frame[]>(() => {
    if (
      config.frames &&
      Array.isArray(config.frames) &&
      config.frames.length > 0
    ) {
      return config.frames;
    }
    const w = Math.max(1, Number(config.width) || 32);
    const h = Math.max(1, Number(config.height) || 32);
    return [
      {
        id: generateId(),
        layers: [
          {
            id: generateId(),
            name: "Camada 1",
            data: new Array(w * h).fill(""),
            visible: true,
            opacity: 1,
          },
        ],
      },
    ];
  });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentLayer, setCurrentLayer] = useState(0);

  const [currentColor, setCurrentColor] = useState(DEFAULT_PALETTE[0]);
  const [currentTool, setCurrentTool] = useState<Tool>("pencil");
  const [currentShape, setCurrentShape] = useState<ShapeType>("line");
  const [brushSize, setBrushSize] = useState(1);
  const [pixelPerfect, setPixelPerfect] = useState(false);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const activeStrokeFrames = useRef<Frame[] | null>(null);
  const [brushType, setBrushType] = useState<BrushType>("solid-square");
  const [brushSolidColor, setBrushSolidColor] = useState(true);
  const [brushTrack, setBrushTrack] = useState(true);
  const [brushSpacing, setBrushSpacing] = useState(1);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [ropeState, setRopeState] = useState<{
    phase: "idle" | "drawing" | "curving";
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
    control: { x: number; y: number } | null;
  }>({ phase: "idle", start: null, end: null, control: null });
  const ropeTimer = useRef<any>(null);
  const lazyPos = useRef<{ x: number; y: number } | null>(null);
  const targetLazyPos = useRef<{ x: number; y: number } | null>(null);

  const drawRope = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    size: number,
    layerData: string[]
  ) => {
    let lastX = x0;
    let lastY = y0;
    const dist = Math.sqrt(Math.pow(x2 - x0, 2) + Math.pow(y2 - y0, 2));
    const steps = Math.max(20, Math.floor(dist * 2));
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round((1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2);
      const y = Math.round((1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2);
      
      drawLine(lastX, lastY, x, y, color, size, layerData);
      lastX = x;
      lastY = y;
    }
    return layerData;
  };

  // History stores the layers and texts of the current frame
  const [history, setHistory] = useState<
    { layers: Layer[]; texts: TextObject[] }[]
  >(() => {
    if (frames && frames.length > 0 && frames[0].layers) {
      return [{ layers: frames[0].layers, texts: frames[0].texts || [] }];
    }
    return [];
  });
  const [historyIndex, setHistoryIndex] = useState(0);

  // Helper functions moved here after state initialization
  function saveToHistory(
    layers: Layer[],
    texts: TextObject[] = frames[currentFrame]?.texts || []
  ) {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ layers, texts });
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }

  function updateCurrentLayer(
    newLayerData: string[],
    saveHistoryFlag = true,
    newTexts?: TextObject[]
  ) {
    const newFrames = [...frames];
    const frameIdx = currentFrame;
    const layerIdx = currentLayer;
    if (!newFrames[frameIdx]) return;

    const newLayers = [...newFrames[frameIdx].layers];
    if (!newLayers[layerIdx]) return;

    newLayers[layerIdx] = { ...newLayers[layerIdx], data: newLayerData };
    newFrames[frameIdx] = {
      ...newFrames[frameIdx],
      layers: newLayers,
      texts: newTexts !== undefined ? newTexts : newFrames[frameIdx].texts,
    };
    setFrames(newFrames);
    if (saveHistoryFlag) {
      saveToHistory(newLayers, newFrames[frameIdx].texts);
    }
  }

  function handleUndo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newFrames = [...frames];
      newFrames[currentFrame] = {
        ...newFrames[currentFrame],
        layers: history[newIndex].layers,
        texts: history[newIndex].texts,
      };
      setFrames(newFrames);
      setSelection(null);
      sound.playClick();
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  }

  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newFrames = [...frames];
      newFrames[currentFrame] = {
        ...newFrames[currentFrame],
        layers: history[newIndex].layers,
        texts: history[newIndex].texts,
      };
      setFrames(newFrames);
      setSelection(null);
      sound.playClick();
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
  }

  function addFrame() {
    const newFrames = [...frames];
    const w = width;
    const h = height;
    newFrames.push({
      id: generateId(),
      layers: [
        {
          id: generateId(),
          name: "Camada 1",
          data: new Array(w * h).fill(""),
          visible: true,
          opacity: 1,
        },
      ],
    });
    setFrames(newFrames);
    setCurrentFrame(newFrames.length - 1);
    setCurrentLayer(0);
    sound.playClick();
  }
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(8);
  const [showGrid, setShowGrid] = useState(false);
  const [gridOpacity, setGridOpacity] = useState(0.4);
  const [gridSize, setGridSize] = useState(16);
  const [gridMode, setGridMode] = useState<'lines' | 'dots' | 'checkerboard'>('checkerboard');
  const [gridOnlyOnZoom, setGridOnlyOnZoom] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);

  // Guide Lines state
  interface GuideLine {
    id: string;
    type: 'horizontal' | 'vertical' | 'angle';
    position: number; // 0-100 percentage for h/v, degrees for angle
    color: string;
    originX?: number; // 0-100 for angle origin
    originY?: number;
  }
  const [guideLines, setGuideLines] = useState<GuideLine[]>([]);
  const [showGuidePanel, setShowGuidePanel] = useState(false);
  const [guideLinesVisible, setGuideLinesVisible] = useState(true);
  const [guideColor, setGuideColor] = useState('#00ffff');
  const [guideOpacity, setGuideOpacity] = useState(0.5);
  const [guideGroups, setGuideGroups] = useState<{ id: string; name: string; lines: GuideLine[] }[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);

  const deleteAllFrames = () => {
    if (window.confirm("Deseja apagar TODOS os frames? Esta ação não pode ser desfeita.")) {
      const emptyFrame = {
        id: generateId(),
        layers: [{ id: generateId(), name: "Camada 1", data: new Array(width * height).fill(""), visible: true, locked: false, opacity: 1 }],
        texts: [],
      };
      setFrames([emptyFrame]);
      setCurrentFrame(0);
      setHistory([{ layers: emptyFrame.layers, texts: [] }]);
      setHistoryIndex(0);
      sound.playClick();
    }
  };

  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");
  const [onionSkin, setOnionSkin] = useState(true);
  const [onionSkinPast, setOnionSkinPast] = useState(1);
  const [onionSkinFuture, setOnionSkinFuture] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState<{
    visible: boolean;
    path: string;
  }>({ visible: false, path: "" });
  const [shareStatus, setShareStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [exportType, setExportType] = useState<
    "image" | "video" | "spritesheet"
  >("image");
  const [exportResolution, setExportResolution] = useState<
    "normal" | "hd" | "4k" | "8k" | "16k"
  >("normal");
  const [exportLoops, setExportLoops] = useState<number>(1);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [panelStates, setPanelStates] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >({
    frames: { x: 0, y: 0, w: 500, h: 320 },
    pencil: { x: 0, y: 0, w: 320, h: 450 },
    colors: { x: 0, y: 0, w: 320, h: 450 },
    layers: { x: 0, y: 0, w: 320, h: 450 },
    effects: { x: 0, y: 0, w: 400, h: 600 },
  });

  const getPanelState = (panel: string) => {
    return panelStates[panel] || { x: 0, y: 0, w: 320, h: 450 };
  };

  const updatePanelState = (
    panel: string,
    updates: Partial<{ x: number; y: number; w: number; h: number }>
  ) => {
    setPanelStates((prev) => ({
      ...prev,
      [panel]: { ...getPanelState(panel), ...updates },
    }));
  };

  const panelDragControls = useDragControls();

  const [appBackground, setAppBackground] = useState<string>(() => {
    return localStorage.getItem("pixel_app_background") || "var(--bg-app)";
  });

  const [bgBlur, setBgBlur] = useState<number>(() => {
    const saved = localStorage.getItem("pixel_bg_blur");
    return saved ? parseFloat(saved) : 0;
  });

  const [bgBrightness, setBgBrightness] = useState<number>(() => {
    const saved = localStorage.getItem("pixel_bg_brightness");
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("pixel_app_background", appBackground);
  }, [appBackground]);

  useEffect(() => {
    localStorage.setItem("pixel_bg_blur", String(bgBlur));
  }, [bgBlur]);

  useEffect(() => {
    localStorage.setItem("pixel_bg_brightness", String(bgBrightness));
  }, [bgBrightness]);

  const [showCanvasBorder, setShowCanvasBorder] = useState<boolean>(() => {
    return localStorage.getItem("pixel_show_canvas_border") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("pixel_show_canvas_border", String(showCanvasBorder));
  }, [showCanvasBorder]);

  const [uiScale, setUiScale] = useState<number>(() => {
    const saved = localStorage.getItem("pixel_ui_scale");
    return saved ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    localStorage.setItem("pixel_ui_scale", uiScale.toString());
    document.documentElement.style.setProperty('--ui-scale', uiScale.toString());
  }, [uiScale]);

  const [showUiToggle, setShowUiToggle] = useState<boolean>(() => {
    const saved = localStorage.getItem("pixel_show_ui_toggle");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("pixel_show_ui_toggle", String(showUiToggle));
  }, [showUiToggle]);

  const [activePanel, setActivePanel] = useState<PanelType>(null);

  const toggleBatchActions = () => {
    sound.playClick();
    if (activePanel === "batch") {
      setActivePanel(null);
    } else {
      setActivePanel("batch");
      closePanelsExceptFrames();
    }
  };

  const togglePanel = (panel: PanelType) => {
    sound.playClick();
    setActivePanel((prev) => {
      const newVal = prev === panel ? null : panel;
      if (newVal) {
        setShowQuickPalette(false);
        setPanelMinimized(false);
      }
      return newVal;
    });
  };

  const handleResize = (e: React.PointerEvent, direction: string) => {
    if (!activePanel) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const { w: startW, h: startH } = getPanelState(activePanel);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const updates: any = {};
      if (direction.includes("e")) updates.w = Math.max(200, startW + dx);
      if (direction.includes("w")) updates.w = Math.max(200, startW - dx);
      if (direction.includes("s")) updates.h = Math.max(100, startH + dy);
      if (direction.includes("n")) updates.h = Math.max(100, startH - dy);
      updatePanelState(activePanel, updates);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const [deletedHistory, setDeletedHistory] = useState<
    {
      id: string;
      type: "clear" | "layer" | "frame";
      name: string;
      data: any;
      timestamp: number;
    }[]
  >([]);
  const [showDeletedHistory, setShowDeletedHistory] = useState(false);
  const [deletedFrame, setDeletedFrame] = useState<{
    frame: Frame;
    index: number;
  } | null>(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveToast, setSaveToast] = useState<{
    message: string;
    visible: boolean;
  }>({ message: "", visible: false });
  const [showTutorials, setShowTutorials] = useState(false);

  // Hint toast that appears when entering the editor
  const [showEditorHint, setShowEditorHint] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowEditorHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  const [showFloatingToolSwitcher, setShowFloatingToolSwitcher] =
    useState(false);
  const [floatingToolSwitcherPos, setFloatingToolSwitcherPos] = useState({
    x: 0,
    y: 0,
  });
  const [hoveredQuickTool, setHoveredQuickTool] = useState<Tool | null>(null);
  const longPressToolTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [selectionAction, setSelectionAction] = useState<
    "create" | "move" | "scale" | null
  >(null);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const selectionActionRef = useRef<"create" | "move" | "scale" | null>(null);
  const [selectType, setSelectType] = useState<"rect" | "magic-wand" | "lasso">(
    "magic-wand"
  );
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>(
    []
  );
  const [selectMode, setSelectMode] = useState<"replace" | "add" | "subtract">(
    "replace"
  );
  const [selectionMask, setSelectionMask] = useState<boolean[] | null>(null);
  const [selectionTolerance, setSelectionTolerance] = useState(0);
  const [wandContiguous, setWandContiguous] = useState(true);
  const [clipboard, setClipboard] = useState<SelectionState | null>(null);
  const [resizeInput, setResizeInput] = useState({
    w: config.width,
    h: config.height,
  });

  const [pasteCount, setPasteCount] = useState(0);
  const lastPastePos = useRef<{ x: number; y: number } | null>(null);

  const applyResize = (newW: number, newH: number) => {
    if (newW === width && newH === height) return;
    sound.playClick();
    
    const newFrames = frames.map(frame => {
      const newLayers = frame.layers.map(layer => {
        const newData = new Array(newW * newH).fill("");
        for (let y = 0; y < Math.min(height, newH); y++) {
          for (let x = 0; x < Math.min(width, newW); x++) {
            newData[x + y * newW] = layer.data[x + y * width];
          }
        }
        return { ...layer, data: newData };
      });
      return { ...frame, layers: newLayers };
    });
    
    setFrames(newFrames);
    setWidth(newW);
    setHeight(newH);
    // Note: To be safe, we reset history to prevent mismatch crashes
    setHistory([{ layers: newFrames[currentFrame].layers, texts: newFrames[currentFrame].texts || [] }]);
    setHistoryIndex(0);
    setSaveToast({ message: `Tela alterada para ${newW}x${newH}`, visible: true });
    setTimeout(() => setSaveToast({ message: "", visible: false }), 2000);
  };

  const trashLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isTrashLongPress = useRef(false);

  const [showBrushSizeIndicator, setShowBrushSizeIndicator] = useState(false);
  const brushSizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [flashingLayerId, setFlashingLayerId] = useState<string | null>(null);
  const [layerBadge, setLayerBadge] = useState<{ text: string; x: number; y: number } | null>(null);

  const triggerLayerFlash = useCallback((layerId: string) => {
    setFlashingLayerId(layerId);
    setTimeout(() => {
      setFlashingLayerId((prev) => (prev === layerId ? null : prev));
    }, 800);
  }, []);

  const showAutoSelectBadge = useCallback((name: string, x: number, y: number) => {
    setLayerBadge({ text: name, x, y });
    setTimeout(() => {
      setLayerBadge(null);
    }, 1500);
  }, []);

  useEffect(() => {
    setShowBrushSizeIndicator(true);
    if (brushSizeTimerRef.current) clearTimeout(brushSizeTimerRef.current);
    brushSizeTimerRef.current = setTimeout(() => {
      setShowBrushSizeIndicator(false);
    }, 1000);
    return () => {
      if (brushSizeTimerRef.current) clearTimeout(brushSizeTimerRef.current);
    };
  }, [brushSize]);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const lastTwoFingerDownTime = useRef<number | null>(null);
  const twoFingerHasMoved = useRef<boolean>(false);
  const threeFingerHasMoved = useRef<boolean>(false);
  const maxFingersInGesture = useRef<number>(0);
  const lastOneFingerTapTime = useRef<number>(0);
  const initialPinchAngle = useRef<number | null>(null);
  const initialRotation = useRef<number>(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [sfxEnabled, setSfxEnabled] = useState(sound.isSfxEnabled());
  const [bgmEnabled, setBgmEnabled] = useState(sound.isBgmEnabled());

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

  const getSoundParams = () => {
    // Zoom: higher zoom (larger canvas on screen) -> more muffled/lower frequency
    const zoomMuffle = Math.min(0.8, Math.max(0, (zoom - 1) / 8));

    // Resolution: higher resolution (smaller pixels) -> faster and muffled sound
    // base res ref: 64x64 = 4096
    const resValue = width * height;
    const resSpeed = Math.min(3, 1 + resValue / 12000);
    const resMuffle = Math.min(0.5, resValue / 20000);

    return {
      muffle: Math.min(1, zoomMuffle + resMuffle),
      speed: resSpeed,
    };
  };

  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [showLayerSettings, setShowLayerSettings] = useState(false);
  const [layerThumbBg, setLayerThumbBg] = useState<
    "transparent" | "white" | "black"
  >("transparent");
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState("#ffffff");
  const [symmetryX, setSymmetryX] = useState(false);
  const [symmetryY, setSymmetryY] = useState(false);
  const [symmetryDiag1, setSymmetryDiag1] = useState(false);
  const [symmetryDiag2, setSymmetryDiag2] = useState(false);
  const [primarySymmetry, setPrimarySymmetry] = useState<
    "x" | "y" | "diag1" | "diag2"
  >("x");
  const [showSymmetryMenu, setShowSymmetryMenu] = useState(false);
  const symmetryLongPress = useRef<NodeJS.Timeout | null>(null);
  const [lightingEffect, setLightingEffect] = useState<LightingEffect>("none");
  const [lightingIntensity, setLightingIntensity] = useState(5);
  const [isProcessRecording, setIsProcessRecording] = useState(false);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [recordingResolution, setRecordingResolution] = useState<
    "normal" | "hd" | "4k"
  >("normal");
  const [showVideoGallery, setShowVideoGallery] = useState(false);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);

  const [showLightingMenu, setShowLightingMenu] = useState(false);
  const lightingLongPress = useRef<NodeJS.Timeout | null>(null);
  const [showRecordingMenu, setShowRecordingMenu] = useState(false);
  const recordingLongPress = useRef<NodeJS.Timeout | null>(null);

  // Keyboard Shortcuts settings
  const defaultShortcuts: Record<string, string> = {
    pencil: "p",
    eraser: "e",
    fill: "g",
    picker: "i",
    shape: "u",
    select: "m",
    hand: "h",
    text: "t",
    undo: "z",
    redo: "y",
    grid: "k",
    play: " ",
    clear: "delete",
    sound: "s",
    zoomIn: "=",
    zoomOut: "-",
    resetView: "0",
    save: "ctrl+s",
    newFrame: "n",
  };

  const shortcutLabels: Record<string, string> = {
    pencil: "Lápis",
    eraser: "Borracha",
    fill: "Balde",
    picker: "Conta-gotas",
    shape: "Formas",
    select: "Seleção",
    hand: "Mover (Mão)",
    text: "Texto",
    undo: "Desfazer (Ctrl+)",
    redo: "Refazer (Ctrl+)",
    grid: "Malha",
    play: "Animação",
    clear: "Limpar Camada",
    sound: "Mutar/Desmutar Som",
    zoomIn: "Zoom +",
    zoomOut: "Zoom -",
    resetView: "Resetar Zoom",
    save: "Salvar Projeto",
    newFrame: "Novo Frame",
  };

  const shortcutCategories = [
    {
      name: "Ferramentas",
      keys: [
        "pencil",
        "eraser",
        "fill",
        "picker",
        "shape",
        "select",
        "hand",
        "text",
      ],
    },
    { name: "Edição", keys: ["undo", "redo", "clear", "newFrame"] },
    {
      name: "Visualização",
      keys: ["grid", "play", "zoomIn", "zoomOut", "resetView"],
    },
    { name: "Sistema", keys: ["save", "sound"] },
  ];

  const toggleSound = () => {
    const newSfx = !sfxEnabled;
    sound.setSfxEnabled(newSfx);
    setSfxEnabled(newSfx);
  };
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("pixel_shortcuts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return { ...defaultShortcuts, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Failed to parse shortcuts, using defaults");
    }
    return { ...defaultShortcuts };
  });
  const [shortcutConfigMode, setShortcutConfigMode] = useState<string | null>(
    null
  );

  const processRecorderRef = useRef<MediaRecorder | null>(null);
  const processChunksRef = useRef<BlobPart[]>([]);
  const recorderCanvasRef = useRef<HTMLCanvasElement>(null);
  const isActuallyRecording = useRef(false);
  const pickerColorPreview = useRef<{
    color: string;
    x: number;
    y: number;
  } | null>(null);
  const [pickerPreviewState, setPickerPreviewState] = useState<{
    color: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectionOffset, setSelectionOffset] = useState(0);
  const [showQuickPalette, setShowQuickPalette] = useState(false);
  const [quickPaletteCategory, setQuickPaletteCategory] =
    useState<string>("Oceano");
  const [toolIndicator, setToolIndicator] = useState<{
    tool: Tool;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (!toolIndicator) return;
    const timer = setTimeout(() => {
      setToolIndicator(null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [toolIndicator]);
  const [savedUserColors, setSavedUserColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pixel_saved_colors");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [colorHistory, setColorHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("pixel_color_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("pixel_saved_colors", JSON.stringify(savedUserColors));
  }, [savedUserColors]);

  useEffect(() => {
    localStorage.setItem("pixel_color_history", JSON.stringify(colorHistory));
  }, [colorHistory]);

  const [userPalettes, setUserPalettes] = useState<{name: string, colors: string[]}[]>(() => {
    try {
      const saved = localStorage.getItem("pixel_user_palettes");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem("pixel_user_palettes", JSON.stringify(userPalettes));
  }, [userPalettes]);

  const addToColorHistory = useCallback((color: string) => {
    if (!color || color === "" || color === "transparent") return;
    setColorHistory((prev) => {
      const filtered = prev.filter(
        (c) => c.toLowerCase() !== color.toLowerCase()
      );
      return [color, ...filtered].slice(0, 24);
    });
  }, []);

  const saveColorToFavorites = useCallback((color: string) => {
    sound.playClick();
    setSavedUserColors((prev) => {
      if (prev.some((c) => c.toLowerCase() === color.toLowerCase()))
        return prev;
      return [...prev, color];
    });
  }, []);

  const removeColorFromFavorites = useCallback((color: string) => {
    sound.playClick();
    setSavedUserColors((prev) =>
      prev.filter((c) => c.toLowerCase() !== color.toLowerCase())
    );
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectionMask || selection) {
      interval = setInterval(() => {
        setSelectionOffset((prev) => (prev + 0.5) % 8);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [selectionMask, selection]);

  const [recordingFeedback, setRecordingFeedback] = useState<{
    type: "tool" | "color" | "intensity" | "effect";
    value: string;
    timestamp: number;
  } | null>(null);

  const triggerFeedback = useCallback(
    (type: "tool" | "color" | "intensity" | "effect", value: string) => {
      if (!isActuallyRecording.current) return;
      setRecordingFeedback({ type, value, timestamp: Date.now() });
    },
    []
  );

  const getExportScale = useCallback(
    (resolution: "normal" | "hd" | "4k" | "8k" | "16k") => {
      if (resolution === "normal") return 10;
      if (resolution === "hd") return Math.max(1, Math.ceil(1080 / height));
      if (resolution === "4k") return Math.max(1, Math.ceil(2160 / height));
      if (resolution === "8k") return Math.max(1, Math.ceil(4320 / height));
      if (resolution === "16k") return Math.max(1, Math.ceil(8640 / height));
      return 10;
    },
    [height]
  );

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const saveToNativeGallery = async (
    data: string,
    fileName: string,
    isVideo = false
  ) => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      // Feedback inicial
      await Toast.show({ text: "Iniciando salvamento...", duration: "short" });

      if (Capacitor.getPlatform() === "android") {
        const perm = await Filesystem.checkPermissions();
        if (perm.publicStorage !== "granted") {
          await Toast.show({
            text: "O Dragon Art precisa de acesso ao seu armazenamento para salvar na galeria.",
            duration: "long",
          });
          const request = await Filesystem.requestPermissions();
          if (request.publicStorage !== "granted") {
            await Toast.show({
              text: "Permissao negada. Por favor, autorize nas configuracoes do celular.",
              duration: "long",
            });
          }
        }
      }

      // Tentativa 1: Pasta de Midia (Galeria)
      try {
        const folder = isVideo ? "DCIM/DragonArt" : "Pictures/DragonArt";
        const path = `${folder}/${fileName}`;

        await Filesystem.writeFile({
          path: path,
          data: data,
          directory: Directory.ExternalStorage,
          recursive: true,
        });

        setShowSaveSuccess({ visible: true, path: folder });
        await Toast.show({
          text: `Salvo na Galeria (${folder})!`,
          duration: "long",
        });
        return true;
      } catch (e) {
        console.warn("Falha ao salvar na galeria, tentando Documentos...", e);

        // Tentativa 2: Pasta de Documentos
        const docPath = `DragonArt/${fileName}`;
        await Filesystem.writeFile({
          path: docPath,
          data: data,
          directory: Directory.Documents,
          recursive: true,
        });

        setShowSaveSuccess({ visible: true, path: "Documents/DragonArt" });
        await Toast.show({
          text: "Salvo em Documentos/DragonArt",
          duration: "long",
        });
        return true;
      }
    } catch (err) {
      console.error("Erro fatal ao salvar:", err);
      await Toast.show({
        text: "Erro ao salvar arquivo. Verifique se ha espaco no celular.",
        duration: "long",
      });
      return false;
    }
  };

  const isSpacePressed = useRef(false);
  const isDraggingText = useRef(false);
  const textDragOffset = useRef({ x: 0, y: 0 });
  const [isSpaceDown, setIsSpaceDown] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textSize, setTextSize] = useState(8);
  const [textFont, setTextFont] = useState("monospace");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [textResizeAction, setTextResizeAction] = useState<{
    x: number;
    y: number;
    initialSize: number;
  } | null>(null);
  const [textDragAction, setTextDragAction] = useState<boolean>(false);
  const [is3D, setIs3D] = useState(false);
  const [show3DSettings, setShow3DSettings] = useState(false);
  const [rotationX, setRotationX] = useState(50);
  const [rotationY, setRotationY] = useState(-30);
  const [autoRotate3D, setAutoRotate3D] = useState(false);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(1);

  React.useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      if (autoRotate3D && is3D) {
        const delta = time - lastTime;
        setRotationY(prev => prev + (autoRotateSpeed * delta * 0.05));
      }
      lastTime = time;
      if (autoRotate3D && is3D) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    
    if (autoRotate3D && is3D) {
      animationFrameId = requestAnimationFrame(loop);
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [autoRotate3D, is3D, autoRotateSpeed]);

  const loadSavedVideos = async () => {
    try {
      const videos = await videoStorage.getAllVideos();
      setSavedVideos(videos.sort((a, b) => b.timestamp - a.timestamp));
    } catch (e) {
      console.error("Erro ao carregar vídeos:", e);
    }
  };

  useEffect(() => {
    loadSavedVideos();
  }, []);

  useEffect(() => {
    return () => {
      if (
        processRecorderRef.current &&
        processRecorderRef.current.state !== "inactive"
      ) {
        processRecorderRef.current.stop();
      }
    };
  }, []);

  // Register back handler for Android back button
  useEffect(() => {
    if (onRegisterBackHandler) {
      onRegisterBackHandler(() => setShowSavePrompt(true));
    }
    return () => {
      if (onUnregisterBackHandler) onUnregisterBackHandler();
    };
  }, [onRegisterBackHandler, onUnregisterBackHandler]);

  const showSaveToast = (message: string) => {
    setSaveToast({ message, visible: true });
    setTimeout(
      () => setSaveToast((prev) => ({ ...prev, visible: false })),
      3000
    );
  };

  const selectTool = useCallback(
    (tool: Tool, playSound = true) => {
      if (playSound) sound.playClick();
      setCurrentTool(tool);
      triggerFeedback("tool", tool);
      setToolIndicator({ tool, timestamp: Date.now() });
    },
    [triggerFeedback]
  );

  const selectColor = useCallback(
    (color: string, playSound = true) => {
      if (playSound) sound.playColorSound();
      setCurrentColor(color);
      addToColorHistory(color);
      triggerFeedback("color", color);
    },
    [triggerFeedback, addToColorHistory]
  );

  const selectEffect = useCallback(
    (effect: LightingEffect) => {
      sound.playClick();
      setLightingEffect(effect);
      triggerFeedback("effect", effect);
    },
    [triggerFeedback]
  );

  const selectIntensity = useCallback(
    (val: number) => {
      setLightingIntensity(val);
      triggerFeedback("intensity", val.toString());
    },
    [triggerFeedback]
  );

  // Rope Physics Catch-up Loop
  useEffect(() => {
    if (currentTool === "shape" && currentShape === "rope" && ropeState.phase === "drawing") {
      let raf: number;
      const update = () => {
        if (lazyPos.current && targetLazyPos.current && ropeState.start) {
          const dx = targetLazyPos.current.x - lazyPos.current.x;
          const dy = targetLazyPos.current.y - lazyPos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.1) {
            const lerpFactor = 0.25; // Professional tension
            lazyPos.current.x += dx * lerpFactor;
            lazyPos.current.y += dy * lerpFactor;
            
            const drawX = Math.round(lazyPos.current.x);
            const drawY = Math.round(lazyPos.current.y);

            // Update state and draw
            setRopeState(prev => ({ ...prev, end: { x: drawX, y: drawY } }));
            
            if (activeStrokeFrames.current && strokeStartData.current) {
              const colorToUse = currentTool === "eraser" ? "" : currentColor;
              const newLayerData = drawLine(
                ropeState.start.x,
                ropeState.start.y,
                drawX,
                drawY,
                colorToUse,
                brushSize,
                [...strokeStartData.current]
              );
              activeStrokeFrames.current[currentFrame].layers[currentLayer].data = newLayerData;
              drawToCanvas(activeStrokeFrames.current, currentFrame);
            }
          }
        }
        raf = requestAnimationFrame(update);
      };
      raf = requestAnimationFrame(update);
      return () => cancelAnimationFrame(raf);
    }
  }, [currentTool, currentShape, ropeState.phase, ropeState.start, currentFrame, currentLayer, brushSize, currentColor]);



  useEffect(() => {
    if (!textDragAction) return;

    const handleMove = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      setTextPos({
        x: x - textDragOffset.current.x,
        y: y - textDragOffset.current.y,
      });
    };

    const handleUp = () => {
      setTextDragAction(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [textDragAction]);

  useEffect(() => {
    if (!textResizeAction) return;

    const handleMove = (e: PointerEvent) => {
      const dx = ((e.clientX - textResizeAction.x) / zoom) * 0.5;
      const newSize = Math.max(
        1,
        Math.min(500, textResizeAction.initialSize + Math.floor(dx))
      );
      setTextSize(newSize);
    };

    const handleUp = () => {
      setTextResizeAction(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [textResizeAction, zoom]);

  useEffect(() => {
    if (showTextInput && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [showTextInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tagName = document.activeElement?.tagName.toLowerCase();
      const isInput =
        tagName === "input" || tagName === "textarea" || showTextInput;

      if (shortcutConfigMode) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") {
          setShortcutConfigMode(null);
          return;
        }

        const newKey = e.key.toLowerCase();
        if (["shift", "control", "alt", "meta"].includes(newKey)) return;

        // Build composite key for ctrl/meta combos
        const compositeKey = e.ctrlKey || e.metaKey ? `ctrl+${newKey}` : newKey;

        setShortcuts((prev) => {
          const updated = { ...prev, [shortcutConfigMode]: compositeKey };
          localStorage.setItem("pixel_shortcuts", JSON.stringify(updated));
          return updated;
        });
        setShortcutConfigMode(null);
        return;
      }

      if (isInput) return;

      // Space for hand/pan tool
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        isSpacePressed.current = true;
        setIsSpaceDown(true);
      }

      const key = e.key.toLowerCase();
      const hasCtrl = e.ctrlKey || e.metaKey;
      const compositeKey = hasCtrl ? `ctrl+${key}` : key;
      let handled = false;

      // Ctrl/Meta combos
      if (hasCtrl) {
        if (e.shiftKey && key === shortcuts.undo) {
          // Ctrl+Shift+Z = Redo (priority over undo)
          e.preventDefault();
          handleRedo();
          handled = true;
        } else if (compositeKey === shortcuts.undo || key === shortcuts.undo) {
          e.preventDefault();
          handleUndo();
          handled = true;
        } else if (compositeKey === shortcuts.redo || key === shortcuts.redo) {
          e.preventDefault();
          handleRedo();
          handled = true;
        } else if (
          compositeKey === shortcuts.save ||
          compositeKey === "ctrl+s"
        ) {
          e.preventDefault();
          saveProject();
          setToolIndicator({ tool: "Salvo" as any, timestamp: Date.now() });
          handled = true;
        }
      }

      // Simple key shortcuts (no ctrl)
      if (!handled && !hasCtrl) {
        if (key === shortcuts.pencil) {
          e.preventDefault();
          selectTool("pencil");
          closePanelsExceptFrames();
        } else if (key === shortcuts.eraser) {
          e.preventDefault();
          selectTool("eraser");
          closePanelsExceptFrames();
        } else if (key === shortcuts.fill) {
          e.preventDefault();
          selectTool("fill");
          closePanelsExceptFrames();
        } else if (key === shortcuts.picker) {
          e.preventDefault();
          selectTool("picker");
          closePanelsExceptFrames();
        } else if (key === shortcuts.shape) {
          e.preventDefault();
          selectTool("shape");
          closePanelsExceptFrames();
        } else if (key === shortcuts.select) {
          e.preventDefault();
          selectTool("select");
          closePanelsExceptFrames();
        } else if (key === shortcuts.hand && e.code !== "Space") {
          e.preventDefault();
          selectTool("hand");
          closePanelsExceptFrames();
        } else if (key === shortcuts.text) {
          e.preventDefault();
          selectTool("text");
          closePanelsExceptFrames();
        } else if (key === shortcuts.grid) {
          e.preventDefault();
          setShowGrid((prev) => !prev);
          setToolIndicator({ tool: "Malha" as any, timestamp: Date.now() });
        } else if (key === shortcuts.play && e.code !== "Space") {
          e.preventDefault();
          setIsPlaying((prev) => !prev);
        } else if (key === shortcuts.clear) {
          e.preventDefault();
          clearCurrentLayer();
          closePanelsExceptFrames();
          setToolIndicator({ tool: "Limpar" as any, timestamp: Date.now() });
        } else if (key === shortcuts.sound) {
          e.preventDefault();
          toggleSound();
          setToolIndicator({ tool: "Som" as any, timestamp: Date.now() });
        } else if (key === shortcuts.zoomIn || key === "+") {
          e.preventDefault();
          handleZoomIn();
          setToolIndicator({ tool: "Zoom +" as any, timestamp: Date.now() });
        } else if (key === shortcuts.zoomOut) {
          e.preventDefault();
          handleZoomOut();
          setToolIndicator({ tool: "Zoom -" as any, timestamp: Date.now() });
        } else if (key === shortcuts.resetView) {
          e.preventDefault();
          handleResetView();
          setToolIndicator({ tool: "Reset" as any, timestamp: Date.now() });
        } else if (key === shortcuts.newFrame) {
          e.preventDefault();
          addFrame();
          setToolIndicator({ tool: "Frame +" as any, timestamp: Date.now() });
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressed.current = false;
        setIsSpaceDown(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showTextInput, shortcutConfigMode, shortcuts]);

  const handleAddText = () => {
    if (!textPos || !textInput) return;

    const newText: TextObject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: textInput,
      x: textPos.x,
      y: textPos.y,
      color: currentColor,
      font: textFont,
      size: textSize,
      bold: isBold,
      italic: isItalic,
    };

    const newFrames = [...frames];
    const currentFrameObj = { ...newFrames[currentFrame] };
    currentFrameObj.texts = [...(currentFrameObj.texts || []), newText];
    newFrames[currentFrame] = currentFrameObj;

    setFrames(newFrames);
    saveToHistory(currentFrameObj.layers, currentFrameObj.texts);

    setShowTextInput(false);
    setTextInput("");
    setTextPos(null);
    hiddenInputRef.current?.blur();
  };

  const closePanelsExceptFrames = () => {
    setActivePanel((prev) => (prev === "frames" ? "frames" : null));
    setShowQuickPalette(false);
  };

  const [referenceImages, setReferenceImages] = useState<({
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
  })[]>([]);
  const [refAction, setRefAction] = useState<
    "move" | "scale" | "stretchX" | "stretchY" | null
  >(null);
  const [refStart, setRefStart] = useState<{
    x: number;
    y: number;
    refX: number;
    refY: number;
    refW: number;
    refH: number;
  } | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.5, 10));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.5, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setRotationX(50);
    setRotationY(-30);
    setIs3D(false);
  };

  // Touch/Mouse Pan logic
  const lastPanPoint = useRef({ x: 0, y: 0 });
  const activePointers = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );
  const initialPinchDist = useRef<number | null>(null);
  const initialPinchZoom = useRef<number | null>(null);

  const handlePanStart = (e: React.PointerEvent) => {
    const now = Date.now();
    if (
      now - lastOneFingerTapTime.current < 250 &&
      activePointers.current.size === 1
    ) {
      // Check if target is NOT canvas
      const target = e.target as HTMLElement;
      if (!target.closest("canvas")) {
        handleUndo();
        sound.playClick();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        lastOneFingerTapTime.current = 0;
        return;
      }
    }
    lastOneFingerTapTime.current = now;

    const isHand = currentTool === "hand" || isSpacePressed.current;
    if (
      e.target instanceof HTMLCanvasElement &&
      activePointers.current.size < 2 &&
      !isHand
    )
      return;

    // Track max fingers in this gesture
    if (activePointers.current.size > maxFingersInGesture.current) {
      maxFingersInGesture.current = activePointers.current.size;
    }

    if (activePointers.current.size >= 2) {
      if (isDrawing.current && strokeStartData.current) {
        isDrawing.current = false;
        updateCurrentLayer(strokeStartData.current, false);
      }
      if (selectionAction) {
        setSelectionAction(null);
        selectionActionRef.current = null;
        setSelectionStart(null);
      }
      if (longPressToolTimer.current) {
        clearTimeout(longPressToolTimer.current);
        longPressToolTimer.current = null;
        longPressStartPos.current = null;
      }
      setShowFloatingToolSwitcher(false);
      setIsDraggingPan(true);

      if (activePointers.current.size === 2) {
        const pts = Array.from(activePointers.current.values()) as { x: number; y: number }[];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        initialPinchDist.current = dist;
        initialPinchZoom.current = zoom;

        const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
        initialPinchAngle.current = angle;
        initialRotation.current = rotation;

        const cx = (pts[0].x + pts[1].x) / 2;
        const cy = (pts[0].y + pts[1].y) / 2;
        lastPanPoint.current = { x: cx, y: cy };
        twoFingerHasMoved.current = false;
      }

      if (activePointers.current.size === 3) {
        threeFingerHasMoved.current = false;
      }
    } else if (
      e.button === 1 ||
      e.altKey ||
      isHand ||
      !(e.target instanceof HTMLCanvasElement)
    ) {
      e.preventDefault();
      setIsDraggingPan(true);
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanMove = (e: React.PointerEvent) => {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Mark 3-finger gesture as moved if any movement detected
    if (activePointers.current.size >= 3) {
      threeFingerHasMoved.current = true;
    }

    if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values()) as {
        x: number;
        y: number;
      }[];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      let currentZoom = zoom;
      if (initialPinchDist.current && initialPinchZoom.current) {
        const scale = dist / initialPinchDist.current;
        if (Math.abs(scale - 1) > 0.05) twoFingerHasMoved.current = true;
        currentZoom = Math.min(
          Math.max(initialPinchZoom.current * scale, 0.5),
          10
        );
        setZoom(currentZoom);
      }

      if (initialPinchAngle.current !== null) {
        const currentAngle = Math.atan2(
          pts[1].y - pts[0].y,
          pts[1].x - pts[0].x
        );
        let angleDiff =
          (currentAngle - initialPinchAngle.current) * (180 / Math.PI);
        
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;

        if (Math.abs(angleDiff) > 2 || twoFingerHasMoved.current) {
          twoFingerHasMoved.current = true;
          setRotation((prev) => prev + angleDiff);
          initialPinchAngle.current = currentAngle;
        }
      }

      const cx = (pts[0].x + pts[1].x) / 2;
      const cy = (pts[0].y + pts[1].y) / 2;
      const dx = (cx - lastPanPoint.current.x) / currentZoom;
      const dy = (cy - lastPanPoint.current.y) / currentZoom;

      if (Math.abs(dx) > 2 || Math.abs(dy) > 2)
        twoFingerHasMoved.current = true;

      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPoint.current = { x: cx, y: cy };
    } else if (isDraggingPan && activePointers.current.size < 2) {
      if (is3D) {
        // Orbit in 3D
        const dx = (e.clientX - lastPanPoint.current.x) * 0.5;
        const dy = (e.clientY - lastPanPoint.current.y) * 0.5;
        setRotationY((p) => p + dx);
        setRotationX((p) => Math.min(Math.max(p - dy, -180), 180));
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
      } else {
        // Pan
        const dx = (e.clientX - lastPanPoint.current.x) / zoom;
        const dy = (e.clientY - lastPanPoint.current.y) / zoom;
        setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
        lastPanPoint.current = { x: e.clientX, y: e.clientY };
      }
    }
  };

  const handlePanEnd = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId);

    // Teleport fix: If we still have one finger down, reset lastPanPoint to it
    if (activePointers.current.size === 1) {
      const remaining = Array.from(activePointers.current.values())[0] as {
        x: number;
        y: number;
      };
      lastPanPoint.current = { x: remaining.x, y: remaining.y };
    }

    if (activePointers.current.size < 2) {
      initialPinchDist.current = null;
      initialPinchZoom.current = null;
      initialPinchAngle.current = null;
    }
    if (activePointers.current.size === 0) {
      // Multi-finger tap gestures: 2 fingers = undo, 3 fingers = redo
      if (maxFingersInGesture.current === 3 && !threeFingerHasMoved.current) {
        handleRedo();
        sound.playClick();
        if (window.navigator.vibrate) window.navigator.vibrate([30, 30, 30]);
      } else if (maxFingersInGesture.current === 2 && !twoFingerHasMoved.current) {
        handleUndo();
        sound.playClick();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }
      maxFingersInGesture.current = 0;
      setIsDraggingPan(false);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.01, 0.5), 10));
      }
    };

    const container = document.getElementById("canvas-container");
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, []);

  useEffect(() => {
    const selectedRef = referenceImages.find(r => r.selected);
    if (!refAction || !refStart || !selectedRef) return;

    const handleMove = (e: PointerEvent) => {
      const dx = (e.clientX - refStart.x) / zoom;
      const dy = (e.clientY - refStart.y) / zoom;

      if (refAction === "move") {
        setReferenceImages(prev => prev.map(r => r.id === selectedRef.id ? {
          ...r,
          x: refStart.refX + dx,
          y: refStart.refY + dy,
        } : r));
      } else if (refAction === "scale") {
        const ratio = refStart.refW / refStart.refH;
        const dist = Math.max(dx, dy);
        const newW = Math.max(10, refStart.refW + dist);
        const newH = newW / ratio;
        setReferenceImages(prev => prev.map(r => r.id === selectedRef.id ? {
          ...r,
          width: newW,
          height: newH,
        } : r));
      } else if (refAction === "stretchX") {
        setReferenceImages(prev => prev.map(r => r.id === selectedRef.id ? {
          ...r,
          width: Math.max(10, refStart.refW + dx),
        } : r));
      } else if (refAction === "stretchY") {
        setReferenceImages(prev => prev.map(r => r.id === selectedRef.id ? {
          ...r,
          height: Math.max(10, refStart.refH + dy),
        } : r));
      }
    };

    const handleUp = () => {
      setRefAction(null);
      setRefStart(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [refAction, refStart, referenceImages, zoom]);

  useEffect(() => {
    // Auto-save to local storage (without thumbnail for performance)
    const timeout = setTimeout(() => {
      const projectsStr = localStorage.getItem("pixel_projects");
      let projects: ProjectConfig[] = [];
      if (projectsStr) {
        try {
          projects = JSON.parse(projectsStr);
        } catch (e) {}
      }
      const existingIdx = projects.findIndex((p) => p.id === config.id);
      
      // Keep existing thumbnail if available
      const existingProject = projects[existingIdx];
      const updatedProject = { 
        ...config, 
        frames, 
        width, 
        height, 
        thumbnail: existingProject?.thumbnail 
      };

      if (existingIdx >= 0) {
        projects[existingIdx] = updatedProject;
      } else {
        projects.push(updatedProject);
      }
      
      try {
        localStorage.setItem("pixel_projects", JSON.stringify(projects));
      } catch (e) {
        console.error("Storage quota exceeded", e);
      }
    }, 5000); // 5 second debounce
    return () => clearTimeout(timeout);
  }, [frames, config, width, height]);

  const saveProject = useCallback(() => {
    const projectsStr = localStorage.getItem("pixel_projects");
    let projects: ProjectConfig[] = [];
    if (projectsStr) {
      try {
        projects = JSON.parse(projectsStr);
      } catch (e) {}
    }
    
    const updatedProject = { ...config, frames, width, height, updatedAt: Date.now() };

    // Efficient thumbnail generation using current canvas
    if (canvasRef.current) {
      const thumbSize = 256;
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = thumbSize;
      thumbCanvas.height = thumbSize;
      const thumbCtx = thumbCanvas.getContext("2d");
      if (thumbCtx) {
        thumbCtx.fillStyle = transparentBackground ? "transparent" : canvasBackgroundColor;
        thumbCtx.fillRect(0, 0, thumbSize, thumbSize);
        thumbCtx.imageSmoothingEnabled = false;
        thumbCtx.drawImage(canvasRef.current, 0, 0, thumbSize, thumbSize);
        updatedProject.thumbnail = thumbCanvas.toDataURL("image/png");
      }
    }

    if (projects.findIndex((p) => p.id === config.id) >= 0) {
      projects = projects.map((p) => (p.id === config.id ? updatedProject : p));
    } else {
      projects.push(updatedProject);
    }
    
    try {
      localStorage.setItem("pixel_projects", JSON.stringify(projects));
      sound.playAction();
      setSaveToast({ message: "Projeto Salvo!", visible: true });
      setTimeout(() => setSaveToast({ message: "", visible: false }), 2000);
    } catch (e) {
      console.error("Storage quota exceeded", e);
    }
  }, [frames, config, width, height, transparentBackground, canvasBackgroundColor]);

  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(() => {
    const saved = localStorage.getItem("pixel_custom_palettes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        /* fallback */
      }
    }
    return [{ id: "default", name: "Dawnbringer 32", colors: DEFAULT_PALETTE }];
  });
  const [activePaletteId, setActivePaletteId] = useState<string>(() => {
    return localStorage.getItem("pixel_active_palette_id") || "default";
  });

  useEffect(() => {
    localStorage.setItem(
      "pixel_custom_palettes",
      JSON.stringify(customPalettes)
    );
  }, [customPalettes]);

  useEffect(() => {
    localStorage.setItem("pixel_active_palette_id", activePaletteId);
  }, [activePaletteId]);

  // History stores the layers and texts of the current frame

  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const strokeStartData = useRef<string[] | null>(null);
  const strokePixels = useRef<{ x: number; y: number }[]>([]);

  // clearCurrentLayer
  const clearCurrentLayer = () => {
    const currentLayerData = frames[currentFrame].layers[currentLayer];
    if (!currentLayerData) return;

    setDeletedHistory((prev) => [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "clear",
        name: `Limpeza: ${currentLayerData.name || "Camada"}`,
        data: [...currentLayerData.data],
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    let newLayerData;
    let newTexts = frames[currentFrame].texts;

    if (selectionMask) {
      newLayerData = [...currentLayerData.data];
      for (let i = 0; i < width * height; i++) {
        if (selectionMask[i]) newLayerData[i] = "";
      }
    } else {
      newLayerData = new Array(width * height).fill("");
      newTexts = [];
    }

    updateCurrentLayer(newLayerData, true, newTexts);
    sound.playClick();
    if (window.navigator.vibrate) window.navigator.vibrate(50);
  };

  // pickColor
  const pickColor = (
    coords: { x: number; y: number },
    clientX: number,
    clientY: number
  ) => {
    const frame = frames[currentFrame];
    let pickedColor = "";
    for (let i = frame.layers.length - 1; i >= 0; i--) {
      const layer = frame.layers[i];
      if (layer.visible) {
        const color = layer.data[coords.y * width + coords.x];
        if (color) {
          pickedColor = color;
          break;
        }
      }
    }
    if (pickedColor) {
      selectColor(pickedColor, false);
      setPickerPreviewState({ color: pickedColor, x: clientX, y: clientY });
    } else {
      setPickerPreviewState({ color: "transparent", x: clientX, y: clientY });
    }
  };

  // Draw to canvas
  const drawToCanvas = useCallback(
    (frameData: Frame[], frameIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const render = (
        c: HTMLCanvasElement,
        context: CanvasRenderingContext2D,
        s: number
      ) => {
        context.clearRect(0, 0, c.width, c.height);
        // Background color is rendered by the z-5 div layer,
        // keeping canvas transparent so the grid shows through.

        // Use a single persistent offscreen canvas to avoid memory leaks
        let tempCanvas = (window as any)._editorTempCanvas;
        if (!tempCanvas) {
          tempCanvas = document.createElement("canvas");
          (window as any)._editorTempCanvas = tempCanvas;
        }
        if (tempCanvas.width !== width || tempCanvas.height !== height) {
          tempCanvas.width = width;
          tempCanvas.height = height;
        }
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        });

        const drawLayer = (l: Layer, alpha: number) => {
          if (!l.visible || !tempCtx) return;
          const imgData = tempCtx.createImageData(width, height);
          const data = imgData.data;
          for (let i = 0; i < l.data.length; i++) {
            const color = l.data[i];
            if (color && color !== "transparent") {
              const r = parseInt(color.slice(1, 3), 16);
              const g = parseInt(color.slice(3, 5), 16);
              const b = parseInt(color.slice(5, 7), 16);
              const a =
                color.length === 9 ? parseInt(color.slice(7, 9), 16) : 255;
              const idx = i * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }

          tempCtx.putImageData(imgData, 0, 0);
          context.imageSmoothingEnabled = false;
          context.globalAlpha = alpha;
          context.drawImage(tempCanvas, 0, 0, width * s, height * s);
          
          if (l.id === flashingLayerId) {
            context.save();
            context.globalCompositeOperation = 'source-atop';
            context.fillStyle = 'rgba(16, 185, 129, 0.5)'; // Soft green flash
            context.fillRect(0, 0, width * s, height * s);
            context.restore();
          }
          
          context.globalAlpha = 1.0;
        };

        if (onionSkin) {
          // Onion skin now works during both editing AND playback
          // During playback: creates a professional motion trail effect
          const baseAlpha = isPlaying ? 0.18 : 0.3;
          
          // Past frames - tinted with cyan for motion trail
          for (let i = onionSkinPast; i > 0; i--) {
            const pIdx = isPlaying 
              ? ((frameIdx - i) % frameData.length + frameData.length) % frameData.length
              : frameIdx - i;
            if (pIdx >= 0 && pIdx < frameData.length && pIdx !== frameIdx) {
              const alpha = baseAlpha / i;
              frameData[pIdx].layers.forEach((l) => drawLayer(l, alpha));
              
              // Apply tint overlay for past frames
              if (isPlaying) {
                context.save();
                context.globalCompositeOperation = 'source-atop';
                context.globalAlpha = 0.15 / i;
                context.fillStyle = '#00d4ff'; // Cyan tint for past
                context.fillRect(0, 0, c.width, c.height);
                context.restore();
                context.globalAlpha = 1.0;
              }
            }
          }
          
          // Future frames - tinted with magenta for motion trail
          for (let i = onionSkinFuture; i > 0; i--) {
            const fIdx = isPlaying
              ? (frameIdx + i) % frameData.length
              : frameIdx + i;
            if (fIdx >= 0 && fIdx < frameData.length && fIdx !== frameIdx) {
              const alpha = baseAlpha / i;
              frameData[fIdx].layers.forEach((l) => drawLayer(l, alpha));
              
              // Apply tint overlay for future frames
              if (isPlaying) {
                context.save();
                context.globalCompositeOperation = 'source-atop';
                context.globalAlpha = 0.15 / i;
                context.fillStyle = '#ff00d4'; // Magenta tint for future
                context.fillRect(0, 0, c.width, c.height);
                context.restore();
                context.globalAlpha = 1.0;
              }
            }
          }
        }

        const currFrame = frameData[frameIdx];
        currFrame.layers.forEach((l) => {
          drawLayer(l, l.opacity ?? 1);
        });

        // Draw Grid
        // JS Canvas grid drawing removed in favor of SVG overlay
      };

      render(canvas, ctx, 1);

      if (isActuallyRecording.current && recorderCanvasRef.current) {
        const rCanvas = recorderCanvasRef.current;
        const rCtx = rCanvas.getContext("2d");
        if (rCtx) {
          const s = getExportScale(recordingResolution);
          render(rCanvas, rCtx, s);

          // Draw Feedback on Recorder Canvas
          if (recordingFeedback) {
            const now = Date.now();
            const elapsed = now - recordingFeedback.timestamp;
            const duration = 1500;
            if (elapsed < duration) {
              const alpha = Math.min(1, (duration - elapsed) / 300);
              rCtx.save();
              rCtx.globalAlpha = alpha;

              const centerX = rCanvas.width / 2;
              const centerY = rCanvas.height - 40 * s;

              // Draw Bubble
              rCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
              rCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
              rCtx.lineWidth = 1 * s;

              const bubbleW = 120 * s;
              const bubbleH = 32 * s;

              rCtx.beginPath();
              rCtx.roundRect(
                centerX - bubbleW / 2,
                centerY - bubbleH / 2,
                bubbleW,
                bubbleH,
                10 * s
              );
              rCtx.fill();
              rCtx.stroke();

              rCtx.textAlign = "center";
              rCtx.textBaseline = "middle";

              if (recordingFeedback.type === "color") {
                // Drawing color preview
                rCtx.fillStyle = recordingFeedback.value;
                rCtx.beginPath();
                rCtx.arc(centerX - 40 * s, centerY, 8 * s, 0, Math.PI * 2);
                rCtx.fill();
                rCtx.strokeStyle = "white";
                rCtx.stroke();

                rCtx.font = `bold ${10 * s}px monospace`;
                rCtx.fillStyle = "white";
                rCtx.fillText(
                  recordingFeedback.value.toUpperCase(),
                  centerX + 10 * s,
                  centerY
                );
              } else {
                const labels: Record<string, string> = {
                  pencil: "✏️ LÁPIS",
                  eraser: "🧽 BORRACHA",
                  fill: "🪣 BALDE",
                  "erase-fill": "🗑️ LIMPAR",
                  picker: "🧪 COLETAR",
                  shape: "📐 FORMA",
                  select: "✂️ SELECIONAR",
                  hand: "✋ MÃO",
                  text: "🔠 TEXTO",
                  lighten: "☀️ DIA",
                  darken: "🌙 NOITE",
                  none: "🚫 NORMAL",
                  intensity: "⚡ INTENSIDADE",
                };
                const text =
                  labels[recordingFeedback.value] ||
                  recordingFeedback.value.toUpperCase();
                rCtx.font = `bold ${12 * s}px sans-serif`;
                rCtx.fillStyle = "white";
                rCtx.fillText(text, centerX, centerY);
              }
              rCtx.restore();
            }
          }
        }
      }
    },
    [
      width,
      height,
      transparentBackground,
      canvasBackgroundColor,
      onionSkin,
      isPlaying,
      selectionMask,
      onionSkinPast,
      onionSkinFuture,
      isActuallyRecording,
      recordingResolution,
      getExportScale,
      recordingFeedback,
    ]
  );

  useEffect(() => {
    let animFrame: number;
    if (recordingFeedback && isActuallyRecording.current) {
      const loop = () => {
        const now = Date.now();
        if (now - recordingFeedback.timestamp > 1500) {
          setRecordingFeedback(null);
          return;
        }
        drawToCanvas(frames, currentFrame);
        animFrame = requestAnimationFrame(loop);
      };
      animFrame = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [recordingFeedback, drawToCanvas, frames, currentFrame]);

  useEffect(() => {
    drawToCanvas(frames, currentFrame);
  }, [currentFrame, frames, drawToCanvas, selectionOffset]);

  useEffect(() => {
    setHistory([
      {
        layers: frames[currentFrame].layers,
        texts: frames[currentFrame].texts || [],
      },
    ]);
    setHistoryIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFrame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, 1000 / fps);
    }
    return () => clearInterval(interval);
  }, [isPlaying, fps, frames.length]);

  const getTransformedCoords = (clientX: number, clientY: number) => {
    const container = document.getElementById("canvas-container");
    if (!container) return null;
    const rect = container.getBoundingClientRect();

    // Position relative to center of the viewport/container
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 1. Un-translate (Pan is in screen pixels at zoom 1, so pan.x * zoom is current screen offset)
    let x = clientX - cx - pan.x * zoom;
    let y = clientY - cy - pan.y * zoom;

    // 2. Un-scale
    x /= zoom;
    y /= zoom;

    // 3. Un-rotate (Rotation happens around the center of the element)
    if (rotation !== 0) {
      const rad = -rotation * (Math.PI / 180);
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      x = rx;
      y = ry;
    }

    // Map from screen units at zoom 1 to canvas pixels
    const baseDimension = Math.min(
      window.innerWidth * 0.85,
      window.innerHeight * 0.55
    );
    const vWidth =
      width >= height ? baseDimension : baseDimension * (width / height);
    const screenToCanvas = width / vWidth;

    x = x * screenToCanvas + width / 2;
    y = y * screenToCanvas + height / 2;

    return { x, y };
  };

  const getUnclampedPixelCoords = (
    e: React.PointerEvent | React.MouseEvent | PointerEvent | Touch
  ) => {
    let clientX, clientY;
    if ("touches" in e) {
      clientX = (e as any).touches[0].clientX;
      clientY = (e as any).touches[0].clientY;
    } else {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    const coords = getTransformedCoords(clientX, clientY);
    if (!coords) return null;
    return { x: Math.floor(coords.x), y: Math.floor(coords.y) };
  };

  const getPixelCoords = (
    e: React.PointerEvent<HTMLCanvasElement> | PointerEvent | Touch
  ) => {
    let clientX, clientY;
    if ("touches" in e) {
      clientX = (e as any).touches[0].clientX;
      clientY = (e as any).touches[0].clientY;
    } else {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    const coords = getTransformedCoords(clientX, clientY);
    if (!coords) return null;
    const x = Math.floor(coords.x);
    const y = Math.floor(coords.y);
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return { x, y };
  };

  const getClampedPixelCoords = (
    e: React.PointerEvent<HTMLCanvasElement> | PointerEvent | Touch
  ) => {
    let clientX, clientY;
    if ("touches" in e) {
      clientX = (e as any).touches[0].clientX;
      clientY = (e as any).touches[0].clientY;
    } else {
      clientX = (e as any).clientX;
      clientY = (e as any).clientY;
    }

    const coords = getTransformedCoords(clientX, clientY);
    if (!coords) return null;
    const x = Math.max(0, Math.min(width - 1, Math.floor(coords.x)));
    const y = Math.max(0, Math.min(height - 1, Math.floor(coords.y)));
    return { x, y };
  };

  const adjustBrightness = (hex: string, amount: number) => {
    if (!hex || hex === "transparent" || hex === "") return hex;
    let cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
    let r = parseInt(cleanHex.slice(0, 2), 16);
    let g = parseInt(cleanHex.slice(2, 4), 16);
    let b = parseInt(cleanHex.slice(4, 6), 16);
    let a = cleanHex.length > 6 ? cleanHex.slice(6, 8) : "";
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${a}`;
  };

  const drawPixel = (
    cx: number,
    cy: number,
    color: string,
    size: number,
    layerData: string[],
    prevPos?: { x: number, y: number }
  ) => {
    // Mutate directly for performance

    const drawSinglePixel = (px: number, py: number, data: string[]) => {
      const offset = Math.floor(size / 2);
      const startX = size % 2 === 0 ? px - offset + 1 : px - offset;
      const startY = size % 2 === 0 ? py - offset + 1 : py - offset;

      // Helper to apply opacity to hex color
      const applyOpacity = (hex: string, op: number) => {
        if (!hex || hex === "transparent") return hex;
        if (op >= 1) return hex;
        // If it already has alpha, we might need to combine, but for simplicity let's just append/replace
        const baseHex = hex.length > 7 ? hex.slice(0, 7) : hex;
        const alpha = Math.round(op * 255)
          .toString(16)
          .padStart(2, "0");
        return `${baseHex}${alpha}`;
      };

      const finalColor = applyOpacity(color, brushOpacity);
      const isAlphaLocked =
        frames[currentFrame]?.layers[currentLayer]?.alphaLock;

      for (let y = startY; y < startY + size; y++) {
        for (let x = startX; x < startX + size; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            if (selectionMask && !selectionMask[y * width + x]) continue;
            if (isAlphaLocked && !data[y * width + x]) continue;
            let shouldDraw = true;
            const dx = x - px;
            const dy = y - py;

            if (brushType === "solid-circle") {
              const r = size / 2;
              if (dx * dx + dy * dy > r * r) shouldDraw = false;
            } else if (brushType === "soft") {
              const r = size / 2;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > r) shouldDraw = false;
              else {
                const falloff = 1 - dist / r;
                const softColor = applyOpacity(color, brushOpacity * falloff);
                if (shouldDraw) {
                  const pixelIdx = y * width + x;
                  if (lightingEffect === "none") {
                    data[pixelIdx] = softColor;
                  } else {
                    const existingColor = data[pixelIdx];
                    if (existingColor && existingColor !== "transparent") {
                      data[pixelIdx] = adjustBrightness(
                        existingColor,
                        lightingEffect === "lighten"
                          ? lightingIntensity
                          : -lightingIntensity
                      );
                    } else {
                      data[pixelIdx] = softColor;
                    }
                  }
                }
                continue;
              }
            } else if (brushType === "spray") {
              if (Math.random() > 0.2) shouldDraw = false;
            } else if (brushType === "dither") {
              if ((x + y) % 2 !== 0) shouldDraw = false;
            } else if (brushType === "cross") {
              if (x !== px && y !== py) shouldDraw = false;
            } else if (brushType === "diagonal") {
              if (dx !== dy) shouldDraw = false;
            } else if (brushType === "horizontal") {
              if (y !== py) shouldDraw = false;
            } else if (brushType === "vertical") {
              if (x !== px) shouldDraw = false;
            } else if (brushType === "noise") {
              if (Math.random() > 0.5) {
                const noiseOp = brushOpacity * (0.5 + Math.random() * 0.5);
                const noiseColor = applyOpacity(color, noiseOp);
                const pixelIdx = y * width + x;
                if (lightingEffect === "none") {
                  data[pixelIdx] = noiseColor;
                } else {
                  const existingColor = data[pixelIdx];
                  if (existingColor && existingColor !== "transparent") {
                    data[pixelIdx] = adjustBrightness(
                      existingColor,
                      lightingEffect === "lighten"
                        ? lightingIntensity
                        : -lightingIntensity
                    );
                  } else {
                    data[pixelIdx] = noiseColor;
                  }
                }
                continue;
              }
            } else if (brushType === "gradient") {
              const r = size / 2;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > r) shouldDraw = false;
              else {
                const falloff = 1 - dist / r;
                const gradColor = applyOpacity(color, brushOpacity * falloff);
                if (shouldDraw) {
                  const pixelIdx = y * width + x;
                  if (lightingEffect === "none") {
                    data[pixelIdx] = gradColor;
                  } else {
                    const existingColor = data[pixelIdx];
                    if (existingColor && existingColor !== "transparent") {
                      data[pixelIdx] = adjustBrightness(
                        existingColor,
                        lightingEffect === "lighten"
                          ? lightingIntensity
                          : -lightingIntensity
                      );
                    } else {
                      data[pixelIdx] = gradColor;
                    }
                  }
                }
                continue;
              }
            } else if (brushType === "hatch-right") {
              if ((x - y) % 4 !== 0) shouldDraw = false;
            } else if (brushType === "hatch-left") {
              if ((x + y) % 4 !== 0) shouldDraw = false;
            } else if (brushType === "hatch-cross") {
              if ((x - y) % 4 !== 0 && (x + y) % 4 !== 0) shouldDraw = false;
            } else if (brushType === "dots-dense") {
              if (x % 2 !== 0 || y % 2 !== 0) shouldDraw = false;
            } else if (brushType === "dots-sparse") {
              if (x % 4 !== 0 || y % 4 !== 0) shouldDraw = false;
            } else if (brushType === "checker") {
              if ((Math.floor(x / 2) + Math.floor(y / 2)) % 2 !== 0)
                shouldDraw = false;
            } else if (brushType === "zigzag") {
              if ((x + (y % 4 < 2 ? y % 4 : 4 - (y % 4))) % 4 !== 0)
                shouldDraw = false;
            } else if (brushType === "weave") {
              const wx = x % 4;
              const wy = y % 4;
              if (wx === wy || wx + wy === 3) shouldDraw = false;
            } else if (brushType === "bricks") {
              const bx = x % 8;
              const by = y % 4;
              if (!(by === 0 || bx === (by < 2 ? 0 : 4))) shouldDraw = false;
            } else if (brushType === "stars") {
              const sx = x % 5;
              const sy = y % 5;
              if (
                !(
                  (sx === 2 && sy === 2) ||
                  (sx === 2 && sy === 1) ||
                  (sx === 2 && sy === 3) ||
                  (sx === 1 && sy === 2) ||
                  (sx === 3 && sy === 2)
                )
              )
                shouldDraw = false;
            } else if (brushType === "diamond") {
              if (Math.abs(dx) + Math.abs(dy) > size / 2) shouldDraw = false;
            } else if (brushType === "star") {
              if (Math.abs(dx) * Math.abs(dy) > size / 4) shouldDraw = false;
            } else if (brushType === "heart") {
              const r = size / 2;
              const hx = dx / (r || 1);
              const hy = -dy / (r || 1); // Invert y for standard math coordinates
              if (hx * hx + Math.pow(hy - Math.sqrt(Math.abs(hx)), 2) > 1)
                shouldDraw = false;
            } else if (brushType === "hexagon") {
              if (
                Math.abs(dx) + Math.abs(dy) / 2 > size / 2 ||
                Math.abs(dy) > size / 2
              )
                shouldDraw = false;
            } else if (brushType === "triangle") {
              if (dy > size / 2 || dy < -size / 2 + Math.abs(dx) * 2)
                shouldDraw = false;
            } else if (brushType === "cross-thick") {
              if (Math.abs(dx) > size / 4 && Math.abs(dy) > size / 4)
                shouldDraw = false;
            } else if (brushType === "ring") {
              const r = size / 2;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > r || dist < r - Math.max(1, size / 4))
                shouldDraw = false;
            } else if (brushType === "dots-random") {
              if (Math.random() > 0.1) shouldDraw = false;
            } else if (brushType === "splatter") {
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (
                dist > size / 2 ||
                Math.random() > Math.pow(1 - dist / (size / 2), 2)
              )
                shouldDraw = false;
            } else if (brushType === "marker") {
              if (Math.abs(dx) > size / 4 || Math.abs(dy) > size / 2)
                shouldDraw = false;
            } else if (brushType === "grid") {
              if (x % 4 !== 0 && y % 4 !== 0) shouldDraw = false;
            } else if (brushType === "grid-diagonal") {
              if ((x + y) % 4 !== 0 && (x - y) % 4 !== 0) shouldDraw = false;
            } else if (brushType === "waves") {
              if (y % 4 !== Math.floor(Math.sin(x / 2) * 2)) shouldDraw = false;
            } else if (brushType === "scales") {
              const sx = x % 8;
              const sy = y % 4;
              if (sy === Math.floor(Math.sin((sx * Math.PI) / 4) * 2))
                shouldDraw = false;
            } else if (brushType === "wood") {
              if (Math.sin(x * 0.1 + Math.sin(y * 0.1) * 5) > 0.8)
                shouldDraw = false;
            } else if (brushType === "marble") {
              if (Math.sin(x * 0.05 + Math.sin(y * 0.05) * 10) > 0.5)
                shouldDraw = false;
            } else if (brushType === "clouds") {
              if (
                Math.random() >
                0.3 + Math.sin(x * 0.1) * 0.2 + Math.cos(y * 0.1) * 0.2
              )
                shouldDraw = false;
            } else if (brushType === "leaves") {
              if (Math.random() > 0.1 || Math.abs(dx) + Math.abs(dy) > size / 2)
                shouldDraw = false;
            } else if (brushType === "hatch-diagonal-right") {
              if ((x - y) % 2 !== 0) shouldDraw = false;
            } else if (brushType === "hatch-diagonal-left") {
              if ((x + y) % 2 !== 0) shouldDraw = false;
            }

            if (shouldDraw) {
              const pixelIdx = y * width + x;
              
              if (currentTool === "blur") {
                // Professional Blur Logic: Fast 3x3 average
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                for (let ny = -1; ny <= 1; ny++) {
                  for (let nx = -1; nx <= 1; nx++) {
                    const ix = x + nx;
                    const iy = y + ny;
                    if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                      const c = data[iy * width + ix];
                      if (c && c !== "transparent") {
                        const hex = c.startsWith("#") ? c.slice(1) : c;
                        r += parseInt(hex.slice(0, 2), 16);
                        g += parseInt(hex.slice(2, 4), 16);
                        b += parseInt(hex.slice(4, 6), 16);
                        a += hex.length > 6 ? parseInt(hex.slice(6, 8), 16) : 255;
                        count++;
                      }
                    }
                  }
                }
                if (count > 0) {
                  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
                  data[pixelIdx] = `#${toHex(r/count)}${toHex(g/count)}${toHex(b/count)}${toHex(a/count)}`;
                }
              } else if (currentTool === "smudge" && prevPos) {
                // Professional Smudge/Blend Logic: Pull pixels along the brush stroke
                const stepX = cx - prevPos.x;
                const stepY = cy - prevPos.y;
                const sx = Math.max(0, Math.min(width - 1, x - stepX));
                const sy = Math.max(0, Math.min(height - 1, y - stepY));
                
                const srcIdx = sy * width + sx;
                const srcColor = data[srcIdx];
                const destColor = data[pixelIdx];
                
                if (srcColor && srcColor !== "transparent") {
                  const sHex = srcColor.startsWith("#") ? srcColor.slice(1) : srcColor;
                  const dHex = (destColor && destColor !== "transparent") ? (destColor.startsWith("#") ? destColor.slice(1) : destColor) : "00000000";
                  
                  const sr = parseInt(sHex.slice(0, 2), 16);
                  const sg = parseInt(sHex.slice(2, 4), 16);
                  const sb = parseInt(sHex.slice(4, 6), 16);
                  const sa = sHex.length > 6 ? parseInt(sHex.slice(6, 8), 16) : 255;
                  
                  const dr = parseInt(dHex.slice(0, 2), 16);
                  const dg = parseInt(dHex.slice(2, 4), 16);
                  const db = parseInt(dHex.slice(4, 6), 16);
                  const da = dHex.length > 6 ? parseInt(dHex.slice(6, 8), 16) : 0;
                  
                  // Blend factor (pull strength)
                  const f = 0.6;
                  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
                  data[pixelIdx] = `#${toHex(dr*(1-f) + sr*f)}${toHex(dg*(1-f) + sg*f)}${toHex(db*(1-f) + sb*f)}${toHex(da*(1-f) + sa*f)}`;
                }
              } else if (currentTool === "airbrush") {
                // Professional Airbrush Logic: Soft radial build-up
                const r = size / 2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= r) {
                  const falloff = Math.pow(1 - dist / r, 2);
                  const opacity = 0.15 * falloff * brushOpacity; 
                  
                  const existingColor = data[pixelIdx];
                  const brushHex = color.startsWith("#") ? color.slice(1) : color;
                  const br = parseInt(brushHex.slice(0, 2), 16);
                  const bg = parseInt(brushHex.slice(2, 4), 16);
                  const bb = parseInt(brushHex.slice(4, 6), 16);
                  
                  if (existingColor && existingColor !== "transparent") {
                    const eHex = existingColor.startsWith("#") ? existingColor.slice(1) : existingColor;
                    const er = parseInt(eHex.slice(0, 2), 16);
                    const eg = parseInt(eHex.slice(2, 4), 16);
                    const eb = parseInt(eHex.slice(4, 6), 16);
                    const ea = eHex.length > 6 ? parseInt(eHex.slice(6, 8), 16) : 255;
                    
                    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
                    const outA = Math.min(255, ea + Math.round(opacity * 255));
                    data[pixelIdx] = `#${toHex(er*(1-opacity) + br*opacity)}${toHex(eg*(1-opacity) + bg*opacity)}${toHex(eb*(1-opacity) + bb*opacity)}${toHex(outA)}`;
                  } else {
                    data[pixelIdx] = applyOpacity(color, opacity);
                  }
                }
              } else if (lightingEffect === "none") {
                data[pixelIdx] = finalColor;
              } else {
                const existingColor = data[pixelIdx];
                  if (existingColor && existingColor !== "transparent") {
                    data[pixelIdx] = adjustBrightness(
                      existingColor,
                      lightingEffect === "lighten"
                        ? lightingIntensity
                        : -lightingIntensity
                    );
                  } else {
                    data[pixelIdx] = finalColor;
                  }
                }
              }
            }
          }
        }
        return data;
      };

    drawSinglePixel(cx, cy, layerData);

    if (symmetryX) {
      drawSinglePixel(width - 1 - cx, cy, layerData);
    }
    if (symmetryY) {
      drawSinglePixel(cx, height - 1 - cy, layerData);
    }
    if (symmetryX && symmetryY) {
      drawSinglePixel(width - 1 - cx, height - 1 - cy, layerData);
    }
    if (symmetryDiag1) {
      drawSinglePixel(cy, cx, layerData);
      if (symmetryX)
        drawSinglePixel(width - 1 - cy, cx, layerData);
      if (symmetryY)
        drawSinglePixel(cy, height - 1 - cx, layerData);
      if (symmetryX && symmetryY)
        drawSinglePixel(
          width - 1 - cy,
          height - 1 - cx,
          layerData
        );
    }
    if (symmetryDiag2) {
      drawSinglePixel(
        height - 1 - cy,
        width - 1 - cx,
        layerData
      );
      if (symmetryX)
        drawSinglePixel(
          width - 1 - (height - 1 - cy),
          width - 1 - cx,
          layerData
        );
      if (symmetryY)
        drawSinglePixel(
          height - 1 - cy,
          height - 1 - (width - 1 - cx),
          layerData
        );
      if (symmetryX && symmetryY)
        drawSinglePixel(
          width - 1 - (height - 1 - cy),
          height - 1 - (width - 1 - cx),
          layerData
        );
    }

    return layerData;
  };

  const getLinePixels = (x0: number, y0: number, x1: number, y1: number) => {
    const pixels: { x: number; y: number }[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let currX = x0;
    let currY = y0;
    while (true) {
      pixels.push({ x: currX, y: currY });
      if (currX === x1 && currY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }
    }
    return pixels;
  };

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    size: number,
    layerData: string[],
    prevPos?: { x: number; y: number }
  ) => {
    // Mutates layerData directly
    let lastPixelPos = prevPos || { x: x0, y: y0 };
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let currX = x0;
    let currY = y0;
    let dist = 0;
    while (true) {
      if (dist % brushSpacing === 0) {
        drawPixel(currX, currY, color, size, layerData, lastPixelPos);
        lastPixelPos = { x: currX, y: currY };
      }
      if (currX === x1 && currY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }
      dist++;
    }
    return layerData;
  };

  const drawRect = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    size: number,
    layerData: string[]
  ) => {
    let newLayerData = [...layerData];
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    newLayerData = drawLine(minX, minY, maxX, minY, color, size, newLayerData);
    newLayerData = drawLine(maxX, minY, maxX, maxY, color, size, newLayerData);
    newLayerData = drawLine(maxX, maxY, minX, maxY, color, size, newLayerData);
    newLayerData = drawLine(minX, maxY, minX, minY, color, size, newLayerData);

    return newLayerData;
  };

  const drawCircle = (
    xc: number,
    yc: number,
    r: number,
    color: string,
    size: number,
    layerData: string[]
  ) => {
    let newLayerData = [...layerData];
    let x = 0;
    let y = r;
    let d = 3 - 2 * r;

    const drawCirclePoints = (xc: number, yc: number, x: number, y: number) => {
      newLayerData = drawPixel(xc + x, yc + y, color, size, newLayerData);
      newLayerData = drawPixel(xc - x, yc + y, color, size, newLayerData);
      newLayerData = drawPixel(xc + x, yc - y, color, size, newLayerData);
      newLayerData = drawPixel(xc - x, yc - y, color, size, newLayerData);
      newLayerData = drawPixel(xc + y, yc + x, color, size, newLayerData);
      newLayerData = drawPixel(xc - y, yc + x, color, size, newLayerData);
      newLayerData = drawPixel(xc + y, yc - x, color, size, newLayerData);
      newLayerData = drawPixel(xc - y, yc - x, color, size, newLayerData);
    };

    if (r === 0) {
      return drawPixel(xc, yc, color, size, newLayerData);
    }

    drawCirclePoints(xc, yc, x, y);
    while (y >= x) {
      x++;
      if (d > 0) {
        y--;
        d = d + 4 * (x - y) + 10;
      } else {
        d = d + 4 * x + 6;
      }
      drawCirclePoints(xc, yc, x, y);
    }
    return newLayerData;
  };

  const scaleSelection = (
    data: string[],
    oldW: number,
    oldH: number,
    newW: number,
    newH: number
  ) => {
    if (newW === 0 || newH === 0) return [];
    const newData = new Array(newW * newH).fill("");
    for (let y = 0; y < newH; y++) {
      for (let x = 0; x < newW; x++) {
        const srcX = Math.floor((x * oldW) / newW);
        const srcY = Math.floor((y * oldH) / newH);
        newData[y * newW + x] = data[srcY * oldW + srcX];
      }
    }
    return newData;
  };

  const commitSelection = useCallback(() => {
    if (!selection) return;
    const layer = frames[currentFrame].layers[currentLayer];
    if (layer.locked || !layer.visible) {
      setSelection(null);
      return;
    }
    const newLayerData = [...layer.data];
    const scaledData = scaleSelection(
      selection.data,
      selection.originalW,
      selection.originalH,
      selection.w,
      selection.h
    );

    for (let sy = 0; sy < selection.h; sy++) {
      for (let sx = 0; sx < selection.w; sx++) {
        const color = scaledData[sy * selection.w + sx];
        if (color) {
          const px = selection.x + sx;
          const py = selection.y + sy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            newLayerData[py * width + px] = color;
          }
        }
      }
    }
    updateCurrentLayer(newLayerData, true);
    setSelection(null);
  }, [selection, frames, currentFrame, currentLayer, width, height]);

  // Commit selection when changing tool or layer/frame
  useEffect(() => {
    if (currentTool !== "select" && selection) {
      commitSelection();
      setPasteCount(0);
    }
  }, [currentTool]);

  useEffect(() => {
    if (selection) {
      commitSelection();
      setPasteCount(0);
    }
  }, [currentLayer, currentFrame]);

  const floodFill = (
    startX: number,
    startY: number,
    targetColor: string,
    replacementColor: string,
    layerData: string[]
  ) => {
    if (targetColor === replacementColor) return layerData;
    const startIndex = startY * width + startX;
    if (layerData[startIndex] !== targetColor) return layerData;
    if (selectionMask && !selectionMask[startIndex]) return layerData;
    const newLayerData = [...layerData];
    const queue = [{ x: startX, y: startY }];

    // Use a simple array for visited to avoid pushing the same pixel multiple times
    const visited = new Uint8Array(width * height);
    visited[startIndex] = 1;

    let head = 0;
    while (head < queue.length) {
      const { x, y } = queue[head++];
      const idx = y * width + x;

      if (newLayerData[idx] === targetColor) {
        if (selectionMask && !selectionMask[idx]) continue;
        newLayerData[idx] = replacementColor;

        if (
          x > 0 &&
          newLayerData[idx - 1] === targetColor &&
          !visited[idx - 1]
        ) {
          if (!selectionMask || selectionMask[idx - 1]) {
            visited[idx - 1] = 1;
            queue.push({ x: x - 1, y });
          }
        }
        if (
          x < width - 1 &&
          newLayerData[idx + 1] === targetColor &&
          !visited[idx + 1]
        ) {
          if (!selectionMask || selectionMask[idx + 1]) {
            visited[idx + 1] = 1;
            queue.push({ x: x + 1, y });
          }
        }
        if (
          y > 0 &&
          newLayerData[idx - width] === targetColor &&
          !visited[idx - width]
        ) {
          if (!selectionMask || selectionMask[idx - width]) {
            visited[idx - width] = 1;
            queue.push({ x, y: y - 1 });
          }
        }
        if (
          y < height - 1 &&
          newLayerData[idx + width] === targetColor &&
          !visited[idx + width]
        ) {
          if (!selectionMask || selectionMask[idx + width]) {
            visited[idx + width] = 1;
            queue.push({ x, y: y + 1 });
          }
        }
      }
    }
    return newLayerData;
  };

  const invertSelectionMask = () => {
    if (!selectionMask) return;
    sound.playClick();
    const newMask = selectionMask.map((v) => !v);
    setSelectionMask(newMask);
  };

  const clearSelectionMask = () => {
    sound.playClick();
    if (selection) {
      setSelection(null);
      setSelectionAction(null);
      return;
    }
    if (!selectionMask) return;
    const layer = frames[currentFrame].layers[currentLayer];
    if (layer.locked || !layer.visible) return;

    const newLayerData = [...layer.data];
    let changed = false;
    for (let i = 0; i < width * height; i++) {
      if (selectionMask[i] && newLayerData[i]) {
        newLayerData[i] = "";
        changed = true;
      }
    }
    if (changed) {
      updateCurrentLayer(newLayerData, true);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }
    setSelectionMask(null);
  };

  const fillSelectionMask = () => {
    if (!selectionMask) return;
    sound.playClick();
    const layer = frames[currentFrame].layers[currentLayer];
    if (layer.locked || !layer.visible) return;

    const newLayerData = [...layer.data];
    let changed = false;
    for (let i = 0; i < width * height; i++) {
      if (selectionMask[i] && newLayerData[i] !== currentColor) {
        newLayerData[i] = currentColor;
        changed = true;
      }
    }
    if (changed) {
      updateCurrentLayer(newLayerData, true);
    }
  };

  const copySelection = () => {
    if (selection) {
      setClipboard({ ...selection });
      sound.playClick();
      Toast.show({ text: "Desenho copiado!" });
    } else if (selectionMask) {
      const bounds = getMaskBounds(selectionMask);
      if (!bounds) return;
      const layer = frames[currentFrame].layers[currentLayer];
      const data = new Array(bounds.w * bounds.h).fill("");
      for (let sy = 0; sy < bounds.h; sy++) {
        for (let sx = 0; sx < bounds.w; sx++) {
          const idx = (bounds.y + sy) * width + (bounds.x + sx);
          if (selectionMask[idx]) {
            data[sy * bounds.w + sx] = layer.data[idx];
          }
        }
      }
      setClipboard({
        x: bounds.x,
        y: bounds.y,
        w: bounds.w,
        h: bounds.h,
        data,
        originalW: bounds.w,
        originalH: bounds.h,
      });
      sound.playClick();
      Toast.show({ text: "Desenho copiado!" });
    }
  };

  const cutSelection = () => {
    if (selection) {
      setClipboard({ ...selection });
      setSelection(null);
      sound.playClick();
    } else if (selectionMask) {
      copySelection();
      clearSelectionMask();
    }
  };

  const getMaskBounds = (mask: boolean[]) => {
    let minX = width,
      minY = height,
      maxX = -1,
      maxY = -1;
    let hasPixels = false;
    for (let i = 0; i < width * height; i++) {
      if (mask[i]) {
        hasPixels = true;
        const x = i % width;
        const y = Math.floor(i / width);
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (!hasPixels) return null;
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  };

  const handlePaste = () => {
    if (!clipboard) return;

    // FIX 1: Se já existe uma seleção flutuante sendo arrastada, nós a carimbamos na tela primeiro!
    // Isso evita que "a outra parte suma".
    if (selection) {
      commitSelection();
    }

    // FIX 2: Colar usando a posição original do clipboard com um pequeno offset (+2)
    // Isso evita o "teletransporte" para o centro da tela.
    let targetX = clipboard.x + 2;
    let targetY = clipboard.y + 2;

    // Se houver uma máscara de seleção ativa, podemos usar a posição dela
    if (selectionMask) {
      let maskMinX = width, maskMinY = height;
      for (let i = 0; i < width * height; i++) {
        if (selectionMask[i]) {
          maskMinX = Math.min(maskMinX, i % width);
          maskMinY = Math.min(maskMinY, Math.floor(i / width));
        }
      }
      targetX = maskMinX + 2;
      targetY = maskMinY + 2;
      setSelectionMask(null);
    }

    // Garante que pelo menos um pedaço fique visível na tela
    targetX = Math.max(-clipboard.w + 2, Math.min(targetX, width - 2));
    targetY = Math.max(-clipboard.h + 2, Math.min(targetY, height - 2));

    // Contador de cópias empilhadas
    if (lastPastePos.current && lastPastePos.current.x === targetX && lastPastePos.current.y === targetY) {
      setPasteCount(prev => prev + 1);
    } else {
      setPasteCount(1);
    }
    lastPastePos.current = { x: targetX, y: targetY };

    setSelection({
      x: targetX,
      y: targetY,
      w: clipboard.w,
      h: clipboard.h,
      data: [...clipboard.data],
      originalW: clipboard.w,
      originalH: clipboard.h,
    });

    if (currentTool !== "select") {
      selectTool("select");
    }

    sound.playClick();
    if (window.navigator.vibrate) window.navigator.vibrate(20);
    Toast.show({ text: "Desenho colado!" });
  };

  const getSupportedMimeType = (): { mimeType: string; extension: string } => {
    const candidates = [
      { mimeType: "video/webm;codecs=vp9", extension: "webm" },
      { mimeType: "video/webm;codecs=vp8", extension: "webm" },
      { mimeType: "video/webm", extension: "webm" },
      { mimeType: "video/mp4;codecs=avc1", extension: "mp4" },
      { mimeType: "video/mp4", extension: "mp4" },
    ];
    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
      } catch (_) {
        /* ignore */
      }
    }
    // Fallback – let the browser pick
    return { mimeType: "", extension: "webm" };
  };

  const startProcessRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup recorder canvas
    const s = getExportScale(recordingResolution);
    const rCanvas = document.createElement("canvas");
    rCanvas.width = width * s;
    rCanvas.height = height * s;
    (recorderCanvasRef as any).current = rCanvas;

    try {
      const { mimeType, extension } = getSupportedMimeType();
      const stream = rCanvas.captureStream(30);
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) recorderOptions.mimeType = mimeType;
      const recorder = new MediaRecorder(stream, recorderOptions);
      const activeMime = recorder.mimeType || mimeType || "video/webm";
      processChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) processChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(processChunksRef.current, { type: activeMime });

        // Save to indexedDB instead of direct download
        const newVideo: SavedVideo = {
          id: generateId(),
          name: `Gravação ${new Date().toLocaleString()}`,
          blob,
          timestamp: Date.now(),
          resolution: recordingResolution.toUpperCase(),
        };
        await videoStorage.saveVideo(newVideo);
        loadSavedVideos();
        setShowVideoGallery(true);

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `processo-desenho-${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
      };
      recorder.start();
      processRecorderRef.current = recorder;
      isActuallyRecording.current = true;

      // Force an initial draw
      drawToCanvas(frames, currentFrame);
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
    }
  };

  const stopProcessRecording = () => {
    if (
      processRecorderRef.current &&
      processRecorderRef.current.state !== "inactive"
    ) {
      processRecorderRef.current.stop();
    }
    isActuallyRecording.current = false;
    processRecorderRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.altKey || activePointers.current.size > 1) {
      return; // Handled by pan
    }
    if (activePanel && activePanel !== "frames") {
      setActivePanel(null);
      return;
    }
    if (isPlaying) return;

    // Start long press timer for quick tool switcher or handle right click
    if (e.button === 2) {
      e.preventDefault();
      setFloatingToolSwitcherPos({ x: e.clientX, y: e.clientY });
      setShowFloatingToolSwitcher(true);
      setHoveredQuickTool(null);
      sound.playClick();
      return;
    }

    if (
      currentTool === "pencil" ||
      currentTool === "eraser" ||
      currentTool === "picker"
    ) {
      longPressStartPos.current = { x: e.clientX, y: e.clientY };
      longPressToolTimer.current = setTimeout(() => {
        setFloatingToolSwitcherPos({ x: e.clientX, y: e.clientY });
        setShowFloatingToolSwitcher(true);
        setHoveredQuickTool(null);
        sound.playClick();
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }, 500);
    }

    if (currentTool === "text") {
      const unclampedCoords = getUnclampedPixelCoords(e);
      if (unclampedCoords) {
        const frame = frames[currentFrame];
        const texts = frame.texts || [];

        // Check if we clicked on an existing text to edit it
        if (!showTextInput) {
          const hitTextIndex = texts.findIndex((t) => {
            const metrics = getTextMetrics(
              t.text,
              t.font,
              t.size,
              t.bold,
              t.italic
            );
            return (
              unclampedCoords.x >= t.x &&
              unclampedCoords.x <= t.x + metrics.width &&
              unclampedCoords.y >= t.y &&
              unclampedCoords.y <= t.y + metrics.height
            );
          });

          if (hitTextIndex !== -1) {
            const t = texts[hitTextIndex];
            setTextInput(t.text);
            setTextPos({ x: t.x, y: t.y });
            setCurrentColor(t.color);
            setTextFont(t.font);
            setTextSize(t.size);
            setIsBold(t.bold);
            setIsItalic(t.italic);

            // Remove from frame
            const newFrames = [...frames];
            const currentFrameObj = { ...newFrames[currentFrame] };
            currentFrameObj.texts = texts.filter((_, i) => i !== hitTextIndex);
            newFrames[currentFrame] = currentFrameObj;
            setFrames(newFrames);

            textDragOffset.current = {
              x: unclampedCoords.x - t.x,
              y: unclampedCoords.y - t.y,
            };
            setShowTextInput(true);
            setTimeout(() => hiddenInputRef.current?.focus(), 0);
            isDraggingText.current = true;
            setTextDragAction(true);
            return;
          }
        }

        // Check if we clicked on the currently active text
        if (showTextInput && textPos) {
          const metrics = getTextMetrics(
            textInput || " ",
            textFont,
            textSize,
            isBold,
            isItalic
          );
          if (
            unclampedCoords.x >= textPos.x &&
            unclampedCoords.x <= textPos.x + metrics.width &&
            unclampedCoords.y >= textPos.y &&
            unclampedCoords.y <= textPos.y + metrics.height
          ) {
            textDragOffset.current = {
              x: unclampedCoords.x - textPos.x,
              y: unclampedCoords.y - textPos.y,
            };
            isDraggingText.current = true;
            setTextDragAction(true);
            return;
          }
        }

        // Otherwise, start new text
        setTextPos(unclampedCoords);
        textDragOffset.current = { x: 0, y: 0 };
      }
      isDraggingText.current = true;
      setTextDragAction(true);
      if (!showTextInput) {
        setShowTextInput(true);
        // Focus hidden input immediately to open keyboard on mobile
        setTimeout(() => hiddenInputRef.current?.focus(), 0);
      }
      return;
    }

    const coords = getPixelCoords(e);
    if (!coords) return;

    if (currentTool === "picker") {
      pickColor(coords, e.clientX, e.clientY);
      return;
    }

    if (currentTool === "hand" || isSpacePressed.current) return;

      if (currentTool === "select") {
      // Capture pointer for selection so events continue even when outside canvas
      try { (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId); } catch {}

      // Auto-select layer if clicking on a pixel (from top to bottom)
      const pxIdx = coords.y * width + coords.x;
      const f = frames[currentFrame];
      for (let i = f.layers.length - 1; i >= 0; i--) {
        const l = f.layers[i];
        if (l.visible && !l.locked && l.data[pxIdx] && l.data[pxIdx] !== "transparent") {
          if (currentLayer !== i) {
            setCurrentLayer(i);
            triggerLayerFlash(l.id);
            showAutoSelectBadge(l.name || `Camada ${i + 1}`, coords.x, coords.y);
          }
          break;
        }
      }

      if (selectType === "rect" || selectType === "lasso") {
        if (selection) {
          // Check if clicking inside selection
          if (
            coords.x >= selection.x &&
            coords.x < selection.x + selection.w &&
            coords.y >= selection.y &&
            coords.y < selection.y + selection.h
          ) {
            setSelectionAction("move");
            selectionActionRef.current = "move";
            setSelectionStart({ x: coords.x, y: coords.y });
            return;
          } else {
            commitSelection();
          }
        } else if (selectionMask) {
          const idx = coords.y * width + coords.x;
          if (!selectionMask[idx]) {
            // Clicked outside mask, clear it and start new selection
            setSelectionMask(null);
          }
          // If clicked inside mask, just clear mask and let new selection start below
          else {
            setSelectionMask(null);
          }
        }

        if (selectType === "rect") {
          setSelectionStart({ x: coords.x, y: coords.y });
          setSelectionAction("create");
          selectionActionRef.current = "create";
          setPasteCount(0);
        } else if (selectType === "lasso") {
          const unclamped = getUnclampedPixelCoords(e);
          if (unclamped) {
            setLassoPoints([{ x: unclamped.x, y: unclamped.y }]);
            setSelectionAction("create");
            selectionActionRef.current = "create";
          }
        }
      } else if (selectType === "magic-wand") {
        if (selection) {
          if (
            coords.x >= selection.x &&
            coords.x < selection.x + selection.w &&
            coords.y >= selection.y &&
            coords.y < selection.y + selection.h
          ) {
            setSelectionAction("move");
            selectionActionRef.current = "move";
            setSelectionStart({ x: coords.x, y: coords.y });
            return;
          } else {
            commitSelection();
          }
        }
        const frame = frames[currentFrame];
        const layer = frame.layers[currentLayer];
        if (!layer.visible || layer.locked) return;

        // Analisa o ambiente completo (todas as camadas visíveis) para a Varinha Mágica
        const composite = new Array(width * height).fill("");
        for (const l of frame.layers) {
          if (!l.visible) continue;
          for (let i = 0; i < width * height; i++) {
            if (l.data[i]) composite[i] = l.data[i];
          }
        }

        const targetColor = composite[coords.y * width + coords.x] || "";

        const getRGB = (hex: string) => {
          if (!hex || hex === "transparent") return null;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return { r, g, b };
        };

        const targetRGB = getRGB(targetColor);
        const newMask = new Array(width * height).fill(false);
        let hasSelection = false;
        let minX = width, minY = height, maxX = -1, maxY = -1;

        if (wandContiguous) {
          const stack = [[coords.x, coords.y]];
          const visited = new Uint8Array(width * height);
          visited[coords.y * width + coords.x] = 1;

          while (stack.length > 0) {
          const [x, y] = stack.pop()!;
          const idx = y * width + x;

          const color = composite[idx] || "";
          let match = false;

          if (color === targetColor) {
            match = true;
          } else if (selectionTolerance > 0 && targetRGB) {
            const currentRGB = getRGB(color);
            if (currentRGB) {
              const distance = Math.sqrt(
                Math.pow(targetRGB.r - currentRGB.r, 2) +
                  Math.pow(targetRGB.g - currentRGB.g, 2) +
                  Math.pow(targetRGB.b - currentRGB.b, 2)
              );
              if (distance <= selectionTolerance) match = true;
            } else if (targetColor === "" && selectionTolerance > 100) {
              match = true; // Simple case for empty pixels
            }
          }

          if (match) {
            newMask[idx] = true;
            hasSelection = true;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (x > 0 && !visited[idx - 1]) {
              visited[idx - 1] = 1;
              stack.push([x - 1, y]);
            }
            if (x < width - 1 && !visited[idx + 1]) {
              visited[idx + 1] = 1;
              stack.push([x + 1, y]);
            }
            if (y > 0 && !visited[idx - width]) {
              visited[idx - width] = 1;
              stack.push([x, y - 1]);
            }
            if (y < height - 1 && !visited[idx + width]) {
              visited[idx + width] = 1;
              stack.push([x, y + 1]);
            }
          }
          }
        } else {
          // GLOBAL WAND: Select all matching pixels in the whole layer
          for (let i = 0; i < width * height; i++) {
            const color = composite[i] || "";
            let match = false;
            if (color === targetColor) match = true;
            else if (selectionTolerance > 0 && targetRGB) {
              const currentRGB = getRGB(color);
              if (currentRGB) {
                const distance = Math.sqrt(
                  Math.pow(targetRGB.r - currentRGB.r, 2) +
                    Math.pow(targetRGB.g - currentRGB.g, 2) +
                    Math.pow(targetRGB.b - currentRGB.b, 2)
                );
                if (distance <= selectionTolerance) match = true;
              }
            }
            if (match) {
              newMask[i] = true;
              hasSelection = true;
              const x = i % width;
              const y = Math.floor(i / width);
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (hasSelection) {
          let finalMask = newMask;
          const effectiveMode = (selectionMask && selectMode === "replace") ? "add" : selectMode;

          if (effectiveMode === "add" && selectionMask) {
            finalMask = selectionMask.map((v, i) => v || newMask[i]);
          } else if (effectiveMode === "subtract" && selectionMask) {
            finalMask = selectionMask.map((v, i) => v && !newMask[i]);
          }
          setSelectionMask(finalMask);

          const newLayerData = [...layer.data];
          const w = maxX - minX + 1;
          const h = maxY - minY + 1;
          const extractedData = new Array(w * h).fill("");
          for (let sy = 0; sy < h; sy++) {
            for (let sx = 0; sx < w; sx++) {
              const px = minX + sx;
              const py = minY + sy;
              const i = py * width + px;
              if (newMask[i]) {
                extractedData[sy * w + sx] = newLayerData[i];
                newLayerData[i] = ""; // clear from layer
              }
            }
          }
          setSelection({
            x: minX,
            y: minY,
            w,
            h,
            data: extractedData,
            originalW: w,
            originalH: h,
          });
          updateCurrentLayer(newLayerData, true);
        } else {
          if (selectMode === "replace") setSelectionMask(null);
        }
      } else if (selectType === "lasso") {
        // Lasso pointer move is handled in handlePointerMove
      }
      return;
    }

    const frame = frames[currentFrame];
    const layer = frame.layers[currentLayer];
    if (!layer.visible || layer.locked) return;

    // Start recording if enabled and not already recording
    if (isProcessRecording && !isActuallyRecording.current) {
      startProcessRecording();
    }

    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

    isDrawing.current = true;
    lastPos.current = coords;
    startPos.current = coords;
    strokeStartData.current = [...layer.data];
    strokePixels.current = [{ x: coords.x, y: coords.y }];

    // Clone frames array; only deep-clone current frame's current layer for stroke editing
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers[currentLayer] = {
      ...newLayers[currentLayer],
      data: [...layer.data],
    };
    newFrames[currentFrame] = { ...newFrames[currentFrame], layers: newLayers };
    activeStrokeFrames.current = newFrames;

    let newLayerData = [...layer.data];
    const colorToUse =
      currentTool === "eraser" || currentTool === "erase-fill"
        ? ""
        : currentColor;

    if (currentTool === "fill" || currentTool === "erase-fill") {
      const targetColor = newLayerData[coords.y * width + coords.x] || "";
      newLayerData = floodFill(
        coords.x,
        coords.y,
        targetColor,
        colorToUse,
        newLayerData
      );
      if (activeStrokeFrames.current) {
        activeStrokeFrames.current[currentFrame].layers[currentLayer].data =
          newLayerData;
      }
      updateCurrentLayer(newLayerData, true);
      // Fill is instant - reset drawing state immediately
      isDrawing.current = false;
      activeStrokeFrames.current = null;
      lastPos.current = null;
      startPos.current = null;
      strokeStartData.current = null;
      const params = getSoundParams();
      sound.playColorSound();
    } else if (currentTool === "shape" && currentShape === "rope") {
      lazyPos.current = { x: coords.x, y: coords.y };
      targetLazyPos.current = { x: coords.x, y: coords.y };
      setRopeState({ phase: "drawing", start: coords, end: coords, control: null });
      ropeTimer.current = setTimeout(() => {
        setRopeState(prev => {
          // Snap end to current target when switching to curving
          const finalEnd = targetLazyPos.current || prev.end || prev.start;
          return { ...prev, phase: "curving", end: finalEnd };
        });
        if (window.navigator.vibrate) window.navigator.vibrate(50);
      }, 600);
    } else if (currentTool === "pencil" || currentTool === "eraser") {
      newLayerData = drawPixel(
        coords.x,
        coords.y,
        colorToUse,
        brushSize,
        newLayerData
      );
      if (activeStrokeFrames.current) {
        activeStrokeFrames.current[currentFrame].layers[currentLayer].data =
          newLayerData;
        drawToCanvas(activeStrokeFrames.current, currentFrame);
      }
      if (currentTool === "eraser") {
        const params = getSoundParams();
        sound.playErase(params.muffle, params.speed);
      } else {
        const params = getSoundParams();
        sound.playDraw(params.muffle, params.speed);
      }
    } else if (currentTool === "shape") {
      newLayerData = drawPixel(
        coords.x,
        coords.y,
        colorToUse,
        brushSize,
        newLayerData
      );
      if (activeStrokeFrames.current) {
        activeStrokeFrames.current[currentFrame].layers[currentLayer].data =
          newLayerData;
        drawToCanvas(activeStrokeFrames.current, currentFrame);
      }
      const params = getSoundParams();
      sound.playDraw(params.muffle, params.speed);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Handle floating tool switcher logic
    if (showFloatingToolSwitcher) {
      const dx = e.clientX - floatingToolSwitcherPos.x;
      const dy = e.clientY - floatingToolSwitcherPos.y;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 25) {
        if (dx < -35) {
          if (hoveredQuickTool !== "pencil") {
            setHoveredQuickTool("pencil");
            sound.playClick();
          }
        } else if (dx > 35) {
          if (hoveredQuickTool !== "picker") {
            setHoveredQuickTool("picker");
            sound.playClick();
          }
        } else if (Math.abs(dx) < 25) {
          if (hoveredQuickTool !== "eraser") {
            setHoveredQuickTool("eraser");
            sound.playClick();
          }
        } else {
          setHoveredQuickTool(null);
        }

        // Auto-commit if moving far away from the switcher
        if (dist > 120 && hoveredQuickTool) {
          selectTool(hoveredQuickTool);
          setShowFloatingToolSwitcher(false);
          setHoveredQuickTool(null);
          // Don't return, allow the rest of the move event to process for the new tool
        } else {
          return;
        }
      } else {
        setHoveredQuickTool(null);
        return;
      }
    }

    // Cancel long press if moved significantly from start position
    if (longPressToolTimer.current && longPressStartPos.current) {
      const dx = e.clientX - longPressStartPos.current.x;
      const dy = e.clientY - longPressStartPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If moved more than 5 pixels (screen pixels) total, it's a drag/draw, not a long press
      if (dist > 5) {
        clearTimeout(longPressToolTimer.current);
        longPressToolTimer.current = null;
        longPressStartPos.current = null;
      }
    }

    if (currentTool === "text" && isDraggingText.current) {
      const coords = getUnclampedPixelCoords(e);
      if (coords) {
        setTextPos({
          x: coords.x - textDragOffset.current.x,
          y: coords.y - textDragOffset.current.y,
        });
      }
      return;
    }

    if (currentTool === "picker") {
      const coords = getPixelCoords(e);
      if (coords) pickColor(coords, e.clientX, e.clientY);
      return;
    }

    if (
      currentTool === "select" &&
      (selectionAction || selectionActionRef.current) &&
      selectionStart
    ) {
      const activeAction = selectionAction || selectionActionRef.current;
      if (selectType === "rect") {
        const coords = getClampedPixelCoords(e);
        if (!coords) return;

        if (activeAction === "create") {
          const x = Math.min(selectionStart.x, coords.x);
          const y = Math.min(selectionStart.y, coords.y);
          const w = Math.abs(coords.x - selectionStart.x) + 1;
          const h = Math.abs(coords.y - selectionStart.y) + 1;

          const newMask = new Array(width * height).fill(false);
          for (let sy = 0; sy < h; sy++) {
            for (let sx = 0; sx < w; sx++) {
              const px = x + sx;
              const py = y + sy;
              if (px >= 0 && px < width && py >= 0 && py < height) {
                newMask[py * width + px] = true;
              }
            }
          }
          setSelectionMask(newMask);
        } else if (activeAction === "move" && selection) {
          const dx = coords.x - selectionStart.x;
          const dy = coords.y - selectionStart.y;
          if (dx !== 0 || dy !== 0) {
            setPasteCount(0); // Fade out counter on move
          }
          setSelection({
            ...selection,
            x: selection.x + dx,
            y: selection.y + dy,
          });
          setSelectionStart(coords);
        } else if (activeAction === "scale" && selection) {
          const w = Math.max(1, coords.x - selection.x + 1);
          const h = Math.max(1, coords.y - selection.y + 1);
          setSelection({
            ...selection,
            w,
            h,
          });
        }
      } else if (selectType === "lasso" && activeAction === "create") {
        const unclamped = getUnclampedPixelCoords(e);
        if (unclamped) {
          setLassoPoints((prev) => {
            const last = prev[prev.length - 1];
            if (!last || last.x !== unclamped.x || last.y !== unclamped.y) {
              return [...prev, { x: unclamped.x, y: unclamped.y }];
            }
            return prev;
          });
        }
      }
      return;
    }

    if (
      !isDrawing.current ||
      isPlaying ||
      currentTool === "fill" ||
      currentTool === "erase-fill"
    )
      return;
    const coords = getClampedPixelCoords(e);
    if (
      !coords ||
      !lastPos.current ||
      !startPos.current ||
      !strokeStartData.current
    )
      return;

    const layer = frames[currentFrame].layers[currentLayer];
    if (!layer.visible || layer.locked) return;

    const colorToUse =
      currentTool === "eraser" || currentTool === "erase-fill"
        ? ""
        : currentColor;

    if (currentTool === "pencil" || currentTool === "eraser" || currentTool === "blur" || currentTool === "smudge" || currentTool === "airbrush") {
      if (activeStrokeFrames.current && lastPos.current && strokeStartData.current) {
        if (precisionMode) {
          // Precision mode draws from start point to current point on a copy of start data
          const newLayerData = drawLine(
            startPos.current.x,
            startPos.current.y,
            coords.x,
            coords.y,
            colorToUse,
            brushSize,
            [...strokeStartData.current],
            lastPos.current
          );
          activeStrokeFrames.current[currentFrame].layers[currentLayer].data = newLayerData;
        } else {
          // Normal mode mutates the active stroke data incrementally
          const data = activeStrokeFrames.current[currentFrame].layers[currentLayer].data;
          drawLine(
            lastPos.current.x,
            lastPos.current.y,
            coords.x,
            coords.y,
            colorToUse,
            brushSize,
            data,
            lastPos.current
          );
          lastPos.current = coords;
        }
        drawToCanvas(activeStrokeFrames.current, currentFrame);
      }
      
      if (Math.random() > 0.8) {
        const params = getSoundParams();
        if (currentTool === "eraser")
          sound.playErase(params.muffle, params.speed);
        else {
          sound.playDraw(params.muffle, params.speed);
        }
      }
    } else if (currentTool === "shape") {
      if (activeStrokeFrames.current && startPos.current && strokeStartData.current) {
        let newLayerData;
        if (currentShape === "line") {
          newLayerData = drawLine(
            startPos.current.x,
            startPos.current.y,
            coords.x,
            coords.y,
            colorToUse,
            brushSize,
            [...strokeStartData.current]
          );
        } else if (currentShape === "rect") {
          newLayerData = drawRect(
            startPos.current.x,
            startPos.current.y,
            coords.x,
            coords.y,
            colorToUse,
            brushSize,
            [...strokeStartData.current]
          );
        } else if (currentShape === "circle") {
          const r = Math.round(
            Math.sqrt(
              Math.pow(coords.x - startPos.current.x, 2) +
                Math.pow(coords.y - startPos.current.y, 2)
            )
          );
          newLayerData = drawCircle(
            startPos.current.x,
            startPos.current.y,
            r,
            colorToUse,
            brushSize,
            [...strokeStartData.current]
          );
        } else if (currentShape === "rope") {
          targetLazyPos.current = coords;
          
          if (ropeState.phase === "curving") {
            setRopeState(prev => ({ ...prev, control: coords }));
            newLayerData = drawRope(
              ropeState.start!.x,
              ropeState.start!.y,
              coords.x,
              coords.y,
              ropeState.end!.x,
              ropeState.end!.y,
              colorToUse,
              brushSize,
              [...strokeStartData.current!]
            );
          }
        }
        if (newLayerData) {
          activeStrokeFrames.current[currentFrame].layers[currentLayer].data = newLayerData;
          drawToCanvas(activeStrokeFrames.current, currentFrame);
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (longPressToolTimer.current) {
      clearTimeout(longPressToolTimer.current);
      longPressToolTimer.current = null;
      longPressStartPos.current = null;
    }
    if (showFloatingToolSwitcher) {
      if (hoveredQuickTool && hoveredQuickTool !== currentTool) {
        selectTool(hoveredQuickTool);
      }
      setShowFloatingToolSwitcher(false);
      setHoveredQuickTool(null);
      return;
    }

    if (ropeTimer.current) {
      clearTimeout(ropeTimer.current);
      ropeTimer.current = null;
    }
    setRopeState({ phase: "idle", start: null, end: null, control: null });

    if (currentTool === "text") {
      isDraggingText.current = false;
    }
    if (currentTool === "picker") {
      if (pickerPreviewState) {
        selectTool("pencil");
      }
      setPickerPreviewState(null);
    }
    if (currentTool === "select" && selectionAction) {
      if (selectType === "rect" || selectType === "lasso") {
        if (selectionAction === "create" && selectType === "lasso" && lassoPoints.length > 2) {
          // Draw polygon to an offscreen canvas to generate mask
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
            for (let i = 1; i < lassoPoints.length; i++) {
              ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
            }
            ctx.closePath();
            ctx.fill();
            
            const imgData = ctx.getImageData(0, 0, width, height).data;
            const newMask = new Array(width * height).fill(false);
            for (let i = 0; i < width * height; i++) {
              if (imgData[i * 4] > 128) {
                newMask[i] = true;
              }
            }
            
            // Auto-float lasso selection
            const bounds = getMaskBounds(newMask);
            if (bounds) {
              const layer = frames[currentFrame].layers[currentLayer];
              const extractedData = new Array(bounds.w * bounds.h).fill("");
              const newLayerData = [...layer.data];
              for (let sy = 0; sy < bounds.h; sy++) {
                for (let sx = 0; sx < bounds.w; sx++) {
                  const pIdx = (bounds.y + sy) * width + (bounds.x + sx);
                  if (newMask[pIdx]) {
                    extractedData[sy * bounds.w + sx] = layer.data[pIdx];
                    newLayerData[pIdx] = "";
                  }
                }
              }
              setSelection({
                x: bounds.x,
                y: bounds.y,
                w: bounds.w,
                h: bounds.h,
                data: extractedData,
                originalW: bounds.w,
                originalH: bounds.h,
              });
              updateCurrentLayer(newLayerData, true);
              setSelectionMask(null);
            }
          }
          setLassoPoints([]);
        } else if (selectionAction === "create" && selectType === "rect" && selectionMask) {
          // Auto-float rect selection
          const bounds = getMaskBounds(selectionMask);
          if (bounds) {
            const layer = frames[currentFrame].layers[currentLayer];
            const extractedData = new Array(bounds.w * bounds.h).fill("");
            const newLayerData = [...layer.data];
            for (let sy = 0; sy < bounds.h; sy++) {
              for (let sx = 0; sx < bounds.w; sx++) {
                const pIdx = (bounds.y + sy) * width + (bounds.x + sx);
                if (selectionMask[pIdx]) {
                  extractedData[sy * bounds.w + sx] = layer.data[pIdx];
                  newLayerData[pIdx] = "";
                }
              }
            }
            setSelection({
              x: bounds.x,
              y: bounds.y,
              w: bounds.w,
              h: bounds.h,
              data: extractedData,
              originalW: bounds.w,
              originalH: bounds.h,
            });
            updateCurrentLayer(newLayerData, true);
            setSelectionMask(null);
          }
        }
        
        setSelectionAction(null);
        selectionActionRef.current = null;
        setSelectionStart(null);
        return;
      }
    }

    if (!isDrawing.current) return;
    isDrawing.current = false;

    // Release pointer capture
    try { (document.querySelector('#main-drawing-canvas') as HTMLElement)?.releasePointerCapture?.(0); } catch {}

    // Commit only the current frame's current layer (not ALL frames)
    // Fill/erase-fill already committed in handlePointerDown via updateCurrentLayer
    if (activeStrokeFrames.current && currentTool !== "fill" && currentTool !== "erase-fill") {
      const finalLayerData = activeStrokeFrames.current[currentFrame]?.layers?.[currentLayer]?.data;
      if (finalLayerData) {
        updateCurrentLayer(finalLayerData, true);
      }
    }

    lastPos.current = null;
    startPos.current = null;
    strokeStartData.current = null;
    activeStrokeFrames.current = null;
  };

  const restoreDeletedItem = (item: {
    id: string;
    type: "clear" | "layer" | "frame";
    name: string;
    data: any;
    timestamp: number;
  }) => {
    saveToHistory(frames[currentFrame].layers);
    if (item.type === "clear") {
      const newFrames = [...frames];
      newFrames[currentFrame].layers[currentLayer].data = [...item.data];
      setFrames(newFrames);
    } else if (item.type === "layer") {
      const newFrames = [...frames];
      newFrames[currentFrame].layers.push({
        ...item.data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      });
      setFrames(newFrames);
      setCurrentLayer(newFrames[currentFrame].layers.length - 1);
    } else if (item.type === "frame") {
      const newFrames = [...frames];
      newFrames.push({
        ...item.data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      });
      setFrames(newFrames);
      setCurrentFrame(newFrames.length - 1);
    }
    setDeletedHistory((prev) => prev.filter((i) => i.id !== item.id));
    setShowDeletedHistory(false);
  };

  const applyEffectToLayer = (newData: string[]) => {
    saveToHistory(frames[currentFrame].layers);
    const newFrames = [...frames];
    const currentFrameObj = { ...newFrames[currentFrame] };
    const newLayers = [...currentFrameObj.layers];
    newLayers[currentLayer] = {
      ...newLayers[currentLayer],
      data: newData
    };
    currentFrameObj.layers = newLayers;
    newFrames[currentFrame] = currentFrameObj;
    setFrames(newFrames);
    sound.playClick();
  };

  // Layer Management
  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `Layer ${frames[currentFrame].layers.length + 1}`,
      data: new Array(width * height).fill(""),
      visible: true,
      locked: false,
    };
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers.splice(currentLayer + 1, 0, newLayer);
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    setCurrentLayer(currentLayer + 1);
    saveToHistory(newLayers);
  };

  const deleteLayer = (idx: number) => {
    const layers = frames[currentFrame].layers;
    if (layers.length === 1) return;

    setDeletedHistory((prev) => [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "layer",
        name: `Camada: ${layers[idx].name}`,
        data: { ...layers[idx] },
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    const newFrames = [...frames];
    const newLayers = layers.filter((_, i) => i !== idx);
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    if (currentLayer >= newLayers.length) {
      setCurrentLayer(newLayers.length - 1);
    } else if (currentLayer === idx && idx > 0) {
      setCurrentLayer(idx - 1);
    }
    saveToHistory(newLayers);
  };

  const toggleLayerVisibility = (idx: number) => {
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers[idx] = { ...newLayers[idx], visible: !newLayers[idx].visible };
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    saveToHistory(newLayers);
  };

  const toggleLayerLock = (idx: number) => {
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers[idx] = { ...newLayers[idx], locked: !newLayers[idx].locked };
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    saveToHistory(newLayers);
  };

  const toggleLayerAlphaLock = (idx: number) => {
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers[idx] = {
      ...newLayers[idx],
      alphaLock: !newLayers[idx].alphaLock,
    };
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    saveToHistory(newLayers);
  };

  const updateLayerOpacity = (idx: number, opacity: number) => {
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers[idx] = { ...newLayers[idx], opacity };
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    saveToHistory(newLayers);
  };

  const mergeLayerDown = (idx: number) => {
    if (idx === 0) return;
    const frame = frames[currentFrame];
    const topLayer = frame.layers[idx];
    const bottomLayer = frame.layers[idx - 1];

    const newData = [...bottomLayer.data];
    for (let i = 0; i < topLayer.data.length; i++) {
      if (topLayer.data[i]) {
        newData[i] = topLayer.data[i];
      }
    }

    const newLayers = [...frame.layers];
    newLayers[idx - 1] = { ...bottomLayer, data: newData };
    newLayers.splice(idx, 1);

    const newFrames = [...frames];
    newFrames[currentFrame] = { ...frame, layers: newLayers };
    setFrames(newFrames);

    if (currentLayer >= newLayers.length) {
      setCurrentLayer(newLayers.length - 1);
    } else if (currentLayer === idx) {
      setCurrentLayer(idx - 1);
    }
    saveToHistory(newLayers);
  };

  const duplicateLayer = (idx: number) => {
    const frame = frames[currentFrame];
    const layerToDuplicate = frame.layers[idx];
    const newLayer: Layer = {
      ...layerToDuplicate,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${layerToDuplicate.name} (Cópia)`,
      data: [...layerToDuplicate.data],
    };

    const newLayers = [...frame.layers];
    newLayers.splice(idx + 1, 0, newLayer);

    const newFrames = [...frames];
    newFrames[currentFrame] = { ...frame, layers: newLayers };
    setFrames(newFrames);
    setCurrentLayer(idx + 1);
    triggerLayerFlash(newLayer.id);
    saveToHistory(newLayers);
    sound.playClick();
  };

  const renameLayer = (idx: number, newName: string) => {
    const newFrames = [...frames];
    const newLayers = [...newFrames[currentFrame].layers];
    newLayers[idx] = { ...newLayers[idx], name: newName };
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    saveToHistory(newLayers);
  };

  const handleRenameLayer = (idx: number) => {
    const layer = frames[currentFrame].layers[idx];
    const value = prompt("Nome da camada:", layer.name);
    if (value !== null) {
      renameLayer(idx, value.trim());
    }
  };

  const handleRenameSubmit = (idx: number, value: string) => {
    if (value.trim()) {
      renameLayer(idx, value.trim());
    }
    setRenamingLayerId(null);
    setRenamingValue("");
    sound.playClick();
  };

  const reorderLayers = (newLayers: Layer[]) => {
    const newFrames = [...frames];
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);

    // Find the new index of the currently selected layer
    const currentLayerId = frames[currentFrame].layers[currentLayer]?.id;
    if (!currentLayerId) {
      setCurrentLayer(0);
      saveToHistory(newLayers);
      return;
    }

    const newCurrentLayerIndex = newLayers.findIndex(
      (l) => l.id === currentLayerId
    );
    if (newCurrentLayerIndex !== -1) {
      setCurrentLayer(newCurrentLayerIndex);
    }

    saveToHistory(newLayers);
  };

  const moveLayer = (idx: number, direction: "up" | "down") => {
    const frame = frames[currentFrame];
    const newLayers = [...frame.layers];
    const targetIdx = direction === "up" ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= newLayers.length) return;

    [newLayers[idx], newLayers[targetIdx]] = [
      newLayers[targetIdx],
      newLayers[idx],
    ];

    const newFrames = [...frames];
    newFrames[currentFrame] = { ...frame, layers: newLayers };
    setFrames(newFrames);
    setCurrentLayer(targetIdx);
    saveToHistory(newLayers);
    sound.playClick();
  };

  const moveToLimit = (idx: number, limit: "top" | "bottom") => {
    const frame = frames[currentFrame];
    const newLayers = [...frame.layers];
    const layer = newLayers.splice(idx, 1)[0];

    if (limit === "top") {
      newLayers.push(layer);
    } else {
      newLayers.unshift(layer);
    }

    const newFrames = [...frames];
    newFrames[currentFrame] = { ...frame, layers: newLayers };
    setFrames(newFrames);
    setCurrentLayer(limit === "top" ? newLayers.length - 1 : 0);
    saveToHistory(newLayers);
    sound.playClick();
  };

  const reorderFrames = (newOrder: Frame[]) => {
    const currentFrameId = frames[currentFrame].id;
    setFrames(newOrder);
    const newCurrentFrameIndex = newOrder.findIndex(
      (f) => f.id === currentFrameId
    );
    if (newCurrentFrameIndex !== -1) {
      setCurrentFrame(newCurrentFrameIndex);
    }
  };

  const moveLayerUp = (idx: number) => {
    const layers = frames[currentFrame].layers;
    if (idx === layers.length - 1) return;
    const newFrames = [...frames];
    const newLayers = [...layers];
    [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    setCurrentLayer(idx + 1);
    saveToHistory(newLayers);
  };

  const moveLayerDown = (idx: number) => {
    if (idx === 0) return;
    const newFrames = [...frames];
    const newLayers = [...frames[currentFrame].layers];
    [newLayers[idx], newLayers[idx - 1]] = [newLayers[idx - 1], newLayers[idx]];
    newFrames[currentFrame].layers = newLayers;
    setFrames(newFrames);
    setCurrentLayer(idx - 1);
    saveToHistory(newLayers);
  };

  // Frame Management

  const duplicateFrame = () => {
    const currFrame = frames[currentFrame];
    const newFrame: Frame = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      layers: currFrame.layers.map((l) => ({
        ...l,
        data: [...l.data],
        id:
          Date.now().toString() +
          Math.random().toString(36).substr(2, 9) +
          Math.random(),
      })),
    };
    setFrames([...frames, newFrame]);
    setCurrentFrame(frames.length);
  };

  const deleteFrame = (idx: number) => {
    const frameToDelete = frames[idx];
    setDeletedHistory((prev) => [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: "frame",
        name: `Quadro ${idx + 1}`,
        data: { ...frameToDelete },
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    setDeletedFrame({ frame: frameToDelete, index: idx });
    setTimeout(() => setDeletedFrame(null), 5000);

    if (frames.length === 1) {
      const newFrame: Frame = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        layers: [
          {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: "Layer 1",
            data: new Array(width * height).fill(""),
            visible: true,
          },
        ],
      };
      setFrames([newFrame]);
      setCurrentFrame(0);
      setCurrentLayer(0);
      return;
    }
    const newFrames = frames.filter((_, i) => i !== idx);
    setFrames(newFrames);
    if (currentFrame >= newFrames.length) {
      setCurrentFrame(newFrames.length - 1);
    }
  };

  const restoreDeletedFrame = () => {
    if (!deletedFrame) return;
    const newFrames = [...frames];
    newFrames.splice(deletedFrame.index, 0, deletedFrame.frame);
    setFrames(newFrames);
    setCurrentFrame(deletedFrame.index);
    setDeletedFrame(null);
  };

  const moveFrameLeft = (idx: number) => {
    if (idx === 0) return;
    const newFrames = [...frames];
    [newFrames[idx], newFrames[idx - 1]] = [newFrames[idx - 1], newFrames[idx]];
    setFrames(newFrames);
    if (currentFrame === idx) setCurrentFrame(idx - 1);
    else if (currentFrame === idx - 1) setCurrentFrame(idx);
  };

  const moveFrameRight = (idx: number) => {
    if (idx === frames.length - 1) return;
    const newFrames = [...frames];
    [newFrames[idx], newFrames[idx + 1]] = [newFrames[idx + 1], newFrames[idx]];
    setFrames(newFrames);
    if (currentFrame === idx) setCurrentFrame(idx + 1);
    else if (currentFrame === idx + 1) setCurrentFrame(idx);
  };

  // Share
  const generateShareCanvas = (addWatermark = true): HTMLCanvasElement => {
    const scale = Math.max(10, Math.ceil(1080 / height));
    const canvas = document.createElement("canvas");
    const watermarkHeight = addWatermark
      ? Math.max(24, Math.floor(scale * 1.5))
      : 0;
    canvas.width = width * scale;
    canvas.height = height * scale + watermarkHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    if (!transparentBackground) {
      ctx.fillStyle = canvasBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, height * scale);
    }

    const frame = frames[currentFrame];
    frame.layers.forEach((layer) => {
      if (!layer.visible) return;
      for (let y2 = 0; y2 < height; y2++) {
        for (let x2 = 0; x2 < width; x2++) {
          const color = layer.data[y2 * width + x2];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x2 * scale, y2 * scale, scale, scale);
          }
        }
      }
    });

    frame.texts?.forEach((t) => {
      ctx.font = `${t.italic ? "italic " : ""}${t.bold ? "bold " : ""}${
        t.size * scale
      }px ${t.font}`;
      ctx.fillStyle = t.color;
      ctx.textBaseline = "top";
      ctx.fillText(t.text, t.x * scale, t.y * scale);
    });

    if (addWatermark && watermarkHeight > 0) {
      const wmY = height * scale;
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, wmY, canvas.width, watermarkHeight);
      const fontSize = Math.max(10, Math.floor(watermarkHeight * 0.5));
      ctx.font = `bold ${fontSize}px "Press Start 2P", monospace, sans-serif`;
      ctx.fillStyle = "#888888";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "Made with DragonArt \uD83D\uDC09",
        canvas.width / 2,
        wmY + watermarkHeight / 2
      );
    }

    return canvas;
  };

  const shareArt = async (method: "native" | "clipboard" | "download") => {
    setShareStatus("generating");
    const useJpeg = !transparentBackground;
    const mimeType = useJpeg ? "image/jpeg" : "image/png";
    const ext = useJpeg ? "jpg" : "png";
    try {
      const canvas = generateShareCanvas(true);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error("Failed to generate image")),
          mimeType,
          useJpeg ? 0.95 : undefined
        );
      });
      const file = new File([blob], `${config.name}.${ext}`, {
        type: mimeType,
      });

      if (method === "native" && navigator.share) {
        await navigator.share({
          title: `${config.name} - DragonArt`,
          text: "Olha minha pixel art feita no DragonArt! \uD83D\uDC09\uD83C\uDFA8",
          files: [file],
        });
        setShareStatus("success");
      } else if (method === "clipboard") {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ [mimeType]: blob }),
          ]);
          setShareStatus("success");
        } catch {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${config.name}.${ext}`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          setShareStatus("success");
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${config.name}.${ext}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setShareStatus("success");
      }

      setTimeout(() => setShareStatus("idle"), 2500);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setShareStatus("error");
        setTimeout(() => setShareStatus("idle"), 2500);
      } else {
        setShareStatus("idle");
      }
    }
  };

  // Export
  const exportImage = async () => {
    const canvas = document.createElement("canvas");
    const scale = getExportScale(exportResolution);
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    if (!transparentBackground) {
      ctx.fillStyle = canvasBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const frame = frames[currentFrame];
    frame.layers.forEach((layer) => {
      if (!layer.visible) return;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const color = layer.data[y * width + x];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
          }
        }
      }
    });

    frame.texts?.forEach((t) => {
      const fontStyle = `${t.italic ? "italic " : ""}${t.bold ? "bold " : ""}${
        t.size * scale
      }px ${t.font}`;
      ctx.font = fontStyle;
      ctx.fillStyle = t.color;
      ctx.textBaseline = "top";
      ctx.fillText(t.text, t.x * scale, t.y * scale);
    });

    const useJpeg = !transparentBackground;
    const ext = useJpeg ? "jpg" : "png";
    const mimeType = useJpeg ? "image/jpeg" : "image/png";
    const fileName = `${config.name}-frame-${
      currentFrame + 1
    }-${exportResolution}.${ext}`;
    const dataUrl = canvas.toDataURL(mimeType, useJpeg ? 0.95 : undefined);

    if (Capacitor.isNativePlatform()) {
      await saveToNativeGallery(dataUrl.split(",")[1], fileName);
    } else {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    }

    setShowExportModal(false);
    showSaveToast(`📸 Imagem salva como ${ext.toUpperCase()} na galeria Dragon Art!`);
  };

  const exportSpriteSheet = async () => {
    const canvas = document.createElement("canvas");
    const scale = getExportScale(exportResolution);
    canvas.width = width * scale * frames.length;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    if (!transparentBackground) {
      ctx.fillStyle = canvasBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    frames.forEach((frame, index) => {
      const offsetX = index * width * scale;
      frame.layers.forEach((layer) => {
        if (!layer.visible) return;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const color = layer.data[y * width + x];
            if (color) {
              ctx.fillStyle = color;
              ctx.fillRect(offsetX + x * scale, y * scale, scale, scale);
            }
          }
        }
      });

      frame.texts?.forEach((t) => {
        const fontStyle = `${t.italic ? "italic " : ""}${
          t.bold ? "bold " : ""
        }${t.size * scale}px ${t.font}`;
        ctx.font = fontStyle;
        ctx.fillStyle = t.color;
        ctx.textBaseline = "top";
        ctx.fillText(t.text, offsetX + t.x * scale, t.y * scale);
      });
    });

    const useJpeg = !transparentBackground;
    const ext = useJpeg ? "jpg" : "png";
    const mimeType = useJpeg ? "image/jpeg" : "image/png";
    const fileName = `${config.name}-spritesheet-${exportResolution}.${ext}`;
    const dataUrl = canvas.toDataURL(mimeType, useJpeg ? 0.95 : undefined);

    if (Capacitor.isNativePlatform()) {
      await saveToNativeGallery(dataUrl.split(",")[1], fileName);
    } else {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    }

    setShowExportModal(false);
    showSaveToast(`🎞️ Sprite Sheet salva como ${ext.toUpperCase()} na galeria Dragon Art!`);
  };

  const exportGif = async () => {
    if (frames.length === 0) return;
    setIsExporting(true);
    
    try {
      const scale = getExportScale(exportResolution);
      const gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'gif.worker.js',
        width: width * scale,
        height: height * scale,
        transparent: transparentBackground ? "rgba(0,0,0,0)" : null,
        background: canvasBackgroundColor
      });

      const delay = 1000 / fps;

      // Only need to render 1 loop for a GIF, as GIFs loop infinitely by default
      for (let i = 0; i < frames.length; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        
        ctx.imageSmoothingEnabled = false;

        if (!transparentBackground) {
          ctx.fillStyle = canvasBackgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        const frame = frames[i];
        frame.layers.forEach((layer) => {
          if (!layer.visible) return;
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              const color = layer.data[y * width + x];
              if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
              }
            }
          }
        });

        frame.texts?.forEach((t) => {
          const fontStyle = `${t.italic ? "italic " : ""}${
            t.bold ? "bold " : ""
          }${t.size * scale}px ${t.font}`;
          ctx.font = fontStyle;
          ctx.fillStyle = t.color;
          ctx.textBaseline = "top";
          ctx.fillText(t.text, t.x * scale, t.y * scale);
        });

        gif.addFrame(canvas, { delay: delay });
      }

      gif.on('finished', async (blob: Blob) => {
        const fileName = `${config.name}-animation-${exportResolution}.gif`;

        if (Capacitor.isNativePlatform()) {
          const base64 = await blobToBase64(blob);
          await saveToNativeGallery(base64, fileName, true);
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          URL.revokeObjectURL(url);
        }

        setIsExporting(false);
        setShowExportModal(false);
        showSaveToast("🎬 GIF animado salvo na galeria!");
      });

      gif.render();
    } catch (err) {
      console.error("GIF export failed", err);
      setIsExporting(false);
      showSaveToast("❌ Erro ao exportar GIF.");
    }
  };

  const activePalette =
    customPalettes.find((p) => p.id === activePaletteId) || customPalettes[0];
  const createNewPalette = () => {
    const name = prompt("Enter palette name:");
    if (name) {
      const newPalette = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name,
        colors: [currentColor],
      };
      setCustomPalettes([...customPalettes, newPalette]);
      setActivePaletteId(newPalette.id);
    }
  };
  const addColorToPalette = () => {
    sound.playClick();
    setCustomPalettes(
      customPalettes.map((p) => {
        if (p.id === activePaletteId) {
          const customColors = p.customColors || [];
          if (
            !customColors.find(
              (c) => c.hex.toLowerCase() === currentColor.toLowerCase()
            )
          ) {
            return {
              ...p,
              customColors: [
                ...customColors,
                { hex: currentColor, name: currentColor.toUpperCase() },
              ],
            };
          }
        }
        return p;
      })
    );
  };

  const removeColorFromPalette = (colorHex: string) => {
    sound.playClick();
    setCustomPalettes(
      customPalettes.map((p) => {
        if (p.id === activePaletteId) {
          return {
            ...p,
            customColors: (p.customColors || []).filter(
              (c) => c.hex.toLowerCase() !== colorHex.toLowerCase()
            ),
          };
        }
        return p;
      })
    );
  };

  const [activeSizeSlider, setActiveSizeSlider] = useState<
    "pencil" | "eraser" | null
  >(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isGridLongPress = useRef(false);
  const [activeBrushCategory, setActiveBrushCategory] = useState("Favoritos");
  const [favoriteBrushes, setFavoriteBrushes] = useState<BrushType[]>([
    "solid-square",
    "soft",
  ]);

  const isToolLongPress = useRef(false);

  const handleToolPointerDown = (tool: "pencil" | "eraser") => {
    isToolLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isToolLongPress.current = true;
      setActiveSizeSlider(tool);
      selectTool(tool);
    }, 3000);
  };

  const handleToolPointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleImportReference = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        const img = new Image();
        img.onload = () => {
          const maxDim = 200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w *= ratio;
            h *= ratio;
          }
          
          const newRef = {
            id: Date.now().toString(),
            url: event.target!.result as string,
            x: 0,
            y: 0,
            width: w,
            height: h,
            opacity: 0.5,
            visible: true,
            selected: true,
          };

          setReferenceImages(prev => [
            ...prev.map(r => ({ ...r, selected: false })),
            newRef
          ]);
        };
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  if (!frames[currentFrame]) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white font-bold z-[9999]">
        Carregando...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 text-white overflow-hidden select-none touch-none flex flex-col font-sans"
      style={{
        backgroundColor: appBackground.startsWith('/') ? '#000' : appBackground,
        zIndex: 9999,
      }}
    >
      {/* Background image layer with blur/brightness */}
      {appBackground.startsWith('/') && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("${appBackground}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${bgBlur}px) brightness(${bgBrightness})`,
          }}
        />
      )}

      {/* Top Bar Component */}
      <TopBar
        shortcuts={shortcuts}
        activePanel={activePanel}
        togglePanel={togglePanel}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        uiVisible={uiVisible}
        setUiVisible={setUiVisible}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showGridSettings={showGridSettings}
        setShowGridSettings={setShowGridSettings}
        gridSize={gridSize}
        setGridSize={setGridSize}
        gridOpacity={gridOpacity}
        setGridOpacity={setGridOpacity}
        isGridLongPress={isGridLongPress}
        longPressTimer={longPressTimer}
        handleToolPointerUp={handleToolPointerUp}
        setShowTutorials={setShowTutorials}
        referenceImages={referenceImages}
        setReferenceImages={setReferenceImages}
        handleImportReference={handleImportReference}
        uiScale={uiScale}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        is3D={is3D}
        setIs3D={setIs3D}
        show3DSettings={show3DSettings}
        setShow3DSettings={setShow3DSettings}
        rotation={rotation}
        setRotation={setRotation}
        rotationX={rotationX}
        setRotationX={setRotationX}
        rotationY={rotationY}
        setRotationY={setRotationY}
        autoRotate3D={autoRotate3D}
        setAutoRotate3D={setAutoRotate3D}
        autoRotateSpeed={autoRotateSpeed}
        setAutoRotateSpeed={setAutoRotateSpeed}
        onBack={() => setShowSavePrompt(true)}
        showUiToggle={showUiToggle}
        gridMode={gridMode}
        setGridMode={setGridMode}
        gridOnlyOnZoom={gridOnlyOnZoom}
        setGridOnlyOnZoom={setGridOnlyOnZoom}
        sound={sound}
        guideLines={guideLines}
        setGuideLines={setGuideLines}
        showGuidePanel={showGuidePanel}
        setShowGuidePanel={setShowGuidePanel}
        guideLinesVisible={guideLinesVisible}
        setGuideLinesVisible={setGuideLinesVisible}
        guideColor={guideColor}
        setGuideColor={setGuideColor}
        guideOpacity={guideOpacity}
        setGuideOpacity={setGuideOpacity}
        guideGroups={guideGroups}
        setGuideGroups={setGuideGroups}
        deleteAllFrames={deleteAllFrames}
        showBatchActions={showBatchActions}
        setShowBatchActions={setShowBatchActions}
        toggleBatchActions={toggleBatchActions}
      />

      {/* Floating Controls Component */}
      <FloatingControls
        uiVisible={uiVisible}
        symmetryX={symmetryX}
        setSymmetryX={setSymmetryX}
        symmetryY={symmetryY}
        setSymmetryY={setSymmetryY}
        symmetryDiag1={symmetryDiag1}
        setSymmetryDiag1={setSymmetryDiag1}
        symmetryDiag2={symmetryDiag2}
        setSymmetryDiag2={setSymmetryDiag2}
        primarySymmetry={primarySymmetry}
        setPrimarySymmetry={setPrimarySymmetry}
        showSymmetryMenu={showSymmetryMenu}
        setShowSymmetryMenu={setShowSymmetryMenu}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleResetView={handleResetView}
        shortcuts={shortcuts}
        currentTool={currentTool}
        selectTool={selectTool}
        clearCurrentLayer={clearCurrentLayer}
        isTrashLongPress={isTrashLongPress}
        trashLongPressTimer={trashLongPressTimer}
        setShowDeletedHistory={setShowDeletedHistory}
      />

      {/* Bottom Bar Component */}
      <BottomBar
        shortcuts={shortcuts}
        currentTool={currentTool}
        selectTool={selectTool}
        activePanel={activePanel}
        togglePanel={togglePanel}
        closePanelsExceptFrames={closePanelsExceptFrames}
        handleToolPointerDown={handleToolPointerDown}
        handleToolPointerUp={handleToolPointerUp}
        currentColor={currentColor}
        currentShape={currentShape}
        selectType={selectType}
        clearCurrentLayer={clearCurrentLayer}
        isTrashLongPress={isTrashLongPress}
        trashLongPressTimer={trashLongPressTimer}
        setShowDeletedHistory={setShowDeletedHistory}
        uiVisible={uiVisible}
        isToolLongPress={isToolLongPress}
        uiScale={uiScale}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        lightingEffect={lightingEffect}
        selectEffect={selectEffect}
        lightingIntensity={lightingIntensity}
        selectIntensity={selectIntensity}
        showLightingMenu={showLightingMenu}
        setShowLightingMenu={setShowLightingMenu}
        lightingLongPress={lightingLongPress}
      />



      {/* Canvas Container */}
      <div
        id="canvas-container"
        className={`absolute left-0 right-0 flex items-center justify-center pointer-events-auto overflow-hidden ${
          uiVisible
            ? "top-16 bottom-20 landscape:top-0 landscape:bottom-0 landscape:left-12 landscape:right-14"
            : "top-0 bottom-0 landscape:left-0 landscape:right-0"
        }`}
        style={{ 
          cursor: currentTool === "fill" ? `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 4L12 28L15.5 17.5L26 14L4 4Z' fill='white' stroke='black' stroke-width='2'/%3E%3Cg transform='translate(14, 14) scale(0.6)'%3E%3Cpath d='M3 7H21V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7Z' fill='%233b82f6' stroke='black' stroke-width='2'/%3E%3Cpath d='M3 7L5 4H19L21 7' stroke='black' stroke-width='2'/%3E%3Cpath d='M8 11V17' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E") 4 4, auto` : "default"
        }}
        onClick={() => {
          if (activePanel && activePanel !== "frames") setActivePanel(null);
          if (showQuickPalette) setShowQuickPalette(false);
        }}
        onPointerDownCapture={(e) => {
          activePointers.current.set(e.pointerId, {
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerLeave={handlePanEnd}
        onPointerCancel={handlePanEnd}
      >
        <div
          className="relative"
          style={{
            width:
              width >= height
                ? "min(85vw, 55vh)"
                : `calc(min(85vw, 55vh) * ${width / height})`,
            height:
              height >= width
                ? "min(85vw, 55vh)"
                : `calc(min(85vw, 55vh) * ${height / width})`,
            aspectRatio: `${width} / ${height}`,
            transform: `perspective(1000px) translate3d(${pan.x * zoom}px, ${
              pan.y * zoom
            }px, 0) scale(${zoom}) rotate(${rotation}deg) ${is3D ? `rotateX(${rotationX}deg) rotateY(${rotationY}deg)` : ""}`,
            transformStyle: "preserve-3d",
            transformOrigin: "center",
            willChange: "transform",
            transition: (isDraggingPan || autoRotate3D) ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            backgroundColor: "transparent",
          }}
        >
          {/* Base Background Layer - For solid colors */}
          {/* 1. Transparency Checkerboard (Under Everything) */}
          {transparentBackground && (
            <div 
              className="absolute inset-0 z-[4]" 
              style={{ 
                backgroundImage: "conic-gradient(#ccc 90deg, #fff 90deg 180deg, #ccc 180deg 270deg, #fff 270deg)",
                backgroundSize: "16px 16px"
              }} 
            />
          )}

          {/* 2. Base Background Layer - For solid colors (A FOLHA) */}
          {!transparentBackground && (
            <div 
              className="absolute inset-0 z-[5]" 
              style={{ backgroundColor: canvasBackgroundColor }} 
            />
          )}

          {/* 3. Reference Images - Image Content */}
          {referenceImages.map(ref => ref.visible && (
            <div
              key={ref.id}
              className="absolute pointer-events-none z-[7]"
              style={{
                left: ref.x,
                top: ref.y,
                width: ref.width,
                height: ref.height,
                opacity: ref.opacity,
              }}
            >
              <img
                src={ref.url}
                alt="Reference"
                className="w-full h-full"
                style={{ 
                  imageRendering: "pixelated",
                  transform: `scale(${ref.flipX ? -1 : 1}, ${ref.flipY ? -1 : 1})`
                }}
              />
            </div>
          ))}

          {/* 4. Professional Grid Layer - OVER BACKGROUND, UNDER DRAWING (Moved to SVG layer at z-[11]) */}

          {/* 4.5 Symmetry Guidelines (z-[9]) */}
          {(symmetryX || symmetryY || symmetryDiag1 || symmetryDiag2) && (
            <div className="absolute inset-0 pointer-events-none z-[9] overflow-hidden mix-blend-difference">
              {symmetryX && (
                <div className="absolute top-0 bottom-0 w-[2px] bg-white opacity-40 shadow-[0_0_4px_rgba(255,255,255,0.8)] border-x border-black/20" style={{ left: '50%', transform: 'translateX(-50%)' }} />
              )}
              {symmetryY && (
                <div className="absolute left-0 right-0 h-[2px] bg-white opacity-40 shadow-[0_0_4px_rgba(255,255,255,0.8)] border-y border-black/20" style={{ top: '50%', transform: 'translateY(-50%)' }} />
              )}
              {symmetryDiag1 && (
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[2px] bg-white opacity-40 shadow-[0_0_4px_rgba(255,255,255,0.8)] border-y border-black/20" style={{ transform: 'translate(-50%, -50%) rotate(45deg)', transformOrigin: 'center' }} />
              )}
              {symmetryDiag2 && (
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[2px] bg-white opacity-40 shadow-[0_0_4px_rgba(255,255,255,0.8)] border-y border-black/20" style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', transformOrigin: 'center' }} />
              )}
            </div>
          )}

          {/* 4.6 Perspective Guide Lines (SVG Layer, z-[10]) */}
          {guideLinesVisible && guideLines.length > 0 && (
            <svg 
              className="absolute inset-0 pointer-events-none z-[10] w-full h-full overflow-visible"
              viewBox={`0 0 ${width} ${height}`}
            >
              {guideLines.map(guide => {
                if (guide.type === 'horizontal') {
                  const y = (guide.position / 100) * height;
                  return <line key={guide.id} x1="0" y1={y} x2={width} y2={y} stroke={guide.color} strokeWidth={1/zoom} opacity={guideOpacity} />;
                }
                if (guide.type === 'vertical') {
                  const x = (guide.position / 100) * width;
                  return <line key={guide.id} x1={x} y1="0" x2={x} y2={height} stroke={guide.color} strokeWidth={1/zoom} opacity={guideOpacity} />;
                }
                if (guide.type === 'angle') {
                  const originX = ((guide.originX || 50) / 100) * width;
                  const originY = ((guide.originY || 50) / 100) * height;
                  const angleRad = (guide.position * Math.PI) / 180;
                  const length = Math.max(width, height) * 2;
                  const x2 = originX + Math.cos(angleRad) * length;
                  const y2 = originY + Math.sin(angleRad) * length;
                  const x1 = originX - Math.cos(angleRad) * length;
                  const y1 = originY - Math.sin(angleRad) * length;
                  return <line key={guide.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={guide.color} strokeWidth={1/zoom} opacity={guideOpacity} />;
                }
                return null;
              })}
            </svg>
          )}

          {/* 4. Professional Grid Layer (SVG Vector Overlay, z-[8]) */}
          {showGrid && (zoom >= 4 || !gridOnlyOnZoom) && (
            <svg
              className="absolute inset-0 pointer-events-none z-[8] w-full h-full"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {gridMode === 'checkerboard' ? (
                  <pattern
                    id="grid-pattern"
                    width={Math.max(1, gridSize) * 2}
                    height={Math.max(1, gridSize) * 2}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width={Math.max(1, gridSize)} height={Math.max(1, gridSize)} fill={`rgba(180, 180, 180, ${gridOpacity * 0.35})`} />
                    <rect x={Math.max(1, gridSize)} width={Math.max(1, gridSize)} height={Math.max(1, gridSize)} fill={`rgba(220, 220, 220, ${gridOpacity * 0.15})`} />
                    <rect y={Math.max(1, gridSize)} width={Math.max(1, gridSize)} height={Math.max(1, gridSize)} fill={`rgba(220, 220, 220, ${gridOpacity * 0.15})`} />
                    <rect x={Math.max(1, gridSize)} y={Math.max(1, gridSize)} width={Math.max(1, gridSize)} height={Math.max(1, gridSize)} fill={`rgba(180, 180, 180, ${gridOpacity * 0.35})`} />
                  </pattern>
                ) : gridMode === 'dots' ? (
                  <pattern
                    id="grid-pattern"
                    width={Math.max(1, gridSize)}
                    height={Math.max(1, gridSize)}
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="0" cy="0" r="0.1" fill="none" stroke={`rgba(200, 200, 200, ${gridOpacity * 0.8})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  </pattern>
                ) : (
                  <pattern
                    id="grid-pattern"
                    width={Math.max(1, gridSize)}
                    height={Math.max(1, gridSize)}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width={Math.max(1, gridSize)} height={Math.max(1, gridSize)} fill="none" stroke={`rgba(150, 150, 150, ${gridOpacity * 0.8})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  </pattern>
                )}
              </defs>
              <rect width={width} height={height} fill="url(#grid-pattern)" />
            </svg>
          )}

          {/* 5. Main Drawing Canvas */}
          <canvas
            id="main-drawing-canvas"
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute inset-0 w-full h-full pixelated touch-none z-10"
            style={{
              cursor:
                currentTool === "hand" || isSpaceDown
                  ? isDraggingPan
                    ? "grabbing"
                    : "grab"
                  : currentTool === "pencil"
                  ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='square' stroke-linejoin='miter'><path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/><path d='m15 5 4 4'/></svg>") 0 24, crosshair`
                  : currentTool === "eraser" || currentTool === "erase-fill"
                  ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='pink' stroke='black' stroke-width='2' stroke-linecap='square' stroke-linejoin='miter'><path d='m7 21-4.3-4.3-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21'/><path d='M22 21H7'/><path d='m5 11 9 9'/></svg>") 4 18, crosshair`
                  : currentTool === "fill"
                  ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='square' stroke-linejoin='miter'><path d='m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z'/><path d='m5 2 5 5'/><path d='M2 13h15'/><path d='M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z'/></svg>") 3 19, crosshair`
                  : currentTool === "picker"
                  ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='2' stroke-linecap='square' stroke-linejoin='miter'><path d='m2 22 1-1h3l9-9'/><path d='M3 21v-3l9-9'/><path d='m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z'/></svg>") 3 22, crosshair`
                  : "crosshair",
              willChange: "auto",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={(e) => {
              if (!selectionActionRef.current && currentTool !== "select") {
                handlePointerUp();
              }
            }}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleRedo}
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Auto-select Layer Badge Overlay */}
          <AnimatePresence>
            {layerBadge && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute pointer-events-none z-[1000] bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-2xl"
                style={{ 
                  left: `calc(50% + ${(layerBadge.x - width/2) * zoom}px)`, 
                  top: `calc(50% + ${(layerBadge.y - height/2) * zoom}px)`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                    {layerBadge.text}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brush Size Indicator Overlay */}
          <AnimatePresence>
            {showBrushSizeIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
              >
                <div className="relative flex items-center justify-center w-full h-full">
                   <motion.div
                     animate={{ 
                       borderColor: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.3)']
                     }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="rounded-full border-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-[1px]"
                     style={{
                       width: `${(brushSize / width) * 100}%`,
                       height: `${(brushSize / height) * 100}%`,
                       maxWidth: '90%',
                       maxHeight: '90%'
                     }}
                   />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12 bg-black/80 backdrop-blur-xl px-4 py-1.5 rounded-2xl border border-white/10 shadow-2xl">
                     <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">
                       {brushSize}px
                     </span>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Texts Overlay */}
          {frames[currentFrame].texts &&
            frames[currentFrame].texts.length > 0 && (
              <TextLayerOverlay
                width={width}
                height={height}
                texts={frames[currentFrame].texts}
                onTextClick={(index) => {
                  const t = frames[currentFrame].texts![index];
                  selectTool("text");
                  setActivePanel("text");
                  setTextInput(t.text);
                  setTextPos({ x: t.x, y: t.y });
                  selectColor(t.color);
                  setTextFont(t.font);
                  setTextSize(t.size);
                  setIsBold(t.bold);
                  setIsItalic(t.italic);

                  const newFrames = [...frames];
                  const currentFrameObj = { ...newFrames[currentFrame] };
                  currentFrameObj.texts = currentFrameObj.texts!.filter(
                    (_, i) => i !== index
                  );
                  newFrames[currentFrame] = currentFrameObj;
                  setFrames(newFrames);

                  setShowTextInput(true);
                  setTimeout(() => hiddenInputRef.current?.focus(), 0);
                }}
              />
            )}

          {/* Text Preview Overlay */}
          {showTextInput && textPos && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              <TextPreviewCanvas
                width={width}
                height={height}
                text={textInput}
                x={textPos.x}
                y={textPos.y}
                color={currentColor}
                font={textFont}
                size={textSize}
                bold={isBold}
                italic={isItalic}
              />

              <div
                className="absolute border-2 border-dashed border-[var(--accent-color)] pointer-events-none"
                style={{
                  left: `${(textPos.x / width) * 100}%`,
                  top: `${(textPos.y / height) * 100}%`,
                  width: `${
                    (getTextMetrics(
                      textInput || " ",
                      textFont,
                      textSize,
                      isBold,
                      isItalic
                    ).width /
                      width) *
                    100
                  }%`,
                  height: `${(textSize / height) * 100}%`,
                }}
              >
                <div
                  className="absolute w-6 h-6 bg-[var(--accent-color)] rounded-full flex items-center justify-center cursor-move pointer-events-auto shadow-lg border-2 border-white"
                  style={{
                    top: -32 / zoom,
                    left: '50%',
                    transform: `translate(-50%, 0) scale(${1 / zoom})`,
                    transformOrigin: 'center bottom'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    isDraggingText.current = true;
                    setTextDragAction(true);
                    const coords = getUnclampedPixelCoords(e);
                    if (coords) {
                      textDragOffset.current = {
                        x: coords.x - textPos.x,
                        y: coords.y - textPos.y,
                      };
                    }
                  }}
                >
                  <Move size={14} />
                </div>

                <div
                  className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg border-2 border-white hover:bg-red-600"
                  style={{
                    top: -12 / zoom,
                    right: -12 / zoom,
                    transform: `scale(${1 / zoom})`,
                    transformOrigin: 'top right'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setShowTextInput(false);
                    setTextInput("");
                    setTextPos(null);
                    hiddenInputRef.current?.blur();
                  }}
                >
                  <Trash2 size={12} color="white" />
                </div>

                <div
                  className="absolute w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center cursor-nwse-resize pointer-events-auto shadow-lg border-2 border-white"
                  style={{
                    bottom: -12 / zoom,
                    right: -12 / zoom,
                    transform: `scale(${1 / zoom})`,
                    transformOrigin: 'bottom right'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setTextResizeAction({
                      x: e.clientX,
                      y: e.clientY,
                      initialSize: textSize,
                    });
                  }}
                >
                  <Maximize2 size={12} color="white" />
                </div>

                {/* In-place Text Input & OK Button */}
                <div 
                  className="absolute flex flex-col md:flex-row items-center gap-2 pointer-events-auto"
                  style={{
                    top: 'calc(100% + 20px)',
                    left: '50%',
                    transform: `translateX(-50%) scale(${Math.max(0.5, 1 / zoom)})`,
                    transformOrigin: 'top center'
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Digite..."
                    className="bg-[var(--bg-panel)]/95 backdrop-blur-md border-2 border-[var(--accent-color)] text-white px-4 py-3 rounded-2xl shadow-2xl outline-none min-w-[200px]"
                    style={{ fontSize: '18px' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddText();
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddText();
                    }}
                    className="bg-green-500 hover:bg-green-400 text-white p-3 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20 transition-transform active:scale-95"
                    title="Confirmar Texto"
                  >
                    <Check size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {(selection || selectionMask) && (
            <div
              className={`absolute border-2 border-dashed border-[var(--accent-color)] pointer-events-none z-10`}
              style={
                (selection
                  ? {
                      left: `${(selection.x / width) * 100}%`,
                      top: `${(selection.y / height) * 100}%`,
                      width: `${(selection.w / width) * 100}%`,
                      height: `${(selection.h / height) * 100}%`,
                      "--lasso-color": "var(--accent-color)",
                    }
                  : selectionMask
                  ? (() => {
                      const b = getMaskBounds(selectionMask);
                      if (!b) return {};
                      return {
                        left: `${(b.x / width) * 100}%`,
                        top: `${(b.y / height) * 100}%`,
                        width: `${(b.w / width) * 100}%`,
                        height: `${(b.h / height) * 100}%`,
                      };
                    })()
                  : {}) as React.CSSProperties
              }
            >
              {selection && pasteCount > 1 && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.5 / zoom }}
                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 / zoom }}
                    exit={{ opacity: 0, scale: 0.5 / zoom, x: "-50%" }}
                    style={{ top: -24 / zoom }}
                    className="absolute left-1/2 bg-[var(--accent-color)] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg pointer-events-none z-20 border border-white/20 whitespace-nowrap"
                  >
                    {pasteCount} CÓPIAS
                  </motion.div>
                </AnimatePresence>
              )}
              {selection && selection.data.length > 0 && (
                <div className="absolute inset-0 pointer-events-none opacity-80">
                  <MiniLayerCanvas
                    layerData={selection.data}
                    width={selection.originalW}
                    height={selection.originalH}
                    className="w-full h-full object-fill"
                  />
                </div>
              )}
              {currentTool === "select" && (
                <>
                  {selection && (
                    <div
                      className="absolute w-6 h-6 bg-[var(--accent-color)] rounded-full pointer-events-auto cursor-se-resize shadow-md flex items-center justify-center"
                      style={{ 
                        bottom: -12 / zoom, 
                        right: -12 / zoom,
                        transform: `scale(${1 / zoom})`,
                        transformOrigin: 'bottom right'
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelectionAction("scale");
                        setSelectionStart({ x: e.clientX, y: e.clientY });
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full pointer-events-none" />
                    </div>
                  )}

                  <div 
                    className="absolute right-0 flex gap-1 pointer-events-auto"
                    style={{ 
                      top: -48 / zoom,
                      transform: `scale(${1 / zoom})`,
                      transformOrigin: 'top right'
                    }}
                  >
                    <button
                      className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-2 rounded-xl shadow-2xl hover:bg-red-500/80 transition-all active:scale-90"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        setSelection(null);
                        setSelectionMask(null);
                        setSelectionAction(null);
                        selectTool("pencil");
                      }}
                      title="Remover Seleção"
                    >
                      <X size={18} />
                    </button>
                    <button
                      className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-2 rounded-xl shadow-2xl hover:bg-blue-500/80 transition-all active:scale-90"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        copySelection();
                      }}
                      title="Copiar"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-2 rounded-xl shadow-2xl hover:bg-blue-500/80 transition-all active:scale-90"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        cutSelection();
                      }}
                      title="Recortar"
                    >
                      <Scissors size={18} />
                    </button>
                    {clipboard && (
                      <button
                        className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-2 rounded-xl shadow-2xl hover:bg-blue-500/80 transition-all active:scale-90"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaste();
                        }}
                        title="Colar"
                      >
                        <ClipboardPaste size={18} />
                      </button>
                    )}
                    <button
                      className="bg-black/80 backdrop-blur-md border border-white/10 text-white p-2 rounded-xl shadow-2xl hover:bg-red-500/80 transition-all active:scale-90"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelectionMask();
                      }}
                      title="Apagar Pixels"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      className="bg-green-600/90 backdrop-blur-md border border-white/20 text-white p-2 rounded-xl shadow-2xl hover:bg-green-500 transition-all active:scale-90 scale-110 ml-1"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        if (selection) commitSelection();
                        setSelection(null);
                        setSelectionMask(null);
                        setSelectionAction(null);
                        selectTool("pencil");
                      }}
                      title="Confirmar Seleção"
                    >
                      <Check size={20} strokeWidth={3} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Reference Image Control Overlay */}
          {(() => {
            const selectedRef = referenceImages.find(r => r.selected);
            if (!selectedRef || !selectedRef.visible || selectedRef.locked) return null;

            return (
              <div
                className="absolute pointer-events-auto border-2 border-[var(--accent-color)] shadow-2xl z-[20]"
                style={{
                  left: selectedRef.x,
                  top: selectedRef.y,
                  width: selectedRef.width,
                  height: selectedRef.height,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setRefAction("move");
                  setRefStart({
                    x: e.clientX,
                    y: e.clientY,
                    refX: selectedRef.x,
                    refY: selectedRef.y,
                    refW: selectedRef.width,
                    refH: selectedRef.height,
                  });
                }}
              >
                <div className="absolute inset-0 border-2 border-dashed border-[var(--accent-color)] pointer-events-none" />

                {/* Resize Handles */}
                <div
                  className="absolute w-6 h-6 bg-[#10b981] rounded-full flex items-center justify-center cursor-nwse-resize pointer-events-auto shadow-lg border-2 border-white"
                  style={{
                    bottom: -12 / zoom,
                    right: -12 / zoom,
                    transform: `scale(${1 / zoom})`,
                    transformOrigin: 'bottom right'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setRefAction("scale");
                    setRefStart({
                      x: e.clientX,
                      y: e.clientY,
                      refX: selectedRef.x,
                      refY: selectedRef.y,
                      refW: selectedRef.width,
                      refH: selectedRef.height,
                    });
                  }}
                >
                  <Maximize2 size={12} color="white" />
                </div>

                <div
                  className="absolute w-6 h-6 bg-[#f59e0b] rounded-full flex items-center justify-center cursor-ew-resize pointer-events-auto shadow-lg border-2 border-white"
                  style={{
                    top: '50%',
                    right: -12 / zoom,
                    transform: `translate(0, -50%) scale(${1 / zoom})`,
                    transformOrigin: 'center right'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setRefAction("stretchX");
                    setRefStart({
                      x: e.clientX,
                      y: e.clientY,
                      refX: selectedRef.x,
                      refY: selectedRef.y,
                      refW: selectedRef.width,
                      refH: selectedRef.height,
                    });
                  }}
                >
                  <ArrowRight size={12} color="white" />
                </div>

                <div
                  className="absolute w-6 h-6 bg-[#f59e0b] rounded-full flex items-center justify-center cursor-ns-resize pointer-events-auto shadow-lg border-2 border-white"
                  style={{
                    bottom: -12 / zoom,
                    left: '50%',
                    transform: `translate(-50%, 0) scale(${1 / zoom})`,
                    transformOrigin: 'center bottom'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setRefAction("stretchY");
                    setRefStart({
                      x: e.clientX,
                      y: e.clientY,
                      refX: selectedRef.x,
                      refY: selectedRef.y,
                      refW: selectedRef.width,
                      refH: selectedRef.height,
                    });
                  }}
                >
                  <ArrowDown size={12} color="white" />
                </div>

                {/* Close Handle */}
                <div
                  className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg border-2 border-white"
                  style={{
                    top: -12 / zoom,
                    right: -12 / zoom,
                    transform: `scale(${1 / zoom})`,
                    transformOrigin: 'top right'
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setReferenceImages(prev => prev.map(r => r.id === selectedRef.id ? { ...r, selected: false } : r));
                  }}
                >
                  <X size={12} color="white" />
                </div>
              </div>
            );
          })()}

          {/* 6. Custom Pixel Art Frame (Front) */}
          {showCanvasBorder && (
            <div
              className="absolute -inset-1 pointer-events-none z-50"
              style={{
                border: "4px solid #000",
                boxShadow: "inset 4px 4px 0px 0px rgba(255,255,255,0.8), inset -4px -4px 0px 0px rgba(0,0,0,0.4), 0 0 0 4px #8b5a2b, 0 0 0 8px #000",
                borderRadius: "2px",
              }}
            />
          )}

          {/* 7. 3D Back of Canvas Indicator */}
          {is3D && (
            <div 
              className="absolute inset-0 bg-red-600/30 flex items-center justify-center border-4 border-red-900/50"
              style={{
                transform: "translateZ(-1px) rotateY(180deg)",
                backfaceVisibility: "visible"
              }}
            >
              <div className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-50">VERSO</div>
            </div>
          )}
        </div>
      </div>

      {/* Tool Panels */}
      <AnimatePresence>
        {activePanel && activePanel !== "ajustes" && (
          <motion.div
            key={activePanel}
            drag
            dragListener={false}
            dragControls={panelDragControls}
            dragMomentum={false}
            onDragEnd={(e, info) => {
              const current = getPanelState(activePanel);
              updatePanelState(activePanel, {
                x: current.x + info.offset.x,
                y: current.y + info.offset.y,
              });
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              x: getPanelState(activePanel).x,
              y: getPanelState(activePanel).y,
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute left-1/2 -translate-x-1/2 bottom-24 landscape:bottom-4 bg-[var(--bg-panel)]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl z-50 pointer-events-auto flex flex-col ${
              !uiVisible ? "opacity-20 pointer-events-none" : ""
            }`}
            style={{
              width: getPanelState(activePanel).w,
              height: panelMinimized ? "50px" : getPanelState(activePanel).h,
              maxHeight: "85vh",
              touchAction: "none",
            }}
          >
            {/* DRAG BORDERS (Outer edges) */}
            <div className="absolute inset-0 pointer-events-none border-4 border-transparent rounded-2xl">
              {/* Top Drag */}
              <div
                className="absolute top-0 left-4 right-4 h-2 cursor-move pointer-events-auto"
                onPointerDown={(e) => panelDragControls.start(e)}
              />
              {/* Bottom Drag */}
              <div
                className="absolute bottom-0 left-4 right-4 h-2 cursor-move pointer-events-auto"
                onPointerDown={(e) => panelDragControls.start(e)}
              />
              {/* Left Drag */}
              <div
                className="absolute left-0 top-4 bottom-4 w-2 cursor-move pointer-events-auto"
                onPointerDown={(e) => panelDragControls.start(e)}
              />
              {/* Right Drag */}
              <div
                className="absolute right-0 top-4 bottom-4 w-2 cursor-move pointer-events-auto"
                onPointerDown={(e) => panelDragControls.start(e)}
              />
            </div>

            {/* RESIZE HANDLES (Corners & Mid-points) */}
            {!panelMinimized && (
              <>
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 cursor-nwse-resize z-[60] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "ne")}
                />
                <div
                  className="absolute -top-1 -left-1 w-4 h-4 cursor-nesw-resize z-[60] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "nw")}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 cursor-nwse-resize z-[60] pointer-events-auto flex items-center justify-center"
                  onPointerDown={(e) => handleResize(e, "se")}
                >
                  <div className="w-2 h-2 border-r-2 border-bottom-2 border-white/20 rounded-br-sm" />
                </div>
                <div
                  className="absolute -bottom-1 -left-1 w-4 h-4 cursor-nesw-resize z-[60] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "sw")}
                />

                {/* Side Resizers */}
                <div
                  className="absolute top-0 bottom-0 -right-1 w-2 cursor-ew-resize z-[55] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "e")}
                />
                <div
                  className="absolute top-0 bottom-0 -left-1 w-2 cursor-ew-resize z-[55] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "w")}
                />
                <div
                  className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize z-[55] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "n")}
                />
                <div
                  className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize z-[55] pointer-events-auto"
                  onPointerDown={(e) => handleResize(e, "s")}
                />
              </>
            )}

            {/* Drag Handle & Minimize Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5 shrink-0">
              <div
                className="flex items-center gap-2 cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded-lg transition-colors"
                onPointerDown={(e) => panelDragControls.start(e)}
              >
                <GripVertical size={14} className="text-blue-500/60" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                  {activePanel === "pencil"
                    ? "Lápis"
                    : activePanel === "colors"
                    ? "Cores"
                    : activePanel === "layers"
                    ? "Camadas"
                    : activePanel === "frames"
                    ? "Linha do Tempo"
                    : activePanel === "effects"
                    ? "Efeitos & FX"
                    : activePanel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setPanelMinimized(!panelMinimized);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400"
                >
                  {panelMinimized ? (
                    <Maximize2 size={16} />
                  ) : (
                    <Minus size={16} />
                  )}
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setActivePanel(null);
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div
              className={`p-4 overflow-y-auto hide-scrollbar ${
                panelMinimized ? "hidden" : "block"
              }`}
            >
              {/* BATCH ACTIONS PANEL */}
              {activePanel === "batch" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
                      <Zap size={28} className="fill-cyan-400" />
                    </div>
                    <div className="flex flex-col items-center">
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">Ações em Lote</h3>
                      <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em]">Gerenciamento Inteligente 2-in-1</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Action 1: Group Guides */}
                    <button 
                      onClick={() => {
                        if (guideLines.length === 0) {
                          alert("Crie algumas linhas guia primeiro para agrupar!");
                          return;
                        }
                        const name = window.prompt("Nome do grupo de guias:");
                        if (name) {
                          setGuideGroups(prev => [...prev, { id: Date.now().toString(), name, lines: [...guideLines] }]);
                          sound.playClick();
                        }
                      }}
                      className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                          <FolderHeart size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-black uppercase text-white/90">Agrupar Guias</span>
                          <span className="text-[9px] font-bold text-white/30 uppercase">Salva as guias atuais como um grupo</span>
                        </div>
                      </div>
                      <Plus size={16} className="text-white/20 group-hover:text-blue-400" />
                    </button>

                    {/* Action 2: Clear All Guides */}
                    <button 
                      onClick={() => {
                        if (window.confirm("Deseja apagar TODAS as linhas guia da tela?")) {
                          setGuideLines([]);
                          sound.playClick();
                        }
                      }}
                      className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-yellow-500/20 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform">
                          <Compass size={20} />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-black uppercase text-white/90">Limpar Guias</span>
                          <span className="text-[9px] font-bold text-white/30 uppercase">Remove todas as linhas da tela</span>
                        </div>
                      </div>
                      <Trash2 size={16} className="text-white/20 group-hover:text-yellow-400" />
                    </button>
                  </div>

                  {guideGroups.length > 0 && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
                      <span className="text-[9px] font-black uppercase text-white/30 px-1">Grupos de Guias Salvos</span>
                      <div className="flex flex-wrap gap-2">
                        {guideGroups.map(group => (
                          <div key={group.id} className="flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 p-2 transition-all">
                            <button 
                              onClick={() => {
                                setGuideLines(group.lines);
                                sound.playClick();
                              }}
                              className="text-[10px] font-black uppercase px-1 text-cyan-400"
                            >
                              {group.name}
                            </button>
                            <button 
                              onClick={() => {
                                setGuideGroups(prev => prev.filter(g => g.id !== group.id));
                                sound.playClick();
                              }}
                              className="p-1 text-white/20 hover:text-red-400"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-center">
                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest leading-relaxed">
                       dragon art advanced management system <br/> 
                      v2.0 professional edition
                    </p>
                  </div>
                </div>
              )}
              {activePanel === "text" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-1 mb-1">
                    <div className="text-lg font-bold text-white tracking-tight uppercase">Texto</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Toque na tela para posicionar</div>
                  </div>

                  {/* Quick Font Selector */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { id: "monospace", label: "Mono", preview: "Aa" },
                      { id: '"Press Start 2P", cursive', label: "Pixel", preview: "Aa" },
                      { id: "sans-serif", label: "Sans", preview: "Aa" },
                      { id: "serif", label: "Serif", preview: "Aa" },
                      { id: "cursive", label: "Script", preview: "Aa" },
                    ].map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setTextFont(font.id)}
                        className={`px-3 py-2 rounded-xl border transition-all text-sm ${
                          textFont === font.id
                            ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20 scale-105"
                            : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
                        }`}
                        style={{ fontFamily: font.id }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>

                  {/* Style toggles in a compact row */}
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      onClick={() => setIsBold(!isBold)}
                      className={`w-10 h-10 rounded-xl border text-sm font-black transition-all ${
                        isBold
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)]"
                      }`}
                    >B</button>
                    <button
                      onClick={() => setIsItalic(!isItalic)}
                      className={`w-10 h-10 rounded-xl border text-sm italic transition-all ${
                        isItalic
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)]"
                      }`}
                    >I</button>
                    <div className="w-px h-8 bg-[var(--border-subtle)]" />
                    <button
                      onClick={() => togglePanel("colors")}
                      className="w-10 h-10 rounded-xl border-2 border-white/30 shadow-sm"
                      style={{ backgroundColor: currentColor }}
                    />
                    <div className="w-px h-8 bg-[var(--border-subtle)]" />
                    <div className="flex items-center gap-1 bg-[var(--bg-element)] rounded-xl border border-[var(--border-strong)] px-2 h-10">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold">{textSize}px</span>
                      <input
                        type="range"
                        min="1" max="72"
                        value={textSize}
                        onChange={(e) => setTextSize(parseInt(e.target.value))}
                        className="w-16 accent-[var(--accent-color)]"
                      />
                    </div>
                  </div>

                  {/* Text Prompt */}
                  <div className="text-center py-3 text-xs text-[var(--text-muted)] bg-[var(--bg-element)] rounded-xl border border-[var(--border-strong)]">
                    {showTextInput ? "Escreva na folha de desenho..." : "Toque na tela para posicionar o texto"}
                  </div>

                  {/* Existing texts list */}
                  {frames[currentFrame]?.texts?.length > 0 && (
                    <div className="flex flex-col gap-1 pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Textos na tela</span>
                      {frames[currentFrame].texts.map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-[var(--bg-element)] rounded-lg border border-[var(--border-strong)]">
                          <span className="flex-1 text-xs text-white truncate" style={{ fontFamily: t.font }}>{t.text}</span>
                          <button
                            onClick={() => {
                              setTextInput(t.text);
                              setTextPos({ x: t.x, y: t.y });
                              setIsBold(t.bold);
                              setTextFont(t.font);
                              setTextSize(t.size);
                              setIsItalic(t.italic);
                              const newTexts = [...frames[currentFrame].texts];
                              newTexts.splice(i, 1);
                              updateCurrentLayer(frames[currentFrame].layers[currentLayer].data, true, newTexts);
                              setShowTextInput(true);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-[var(--accent-color)] bg-[var(--accent-color)]/10 rounded-lg hover:bg-[var(--accent-color)]/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              const newTexts = [...frames[currentFrame].texts];
                              newTexts.splice(i, 1);
                              updateCurrentLayer(frames[currentFrame].layers[currentLayer].data, true, newTexts);
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SELECTION PANEL - Simplified & Professional */}
              {activePanel === "select" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 items-center mb-2">
                    <div className="text-lg font-bold text-white tracking-tight uppercase">Seleção</div>
                    <div className="text-[10px] text-[var(--accent-color)] font-black uppercase tracking-[0.2em]">Essencial</div>
                  </div>

                  {/* Tool Switch */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { sound.playClick(); setSelectType("rect"); }}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        selectType === "rect" ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      <div className={`w-3 h-3 border-2 border-dashed ${selectType === "rect" ? 'border-white' : 'border-gray-500'} rounded-sm`} />
                      <span className="text-[9px] font-black uppercase">Retângulo</span>
                    </button>
                    <button
                      onClick={() => { sound.playClick(); setSelectType("magic-wand"); }}
                      className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        selectType === "magic-wand" ? 'bg-[var(--accent-color)] text-white' : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      <Zap size={14} />
                      <span className="text-[9px] font-black uppercase">Varinha</span>
                    </button>
                  </div>

                  {/* Selection Mode Toggles */}
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(["replace", "add", "subtract"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => { setSelectMode(mode); sound.playClick(); }}
                        className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${
                          selectMode === mode 
                            ? 'bg-[var(--accent-color)] text-white shadow-lg' 
                            : 'text-white/30 hover:text-white'
                        }`}
                      >
                        {mode === "replace" ? "Novo" : mode === "add" ? "Adicionar" : "Subtrair"}
                      </button>
                    ))}
                  </div>

                  {selectType === "magic-wand" && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-2">
                      <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Tolerância</span>
                        <span>{selectionTolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="0" max="255"
                        value={selectionTolerance}
                        onChange={(e) => setSelectionTolerance(parseInt(e.target.value))}
                        className="w-full accent-[var(--accent-color)] h-1 rounded-full appearance-none bg-white/10"
                      />
                    </div>
                  )}

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={copySelection}
                      disabled={!selection && !selectionMask}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-20"
                    >
                      <Copy size={14} className="text-[var(--accent-color)]" />
                      <span className="text-[9px] font-black uppercase">Copiar</span>
                    </button>
                    <button
                      onClick={handlePaste}
                      disabled={!clipboard}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-20"
                    >
                      <ClipboardPaste size={14} className="text-green-400" />
                      <span className="text-[9px] font-black uppercase">Colar</span>
                    </button>
                    <button
                      onClick={invertSelectionMask}
                      disabled={!selectionMask}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all disabled:opacity-20"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span className="text-[9px] font-black uppercase">Inverter</span>
                    </button>
                    <button
                      onClick={clearSelectionMask}
                      disabled={!selectionMask}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition-all disabled:opacity-20"
                    >
                      <Trash2 size={14} className="text-red-400" />
                      <span className="text-[9px] font-black uppercase">Apagar</span>
                    </button>
                  </div>

                  <button
                    onClick={() => { setSelectionMask(null); setSelection(null); sound.playClick(); }}
                    className="w-full py-3 bg-[var(--bg-element)] border border-white/5 text-white/50 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Deselecionar Tudo
                  </button>
                </div>
              )}

              {/* SHAPE PANEL */}
              {activePanel === "shape" && (
                <div className="flex flex-col gap-4">
                  <div className="text-lg font-bold text-white mb-4 text-center tracking-tight">
                    FORMAS
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCurrentShape("line");
                        selectTool("shape");
                        closePanelsExceptFrames();
                      }}
                      className={`p-4 flex flex-col items-center gap-3 rounded-xl border transition-all ${
                        currentShape === "line"
                          ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                          : "border-[var(--border-strong)] bg-[var(--bg-element)] text-[var(--text-muted)] hover:border-[#666] hover:text-white"
                      }`}
                    >
                      <Minus size={28} />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Linha
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCurrentShape("rect");
                        selectTool("shape");
                        closePanelsExceptFrames();
                      }}
                      className={`p-4 flex flex-col items-center gap-3 rounded-xl border transition-all ${
                        currentShape === "rect"
                          ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                          : "border-[var(--border-strong)] bg-[var(--bg-element)] text-[var(--text-muted)] hover:border-[#666] hover:text-white"
                      }`}
                    >
                      <Square size={28} />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Quadrado
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCurrentShape("circle");
                        selectTool("shape");
                        closePanelsExceptFrames();
                      }}
                      className={`p-4 flex flex-col items-center gap-3 rounded-xl border transition-all ${
                        currentShape === "circle"
                          ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                          : "border-[var(--border-strong)] bg-[var(--bg-element)] text-[var(--text-muted)] hover:border-[#666] hover:text-white"
                      }`}
                    >
                      <Circle size={28} />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Círculo
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setCurrentShape("rope");
                        selectTool("shape");
                        closePanelsExceptFrames();
                      }}
                      className={`p-4 flex flex-col items-center gap-3 rounded-xl border transition-all ${
                        currentShape === "rope"
                          ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                          : "border-[var(--border-strong)] bg-[var(--bg-element)] text-[var(--text-muted)] hover:border-[#666] hover:text-white"
                      }`}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12c4-4 12-4 16 0"/></svg>
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Corda
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* COLORS PANEL */}
              {activePanel === "colors" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 animate-spin-slow shadow-lg shadow-black/20" />
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">
                        Cores & Paletas HD
                      </div>
                    </div>
                    <ProfessionalColorPicker
                      color={currentColor}
                      history={colorHistory}
                      onChange={(c) => {
                        setCurrentColor(c);
                        sound.playColorSound();
                        triggerFeedback("color", c);
                      }}
                    />

                    {/* Favorites Action Area */}
                    <div className="w-full flex items-center justify-between mt-4 px-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Favoritos</span>
                        <p className="text-[8px] text-white/20 uppercase font-bold">Salve suas cores preferidas</p>
                      </div>
                      <button
                        onClick={() => saveColorToFavorites(currentColor)}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                          savedUserColors.some(
                            (c) => c.toLowerCase() === currentColor.toLowerCase()
                          )
                            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"
                        }`}
                      >
                        <Star
                          size={14}
                          className={
                            savedUserColors.some(
                              (c) => c.toLowerCase() === currentColor.toLowerCase()
                            )
                              ? "fill-black"
                              : "group-hover:fill-white/20"
                          }
                        />
                        <span className="text-[10px] font-black uppercase">
                          {savedUserColors.some(
                            (c) => c.toLowerCase() === currentColor.toLowerCase()
                          )
                            ? "Salva"
                            : "Salvar"}
                        </span>
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex gap-2 mt-6">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentColor);
                          sound.playClick();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white/60 uppercase transition-all border border-white/5"
                      >
                        <Copy size={14} /> Copiar HEX
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          if (
                            currentTool === "eraser" ||
                            currentTool === "erase-fill" ||
                            currentTool === "hand" ||
                            currentTool === "picker"
                          ) {
                            selectTool("pencil");
                          }
                          addToColorHistory(currentColor);
                          setActivePanel(null);
                        }}
                        className="flex-[1.5] py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 border border-blue-400/20"
                      >
                        Confirmar Cor
                      </button>
                    </div>
                  </div>

                  {/* Recent Colors */}
                  {colorHistory.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          ⏱ Recentes
                        </span>
                        <button
                          onClick={() => {
                            sound.playClick();
                            setColorHistory([]);
                          }}
                          className="text-[9px] font-bold text-white/20 uppercase tracking-widest hover:text-red-400 transition-colors"
                        >
                          Limpar
                        </button>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                        {colorHistory.map((c, i) => (
                          <button
                            key={`recent-${i}-${c}`}
                            onClick={() => selectColor(c)}
                            className={`w-8 h-8 rounded-lg border-2 shrink-0 transition-all hover:scale-110 ${
                              currentColor.toLowerCase() === c.toLowerCase()
                                ? "border-white shadow-lg shadow-white/10"
                                : "border-white/10 hover:border-white/30"
                            }`}
                            style={{ backgroundColor: c }}
                            title={c.toUpperCase()}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Palettes System */}
                  <PaletteManager 
                    currentColor={currentColor}
                    selectColor={selectColor}
                    userPalettes={userPalettes}
                    setUserPalettes={setUserPalettes}
                  />
                </div>
              )}
              {/* FILL PANEL */}
              {activePanel === "fill" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-1 mb-2">
                    <div className="text-lg font-bold text-white tracking-tight uppercase">Balde de Tinta</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cores Rápidas</div>
                  </div>
                  
                  {/* Default Swatches */}
                  <div className="grid grid-cols-5 gap-2">
                    {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#FFA500", "#800080", "#808080", "#8B4513", "#FFC0CB", "#A52A2A", "#FFD700"].map((c, i) => (
                      <button
                        key={`fill-swatch-${i}-${c}`}
                        onClick={() => selectColor(c)}
                        className={`aspect-square rounded-xl border-2 shrink-0 transition-all hover:scale-110 ${
                          currentColor.toLowerCase() === c.toLowerCase()
                            ? "border-white shadow-lg shadow-white/10 scale-110"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        style={{ backgroundColor: c }}
                        title={c.toUpperCase()}
                      />
                    ))}
                  </div>

                  {/* Recent Colors */}
                  {colorHistory.length > 0 && (
                    <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recentes</span>
                      <div className="flex flex-wrap gap-2">
                        {colorHistory.map((c, i) => (
                          <button
                            key={`fill-recent-${i}-${c}`}
                            onClick={() => selectColor(c)}
                            className={`w-8 h-8 rounded-lg border-2 shrink-0 transition-all hover:scale-110 ${
                              currentColor.toLowerCase() === c.toLowerCase()
                                ? "border-white shadow-lg shadow-white/10 scale-110"
                                : "border-white/10 hover:border-white/30"
                            }`}
                            style={{ backgroundColor: c }}
                            title={c.toUpperCase()}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => togglePanel("colors")}
                    className="w-full mt-2 py-3 rounded-xl border border-white/10 bg-[#111] hover:bg-[#222] text-xs font-bold text-white/60 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <Palette size={14} /> Mais Cores
                  </button>
                </div>
              )}
              {/* PENCIL PANEL */}
              {activePanel === "pencil" &&
                (() => {
                  const ALL_BRUSHES = [
                    { id: "solid-square", label: "Quadrado" },
                    { id: "solid-circle", label: "Círculo" },
                    { id: "soft", label: "Suave" },
                    { id: "marker", label: "Marcador" },
                    { id: "spray", label: "Spray" },
                    { id: "noise", label: "Ruído" },
                    { id: "gradient", label: "Degradê" },
                    { id: "splatter", label: "Mancha" },
                    { id: "clouds", label: "Nuvens" },
                    { id: "marble", label: "Mármore" },
                    { id: "wood", label: "Madeira" },
                    { id: "horizontal", label: "Horiz" },
                    { id: "vertical", label: "Vert" },
                    { id: "cross", label: "Cruz" },
                    { id: "diagonal", label: "Diagonal" },
                    { id: "stars", label: "Estrelas" },
                    { id: "diamond", label: "Diamante" },
                    { id: "star", label: "Estrela" },
                    { id: "heart", label: "Coração" },
                    { id: "hexagon", label: "Hexágono" },
                    { id: "triangle", label: "Triângulo" },
                    { id: "ring", label: "Anel" },
                    { id: "leaves", label: "Folhas" },
                    { id: "grid", label: "Grade" },
                    { id: "dither", label: "Dither" },
                  ];

                  const toggleFavoriteBrush = (
                    e: React.MouseEvent,
                    brushId: BrushType
                  ) => {
                    e.stopPropagation();
                    sound.playClick();
                    setFavoriteBrushes((prev) =>
                      prev.includes(brushId)
                        ? prev.filter((id) => id !== brushId)
                        : [...prev, brushId]
                    );
                  };

                  return (
                    <div className="flex flex-col gap-5 p-1">
                      <div className="space-y-6 pb-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                              Calibre
                            </span>
                            <span className="text-xl font-black text-blue-500 leading-none">
                              {brushSize}
                              <small className="text-[10px] ml-1 opacity-50 uppercase tracking-tighter">
                                px
                              </small>
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="range"
                              min="1"
                              max="100"
                              value={brushSize}
                              onChange={(e) =>
                                setBrushSize(parseInt(e.target.value))
                              }
                              className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                              Opacidade
                            </span>
                            <span className="text-xl font-black text-blue-500 leading-none">
                              {Math.round(brushOpacity * 100)}
                              <small className="text-[10px] ml-1 opacity-50 uppercase tracking-tighter">
                                %
                              </small>
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={brushOpacity}
                              onChange={(e) =>
                                setBrushOpacity(parseFloat(e.target.value))
                              }
                              className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="max-h-[35vh] overflow-y-auto pr-1 hide-scrollbar grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {ALL_BRUSHES.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setBrushType(type.id as BrushType)}
                            className={`group relative flex flex-col items-center justify-center p-3 rounded-[1.2rem] border-2 transition-all ${
                              brushType === type.id
                                ? "bg-[var(--bg-surface)] border-blue-500 scale-105 shadow-2xl z-10"
                                : "bg-transparent border-white/5 hover:border-white/20"
                            }`}
                          >
                            <div
                              className="absolute -top-1 -right-1 p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) =>
                                toggleFavoriteBrush(e, type.id as BrushType)
                              }
                            >
                              <Star
                                size={12}
                                className={
                                  favoriteBrushes.includes(type.id as BrushType)
                                    ? "fill-yellow-500 text-yellow-500"
                                    : "text-white/20 hover:text-yellow-500"
                                }
                              />
                            </div>

                            <div
                              className="w-10 h-10 mb-2 bg-white rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner"
                              style={{
                                backgroundImage:
                                  "conic-gradient(#f0f0f0 90deg, #fff 90deg 180deg, #f0f0f0 180deg 270deg, #fff 270deg)",
                                backgroundSize: "4px 4px",
                              }}
                            >
                              <div className="scale-[0.8] flex items-center justify-center">
                                {type.id === "solid-square" && (
                                  <div className="w-10 h-10 bg-black" />
                                )}
                                {type.id === "solid-circle" && (
                                  <div className="w-10 h-10 bg-black rounded-full" />
                                )}
                                {type.id === "soft" && (
                                  <div className="w-11 h-11 bg-black rounded-full blur-[2px]" />
                                )}
                                {type.id === "marker" && (
                                  <div className="text-black text-[30px] font-bold">
                                    ▮
                                  </div>
                                )}
                                {type.id === "stars" && (
                                  <div className="text-black text-[24px]">
                                    ★
                                  </div>
                                )}
                                {type.id === "heart" && (
                                  <div className="text-black text-[24px]">
                                    ♥
                                  </div>
                                )}
                                {![
                                  "solid-square",
                                  "solid-circle",
                                  "soft",
                                  "marker",
                                  "stars",
                                  "heart",
                                ].includes(type.id) && (
                                  <div className="text-black text-[20px] font-bold uppercase">
                                    {type.label.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors text-center truncate w-full">
                              {type.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {activePanel === "layers" && (
                <LayerPanel
                  layers={frames[currentFrame].layers}
                  currentLayer={currentLayer}
                  setCurrentLayer={(idx) => {
                    setCurrentLayer(idx);
                    triggerLayerFlash(frames[currentFrame].layers[idx].id);
                  }}
                  addLayer={addLayer}
                  deleteLayer={deleteLayer}
                  toggleLayerVisibility={toggleLayerVisibility}
                  toggleLayerLock={toggleLayerLock}
                  reorderLayers={reorderLayers}
                  renameLayer={renameLayer}
                  duplicateLayer={duplicateLayer}
                  updateLayerOpacity={updateLayerOpacity}
                  moveLayer={moveLayer}
                  moveToLimit={moveToLimit}
                  triggerLayerFlash={triggerLayerFlash}
                  width={width}
                  height={height}
                  transparentBackground={transparentBackground}
                  setTransparentBackground={setTransparentBackground}
                  canvasBackgroundColor={canvasBackgroundColor}
                  setCanvasBackgroundColor={setCanvasBackgroundColor}
                />
              )}

              {activePanel === "frames" && (
                <FramePanel
                  frames={frames}
                  setFrames={setFrames}
                  currentFrame={currentFrame}
                  setCurrentFrame={setCurrentFrame}
                  addFrame={addFrame}
                  deleteFrame={deleteFrame}
                  reorderFrames={reorderFrames}
                  width={width}
                  height={height}
                  fps={fps}
                  setFps={setFps}
                  onionSkin={onionSkin}
                  setOnionSkin={setOnionSkin}
                  onionSkinPast={onionSkinPast}
                  setOnionSkinPast={setOnionSkinPast}
                  onionSkinFuture={onionSkinFuture}
                  setOnionSkinFuture={setOnionSkinFuture}
                  deleteAllFrames={deleteAllFrames}
                  isPlaying={isPlaying}
                />
              )}

              {activePanel === "effects" && (
                <EffectsPanel
                  layerData={frames[currentFrame].layers[currentLayer].data}
                  width={width}
                  height={height}
                  currentColor={currentColor}
                  onApply={applyEffectToLayer}
                  onClose={() => setActivePanel(null)}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activePanel === "resize" && (
          <AjustesPanel
            setActivePanel={setActivePanel}
            setShowExportModal={setShowExportModal}
            setShowTutorials={setShowTutorials}
            resizeInput={resizeInput}
            setResizeInput={setResizeInput}
            applyResize={applyResize}
            appBackground={appBackground}
            setAppBackground={setAppBackground}
            bgBlur={bgBlur}
            setBgBlur={setBgBlur}
            bgBrightness={bgBrightness}
            setBgBrightness={setBgBrightness}
            bgmEnabled={bgmEnabled}
            toggleBgm={toggleBgm}
            sfxEnabled={sfxEnabled}
            toggleSfx={toggleSfx}
            sound={sound}
            uiScale={uiScale}
            setUiScale={setUiScale}
            showUiToggle={showUiToggle}
            setShowUiToggle={setShowUiToggle}
            showCanvasBorder={showCanvasBorder}
            setShowCanvasBorder={setShowCanvasBorder}
            gridMode={gridMode}
            setGridMode={setGridMode}
            gridOnlyOnZoom={gridOnlyOnZoom}
            setGridOnlyOnZoom={setGridOnlyOnZoom}
            gridSize={gridSize}
            setGridSize={setGridSize}
          />
        )}
      </AnimatePresence>



      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  Exportar Projeto
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-xs font-black text-[var(--accent-color)] mb-2 uppercase tracking-[0.2em]">
                      Formatos Comuns
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setExportType("image")}
                        className={`w-full py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-black uppercase tracking-wider ${
                          exportType === "image"
                            ? "bg-[var(--accent-color)]/20 border-[var(--accent-color)] text-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20"
                            : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <Download size={20} />
                        Imagem (PNG)
                      </button>
                      <button
                        onClick={() => setExportType("gif")}
                        className={`w-full py-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-black uppercase tracking-wider ${
                          exportType === "gif"
                            ? "bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/20"
                            : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <Film size={20} />
                        Animação (GIF)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#8b5cf6] mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Gamepad size={14} /> Para Game Devs
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setExportType("spritesheet")}
                        className={`w-full py-3 rounded-xl border-2 flex items-center justify-center gap-3 transition-all text-sm font-black uppercase tracking-wider ${
                          exportType === "spritesheet"
                            ? "bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#8b5cf6] shadow-lg shadow-[#8b5cf6]/20"
                            : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <LayersIcon size={20} />
                        Sprite Sheet (PNG)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    Resolução
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setExportResolution("normal")}
                      className={`py-2 rounded-lg border transition-colors text-sm font-medium ${
                        exportResolution === "normal"
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => setExportResolution("hd")}
                      className={`py-2 rounded-lg border transition-colors text-sm font-medium ${
                        exportResolution === "hd"
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
                      }`}
                    >
                      HD
                    </button>
                    <button
                      onClick={() => setExportResolution("4k")}
                      className={`py-2 rounded-lg border transition-colors text-sm font-medium ${
                        exportResolution === "4k"
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
                      }`}
                    >
                      4K
                    </button>
                    <button
                      onClick={() => setExportResolution("8k")}
                      className={`py-2 rounded-lg border transition-colors text-sm font-medium ${
                        exportResolution === "8k"
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
                      }`}
                    >
                      8K
                    </button>
                    <button
                      onClick={() => setExportResolution("16k")}
                      className={`py-2 rounded-lg border transition-colors text-sm font-medium ${
                        exportResolution === "16k"
                          ? "bg-[var(--accent-color)] border-[var(--accent-color)] text-white"
                          : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white"
                      }`}
                    >
                      16K
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    if (exportType === "image") exportImage();
                    else if (exportType === "spritesheet") exportSpriteSheet();
                    else exportGif();
                  }}
                  disabled={isExporting}
                  className={`w-full font-semibold p-4 rounded-xl transition-all text-lg shadow-lg flex items-center justify-center gap-2 ${
                    isExporting
                      ? "bg-[#444] text-[var(--text-muted)] cursor-not-allowed"
                      : exportType === "image"
                      ? "bg-[var(--accent-color)] hover:bg-[#2563eb] text-white shadow-[#3b82f6]/20"
                      : "bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-[#8b5cf6]/20"
                  }`}
                >
                  {isExporting ? "Exportando..." : "Exportar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Share2 size={22} className="text-[#5865F2]" /> Compartilhar
                </h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Preview */}
                <div
                  className="w-full aspect-square max-h-[180px] bg-[var(--bg-element)] rounded-xl overflow-hidden flex items-center justify-center border border-[var(--border-strong)] mb-4"
                  style={{
                    backgroundImage:
                      "conic-gradient(var(--bg-panel) 90deg, var(--bg-surface) 90deg 180deg, var(--bg-panel) 180deg 270deg, var(--bg-surface) 270deg)",
                    backgroundSize: "12px 12px",
                  }}
                >
                  {config.thumbnail ? (
                    <img
                      src={config.thumbnail}
                      alt="Preview"
                      className="max-w-[80%] max-h-[80%] object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span className="text-[var(--text-muted)] text-sm font-bold">
                      Sua Arte Aqui
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--text-muted)] text-center mb-2">
                  Sua arte será compartilhada com a marca{" "}
                  <span className="text-[var(--accent-color)] font-bold">
                    DragonArt \uD83D\uDC09
                  </span>
                </p>

                {/* Native Share (mobile) */}
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={() => shareArt("native")}
                    disabled={shareStatus === "generating"}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#5865F2] to-[#7289DA] hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#5865F2]/20"
                  >
                    <ExternalLink size={18} />
                    Compartilhar (Discord, WhatsApp...)
                  </button>
                )}

                {/* Copy to clipboard */}
                <button
                  onClick={() => shareArt("clipboard")}
                  disabled={shareStatus === "generating"}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[var(--bg-element)] border border-[var(--border-strong)] hover:border-[var(--accent-color)] hover:bg-[var(--bg-surface)] transition-all flex items-center justify-center gap-3"
                >
                  <Copy size={18} />
                  Copiar Imagem
                </button>

                {/* Download */}
                <button
                  onClick={() => shareArt("download")}
                  disabled={shareStatus === "generating"}
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[var(--bg-element)] border border-[var(--border-strong)] hover:border-green-500 hover:bg-green-500/10 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={18} />
                  Baixar PNG (com marca)
                </button>

                {/* Discord link */}
                <a
                  href="https://discord.gg/nVhedfdR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#5865F2]/10 border border-[#5865F2]/30 hover:bg-[#5865F2] hover:border-[#5865F2] transition-all flex items-center justify-center gap-3 text-sm"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="shrink-0"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Poste no Discord da Comunidade
                </a>

                {/* Status feedback */}
                <AnimatePresence>
                  {shareStatus !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`w-full py-3 rounded-xl text-center font-bold text-sm ${
                        shareStatus === "generating"
                          ? "bg-blue-500/20 text-blue-400"
                          : shareStatus === "success"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {shareStatus === "generating" && "⏳ Gerando imagem..."}
                      {shareStatus === "success" &&
                        "✅ Compartilhado com sucesso!"}
                      {shareStatus === "error" &&
                        "❌ Erro ao compartilhar. Tente novamente."}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Prompt Modal */}
      <AnimatePresence>
        {showSavePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSavePrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-panel)] rounded-2xl p-6 max-w-sm w-full border border-[var(--border-subtle)] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white text-center flex-1">
                  Salvar Projeto?
                </h2>
                <button
                  onClick={() => setShowSavePrompt(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors p-1 rounded-full hover:bg-[var(--bg-element)]"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-[var(--text-muted)] text-center mb-6">
                Deseja salvar onde parou antes de voltar ao menu?
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    const projectsStr = localStorage.getItem("pixel_projects");
                    let projects: ProjectConfig[] = [];
                    if (projectsStr) {
                      try {
                        projects = JSON.parse(projectsStr);
                      } catch (e) {}
                    }
                    const existingIndex = projects.findIndex(
                      (p) => p.id === config.id
                    );
                    const updatedConfig = {
                      ...config,
                      width,
                      height,
                      frames,
                      updatedAt: Date.now(),
                    };

                    // Generate fresh thumbnail before exit
                    if (canvasRef.current) {
                      const thumbSize = 256;
                      const thumbCanvas = document.createElement("canvas");
                      thumbCanvas.width = thumbSize;
                      thumbCanvas.height = thumbSize;
                      const thumbCtx = thumbCanvas.getContext("2d");
                      if (thumbCtx) {
                        thumbCtx.fillStyle = transparentBackground ? "transparent" : canvasBackgroundColor;
                        thumbCtx.fillRect(0, 0, thumbSize, thumbSize);
                        thumbCtx.imageSmoothingEnabled = false;
                        thumbCtx.drawImage(canvasRef.current, 0, 0, thumbSize, thumbSize);
                        updatedConfig.thumbnail = thumbCanvas.toDataURL("image/png");
                      }
                    }

                    if (existingIndex >= 0) {
                      projects[existingIndex] = updatedConfig;
                    } else {
                      projects.push(updatedConfig);
                    }
                    try {
                      localStorage.setItem("pixel_projects", JSON.stringify(projects));
                    } catch (e) {
                      console.error("Storage quota exceeded", e);
                    }
                    onBack();
                  }}
                  className="w-full p-4 bg-[var(--accent-color)] text-white font-black rounded-xl shadow-lg border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                  <Save size={18} /> Salvar e Sair
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onBack();
                  }}
                  className="w-full p-4 bg-red-500 text-white font-black rounded-xl shadow-lg border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                  <X size={18} /> Sair sem Salvar
                </button>
                <button
                  onClick={() => setShowSavePrompt(false)}
                  className="w-full p-4 bg-[var(--bg-element)] text-[var(--text-muted)] font-black rounded-xl shadow-lg border-b-4 border-black/20 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deleted History Modal */}
      <AnimatePresence>
        {showDeletedHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeletedHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--bg-panel)] rounded-2xl p-6 max-w-md w-full border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trash2 size={24} className="text-red-400" /> Histórico de
                  Exclusões
                </h2>
                <button
                  onClick={() => setShowDeletedHistory(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors p-2 rounded-full hover:bg-[var(--bg-element)]"
                >
                  <X size={20} />
                </button>
              </div>

              {deletedHistory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                  <Trash2 size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Nenhum item excluído</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {deletedHistory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[var(--bg-element)] border border-[var(--border-strong)] rounded-xl p-4 flex items-center justify-between group hover:border-[#555] transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">
                          {new Date(item.timestamp).toLocaleTimeString()} -{" "}
                          {item.type === "clear"
                            ? "Limpeza"
                            : item.type === "layer"
                            ? "Camada"
                            : "Quadro"}
                        </div>
                      </div>
                      <button
                        onClick={() => restoreDeletedItem(item)}
                        className="px-3 py-1.5 bg-[var(--accent-color)] hover:bg-[#2563eb] text-white text-sm font-bold rounded-lg transition-colors shadow-md"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {deletedHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  {showClearHistoryConfirm ? (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-red-400 font-medium text-center">
                        Tem certeza que deseja excluir todo o histórico?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowClearHistoryConfirm(false)}
                          className="flex-1 p-3 bg-[var(--bg-element)] hover:bg-[#333] text-white font-bold rounded-xl transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            setDeletedHistory([]);
                            setShowClearHistoryConfirm(false);
                          }}
                          className="flex-1 p-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
                        >
                          Sim, Excluir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowClearHistoryConfirm(true)}
                      className="w-full p-3 bg-[var(--bg-element)] hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl transition-colors border border-[var(--border-strong)] hover:border-red-500/50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Limpar Histórico
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guidelines Modal */}
      <AnimatePresence>
        {showTutorials && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--bg-surface)] text-white p-8 rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg-surface)] z-10 pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="font-bold text-2xl flex items-center gap-2">
                  <BookOpen className="text-[var(--accent-color)]" /> Diretrizes
                  e Copyright
                </h3>
                <button
                  onClick={() => setShowTutorials(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    🐉 Sobre o Dragon Art
                  </h4>
                  <p>
                    O Dragon Art é um aplicativo focado em criação de pixel art
                    e animação, feito com carinho para oferecer um ambiente
                    criativo, imersivo e direto ao ponto. Ele foi construído
                    pensando na agilidade de desenhistas, tanto em dispositivos
                    móveis quanto em computadores.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    📜 Direitos Autorais e Copyright
                  </h4>
                  <p>
                    O código base e design do aplicativo, incluindo a logo
                    original e fundos temáticos, pertencem à equipe do Dragon
                    Art.{" "}
                    <b>As obras que você desenha no canvas são 100% suas.</b>{" "}
                    Você detém todo o direito autoral, comercial e criativo dos
                    pixels que criar e exportar usando o nosso editor.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    🎨 Regras de Convivência
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Sempre respeite e incentive as artes de outros membros.
                    </li>
                    <li>
                      Compartilhe seu conhecimento! Ajude outros usuários a
                      dominar atalhos.
                    </li>
                    <li>
                      Não faça cópias não-autorizadas de artes sem dar os
                      devidos créditos aos autores originais.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    🚀 Boas Práticas
                  </h4>
                  <p>
                    Utilize os gestos otimizados do Dragon Art para maior
                    fluidez:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                      <b>Dois Toques Rápidos:</b> No fundo cinza (fora da folha)
                      para Desfazer (Undo).
                    </li>
                    <li>
                      <b>Dois Dedos:</b> Arraste para mover a folha, gire para
                      rotacionar e belisque para dar zoom.
                    </li>
                    <li>
                      <b>Menu Flutuante:</b> Segure o dedo sobre a folha ou o
                      botão direito do mouse para acessar o anel de ferramentas
                      rápidas.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowTutorials(false)}
                  className="px-6 py-3 bg-[var(--accent-color)] text-white font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Li e Entendi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecordingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Video size={24} className="text-red-500" /> Gravar Processo
                </h2>
                <button
                  onClick={() => setIsRecordingModalOpen(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
                    Resolução da Gravação
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        id: "normal",
                        label: "Normal (Nativa)",
                        desc: `${width}x${height}`,
                        icon: <MonitorCheck size={16} />,
                      },
                      {
                        id: "hd",
                        label: "Alta Definição (HD)",
                        desc: "1280x720 (Escalado)",
                        icon: <Maximize2 size={16} />,
                      },
                      {
                        id: "4k",
                        label: "Ultra HD (4K)",
                        desc: "3840x2160 (K)",
                        icon: <Maximize size={16} />,
                      },
                    ].map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setRecordingResolution(res.id as any)}
                        className={`w-full p-3 rounded-xl border flex items-center gap-4 transition-all ${
                          recordingResolution === res.id
                            ? "bg-red-500/20 border-red-500 text-white"
                            : "bg-[var(--bg-element)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-white hover:border-[#666]"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            recordingResolution === res.id
                              ? "bg-red-500 text-white"
                              : "bg-[var(--bg-panel)] text-gray-500"
                          }`}
                        >
                          {res.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-sm">{res.label}</div>
                          <div className="text-[10px] opacity-60 uppercase">
                            {res.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] flex gap-3 items-start">
                  <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg shrink-0">
                    <HelpCircle size={18} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    A gravação começará <b>automaticamente</b> assim que você
                    tocar na folha. O vídeo será salvo na sua galeria interna.
                  </p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsProcessRecording(true);
                    setIsRecordingModalOpen(false);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold p-4 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Confirmar e Ativar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Gallery Modal */}
      <AnimatePresence>
        {showVideoGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 md:p-10"
            onClick={() => setShowVideoGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-3xl w-full max-w-4xl h-full max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-surface)]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                      Minha Pasta de Vídeos
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                      Histórico de gravações do seu processo criativo
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVideoGallery(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors bg-[var(--bg-element)] p-3 rounded-2xl"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a] custom-scrollbar">
                {savedVideos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-24 h-24 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-[var(--border-subtle)]">
                      <Video size={40} className="text-[#333]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                      Nenhuma Gravação
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs">
                      Ative a gravação no ícone lateral e comece a desenhar para
                      ver seus vídeos aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedVideos.map((video) => (
                      <motion.div
                        layout
                        key={video.id}
                        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden group hover:border-[var(--border-strong)] transition-all shadow-xl"
                      >
                        <div className="aspect-video bg-black relative flex items-center justify-center">
                          <video
                            src={URL.createObjectURL(video.blob)}
                            className="w-full h-full object-contain pointer-events-none"
                            muted
                            loop
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-tighter">
                            {video.resolution}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlayCircle
                              size={48}
                              className="text-white drop-shadow-2xl"
                            />
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="truncate flex-1 pr-2">
                              <h4 className="font-bold text-white text-sm truncate uppercase tracking-tight">
                                {video.name}
                              </h4>
                              <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase mt-1">
                                {new Date(video.timestamp).toLocaleDateString()}{" "}
                                •{" "}
                                {new Date(video.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                if (confirm("Deseja excluir este vídeo?")) {
                                  await videoStorage.deleteVideo(video.id);
                                  loadSavedVideos();
                                }
                              }}
                              className="text-gray-500 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-xl"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                sound.playClick();
                                const fileName = `${video.name}.webm`;
                                if (Capacitor.isNativePlatform()) {
                                  const base64 = await blobToBase64(video.blob);
                                  const success = await saveToNativeGallery(
                                    base64,
                                    fileName,
                                    true
                                  );
                                  if (success)
                                    showSaveToast("🎬 Vídeo salvo na galeria!");
                                  else
                                    showSaveToast("❌ Erro ao salvar vídeo.");
                                } else {
                                  const url = URL.createObjectURL(video.blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = fileName;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  showSaveToast("🎬 Vídeo salvo!");
                                }
                              }}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                              <Download size={14} /> Salvar
                            </button>
                            <button
                              onClick={() => {
                                const url = URL.createObjectURL(video.blob);
                                window.open(url, "_blank");
                              }}
                              className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2"
                            >
                              <Maximize size={14} /> Ver
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <span>{savedVideos.length} Vídeo(s) Armazenado(s)</span>
                <span className="flex items-center gap-1">
                  <MonitorCheck size={12} /> Armazenamento Local (Navegador)
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undo Delete Frame Animation */}
      {/* Tool Shortcut Indicator Toast */}
      <AnimatePresence>
        {toolIndicator && (
          <motion.div
            key={toolIndicator.timestamp}
            initial={{ opacity: 0, scale: 0.5, y: -20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.8, y: -20, x: "-50%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-24 left-1/2 z-[200] bg-[var(--bg-panel)] border-4 border-black px-6 py-4 flex items-center gap-4 pointer-events-none"
            style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
          >
            <div className="w-10 h-10 bg-[var(--accent-color)] flex items-center justify-center border-2 border-white shadow-inner">
              {toolIndicator.tool === "pencil" && (
                <Pencil size={24} color="white" />
              )}
              {toolIndicator.tool === "eraser" && (
                <Eraser size={24} color="white" />
              )}
              {toolIndicator.tool === "fill" && (
                <PaintBucket size={24} color="white" />
              )}
              {toolIndicator.tool === "erase-fill" && (
                <Eraser size={24} color="white" />
              )}
              {toolIndicator.tool === "picker" && (
                <Pipette size={24} color="white" />
              )}
              {toolIndicator.tool === "select" && (
                <Settings size={24} color="white" />
              )}
              {toolIndicator.tool === "shape" && (
                <Square size={24} color="white" />
              )}
              {toolIndicator.tool === "hand" && (
                <Hand size={24} color="white" />
              )}
              {toolIndicator.tool === "text" && (
                <Type size={24} color="white" />
              )}
              {toolIndicator.tool === ("Malha" as any) && (
                <Grid size={24} color="white" />
              )}
              {toolIndicator.tool === ("Som" as any) && (
                <Volume2 size={24} color="white" />
              )}
              {toolIndicator.tool === ("Limpar" as any) && (
                <Trash2 size={24} color="white" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-widest leading-tight">
                Ferramenta Selecionada
              </span>
              <span className="text-xl font-bold uppercase text-white font-sans drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {toolIndicator.tool === "erase-fill"
                  ? "Limpar Área"
                  : toolIndicator.tool === "picker"
                  ? "Conta-gotas"
                  : toolIndicator.tool === "pencil"
                  ? "Lápis"
                  : toolIndicator.tool === "eraser"
                  ? "Borracha"
                  : toolIndicator.tool === "fill"
                  ? "Balde"
                  : toolIndicator.tool === "select"
                  ? "Seleção"
                  : toolIndicator.tool === "shape"
                  ? "Formas"
                  : toolIndicator.tool === "hand"
                  ? "Mover"
                  : toolIndicator.tool === "text"
                  ? "Texto"
                  : toolIndicator.tool}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tool Switcher UI */}
      <AnimatePresence>
        {showFloatingToolSwitcher && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed z-[100] pointer-events-none"
            style={{
              left: floatingToolSwitcherPos.x,
              top: floatingToolSwitcherPos.y - 80,
            }}
          >
            <div className="relative flex gap-4 p-4 bg-[#1a1a1a] border-4 border-[var(--accent-color)] rounded-none shadow-[8px_8px_0_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{
                  scale: hoveredQuickTool === "pencil" ? 1.2 : 1,
                  backgroundColor:
                    hoveredQuickTool === "pencil"
                      ? "var(--accent-color)"
                      : currentTool === "pencil"
                      ? "var(--accent-color)"
                      : "#333",
                  opacity:
                    hoveredQuickTool === "pencil" || currentTool === "pencil"
                      ? 1
                      : 0.6,
                }}
                className={`p-4 border-2 border-white/20 transition-all duration-100 relative`}
              >
                <Pencil size={28} className="text-white" />
              </motion.div>

              <motion.div
                animate={{
                  scale: hoveredQuickTool === "eraser" ? 1.2 : 1,
                  backgroundColor:
                    hoveredQuickTool === "eraser"
                      ? "var(--accent-color)"
                      : currentTool === "eraser"
                      ? "var(--accent-color)"
                      : "#333",
                  opacity:
                    hoveredQuickTool === "eraser" || currentTool === "eraser"
                      ? 1
                      : 0.6,
                }}
                className={`p-4 border-2 border-white/20 transition-all duration-100 relative`}
              >
                <Eraser size={28} className="text-white" />
              </motion.div>

              <motion.div
                animate={{
                  scale: hoveredQuickTool === "picker" ? 1.2 : 1,
                  backgroundColor:
                    hoveredQuickTool === "picker"
                      ? "var(--accent-color)"
                      : currentTool === "picker"
                      ? "var(--accent-color)"
                      : "#333",
                  opacity:
                    hoveredQuickTool === "picker" || currentTool === "picker"
                      ? 1
                      : 0.6,
                }}
                className={`p-4 border-2 border-white/20 transition-all duration-100 relative`}
              >
                <Pipette size={28} className="text-white" />
              </motion.div>

              {/* Pixel Connector */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 bg-[var(--accent-color)] h-8" />
            </div>
            {/* Visual Indicator of drag */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-8 flex flex-col items-center gap-1">
              <div className="w-2 h-2 bg-white animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletedFrame && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.5 }}
            animate={{
              y: [0, -40, 0, -20, 0],
              opacity: 1,
              scale: 1,
              rotate: [0, -10, 10, -5, 5, 0],
            }}
            exit={{ y: 100, opacity: 0, scale: 0.5 }}
            transition={{
              y: { duration: 0.8, ease: "easeOut" },
              rotate: { duration: 0.8, ease: "easeInOut" },
            }}
            className="fixed bottom-24 right-8 z-[150] flex flex-col items-center gap-2 cursor-pointer group"
            onClick={restoreDeletedFrame}
          >
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--accent-color)] text-white px-4 py-2 rounded-xl shadow-xl shadow-[#3b82f6]/20 flex flex-col items-center gap-1 group-hover:bg-[var(--bg-element)] transition-colors">
              <span className="font-bold text-sm">Apagou sem querer?</span>
              <span className="text-xs text-[var(--accent-color)] font-bold uppercase">
                Clique para recuperar
              </span>
              <div className="w-16 h-16 bg-white rounded-lg mt-2 overflow-hidden border border-[var(--border-strong)]">
                <MiniCanvas
                  frame={deletedFrame.frame}
                  width={width}
                  height={height}
                />
              </div>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white">
              <Trash2 size={24} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {saveToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 bg-[var(--bg-panel)] border border-[var(--accent-color)] text-white font-bold rounded-2xl shadow-2xl shadow-[var(--accent-color)]/20 flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-2 h-2 bg-[var(--accent-color)] rounded-full animate-pulse" />
            {saveToast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint Toast - appears when entering the editor */}
      <AnimatePresence>
        {showEditorHint && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] max-w-[90vw] sm:max-w-md"
            onClick={() => setShowEditorHint(false)}
          >
            <div className="relative px-5 py-3.5 bg-gradient-to-r from-[var(--bg-panel)] to-[var(--bg-surface)] border border-[var(--accent-color)]/60 text-[var(--text-primary)] font-bold rounded-2xl shadow-2xl shadow-black/40 flex items-center gap-3 backdrop-blur-xl cursor-pointer">
              {/* Animated finger icon */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="text-2xl shrink-0"
              >
                👆
              </motion.div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs sm:text-sm leading-tight">Segure o dedo nos ícones para ver a descrição de cada ferramenta!</span>
                <span className="text-[10px] text-[var(--text-muted)]">Toque aqui para fechar</span>
              </div>
              {/* Progress bar that drains */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 6, ease: 'linear' }}
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--accent-color)] rounded-b-2xl origin-left"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSaveSuccess.visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() =>
              setShowSaveSuccess({ ...showSaveSuccess, visible: false })
            }
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--bg-panel)] border border-green-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-green-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <Check size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Salvo com Sucesso!
              </h2>
              <p className="text-[var(--text-muted)] mb-8">
                Seu desenho foi exportado para a sua galeria na pasta:
                <br />
                <span className="text-green-400 font-mono text-sm mt-2 block bg-black/20 p-2 rounded-lg border border-white/5">
                  {showSaveSuccess.path}
                </span>
              </p>
              <button
                onClick={() =>
                  setShowSaveSuccess({ ...showSaveSuccess, visible: false })
                }
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-500/30 active:scale-95"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
const ToolButton = ({
  id,
  icon,
  active,
  onClick,
  color,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  label,
  shortcutKey,
}: any) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="flex flex-col items-center gap-0.5 shrink-0 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pixel Animated Label */}
      <AnimatePresence>
        {(isHovered || active) && label && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-[100] pointer-events-none
                       bottom-full mb-2 left-1/2 -translate-x-1/2
                       landscape:bottom-auto landscape:mb-0 landscape:top-1/2 landscape:-translate-y-1/2 landscape:right-full landscape:mr-3 landscape:left-auto landscape:translate-x-0"
          >
            <div 
              className="bg-black/90 text-[7px] font-black text-white px-2.5 py-1.5 rounded-sm border border-white/20 whitespace-nowrap shadow-xl uppercase tracking-widest"
              style={{ 
                fontFamily: "'Press Start 2P', cursive, monospace",
                textShadow: "0 0 8px var(--accent-color)" 
              }}
            >
              {label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={(e) => {
          sound.playClick();
          if (onClick) onClick(e);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`w-10 h-10 landscape:w-9 landscape:h-9 pixel-icon-btn ${
          active ? "active" : ""
        } relative`}
      >
        {icon}
        {color && (
          <div
            className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 border-2 border-[#000]"
            style={{ backgroundColor: color }}
          />
        )}
        {shortcutKey && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 bg-[var(--bg-surface)] text-[var(--text-primary)] text-[8px] font-bold px-0.5 rounded-sm border border-[var(--border-strong)] z-20 shadow-sm pointer-events-none uppercase hidden sm:block">
            {shortcutKey}
          </div>
        )}
      </button>
      {label && (
        <span
          className="text-[8px] landscape:hidden text-[#e5e5e5] uppercase tracking-wider text-center leading-tight opacity-40"
          style={{
            textShadow:
              "1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
