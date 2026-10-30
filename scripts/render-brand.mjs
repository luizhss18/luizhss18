// Custom navigation/contact controls for the GitHub-safe SVG image surface.
// Links live in README.md, where they remain keyboard-accessible.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const palettes={dark:{bg:'#10192e',ink:'#f1f5ff',muted:'#8fa1c4',line:'#2b3a59',cyan:'#5ce5d6',violet:'#b09bff'},light:{bg:'#ffffff',ink:'#182642',muted:'#5b6c8c',line:'#d1daec',cyan:'#0a7f82',violet:'#7954ce'}};
const icons={
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 23v-2a8 8 0 0 1 16 0v2"/>',
  tree:'<path d="M12 4v7M4 17v-6h16v6M12 11v6"/><rect x="9" y="1" width="6" height="5" rx="1"/><rect x="1" y="17" width="6" height="6" rx="1"/><rect x="9" y="17" width="6" height="6" rx="1"/><rect x="17" y="17" width="6" height="6" rx="1"/>',
  code:'<path d="m8 5-7 7 7 7m8-14 7 7-7 7M14 2l-4 20"/>',
  game:'<path d="M7 6h10c4 0 7 15 4 16-2 1-5-5-7-5h-4c-2 0-5 6-7 5-3-1 0-16 4-16Z"/><path d="M7 9v7M3.5 12.5h7"/><circle cx="17" cy="11" r="1"/><circle cx="20" cy="15" r="1"/>',
  contact:'<rect x="1" y="4" width="22" height="16" rx="4"/><path d="m2 6 10 8L22 6"/>',
  linkedin:'<rect x="1" y="1" width="22" height="22" rx="5"/><path d="M6 11v7M11 18v-7m0 3c0-5 7-5 7 0v4"/><circle cx="6" cy="6.5" r="1"/>',
  presentation:'<rect x="1" y="2" width="22" height="15" rx="3"/><path d="m9 6 7 4-7 4ZM12 17v6M7 23h10"/>',
  github:'<path d="M8 23v-5c-6 1-7-3-7-3m18 8v-5c0-2-1-3-1-3 7-1 7-10 3-12l-1-4-5 2h-5L5-1 4 3c-4 2-4 11 3 12 0 0-1 1-1 3"/>'
};
const controls=[
 ['nav-about','SOBRE','01 / QUEM SOU','user'],['nav-skills','SKILL TREE','02 / EM EVOLUÇÃO','tree'],['nav-projects','PROJETOS','03 / MEU CÓDIGO','code'],['nav-arcade','DEV ARCADE','04 / PLAYER ONE','game'],['nav-contact','CONTATO','05 / VAMOS CONECTAR','contact'],
 ['contact-linkedin','LinkedIn','CONEXÕES & CARREIRA','linkedin'],['contact-site','Apresentação','PORTFÓLIO INTERATIVO','presentation'],['contact-github','GitHub','PROJETOS PÚBLICOS','code']
];
function control(label,sub,icon,p,index){
 const accent=index%2?p.violet:p.cyan;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="208" height="70" viewBox="0 0 208 70" role="img" aria-labelledby="title"><title id="title">${esc(label)} — ${esc(sub)}</title><defs><linearGradient id="border"><stop stop-color="${accent}" stop-opacity=".9"/><stop offset="1" stop-color="${p.line}"/></linearGradient></defs><rect x="1" y="1" width="206" height="68" rx="15" fill="${p.bg}" stroke="url(#border)"/><path d="M17 1H64" stroke="${accent}" stroke-width="2"/><rect x="12" y="15" width="39" height="40" rx="10" fill="${accent}" fill-opacity=".10"/><g transform="translate(20 23) scale(.9)" fill="none" stroke="${accent}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</g><text x="62" y="32" fill="${p.ink}" font-family="Segoe UI,Arial,sans-serif" font-weight="700" font-size="13">${esc(label)}</text><text x="62" y="49" fill="${p.muted}" font-family="Consolas,monospace" font-size="7.3" letter-spacing=".4">${esc(sub)}</text><path d="m187 27 5 5-5 5m-5-5h10" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round"/><circle cx="191" cy="52" r="2" fill="${accent}"><animate attributeName="opacity" values=".3;1;.3" dur="3s" repeatCount="indefinite"/></circle></svg>\n`;
}
export function renderControls(){
 const assets={};for(const [theme,p] of Object.entries(palettes)) controls.forEach(([id,label,sub,icon],i)=>assets[`${id}-${theme}.svg`]=control(label,sub,icon,p,i));return assets;
}
