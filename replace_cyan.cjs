const fs = require('fs');

let content = fs.readFileSync('src/StartMenu.tsx', 'utf-8');

// Replace standard colors
content = content.replace(/text-cyan-400/g, 'text-[var(--accent-color)]');
content = content.replace(/bg-cyan-500\/10/g, 'bg-[var(--accent-color)]/10');
content = content.replace(/bg-cyan-500\/20/g, 'bg-[var(--accent-color)]/20');
content = content.replace(/bg-cyan-400\/10/g, 'bg-[var(--accent-color)]/10');
content = content.replace(/border-cyan-400\/20/g, 'border-[var(--accent-color)]/20');
content = content.replace(/border-cyan-500\/50/g, 'border-[var(--accent-color)]/50');
content = content.replace(/text-cyan-400\/60/g, 'text-[var(--accent-color)]/60');
content = content.replace(/bg-cyan-500/g, 'bg-[var(--accent-color)]');
content = content.replace(/hover:bg-cyan-400/g, 'hover:brightness-110');
content = content.replace(/focus:border-cyan-500/g, 'focus:border-[var(--accent-color)]');
content = content.replace(/border-cyan-500/g, 'border-[var(--accent-color)]');
content = content.replace(/shadow-cyan-500\/20/g, ''); // just remove custom colored shadows
content = content.replace(/shadow-cyan-500\/40/g, '');
content = content.replace(/fill-cyan-400\/20/g, 'fill-[var(--accent-color)]/20');

// specifically for the profile gradient which we will completely rewrite anyway, but good to clean up
content = content.replace(/from-cyan-500 to-blue-600/g, 'from-[var(--accent-color)] to-[var(--bg-panel)]');

fs.writeFileSync('src/StartMenu.tsx', content);
console.log('Replaced cyan in StartMenu');
