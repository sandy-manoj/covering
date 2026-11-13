import fs from 'fs';
import path from 'path';

const styles = ['rope', 'box', 'curb', 'figaro', 'cuban', 'snake', 'mariner', 'wheat', 'byzantine', 'haram'];

for (const style of styles) {
  const isThick = style === 'cuban' || style === 'haram';
  const strokeWidth = isThick ? 20 : (style === 'snake' ? 12 : 14);
  const strokeDash = style === 'curb' ? '14,6' : (style === 'figaro' ? '28,6,12,6' : (style === 'rope' ? '10,5' : (style === 'box' ? '16,5' : 'none')));
  
  let pendant = '';
  if (style === 'haram') {
    pendant = '<path d="M 250,265 C 220,295 220,355 250,380 C 280,355 280,295 250,265 Z" fill="url(#goldGrad)" stroke="#AA7C11" stroke-width="4"/><circle cx="250" cy="330" r="14" fill="#B71C1C"/><circle cx="250" cy="330" r="8" fill="#FFE082"/>';
  } else if (style === 'rope') {
    pendant = '<path d="M 250,285 C 235,260 205,260 205,290 C 205,320 250,345 250,345 C 250,345 295,320 295,290 C 295,260 265,260 250,285 Z" fill="url(#goldGrad)" stroke="#AA7C11" stroke-width="3"/>';
  } else if (style === 'mariner') {
    pendant = '<circle cx="250" cy="300" r="30" fill="url(#goldGrad)" stroke="#8C650A" stroke-width="4"/><circle cx="250" cy="300" r="22" fill="none" stroke="#FFF8E1" stroke-width="2.5" stroke-dasharray="5,4"/><circle cx="250" cy="300" r="12" fill="#D4AF37"/>';
  }

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFE082"/><stop offset="35%" stop-color="#D4AF37"/><stop offset="70%" stop-color="#AA7C11"/><stop offset="100%" stop-color="#FFD700"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.45"/></filter></defs><g filter="url(#shadow)"><path d="M 90,80 C 110,310 390,310 410,80" fill="none" stroke="url(#goldGrad)" stroke-width="' + strokeWidth + '" stroke-linecap="round" stroke-dasharray="' + strokeDash + '"/><path d="M 90,80 C 110,310 390,310 410,80" fill="none" stroke="#FFFDE7" stroke-width="3" opacity="0.8" stroke-linecap="round"/>' + pendant + '</g></svg>';

  fs.writeFileSync(path.join('public/chains', 'chain_' + style + '.svg'), svg);
}
console.log('Successfully generated 10 chain SVGs in public/chains');

