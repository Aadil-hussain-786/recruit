const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Asus/Recruit-AI/frontend/src/app');
const componentFiles = walk('c:/Users/Asus/Recruit-AI/frontend/src/components');
const allFiles = [...files, ...componentFiles];

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    content = content.replace(/\bbg-white\b/g, 'bg-[#0A0A0A]');
    content = content.replace(/\bbg-zinc-50\b/g, 'bg-zinc-900/50');
    content = content.replace(/\btext-zinc-900\b/g, 'text-white');
    content = content.replace(/\btext-black\b/g, 'text-white');
    content = content.replace(/\bbg-black\b/g, 'bg-[#0A0A0A]');
    content = content.replace(/\bborder-zinc-200\b/g, 'border-white/10');
    content = content.replace(/\bborder-zinc-100\b/g, 'border-white/5');
    content = content.replace(/\bborder-black\b/g, 'border-white/20');
    
    // remove dark: variants to clean up
    content = content.replace(/dark:bg-[a-zA-Z0-9/-]+/g, '');
    content = content.replace(/dark:text-[a-zA-Z0-9/-]+/g, '');
    content = content.replace(/dark:border-[a-zA-Z0-9/-]+/g, '');
    
    content = content.replace(/\btext-zinc-600\b/g, 'text-zinc-400');
    content = content.replace(/\btext-zinc-700\b/g, 'text-zinc-300');
    content = content.replace(/\btext-zinc-800\b/g, 'text-zinc-200');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
console.log('UI applied successfully');
