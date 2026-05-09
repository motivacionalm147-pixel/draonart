import React, { useEffect, useState } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppScreen from './pages/AppScreen';
import Home from './pages/Home';
import WebGallery from './pages/WebGallery';
import Profile from './pages/Profile';
import WebDashboard from './pages/WebDashboard';
import Admin from './pages/Admin';

import { Capacitor } from '@capacitor/core';

export default function App() {
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    setIsMobileApp(Capacitor.isNativePlatform());
  }, []);

  // Usamos HashRouter sempre para evitar problemas de rota (404/403) na Vercel
  // caso o projeto não esteja configurado com o preset correto.
  const Router = HashRouter;

  return (
    <Router>
      <Routes>
        {/* Se for celular, a raiz redireciona para o app, senão para a Home (Landing Page) */}
        <Route path="/" element={isMobileApp ? <Navigate to="/app" replace /> : <Home />} />
        
        {/* Painel do site (como Pixilart) */}
        <Route path="/dashboard" element={<WebDashboard />} />
        
        {/* Editor do Aplicativo */}
        <Route path="/app" element={<AppScreen />} />
        
        {/* Galeria Web */}
        <Route path="/gallery" element={<WebGallery />} />
        
        {/* Perfil */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Painel Admin */}
        <Route path="/admin" element={<Admin />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
