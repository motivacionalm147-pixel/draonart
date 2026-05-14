export interface Theme {
  id: string;
  name: string;
  colors: {
    bgApp: string;
    bgSurface: string;
    bgPanel: string;
    bgElement: string;
    borderSubtle: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentColor: string;
  };
}

export const themes: Theme[] = [
  // 0: Default Clean Themes
  {
    id: 'clean-dark',
    name: 'Escuro Clean Suave',
    colors: { bgApp: '#0a0a0a', bgSurface: '#121212', bgPanel: '#181818', bgElement: '#222222', borderSubtle: '#2a2a2a', borderStrong: '#333333', textPrimary: '#ffffff', textSecondary: '#a0a0a0', textMuted: '#666666', accentColor: '#3b82f6' }
  },
  {
    id: 'clean-light',
    name: 'Branco Clean Suave',
    colors: { bgApp: '#f8f9fa', bgSurface: '#ffffff', bgPanel: '#ffffff', bgElement: '#f1f3f5', borderSubtle: '#e9ecef', borderStrong: '#dee2e6', textPrimary: '#212529', textSecondary: '#495057', textMuted: '#adb5bd', accentColor: '#3b82f6' }
  },
  // 1-10: Dark Themes

  {
    id: 'default',
    name: 'Dragão Escuro',
    colors: { bgApp: '#050000', bgSurface: '#1a0000', bgPanel: '#2b0000', bgElement: '#4a0000', borderSubtle: '#4a0000', borderStrong: '#8b0000', textPrimary: '#ffffff', textSecondary: '#ffcccc', textMuted: '#ff6666', accentColor: '#ff0000' }
  },
  {
    id: 'dracula',
    name: 'Drácula',
    colors: { bgApp: '#282a36', bgSurface: '#343746', bgPanel: '#44475a', bgElement: '#6272a4', borderSubtle: '#44475a', borderStrong: '#6272a4', textPrimary: '#f8f8f2', textSecondary: '#bfbfbf', textMuted: '#8be9fd', accentColor: '#ff79c6' }
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: { bgApp: '#272822', bgSurface: '#383830', bgPanel: '#49483e', bgElement: '#75715e', borderSubtle: '#49483e', borderStrong: '#75715e', textPrimary: '#f8f8f2', textSecondary: '#e6db74', textMuted: '#a6e22e', accentColor: '#f92672' }
  },
  {
    id: 'nord',
    name: 'Nord Escuro',
    colors: { bgApp: '#2e3440', bgSurface: '#3b4252', bgPanel: '#434c5e', bgElement: '#4c566a', borderSubtle: '#434c5e', borderStrong: '#4c566a', textPrimary: '#eceff4', textSecondary: '#e5e9f0', textMuted: '#d8dee9', accentColor: '#88c0d0' }
  },
  {
    id: 'oceanic',
    name: 'Oceano Profundo',
    colors: { bgApp: '#0f111a', bgSurface: '#1a1d2e', bgPanel: '#202438', bgElement: '#2b304a', borderSubtle: '#202438', borderStrong: '#2b304a', textPrimary: '#ffffff', textSecondary: '#b0b5c9', textMuted: '#8f93a2', accentColor: '#82aaff' }
  },
  {
    id: 'synthwave',
    name: 'Retro 80s',
    colors: { bgApp: '#2b213a', bgSurface: '#241b2f', bgPanel: '#262335', bgElement: '#49465c', borderSubtle: '#49465c', borderStrong: '#f92aad', textPrimary: '#f8f8f2', textSecondary: '#b4a6d1', textMuted: '#36f9f6', accentColor: '#f92aad' }
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox',
    colors: { bgApp: '#282828', bgSurface: '#3c3836', bgPanel: '#504945', bgElement: '#665c54', borderSubtle: '#3c3836', borderStrong: '#665c54', textPrimary: '#ebdbb2', textSecondary: '#d5c4a1', textMuted: '#bdae93', accentColor: '#fb4934' }
  },
  {
    id: 'material-palenight',
    name: 'Palenight',
    colors: { bgApp: '#292d3e', bgSurface: '#32374d', bgPanel: '#3a3f58', bgElement: '#444a69', borderSubtle: '#32374d', borderStrong: '#444a69', textPrimary: '#bfc7d5', textSecondary: '#a6accd', textMuted: '#828bb8', accentColor: '#c792ea' }
  },
  {
    id: 'ayu-mirage',
    name: 'Ayu Mirage',
    colors: { bgApp: '#1f2430', bgSurface: '#242936', bgPanel: '#292e3c', bgElement: '#363d51', borderSubtle: '#292e3c', borderStrong: '#363d51', textPrimary: '#cbccc6', textSecondary: '#acb3b5', textMuted: '#707a8c', accentColor: '#ffcc66' }
  },
  {
    id: 'catppuccin',
    name: 'Macchiato',
    colors: { bgApp: '#24273a', bgSurface: '#363a4f', bgPanel: '#494d64', bgElement: '#5b6078', borderSubtle: '#363a4f', borderStrong: '#5b6078', textPrimary: '#cad3f5', textSecondary: '#b8c0e0', textMuted: '#a5adcb', accentColor: '#c6a0f6' }
  },
  
  // 11-20: Light Themes
  {
    id: 'light',
    name: 'Claro (Padrão)',
    colors: { bgApp: '#f9fafb', bgSurface: '#f1f5f9', bgPanel: '#ffffff', bgElement: '#e2e8f0', borderSubtle: '#e2e8f0', borderStrong: '#cbd5e1', textPrimary: '#0f172a', textSecondary: '#334155', textMuted: '#64748b', accentColor: '#3b82f6' }
  },
  {
    id: 'paper',
    name: 'Papel',
    colors: { bgApp: '#f5f5f0', bgSurface: '#e8e8e3', bgPanel: '#ffffff', bgElement: '#d1d1cd', borderSubtle: '#d1d1cd', borderStrong: '#a3a39e', textPrimary: '#2d2d2a', textSecondary: '#4f4f4a', textMuted: '#73736c', accentColor: '#d9534f' }
  },
  {
    id: 'solarized-light',
    name: 'Solarized Claro',
    colors: { bgApp: '#fdf6e3', bgSurface: '#eee8d5', bgPanel: '#fcf4dc', bgElement: '#e3dfd0', borderSubtle: '#eee8d5', borderStrong: '#ccc7b8', textPrimary: '#657b83', textSecondary: '#586e75', textMuted: '#93a1a1', accentColor: '#268bd2' }
  },
  {
    id: 'nord-light',
    name: 'Nord Claro',
    colors: { bgApp: '#eceff4', bgSurface: '#e5e9f0', bgPanel: '#d8dee9', bgElement: '#c1c9d6', borderSubtle: '#d8dee9', borderStrong: '#c1c9d6', textPrimary: '#2e3440', textSecondary: '#3b4252', textMuted: '#4c566a', accentColor: '#5e81ac' }
  },
  {
    id: 'rose-pine-dawn',
    name: 'Amanhecer',
    colors: { bgApp: '#faf4ed', bgSurface: '#fffaf3', bgPanel: '#f2e9e1', bgElement: '#dfdad9', borderSubtle: '#dfdad9', borderStrong: '#cecacd', textPrimary: '#575279', textSecondary: '#797593', textMuted: '#9893a5', accentColor: '#d7827e' }
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Claro',
    colors: { bgApp: '#fbf1c7', bgSurface: '#ebdbb2', bgPanel: '#d5c4a1', bgElement: '#bdae93', borderSubtle: '#ebdbb2', borderStrong: '#bdae93', textPrimary: '#3c3836', textSecondary: '#504945', textMuted: '#665c54', accentColor: '#9d0006' }
  },
  {
    id: 'mocha',
    name: 'Café com Leite',
    colors: { bgApp: '#f4ecd8', bgSurface: '#e9dfc6', bgPanel: '#fdfbf6', bgElement: '#d4c7a6', borderSubtle: '#d4c7a6', borderStrong: '#bdae8c', textPrimary: '#5c4e36', textSecondary: '#78664a', textMuted: '#968161', accentColor: '#8a5a44' }
  },
  {
    id: 'mint',
    name: 'Menta',
    colors: { bgApp: '#f0fdf4', bgSurface: '#dcfce7', bgPanel: '#ffffff', bgElement: '#bbf7d0', borderSubtle: '#bbf7d0', borderStrong: '#86efac', textPrimary: '#14532d', textSecondary: '#166534', textMuted: '#15803d', accentColor: '#10b981' }
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    colors: { bgApp: '#faf5ff', bgSurface: '#f3e8ff', bgPanel: '#ffffff', bgElement: '#e9d5ff', borderSubtle: '#e9d5ff', borderStrong: '#d8b4fe', textPrimary: '#4c1d95', textSecondary: '#5b21b6', textMuted: '#6d28d9', accentColor: '#8b5cf6' }
  },
  {
    id: 'peach',
    name: 'Pêssego',
    colors: { bgApp: '#fff7ed', bgSurface: '#ffedd5', bgPanel: '#ffffff', bgElement: '#fed7aa', borderSubtle: '#fed7aa', borderStrong: '#fdba74', textPrimary: '#7c2d12', textSecondary: '#9a3412', textMuted: '#c2410c', accentColor: '#f97316' }
  },

  // 21-30: Vibrant/Colorful/Special Themes
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: { bgApp: '#fcee0a', bgSurface: '#e0c700', bgPanel: '#d1b900', bgElement: '#000000', borderSubtle: '#000000', borderStrong: '#222222', textPrimary: '#000000', textSecondary: '#111111', textMuted: '#333333', accentColor: '#00f0ff' }
  },
  {
    id: 'hacker',
    name: 'Matriz',
    colors: { bgApp: '#000000', bgSurface: '#080808', bgPanel: '#111111', bgElement: '#1a1a1a', borderSubtle: '#00ff00', borderStrong: '#00cc00', textPrimary: '#00ff00', textSecondary: '#00cc00', textMuted: '#009900', accentColor: '#ffffff' }
  },
  {
    id: 'outrun',
    name: 'Vaporwave',
    colors: { bgApp: '#000000', bgSurface: '#120458', bgPanel: '#180766', bgElement: '#7a04eb', borderSubtle: '#7a04eb', borderStrong: '#ff00a0', textPrimary: '#fe75fe', textSecondary: '#ff00a0', textMuted: '#7a04eb', accentColor: '#00e5ff' }
  },
  {
    id: 'autumn',
    name: 'Outono',
    colors: { bgApp: '#2e1503', bgSurface: '#381c06', bgPanel: '#4a2508', bgElement: '#61320d', borderSubtle: '#4a2508', borderStrong: '#61320d', textPrimary: '#fcedda', textSecondary: '#e0b88d', textMuted: '#bd8048', accentColor: '#d64800' }
  },
  {
    id: 'amethyst',
    name: 'Ametista',
    colors: { bgApp: '#1a0b2e', bgSurface: '#241040', bgPanel: '#2e1650', bgElement: '#3a1f63', borderSubtle: '#2e1650', borderStrong: '#502a89', textPrimary: '#f4ebff', textSecondary: '#d8b4fe', textMuted: '#b08ad6', accentColor: '#d21cd6' }
  },
  {
    id: 'blood-moon',
    name: 'Lua de Sangue',
    colors: { bgApp: '#140000', bgSurface: '#260000', bgPanel: '#380000', bgElement: '#540000', borderSubtle: '#380000', borderStrong: '#6a0000', textPrimary: '#ffcccc', textSecondary: '#ff9999', textMuted: '#cc6666', accentColor: '#ff0505' }
  },
  {
    id: 'forest',
    name: 'Floresta Escura',
    colors: { bgApp: '#0c1a12', bgSurface: '#12261a', bgPanel: '#193323', bgElement: '#254a32', borderSubtle: '#193323', borderStrong: '#326144', textPrimary: '#e0f5ea', textSecondary: '#9fd6b7', textMuted: '#72a88a', accentColor: '#28cf75' }
  },
  {
    id: 'bubblegum',
    name: 'Chiclete',
    colors: { bgApp: '#fff0f5', bgSurface: '#ffe4e1', bgPanel: '#ffffff', bgElement: '#ffb6c1', borderSubtle: '#ffb6c1', borderStrong: '#ff69b4', textPrimary: '#4a154b', textSecondary: '#d23669', textMuted: '#db7093', accentColor: '#ff1493' }
  },
  {
    id: 'midnight-city',
    name: 'Cidade Noturna',
    colors: { bgApp: '#050720', bgSurface: '#080c33', bgPanel: '#0a1045', bgElement: '#141d62', borderSubtle: '#0a1045', borderStrong: '#141d62', textPrimary: '#e0fffb', textSecondary: '#8ae8ff', textMuted: '#5891cf', accentColor: '#f7146b' }
  },
  {
    id: 'retro-crt',
    name: 'Tubo CRT',
    colors: { bgApp: '#232025', bgSurface: '#2E2B30', bgPanel: '#3A373C', bgElement: '#49454C', borderSubtle: '#3A373C', borderStrong: '#5E5A61', textPrimary: '#F2B900', textSecondary: '#CCA000', textMuted: '#997800', accentColor: '#FF6A00' }
  }
];

export const FREE_THEME_IDS: ReadonlySet<string> = new Set([
  'clean-dark',
  'clean-light',
  'default',
  'light',
  'nord',
  'paper',
  'monokai',
]);



export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--bg-app', theme.colors.bgApp);
  root.style.setProperty('--bg-surface', theme.colors.bgSurface);
  root.style.setProperty('--bg-panel', theme.colors.bgPanel);
  root.style.setProperty('--bg-element', theme.colors.bgElement);
  root.style.setProperty('--border-subtle', theme.colors.borderSubtle);
  root.style.setProperty('--border-strong', theme.colors.borderStrong);
  root.style.setProperty('--text-primary', theme.colors.textPrimary);
  root.style.setProperty('--text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--text-muted', theme.colors.textMuted);
  root.style.setProperty('--accent-color', theme.colors.accentColor);
}
