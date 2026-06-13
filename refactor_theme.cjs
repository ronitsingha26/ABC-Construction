const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

function refactorFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // Colors
  content = content.replace(/text-white\/(?:100|90|85|80)/g, 'text-text');
  content = content.replace(/text-white\/(?:70|65|60|55|50|45|40|30|20)/g, 'text-muted');
  content = content.replace(/text-white/g, 'text-text');
  
  content = content.replace(/text-text\/(?:100|90|85|80)/g, 'text-text');
  content = content.replace(/text-text\/(?:70|65|60|55|50|45|40|30|20)/g, 'text-muted');

  // Backgrounds & Borders
  content = content.replace(/bg-white\/5/g, 'bg-slate-50');
  content = content.replace(/bg-white\/10/g, 'bg-slate-100');
  content = content.replace(/border-white\/10/g, 'border-border');
  content = content.replace(/border-white\/20/g, 'border-border');
  content = content.replace(/border-white\/30/g, 'border-border');
  content = content.replace(/divide-white\/10/g, 'divide-border');
  content = content.replace(/divide-white\/5/g, 'divide-border');

  // Slate Backgrounds
  content = content.replace(/bg-slate-800\/[0-9]+/g, 'bg-white');
  content = content.replace(/bg-slate-900\/[0-9]+/g, 'bg-white');
  content = content.replace(/bg-slate-950\/[0-9]+/g, 'bg-white');
  content = content.replace(/bg-slate-800/g, 'bg-white');
  content = content.replace(/bg-slate-900/g, 'bg-white');
  content = content.replace(/bg-slate-950/g, 'bg-white');

  // Light text colors mapped to dark equivalents for contrast
  content = content.replace(/text-orange-200/g, 'text-orange-700');
  content = content.replace(/text-orange-300/g, 'text-orange-600');
  content = content.replace(/text-red-200/g, 'text-red-700');
  content = content.replace(/text-red-300/g, 'text-red-600');
  content = content.replace(/text-red-400/g, 'text-red-600');
  content = content.replace(/text-emerald-200/g, 'text-emerald-700');
  content = content.replace(/text-emerald-300/g, 'text-emerald-600');
  content = content.replace(/text-emerald-400/g, 'text-emerald-600');
  content = content.replace(/text-blue-200/g, 'text-blue-700');
  content = content.replace(/text-blue-300/g, 'text-blue-600');
  content = content.replace(/text-sky-200/g, 'text-sky-700');
  content = content.replace(/text-sky-300/g, 'text-sky-600');
  content = content.replace(/text-purple-200/g, 'text-purple-700');
  content = content.replace(/text-purple-300/g, 'text-purple-600');

  // Chart axes and grids
  content = content.replace(/rgba\(255,255,255,0\.08\)/g, 'rgba(0,0,0,0.05)');
  content = content.replace(/rgba\(255,255,255,0\.45\)/g, 'rgba(0,0,0,0.4)');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated:', filePath);
  }
}

walk(path.join(__dirname, 'src/portal'), refactorFile);
console.log('Done refactoring theme.');
