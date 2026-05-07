import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TutorialProvider } from './contexts/TutorialContext';
import { TooltipProvider } from './contexts/TooltipContext';
import { ErrorBoundary } from './ErrorBoundary';

import { Buffer } from 'buffer';

// Polyfill Buffer for jszip - safe for mobile
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <TutorialProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </TutorialProvider>
    </ErrorBoundary>
  </StrictMode>,
);
