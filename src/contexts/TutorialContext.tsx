import React, { createContext, useContext, useState, useEffect } from 'react';

export type TutorialStep = 
  | 'NONE'
  | 'MENU_WELCOME'
  | 'MENU_CANVAS_SIZES'
  | 'MENU_CREATE_PROJECT'
  | 'MENU_HOLD_PROJECT'
  | 'MENU_FOLDERS'
  | 'MENU_GALLERY'
  | 'MENU_THEME'
  | 'MENU_DRAG_PROJECT'
  | 'MENU_EXPORT_FOLDER'
  | 'EDITOR_INTRO'
  | 'EDITOR_BACK'
  | 'EDITOR_UNDO_REDO'
  | 'EDITOR_GRID'
  | 'EDITOR_HELP'
  | 'EDITOR_EXPORT'
  | 'EDITOR_ZOOM'
  | 'EDITOR_PENCIL'
  | 'EDITOR_ERASER'
  | 'EDITOR_FILL'
  | 'EDITOR_PIPETTE'
  | 'EDITOR_SHAPE'
  | 'EDITOR_SELECT'
  | 'EDITOR_SELECT_COPY'
  | 'EDITOR_HAND'
  | 'EDITOR_TEXT'
  | 'EDITOR_TRASH'
  | 'EDITOR_COLOR'
  | 'EDITOR_LAYERS'
  | 'EDITOR_FRAMES'
  | 'EDITOR_FRAMES_DRAG'
  | 'EDITOR_PLAY'
  | 'EDITOR_RECORD'
  | 'EDITOR_RESIZE'
  | 'EDITOR_SYMMETRY'
  | 'EDITOR_LIGHTING'
  | 'EDITOR_UI'
  | 'EDITOR_FINISH';

interface TutorialContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  currentStep: TutorialStep;
  nextStep: () => void;
  setStep: (step: TutorialStep) => void;
  playTutorial: (step: TutorialStep) => void;
  playAll: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState<TutorialStep>('NONE');

  useEffect(() => {
    const saved = localStorage.getItem('pixel_tutorial_enabled');
    if (saved !== null) {
      const isEnabled = saved === 'true';
      setEnabled(isEnabled);
      if (isEnabled) {
        setCurrentStep('MENU_WELCOME');
      }
    } else {
      // First time user
      setEnabled(true);
      setCurrentStep('MENU_WELCOME');
    }
  }, []);

  const handleSetEnabled = (val: boolean) => {
    setEnabled(val);
    localStorage.setItem('pixel_tutorial_enabled', String(val));
    if (!val) {
      setCurrentStep('NONE');
    } else {
      setCurrentStep('MENU_WELCOME');
    }
  };

  const setStep = (step: TutorialStep) => {
    if (!enabled && step !== 'NONE') return;
    setCurrentStep(step);
  };

  const playTutorial = (step: TutorialStep) => {
    setEnabled(true);
    localStorage.setItem('pixel_tutorial_enabled', 'true');
    setCurrentStep(step);
  };

  const playAll = () => {
    setEnabled(true);
    localStorage.setItem('pixel_tutorial_enabled', 'true');
    setCurrentStep('MENU_WELCOME');
  };

  const nextStep = () => {
    if (!enabled) return;
    const steps: TutorialStep[] = [
      'MENU_WELCOME',
      'MENU_CANVAS_SIZES',
      'MENU_CREATE_PROJECT',
      'MENU_HOLD_PROJECT',
      'MENU_FOLDERS',
      'MENU_GALLERY',
      'MENU_THEME',
      'MENU_DRAG_PROJECT',
      'MENU_EXPORT_FOLDER',
      'EDITOR_INTRO',
      'EDITOR_BACK',
      'EDITOR_UNDO_REDO',
      'EDITOR_GRID',
      'EDITOR_HELP',
      'EDITOR_EXPORT',
      'EDITOR_ZOOM',
      'EDITOR_PENCIL',
      'EDITOR_ERASER',
      'EDITOR_FILL',
      'EDITOR_PIPETTE',
      'EDITOR_SHAPE',
      'EDITOR_SELECT',
      'EDITOR_SELECT_COPY',
      'EDITOR_HAND',
      'EDITOR_TEXT',
      'EDITOR_TRASH',
      'EDITOR_COLOR',
      'EDITOR_LAYERS',
      'EDITOR_FRAMES',
      'EDITOR_FRAMES_DRAG',
      'EDITOR_PLAY',
      'EDITOR_RECORD',
      'EDITOR_RESIZE',
      'EDITOR_SYMMETRY',
      'EDITOR_LIGHTING',
      'EDITOR_UI',
      'EDITOR_FINISH',
      'NONE'
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      setStep('NONE');
    }
  };

  return (
    <TutorialContext.Provider value={{ enabled, setEnabled: handleSetEnabled, currentStep, nextStep, setStep, playTutorial, playAll }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
