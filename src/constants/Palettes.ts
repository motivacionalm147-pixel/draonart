export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  customColors?: {hex: string, name: string}[];
}

export const DEFAULT_PALETTE = [
  '#000000', '#222034', '#45283c', '#663931', 
  '#8f563b', '#df7126', '#d9a066', '#eec39a', 
  '#fbf236', '#99e550', '#6abe30', '#37946e', 
  '#4b692f', '#524b24', '#323c39', '#3f3f74', 
  '#306082', '#5b6ee1', '#639bff', '#5fcde4', 
  '#cbdbfc', '#ffffff', '#9badb7', '#847e87', 
  '#696a6a', '#595652', '#76428a', '#ac3232', 
  '#d95763', '#d77bba', '#8f974a', '#8a6f30'
];

export const PREDEFINED_PALETTES: ColorPalette[] = [
  { id: 'nature', name: 'Natureza', colors: ['#1b3a1b', '#2b5a2b', '#3b7a3b', '#4b9a4b', '#5bba5b', '#6bda6b', '#7bfa7b', '#8bfa8b', '#9bfa9b', '#abfaab'] },
  { id: 'ocean', name: 'Oceano', colors: ['#0a192f', '#112240', '#233554', '#3b5998', '#4b7bec', '#6495ed', '#87ceeb', '#add8e6', '#b0e0e6', '#e0ffff'] },
  { id: 'human', name: 'Humano', colors: ['#3d2314', '#5c3a21', '#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac', '#ffe0bd', '#ffeadb', '#fff5ee'] },
  { id: 'fire', name: 'Fogo', colors: ['#4a0e0e', '#7c1a1a', '#b92b27', '#e55d29', '#f69041', '#fbd26a', '#fce28b', '#fdf2ac', '#fefacd', '#ffffff'] },
  { id: 'night', name: 'Noite', colors: ['#0f0f1b', '#1b1b3a', '#2d2d5c', '#464682', '#6565a8', '#8a8ad1', '#b0b0e6', '#d6d6f5', '#ebebfa', '#ffffff'] },
  { id: 'sweet', name: 'Doce', colors: ['#5c2a4d', '#8a3c73', '#b85499', '#e076bf', '#f59de0', '#ffc7f4', '#ffd6f7', '#ffe5fa', '#fff4fd', '#ffffff'] },
  { id: 'sunset', name: 'Pôr do Sol', colors: ['#2c1b3d', '#4a2545', '#702b4c', '#9e344d', '#cc444b', '#f26430', '#f68e20', '#f9b42d', '#fcd95b', '#fffc99'] },
  { id: 'cyberpunk', name: 'Cyberpunk', colors: ['#050505', '#120458', '#3a0ca3', '#7209b7', '#b5179e', '#f72585', '#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1'] },
];

export const THEMED_PALETTES: Record<string, string[]> = {
  'Oceano': ['#03045E', '#023E8A', '#0077B6', '#0096C7', '#00B4D8', '#48CAE4', '#90E0EF', '#ADE8F4'],
  'Fogo': ['#370617', '#6A040F', '#930A0E', '#D00000', '#DC2F02', '#E85D04', '#F48C06', '#FAA307'],
  'Pele': ['#2D1B0D', '#4B2C16', '#6F4E37', '#8B5E3C', '#B5835A', '#D4A373', '#E6BE8A', '#F3D5B5'],
  'Natureza': ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC'],
  'Neon': ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000', '#FF8000', '#8000FF', '#FF0080']
};
