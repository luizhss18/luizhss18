import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import {renderControls} from './render-brand.mjs';

// Zero dependencies. Read the PUBLIC calendar only; never query private repositories.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'assets');
const user = 'luizhss18';
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const attr = (s, name) => s.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

export function parseCalendar(html) {
  const tips = new Map([...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map(m => [attr(m[1], 'for'), m[2].replace(/<[^>]*>/g, '').trim()]));
  const days = [...html.matchAll(/<td\b([^>]*\bdata-date="[^"]+"[^>]*)>/g)].map(m => {
    const label = tips.get(attr(m[1], 'id'));
    if (!label || !/^(No contributions|\d+ contributions?)/.test(label)) throw Error('Public calendar tooltip format changed');
    return {date: attr(m[1], 'data-date'), level: Number(attr(m[1], 'data-level')), count: Number(label.match(/^\d+/)?.[0] || 0)};
  }).sort((a,b) => a.date.localeCompare(b.date));
  if (days.length < 350 || days.length > 371 || new Set(days.map(d=>d.date)).size !== days.length) throw Error('Incomplete public contribution calendar');
  for (let i=0;i<days.length;i++) {
    const d=days[i];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !Number.isInteger(d.count) || d.count<0 || !Number.isInteger(d.level) || d.level<0 || d.level>4) throw Error('Invalid calendar data');
    if(i && Date.parse(d.date)-Date.parse(days[i-1].date)!==86400000) throw Error('Calendar has gaps');
  }
  return days;
}

