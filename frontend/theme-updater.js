const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/page.tsx',
  'src/app/candidates/page.tsx'
];

function applyTheme(content) {
  // Common replacements for stripping dark mode and switching to light slate theme
  
  // Replace container backgrounds
  content = content.replace(/bg-zinc-50 dark:bg-black/g, 'bg-transparent');
  content = content.replace(/bg-white dark:bg-black/g, 'bg-transparent');
  content = content.replace(/bg-zinc-950/g, 'bg-white');
  
  // Wrapper class updates for layout roots (this might need specific targeting)
  if (content.includes('bg-white bg-grid') === false) {
    if (content.includes('container mx-auto')) {
      // Find the root div and inject the theme
      // By replacing 'container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl'
      // Or simply wrapping? Actually, Candidates and Dashboard both start with container mx-auto.
      content = content.replace(
        /<div className="container mx-auto/g,
        '<div className="container mx-auto'
      );
    }
  }

  // Text color replacements
  content = content.replace(/text-zinc-900 dark:text-zinc-50/g, 'text-slate-900');
  content = content.replace(/text-zinc-600 dark:text-zinc-400/g, 'text-slate-500');
  content = content.replace(/text-zinc-500 dark:text-zinc-400/g, 'text-slate-400');
  content = content.replace(/text-zinc-400 dark:text-zinc-500/g, 'text-slate-400');
  content = content.replace(/text-zinc-400/g, 'text-slate-400');
  content = content.replace(/text-zinc-500/g, 'text-slate-500');
  content = content.replace(/text-zinc-600/g, 'text-slate-500');
  content = content.replace(/text-zinc-700/g, 'text-slate-700');
  content = content.replace(/text-zinc-800/g, 'text-slate-800');
  content = content.replace(/text-zinc-900/g, 'text-slate-900');
  content = content.replace(/text-zinc-50/g, 'text-slate-900');
  content = content.replace(/text-white/g, 'text-white');

  // Background replacements
  content = content.replace(/bg-zinc-900/g, 'bg-slate-50');
  content = content.replace(/bg-zinc-800/g, 'bg-slate-100');
  content = content.replace(/bg-zinc-100/g, 'bg-slate-100');
  content = content.replace(/bg-zinc-50/g, 'bg-slate-50');
  content = content.replace(/dark:bg-zinc-900\/50/g, '');
  content = content.replace(/dark:bg-zinc-900/g, '');
  content = content.replace(/dark:bg-zinc-800\/50/g, '');
  content = content.replace(/dark:bg-zinc-800/g, '');
  content = content.replace(/dark:bg-zinc-950/g, '');
  
  // Border replacements
  content = content.replace(/border-zinc-200 dark:border-zinc-800/g, 'border-slate-200');
  content = content.replace(/border-zinc-100 dark:border-zinc-800/g, 'border-slate-100');
  content = content.replace(/border-zinc-200/g, 'border-slate-200');
  content = content.replace(/border-zinc-100/g, 'border-slate-100');
  content = content.replace(/border-zinc-300/g, 'border-slate-300');
  content = content.replace(/border-zinc-800/g, 'border-slate-200');
  content = content.replace(/dark:border-zinc-800/g, '');
  content = content.replace(/dark:border-zinc-700/g, '');
  
  // Specific fixes
  content = content.replace(/dark:text-zinc-300/g, '');
  content = content.replace(/dark:text-zinc-200/g, '');
  content = content.replace(/dark:text-zinc-100/g, '');
  content = content.replace(/dark:hover:bg-zinc-800/g, 'hover:bg-slate-100');
  content = content.replace(/hover:bg-zinc-100/g, 'hover:bg-slate-100');
  content = content.replace(/hover:bg-zinc-50/g, 'hover:bg-slate-50');
  content = content.replace(/dark:bg-black/g, '');
  
  // Remove empty dark: classes
  content = content.replace(/\s+dark:[a-zA-Z0-9-\/]+/g, '');

  // Dashboard Specific fix for insights
  content = content.replace(/bg-gradient-to-br from-black to-transparent border border-black/g, 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm');
  content = content.replace(/text-black\/70/g, 'text-accent-cyan');
  content = content.replace(/h-0.5 w-4 bg-black/g, 'h-0.5 w-4 bg-accent-cyan');

  // Button adjustments if needed
  content = content.replace(/variant="premium"/g, 'className="bg-slate-900 text-white hover:bg-accent-cyan transition-all uppercase tracking-widest text-[10px] font-black"');
  
  // Candidates particular aesthetic improvements
  content = content.replace(/font-bold/g, 'font-black'); // more aggressive typography per homepage
  
  return content;
}

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const newContent = applyTheme(content);
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${file}`);
  } else {
    console.error(`File not found: ${filePath}`);
  }
});

// Also update page.tsx of dashboard and candidates to have the global bg-grid wrap.
// Wait, we can just replace the root div manually in the script.
function wrapWithGrid(filePath) {
   let content = fs.readFileSync(filePath, 'utf8');
   if (filePath.includes('dashboard')) {
       content = content.replace(
           /<div className="container mx-auto(.*?)">/, 
           '<div className="bg-white bg-grid text-slate-900 min-h-screen pt-20 pb-12 selection:bg-accent-cyan selection:text-white font-sans"><div className="container mx-auto$1 glass-panel rounded-3xl p-8 border border-slate-200">'
       );
       // close div at the end
       content = content.replace(/^[ \t]*<\/div>\n[ \t]*\)[ \t]*;/m, '            </div>\n        </div>\n    );');
   } else if (filePath.includes('candidates')) {
       content = content.replace(
           /<div className="container mx-auto(.*?)">/, 
           '<div className="bg-white bg-grid text-slate-900 min-h-screen pt-20 pb-12 selection:bg-accent-cyan selection:text-white font-sans"><div className="container mx-auto$1 glass-panel rounded-3xl p-8 border border-slate-200">'
       );
       // close div at the end
       // candidates page has an extra div, we need to balance it correctly.
       content = content.replace(/<\/div>\s*<\/div>\s*\)\s*;/m, '</div></div></div>);');
   }
   fs.writeFileSync(filePath, content);
}

wrapWithGrid(path.join(__dirname, 'src/app/dashboard/page.tsx'));
wrapWithGrid(path.join(__dirname, 'src/app/candidates/page.tsx'));

console.log('Script completed.');