const palettes = {
  dark: {bg:'#0b1020', panel:'#111a30', line:'#25324d', ink:'#edf3ff', muted:'#9aaac7', cyan:'#55e0d4', violet:'#ae94ff', yellow:'#ffd668', empty:'#1b2840', levels:['#1b2840','#244c65','#287f91','#43b4ba','#78eee0']},
  light:{bg:'#f5f7ff', panel:'#ffffff', line:'#d4dcef', ink:'#17233e', muted:'#586985', cyan:'#087f83', violet:'#7652cb', yellow:'#a86600', empty:'#e4eafa', levels:['#e4eafa','#b9dce0','#77bfc5','#35969f','#116b78']}
};
function svg(w,h,title,body,p,extra='') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(extra || title)}</desc><style>text{font-family:Segoe UI,Arial,sans-serif;fill:${p.ink}}.mono{font-family:Consolas,monospace}.muted{fill:${p.muted}}.accent{fill:${p.cyan}}.violet{fill:${p.violet}}.motion{animation:float 5s ease-in-out infinite}.blink{animation:blink 1.3s steps(2,end) infinite}@keyframes float{50%{transform:translateY(-7px)}}@keyframes blink{50%{opacity:.18}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="20" fill="${p.bg}" stroke="${p.line}"/>${body}</svg>\n`;
}
const text=(x,y,s,size=14,cls='',attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" class="${cls}" ${attrs}>${esc(s)}</text>`;
const pill=(x,y,w,s,c,p)=>`<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="${p.panel}" stroke="${p.line}"/>${text(x+w/2,y+18,s,11,'mono',`text-anchor="middle" fill="${c}"`)}`;

function header(p) {
  let b=`<defs><linearGradient id="glow"><stop stop-color="${p.cyan}"/><stop offset="1" stop-color="${p.violet}"/></linearGradient><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${p.line}" stroke-width=".6"/></pattern></defs><rect x="580" y="20" width="440" height="326" rx="16" fill="url(#grid)" opacity=".6"/>`;
  b+=text(40,43,'LUIZ OS',14,'mono accent')+text(1000,43,'PORTFOLIO / V.01',11,'mono muted','text-anchor="end"');
  b+=`<path d="M40 64H1000" stroke="${p.line}"/>`;
  b+=text(40,108,'OLÁ, EU SOU',12,'mono muted','letter-spacing="3"')+text(38,173,'Luiz Souza.',62,'','font-weight="750"');
  b+=text(42,212,'Transformando curiosidade em código.',21)+text(42,245,'Informática & Programação Web · Senac',14,'muted');
  b+=pill(40,281,126,'WEB DEV',p.cyan,p)+pill(178,281,122,'SUPORTE TI',p.violet,p)+pill(312,281,116,'INFRA',p.cyan,p);
  b+=`<g class="motion" transform="translate(0 0)"><path d="M768 96 892 166 768 238 644 166Z" fill="${p.panel}" stroke="url(#glow)" stroke-width="2"/><path d="M644 166v40l124 72 124-72v-40M768 238v40" fill="none" stroke="${p.line}" stroke-width="2"/>${text(768,184,'&lt;/&gt;',40,'mono accent','text-anchor="middle"')}</g>`;
  // Literal angle brackets are escaped by text().
  b=b.replace('&amp;lt;/&amp;gt;','&lt;/&gt;');
  for(const [x,y,c] of [[644,166,p.cyan],[892,166,p.violet],[768,278,p.cyan]]) b+=`<circle cx="${x}" cy="${y}" r="5" fill="${c}" class="blink"/>`;
  b+=text(768,320,'LEARN → BUILD → REPEAT',11,'mono muted','text-anchor="middle"');
  return svg(1040,358,'Luiz OS — Luiz Souza, estudante de Informática, web, banco de dados e redes',b,p);
}
function terminal(p) {
  let b=`<rect x="18" y="18" width="1004" height="36" rx="10" fill="${p.panel}"/>`;
  ['#f08091','#ffd668','#55cfb7'].forEach((c,i)=>b+=`<circle cx="${37+i*20}" cy="36" r="4" fill="${c}"/>`);
  b+=text(520,41,'luiz@devlab: ~/about',12,'mono muted','text-anchor="middle"');
  const lines=[['$ whoami','accent'],['Luiz Souza · estudante de Informática e Programação Web',''],['$ cat current-mission.txt','accent'],['Estudar algoritmos, back-end web e banco de dados.',''],['$ ls ./toolbox','accent'],['VS Code/  MySQL Workbench/  Canva/  Pacote Office/','']];
  lines.forEach(([s,c],i)=>b+=`<g class="line${i}">${text(36,84+i*29,s,15,'mono '+c)}</g>`);
  b+=text(36,270,'$ git commit -m "mais uma ideia saiu do papel"',14,'mono muted')+`<rect class="blink" x="468" y="257" width="8" height="17" fill="${p.cyan}"/>`;
  b+=`<style>${lines.map((_,i)=>`.line${i}{animation:reveal${i} 12s infinite}@keyframes reveal${i}{0%,${i*6}%{opacity:${i===0?1:0}}${i*6+4}%,100%{opacity:1}}`).join('')}</style>`;
  return svg(1040,300,'Terminal: sobre Luiz e sua missão de aprendizado',b,p);
}
function skills(p) {
  let b=text(30,36,'SKILL TREE',12,'mono accent')+text(1010,36,'APRENDER · CRIAR · RESOLVER',11,'mono muted','text-anchor="end"');
  const branches=[
    ['01 / FRONT-END','Construindo interfaces',['HTML · CSS','Responsividade','Tecnologias front-end']],
    ['02 / EM APRENDIZADO','Próximas conexões',['Desenvolvimento de algoritmos','Back-end para web','Introdução a banco de dados']],
    ['03 / SOFTWARES','Minha caixa de ferramentas',['Visual Studio Code','MySQL Workbench','Canva · Pacote Office']],
    ['04 / SUPORTE','Resolvendo no dia a dia',['Montagem e manutenção','Instalação de hardware e software','Solução de problemas']],
    ['05 / INFRAESTRUTURA','Conectando ambientes',['Windows','Linux (servidores)','Cabeamento e redes locais']],
    ['06 / CONEXÕES HUMANAS','Trabalhando em conjunto',['Organização e proatividade','Trabalho em equipe','Inglês básico · A2']]
  ];
  branches.forEach(([title,sub,items],i)=>{const x=30+(i%3)*335,y=62+Math.floor(i/3)*180,color=i%2?p.violet:p.cyan;
    b+=`<rect x="${x}" y="${y}" width="310" height="160" rx="14" fill="${p.panel}" stroke="${p.line}"/>${text(x+20,y+30,title,12,'mono',`style="fill:${color}"`)}${text(x+20,y+53,sub,12,'muted')}`;
    items.forEach((s,j)=>b+=`<circle cx="${x+24}" cy="${y+83+j*25}" r="3" fill="${color}"/>${text(x+38,y+88+j*25,s,13)}`);
  });
  return svg(1040,426,'HTML, CSS, responsividade; estudos de algoritmos, back-end e banco de dados; VS Code, MySQL Workbench, Canva, Office; suporte, Windows, Linux e redes locais.',b,p);
}
const projects=[
  {id:'brasa',name:'Sabor Brasa',tag:'RESTAURANT / WEB',desc:'Uma experiência web para restaurante.',tech:'HTML · CSS',icon:'flame',repo:'SABOR-BRASA-FRONT'},
  {id:'basquete',name:'Blog de Basquete',tag:'SPORTS / EDITORIAL',desc:'Conteúdo esportivo em formato de blog.',tech:'HTML · CSS',icon:'ball',repo:'WEB-BLOG-BASQUETE'},
  {id:'retro',name:'Vintage Store',tag:'RETRO / SHOWCASE',desc:'Uma vitrine web de produtos com tema retrô.',tech:'HTML · CSS',icon:'vinyl',repo:'SITE-SIMPLES-EXPOSITIVO-venda-de-produtos-retr-'}
];
function card(q,p,i) {
  let b=text(24,33,`0${i+1} / ${q.tag}`,10,'mono muted');
  b+=`<circle cx="438" cy="67" r="28" fill="${p.panel}" stroke="${p.line}"/>`;
  if(q.icon==='flame')b+=`<path d="M439 42c7 16 20 20 10 38-6 10-24 7-25-5-1-9 7-13 6-22l9 8c5-6 0-12 0-19Z" fill="none" stroke="${p.cyan}" stroke-width="2"/>`;
  if(q.icon==='film')b+=`<rect x="421" y="53" width="34" height="26" rx="4" fill="none" stroke="${p.violet}" stroke-width="2"/><path d="m434 58 11 8-11 8Z" fill="${p.violet}"/>`;
  if(q.icon==='ball')b+=`<circle cx="438" cy="67" r="18" fill="none" stroke="${p.cyan}" stroke-width="2"/><path d="M420 67h36M438 49v36M426 53q23 14 0 28M450 53q-23 14 0 28" fill="none" stroke="${p.cyan}"/>`;
  if(q.icon==='form')b+=`<rect x="424" y="48" width="28" height="37" rx="4" fill="none" stroke="${p.violet}" stroke-width="2"/><path d="M430 58h16M430 66h16M430 74h10" stroke="${p.violet}" stroke-width="2"/>`;
  if(q.icon==='vinyl')b+=`<circle cx="438" cy="67" r="18" fill="none" stroke="${p.violet}" stroke-width="2"/><circle cx="438" cy="67" r="7" fill="none" stroke="${p.violet}" stroke-width="2"/><circle cx="438" cy="67" r="2" fill="${p.violet}"/><path d="M425 65a13 13 0 0 1 11-11M440 80a13 13 0 0 0 11-11" stroke="${p.violet}" stroke-linecap="round" fill="none"/>`;
  b+=text(24,87,q.name,25,'','font-weight="700"')+text(24,122,q.desc,13,'muted')+`<path d="M24 148H476" stroke="${p.line}"/>`+text(24,177,q.tech,12,'mono accent')+text(476,177,'ABRIR REPOSITÓRIO ↗',10,'mono muted','text-anchor="end"');
  return svg(500,200,q.name+': '+q.desc,b,p);
}

export function metrics(days) {
  let best=0,run=0;
  for(const d of days){run=d.count?run+1:0;best=Math.max(best,run);}
  return {total:days.reduce((s,d)=>s+d.count,0),active:days.filter(d=>d.count).length,best,peak:Math.max(...days.map(d=>d.count))};
}
function dashboard(days,p) {
  const m=metrics(days);let b=text(30,35,'GITHUB TELEMETRY',12,'mono accent');
  [[m.total,'CONTRIBUIÇÕES'],[m.active,'DIAS ATIVOS'],[m.best,'MELHOR SEQUÊNCIA'],[m.peak,'RECORDE EM UM DIA']].forEach(([v,s],i)=>{const x=30+i*250;b+=`<rect x="${x}" y="54" width="230" height="108" rx="12" fill="${p.panel}" stroke="${p.line}"/>${text(x+18,103,v,36,'','font-weight="700"')}${text(x+18,139,s,10,'mono muted')}`;});
  b+=text(30,191,`Calendário público · ${days[0].date} → ${days.at(-1).date} · atualizado diariamente`,11,'mono muted');
  return svg(1040,212,'Estatísticas das contribuições públicas: '+JSON.stringify(m),b,p);
}
export function coordinates(days) {
  const start=Date.parse(days[0].date),offset=new Date(start).getUTCDay();
  return days.map((d,i)=>({...d,col:Math.floor((i+offset)/7),row:(i+offset)%7}));
}
function arcade(days,p,mode) {
  const cells=coordinates(days),cols=Math.max(...cells.map(d=>d.col))+1;
  const step=17,left=(1040-cols*step)/2,top=100;
  const names={pacman:'01 / COMMIT MUNCHER',snake:'02 / NEON SNAKE',invaders:'03 / SPACE COMMITS'};
  let b=text(30,36,names[mode],14,'mono accent')+text(1010,36,`${metrics(days).total} CONTRIBUIÇÕES / PLAYER @LUIZHSS18`,11,'mono muted','text-anchor="end"');
  b+=`<path d="M30 55H1010" stroke="${p.line}"/>`;
  b+=text(30,81,'O mesmo calendário. Um novo universo.',12,'muted');
  let empty='';for(const d of cells)empty+=`M${(left+d.col*step).toFixed(1)} ${top+d.row*step}h13v13h-13Z`;
  b+=`<path d="${empty}" fill="${p.empty}"/>`;
  const route=[];for(let row=0;row<7;row++){const list=cells.filter(d=>d.row===row).sort((a,b)=>row%2?b.col-a.col:a.col-b.col);route.push(...list);}
  const path=route.map((d,i)=>`${i?'L':'M'}${(left+d.col*step+6.5).toFixed(1)} ${top+d.row*step+6.5}`).join(' ');
  for(const d of cells.filter(d=>d.count)){
    const i=route.indexOf(d),t=(i/Math.max(1,route.length-1)*.94+.01).toFixed(4);
    b+=`<rect x="${(left+d.col*step).toFixed(1)}" y="${top+d.row*step}" width="13" height="13" rx="3" fill="${p.levels[d.level]}"><title>${d.date}: ${d.count} contribuições</title>`;
    if(mode!=='invaders') b+=`<animate attributeName="opacity" values="1;1;.18;.18;1" keyTimes="0;${t};${Math.min(.97,Number(t)+.002).toFixed(4)};.98;1" dur="24s" repeatCount="indefinite"/>`;
    b+='</rect>';
  }
  if(mode==='pacman'){
    b+=`<g><animateMotion path="${path}" dur="24s" rotate="auto" repeatCount="indefinite"/><path fill="#ffd668" d="M0 0 8-6A10 10 0 1 0 8 6Z"><animate attributeName="d" values="M0 0 8-6A10 10 0 1 0 8 6Z;M0 0 10-1A10 10 0 1 0 10 1Z;M0 0 8-6A10 10 0 1 0 8 6Z" dur=".32s" repeatCount="indefinite"/></path></g>`;
  }else if(mode==='snake'){
    for(let k=8;k>=0;k--) b+=`<g opacity="${(1-k*.075).toFixed(2)}"><animateMotion path="${path}" dur="24s" begin="-${24-k*.065}s" repeatCount="indefinite"/><rect x="-6" y="-6" width="12" height="12" rx="4" fill="${k?p.violet:p.cyan}"/>${!k?`<circle cx="2" cy="-2" r="1.5" fill="${p.bg}"/>`:''}</g>`;
  }else{
    b+=`<g><animateTransform attributeName="transform" type="translate" values="${left} 0;${left+cols*step-25} 0;${left} 0" dur="10s" repeatCount="indefinite"/><path d="M0 244h24v-8h-7v-7H7v7H0Z" fill="${p.cyan}"/>`;
    for(let i=0;i<3;i++) b+=`<rect x="11" y="220" width="2" height="8" fill="${p.cyan}"><animate attributeName="y" values="226;90" dur="1.6s" begin="-${i*.53}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" dur="1.6s" begin="-${i*.53}s" repeatCount="indefinite"/></rect>`;
    b+='</g>';
    b+=`<g><animateTransform attributeName="transform" type="translate" values="0 0;14 0;0 0" dur="2s" calcMode="discrete" repeatCount="indefinite"/>`;
    for(let i=0;i<7;i++){const x=350+i*90;b+=`<path d="M${x} 63h4v4h12v-4h4v4h4v4h4v12h-4v-4h-4v4h-4v-8h-4v8h-4v-4h-4v4h-4V71h4v-4h4Z" fill="${p.violet}" opacity=".6"/>`;}
    b+='</g>';
  }
  b+=text(30,278,mode==='invaders'?'ARCADE VISUAL / AS CORES REPRESENTAM SEUS DIAS DE ATIVIDADE':'ARCADE VISUAL / CADA BLOCO COLORIDO É UM DIA COM CONTRIBUIÇÕES',10,'mono muted');
  b+=text(1010,278,`${days[0].date} — ${days.at(-1).date}`,10,'mono muted','text-anchor="end"');
  // Reduced-motion disables both CSS and SMIL by hiding moving overlays; the data grid stays visible.
  b=b.replaceAll('<g><animateMotion','<g class="smil"><animateMotion').replaceAll('<g opacity=','<g class="smil" opacity=').replaceAll('<g><animateTransform','<g class="smil"><animateTransform');
  b+='<style>@media(prefers-reduced-motion:reduce){.smil{display:none}}</style>';
  return svg(1040,300,names[mode]+' — animação do calendário público de '+user,b,p,'Animação decorativa, sem controles de jogo. Os blocos e as estatísticas usam somente contribuições públicas.');
}
function city(days,p){
  const cells=coordinates(days);let b=text(30,35,'CONTRIBUTION CITY',13,'mono accent')+text(1010,35,'CADA DIA, UM BLOCO. CADA ENTREGA, MAIS UM ANDAR.',10,'mono muted','text-anchor="end"');
  for(const d of cells){const x=95+d.col*16-d.row*8,y=102+d.col*2.5+d.row*7,h=d.count?8+d.level*10:2;const c=p.levels[d.level];b+=`<path d="M${x} ${y-h}l8-4 8 4-8 4Z" fill="${c}"/><path d="M${x} ${y-h}l8 4v${h}l-8-4Z" fill="${c}" opacity=".55"/><path d="M${x+8} ${y-h+4}l8-4v${h}l-8 4Z" fill="${c}" opacity=".8"/>`;}
  b+=text(30,326,'Altura = faixa de intensidade do calendário público · visão isométrica',11,'mono muted');
  return svg(1040,350,'Cidade isométrica das contribuições públicas de Luiz',b,p);
}
function footer(p){let b=text(30,41,'BUILD. BREAK. LEARN. REPEAT.',18,'mono accent')+text(30,68,'O próximo projeto começa com uma boa ideia.',14,'muted');b+=text(1000,51,'LUIZ OS /',13,'mono muted','text-anchor="end"')+`<rect x="1007" y="39" width="8" height="16" fill="${p.cyan}" class="blink"/>`;return svg(1040,100,'Luiz OS — construir, experimentar, aprender e repetir',b,p);}

async function main(){
  await mkdir(out,{recursive:true});await mkdir(resolve(root,'data'),{recursive:true});
  let data;
  if(process.argv.includes('--refresh')){
    const response=await fetch(`https://github.com/users/${user}/contributions`,{headers:{'User-Agent':'luizhss18-profile-arcade','Accept-Language':'en-US'},signal:AbortSignal.timeout(30000)});
    if(!response.ok)throw Error(`Public calendar HTTP ${response.status}`);
    const days=parseCalendar(await response.text());
    // Keep snapshots deterministic within the same day, and never replace good assets on an HTTP/parser failure.
    data={source:`https://github.com/users/${user}/contributions`,updated:new Date().toISOString().slice(0,10),days};
    await writeFile(resolve(root,'data/contributions.json'),JSON.stringify(data,null,2)+'\n');
  }else data=JSON.parse(await readFile(resolve(root,'data/contributions.json'),'utf8'));
  if(!data.days?.length)throw Error('Missing real contribution snapshot');
  for(const [theme,p] of Object.entries(palettes)){
    const files={header:header(p),terminal:terminal(p),skills:skills(p),dashboard:dashboard(data.days,p),pacman:arcade(data.days,p,'pacman'),snake:arcade(data.days,p,'snake'),invaders:arcade(data.days,p,'invaders'),city:city(data.days,p),footer:footer(p)};
    projects.forEach((q,i)=>files['project-'+q.id]=card(q,p,i));
    for(const [name,content] of Object.entries(files))await writeFile(resolve(out,`${name}-${theme}.svg`),content);
  }
  for(const [name,content] of Object.entries(renderControls()))await writeFile(resolve(out,name),content);
  console.log(`Rendered profile, project and control SVGs from ${data.days.length} public days; total ${metrics(data.days).total}.`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
