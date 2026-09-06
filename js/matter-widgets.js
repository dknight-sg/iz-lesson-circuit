/* Chapter 3 · Diversity of matter by chemical composition — interactive widgets.
   Each IIFE guards on its root id so this file can be loaded on any lesson. */
(function(){
'use strict';
const SVGNS = 'http://www.w3.org/2000/svg';
function el(tag, cls, html){ const n=document.createElement(tag); if(cls) n.className=cls; if(html!=null) n.innerHTML=html; return n; }
function svgEl(tag, attrs){ const n=document.createElementNS(SVGNS, tag); for(const k in attrs) n.setAttribute(k, attrs[k]); return n; }
function rnd(a,b){ return a + Math.random()*(b-a); }

/* ---- shared particle renderer -------------------------------- */
const ATOM = { H:{r:6,fill:'#E9EEF3',stroke:'#0F2436'}, O:{r:9,fill:'#D93F2B',stroke:'#0F2436'},
               N:{r:9,fill:'#4C8FCB',stroke:'#0F2436'}, C:{r:9,fill:'#5A6B7A',stroke:'#0F2436'},
               Cu:{r:11,fill:'#C8813A',stroke:'#0F2436'}, Na:{r:10,fill:'#9E7CC8',stroke:'#0F2436'},
               Cl:{r:10,fill:'#5FB36B',stroke:'#0F2436'}, Fe:{r:11,fill:'#7A7F86',stroke:'#0F2436'},
               S:{r:9,fill:'#E8C33B',stroke:'#0F2436'}, Sn:{r:11,fill:'#A9B4BE',stroke:'#0F2436'} };
/* molecule shapes: list of [symbol, dx, dy] */
const MOL = {
  O2:[['O',-8,0],['O',8,0]], N2:[['N',-8,0],['N',8,0]], H2:[['H',-5,0],['H',5,0]],
  H2O:[['O',0,0],['H',-9,-8],['H',9,-8]], CO2:[['C',0,0],['O',-15,0],['O',15,0]],
  NaCl:[['Na',-9,0],['Cl',9,0]], Cu:[['Cu',0,0]], Fe:[['Fe',0,0]], C:[['C',0,0]], S:[['S',0,0]], Sn:[['Sn',0,0]]
};
function drawParticles(svg, spec, w, h){
  /* spec: [{mol:'H2O', n:6}, ...] — scatter without heavy overlap */
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.appendChild(svgEl('rect',{x:1,y:1,width:w-2,height:h-2,fill:'#F7FAFC',stroke:'#0F2436','stroke-width':2}));
  const placed=[];
  spec.forEach(s=>{
    for(let i=0;i<s.n;i++){
      let x,y,tries=0;
      do{ x=rnd(24,w-24); y=rnd(24,h-24); tries++; }
      while(tries<40 && placed.some(p=>Math.hypot(p[0]-x,p[1]-y)<34));
      placed.push([x,y]);
      const g=svgEl('g',{transform:'translate('+x.toFixed(1)+' '+y.toFixed(1)+')'});
      const atoms=MOL[s.mol];
      /* bonds first */
      for(let a=1;a<atoms.length;a++){
        g.appendChild(svgEl('line',{x1:atoms[0][1],y1:atoms[0][2],x2:atoms[a][1],y2:atoms[a][2],stroke:'#0F2436','stroke-width':3}));
      }
      atoms.forEach(a=>{ const A=ATOM[a[0]];
        g.appendChild(svgEl('circle',{cx:a[1],cy:a[2],r:A.r,fill:A.fill,stroke:A.stroke,'stroke-width':1.6}));
        const t=svgEl('text',{x:a[1],y:a[2]+3.5,'text-anchor':'middle','font-size':A.r>8?'9':'7','font-family':'Space Mono, monospace','font-weight':'700',fill:a[0]==='H'||a[0]==='Sn'?'#0F2436':'#F7FAFC'});
        t.textContent=a[0]; g.appendChild(t); });
      svg.appendChild(g);
    }
  });
}

/* ==============================================================
   particleLab — element / compound / mixture at particle level
   ============================================================== */
(function particleLab(){
  const root=document.getElementById('particleLab'); if(!root) return;
  const svg=root.querySelector('svg'); const W=420,H=200;
  const SAMPLES={
    copper:{spec:[{mol:'Cu',n:14}],atoms:1,joined:'—',verdict:'Element',why:'Only <strong>one type of atom</strong> — copper. Nothing to break down into anything simpler.'},
    oxygen:{spec:[{mol:'O2',n:9}],atoms:1,joined:'yes (O to O)',verdict:'Element',why:'The atoms are joined in pairs, but they are all <strong>the same kind</strong>. Joining two oxygen atoms does not make a new substance — it is still oxygen.'},
    water:{spec:[{mol:'H2O',n:8}],atoms:2,joined:'yes (H to O)',verdict:'Compound',why:'<strong>Two kinds of atom, chemically joined</strong> in every particle, always in the same 2 : 1 ratio. That fixed ratio is what makes it a compound.'},
    co2:{spec:[{mol:'CO2',n:7}],atoms:2,joined:'yes (C to O)',verdict:'Compound',why:'Every particle is one carbon joined to two oxygens. Carbon is a black solid and oxygen a gas — carbon dioxide is neither, which is exactly what you expect of a compound.'},
    air:{spec:[{mol:'N2',n:9},{mol:'O2',n:3},{mol:'CO2',n:1},{mol:'H2O',n:1}],atoms:4,joined:'within each particle, but not between them',verdict:'Mixture',why:'Several different substances <strong>side by side</strong>, none joined to the others. Their amounts could be different tomorrow — there is no fixed ratio.'},
    brine:{spec:[{mol:'H2O',n:9},{mol:'NaCl',n:3}],atoms:4,joined:'within each particle, but not between them',verdict:'Mixture',why:'Water particles and salt particles simply share the same space. Add more salt and the ratio changes — no fixed proportion, so a mixture (a <em>solution</em>, specifically).'}
  };
  const out={atoms:root.querySelector('.pl-atoms'),joined:root.querySelector('.pl-joined'),verdict:root.querySelector('.pl-verdict'),why:root.querySelector('.pl-why')};
  function show(key){
    const s=SAMPLES[key]; drawParticles(svg,s.spec,W,H);
    out.atoms.textContent=s.atoms; out.joined.textContent=s.joined; out.verdict.textContent=s.verdict; out.why.innerHTML=s.why;
    out.verdict.style.color = s.verdict==='Element'?'#2E7A8C':s.verdict==='Compound'?'#D93F2B':'#F0871E';
    root.querySelectorAll('.picker button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.s===key?'true':'false'));
  }
  root.querySelectorAll('.picker button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.s)));
  show('copper');
})();

/* ==============================================================
   ptLab — periodic table explorer
   ============================================================== */
(function ptLab(){
  const root=document.getElementById('ptLab'); if(!root) return;
  /* [Z, symbol, name, isMetal, group(col 1-18), period(row)] + note */
  const E=[
    [1,'H','hydrogen',0,1,1,'The lightest element. Combines with oxygen to make water.'],
    [2,'He','helium',0,18,1,'Party balloons. Lighter than air and does not burn.'],
    [3,'Li','lithium',1,1,2,'Rechargeable batteries in phones and laptops.'],
    [4,'Be','beryllium',1,2,2,''],[5,'B','boron',0,13,2,''],
    [6,'C','carbon',0,14,2,'Pencil lead is graphite — pure carbon. Also the basis of every plastic and every living thing.'],
    [7,'N','nitrogen',0,15,2,'78% of the air. As a liquid at −196 °C it freezes ice cream instantly.'],
    [8,'O','oxygen',0,16,2,'21% of the air — the part we breathe. Combines with almost everything.'],
    [9,'F','fluorine',0,17,2,'In toothpaste as fluoride.'],
    [10,'Ne','neon',0,18,2,'Glows orange-red when electricity passes through it — neon signs.'],
    [11,'Na','sodium',1,1,3,'A soft metal that fizzes in water. Joined to chlorine it becomes common salt.'],
    [12,'Mg','magnesium',1,2,3,'Burns with a brilliant white flame. In sparklers and flares.'],
    [13,'Al','aluminium',1,13,3,'Light and does not rust — cooking pots, drink cans, aircraft.'],
    [14,'Si','silicon',0,14,3,'The main element in sand and glass. Computer chips.'],
    [15,'P','phosphorus',0,15,3,'Match heads. Also in milk and bones.'],
    [16,'S','sulfur',0,16,3,'A yellow solid. A contaminant in fuel — burning it causes acid rain.'],
    [17,'Cl','chlorine',0,17,3,'A poisonous green gas — yet joined to sodium it is the salt you eat.'],
    [18,'Ar','argon',0,18,3,'Fills light bulbs so the filament does not burn away.'],
    [19,'K','potassium',1,1,4,'In bananas and fertiliser.'],
    [20,'Ca','calcium',1,2,4,'In bones, teeth, marble and seashells (as calcium carbonate).'],
    [21,'Sc','scandium',1,3,4,''],[22,'Ti','titanium',1,4,4,'Strong and light — hip replacements and aircraft.'],
    [23,'V','vanadium',1,5,4,''],[24,'Cr','chromium',1,6,4,'The shiny plating on taps and bumpers.'],
    [25,'Mn','manganese',1,7,4,''],
    [26,'Fe','iron',1,8,4,'Mixed with a little carbon it becomes steel. Rusts in damp air.'],
    [27,'Co','cobalt',1,9,4,''],[28,'Ni','nickel',1,10,4,'Coins and stainless steel.'],
    [29,'Cu','copper',1,11,4,'Coins, electrical wires and pipes — an excellent conductor.'],
    [30,'Zn','zinc',1,12,4,'Galvanising — a coat of zinc stops steel rusting.'],
    [31,'Ga','gallium',1,13,4,'Melts in your hand.'],[32,'Ge','germanium',0,14,4,''],
    [33,'As','arsenic',0,15,4,'Famously poisonous.'],[34,'Se','selenium',0,16,4,''],
    [35,'Br','bromine',0,17,4,'The only non-metal that is a liquid at room temperature.'],
    [36,'Kr','krypton',0,18,4,''],
    [47,'Ag','silver',1,11,5,'Jewellery, and one of the metals mixed into pewter.'],
    [50,'Sn','tin',1,14,5,'The main metal in pewter. Coats steel food cans.'],
    [53,'I','iodine',0,17,5,'Present in tiny amounts in seawater. Added to table salt.'],
    [79,'Au','gold',1,11,6,'Never tarnishes — jewellery and electrical contacts.'],
    [80,'Hg','mercury',1,12,6,'The only metal that is a liquid at room temperature. Old thermometers.'],
    [82,'Pb','lead',1,14,6,'Heavy and soft. Once in paint and petrol — now banned as poisonous.']
  ];
  const grid=root.querySelector('.ptgrid'); const info=root.querySelector('.pt-info');
  const cells=[];
  E.forEach(e=>{
    const b=el('button','pt-cell '+(e[3]?'pt-metal':'pt-non'),'<span class="pt-z">'+e[0]+'</span><span class="pt-sym">'+e[1]+'</span>');
    b.type='button'; b.style.gridColumn=e[4]; b.style.gridRow=e[5];
    b.setAttribute('aria-label',e[2]);
    b.addEventListener('click',()=>{
      cells.forEach(c=>c.setAttribute('aria-pressed','false')); b.setAttribute('aria-pressed','true');
      info.innerHTML='<div class="pt-name">'+e[2]+' <span class="pt-symbig">'+e[1]+'</span></div>'+
        '<div class="pt-tags"><span class="tag">element '+e[0]+'</span><span class="tag '+(e[3]?'t-metal':'t-non')+'">'+(e[3]?'metal':'non-metal')+'</span>'+
        '<span class="tag">group '+e[4]+'</span></div>'+
        (e[6]?'<p>'+e[6]+'</p>':'<p>One of the 118 known elements.</p>');
    });
    grid.appendChild(b); cells.push(b);
  });
  /* the lanthanoid/actinoid gap & tell-tale labels */
  const lbl=el('div','pt-key','<span><i class="pt-metal"></i>metals</span><span><i class="pt-non"></i>non-metals</span><span>Click any element</span>');
  root.querySelector('.pt-keyrow').appendChild(lbl);
  cells[28].click(); /* copper */
})();

/* ==============================================================
   mixLab — build a mixture and classify it
   ============================================================== */
(function mixLab(){
  const root=document.getElementById('mixLab'); if(!root) return;
  const BANK=[
    {id:'iron',label:'iron',kind:'E',mol:'Fe'},{id:'carbon',label:'carbon',kind:'E',mol:'C'},
    {id:'tin',label:'tin',kind:'E',mol:'Sn'},{id:'copper',label:'copper',kind:'E',mol:'Cu'},
    {id:'sulfur',label:'sulfur',kind:'E',mol:'S'},{id:'oxygen',label:'oxygen',kind:'E',mol:'O2'},
    {id:'nitrogen',label:'nitrogen',kind:'E',mol:'N2'},
    {id:'water',label:'water',kind:'C',mol:'H2O'},{id:'salt',label:'sodium chloride',kind:'C',mol:'NaCl'},
    {id:'co2',label:'carbon dioxide',kind:'C',mol:'CO2'}
  ];
  const KNOWN=[
    {set:['iron','carbon'],name:'steel',note:'a mixture of elements only — stronger than pure iron'},
    {set:['tin','copper'],name:'pewter',note:'a mixture of elements only — used for plates and jewellery'},
    {set:['salt','water'],name:'salt solution',note:'a mixture of compounds only — and a solution'},
    {set:['nitrogen','oxygen','co2','water'],name:'air',note:'a mixture of elements and compounds'},
    {set:['nitrogen','oxygen'],name:'most of air',note:'nitrogen and oxygen make up 99% of it'},
    {set:['salt','water','iodine'],name:'seawater',note:''}
  ];
  const bank=root.querySelector('.chipbank'); const svg=root.querySelector('svg'); const W=420,H=170;
  const out={kind:root.querySelector('.ml-kind'),count:root.querySelector('.ml-count'),name:root.querySelector('.ml-name'),note:root.querySelector('.ml-note')};
  const chosen=new Set();
  BANK.forEach(b=>{
    const c=el('button','chip '+(b.kind==='E'?'chip-e':'chip-c'),b.label+'<small>'+(b.kind==='E'?'element':'compound')+'</small>');
    c.type='button'; c.dataset.id=b.id; c.setAttribute('aria-pressed','false');
    c.addEventListener('click',()=>{ if(chosen.has(b.id)) chosen.delete(b.id); else chosen.add(b.id);
      c.setAttribute('aria-pressed',chosen.has(b.id)?'true':'false'); render(); });
    bank.appendChild(c);
  });
  root.querySelector('.ml-clear').addEventListener('click',()=>{ chosen.clear(); bank.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed','false')); render(); });
  function render(){
    const items=BANK.filter(b=>chosen.has(b.id));
    const per=Math.max(2,Math.floor(14/Math.max(1,items.length)));
    drawParticles(svg,items.map(b=>({mol:b.mol,n:per})),W,H);
    const nE=items.filter(b=>b.kind==='E').length, nC=items.filter(b=>b.kind==='C').length;
    out.count.textContent=nE+' element'+(nE===1?'':'s')+' · '+nC+' compound'+(nC===1?'':'s');
    if(items.length===0){ out.kind.textContent='—'; out.name.textContent='empty jar'; out.note.textContent='Pick two or more substances.'; return; }
    if(items.length===1){ out.kind.textContent='Not a mixture'; out.name.textContent='a single '+(nE?'element':'compound'); out.note.textContent='A mixture needs two or more substances that are not chemically combined.'; return; }
    out.kind.textContent = nE&&nC ? 'Mixture of elements AND compounds' : nE ? 'Mixture of elements only' : 'Mixture of compounds only';
    const key=[...chosen].sort().join(',');
    const hit=KNOWN.find(k=>[...k.set].sort().join(',')===key);
    out.name.textContent = hit ? hit.name : 'a mixture';
    out.note.textContent = hit ? hit.note : 'The particles sit side by side — none are chemically joined to the others, and you could add more of any one of them.';
  }
  render();
})();

/* ==============================================================
   dissolveLab — rate of dissolving
   ============================================================== */
(function dissolveLab(){
  const root=document.getElementById('dissolveLab'); if(!root) return;
  const size=root.querySelector('.dl-size'), temp=root.querySelector('.dl-temp'), stir=root.querySelector('.dl-stir');
  const tempOut=root.querySelector('.dl-tempv'); const timeOut=root.querySelector('.dl-time'); const status=root.querySelector('.dl-status');
  const go=root.querySelector('.dl-go'); const crystal=root.querySelector('.dl-crystal'); const liquid=root.querySelector('.dl-liquid');
  const grains=root.querySelector('.dl-grains');
  let timer=null;
  function predict(){
    const sf={cube:1,granules:0.5,powder:0.22}[size.value];
    const T=+temp.value; const tf=1-((T-20)/60)*0.62;      /* 20 °C → 1.00, 80 °C → 0.38 */
    const stf={none:1,slow:0.6,fast:0.35}[stir.value];
    return Math.round(120*sf*tf*stf);
  }
  function refresh(){ tempOut.textContent=temp.value+' °C'; timeOut.textContent='≈ '+predict()+' s'; }
  [size,temp,stir].forEach(c=>c.addEventListener('input',refresh));
  go.addEventListener('click',()=>{
    if(timer) clearInterval(timer);
    const total=predict(); const start=performance.now(); const dur=Math.min(4000, 400+total*25);
    status.textContent='Dissolving…'; crystal.style.opacity=1; grains.style.opacity=size.value==='cube'?0:1;
    liquid.setAttribute('fill','rgba(200,220,235,.55)');
    timer=setInterval(()=>{
      const p=Math.min(1,(performance.now()-start)/dur);
      const s=1-p; crystal.setAttribute('transform','translate(210 148) scale('+s.toFixed(3)+')'); grains.style.opacity=(1-p)*(size.value==='cube'?0:1);
      liquid.setAttribute('fill','rgba('+(200-40*p)+','+(220-20*p)+','+(235-10*p)+',.6)');
      if(p>=1){ clearInterval(timer); timer=null; status.textContent='Fully dissolved in about '+total+' s.'; }
    },40);
  });
  refresh();
})();

/* ==============================================================
   solubilityLab — how MUCH dissolves
   ============================================================== */
(function solubilityLab(){
  const root=document.getElementById('solubilityLab'); if(!root) return;
  const LIMIT={ 'sugar|water':8, 'salt|water':3, 'chalk|water':0, 'sugar|oil':0, 'salt|oil':0, 'chalk|oil':0 };
  const solute=root.querySelector('.sl-solute'), solvent=root.querySelector('.sl-solvent');
  const add=root.querySelector('.sl-add'), reset=root.querySelector('.sl-reset');
  const dissolved=root.querySelector('.sl-dissolved'), undissolved=root.querySelector('.sl-undissolved'), verdict=root.querySelector('.sl-verdict');
  const liquid=root.querySelector('.sl-liquid'), sediment=root.querySelector('.sl-sediment');
  let spoons=0;
  function key(){ return solute.value+'|'+solvent.value; }
  function render(){
    const lim=LIMIT[key()]; const d=Math.min(spoons,lim); const u=spoons-d;
    dissolved.textContent=d; undissolved.textContent=u;
    liquid.setAttribute('fill', solvent.value==='oil'?'rgba(232,196,60,.55)':'rgba(200,220,235,'+(0.35+0.06*d)+')');
    sediment.setAttribute('height', Math.min(34, u*6)); sediment.setAttribute('y', 176-Math.min(34,u*6));
    sediment.setAttribute('fill', solute.value==='chalk'?'#E9EEF3':'#F7FAFC');
    if(spoons===0){ verdict.textContent='Add a spoonful to begin.'; return; }
    if(lim===0) verdict.textContent=solute.value+' is insoluble in '+solvent.value+' — nothing dissolves, however much you stir.';
    else if(u===0) verdict.textContent='All '+spoons+' spoonful'+(spoons===1?'':'s')+' dissolved. Solubility limit not reached yet.';
    else verdict.textContent='Saturated. Only '+lim+' spoonfuls can dissolve in this much '+solvent.value+' at this temperature — the rest sits undissolved.';
  }
  add.addEventListener('click',()=>{ if(spoons<12){ spoons++; render(); } });
  reset.addEventListener('click',()=>{ spoons=0; render(); });
  [solute,solvent].forEach(s=>s.addEventListener('change',()=>{ spoons=0; render(); }));
  render();
})();

/* ==============================================================
   torchLab — solution vs suspension
   ============================================================== */
(function torchLab(){
  const root=document.getElementById('torchLab'); if(!root) return;
  const beamA=root.querySelector('.tl-beamA'), beamB=root.querySelector('.tl-beamB'), outA=root.querySelector('.tl-outA'), outB=root.querySelector('.tl-outB');
  const mud=root.querySelector('.tl-mud'), sed=root.querySelector('.tl-sed');
  const shine=root.querySelector('.tl-shine'), stand=root.querySelector('.tl-stand'), reset=root.querySelector('.tl-reset');
  const rA=root.querySelector('.tl-rA'), rB=root.querySelector('.tl-rB');
  let settled=false, lit=false;
  function render(){
    [beamA,beamB,outA,outB].forEach(n=>n.style.opacity=lit?1:0);
    outB.style.opacity = lit ? (settled?0.9:0.15) : 0;
    mud.style.opacity = settled?0.12:0.85; sed.style.opacity=settled?1:0;
    rA.textContent = lit ? 'Light passes through fully — the sugar particles are far too small to block it.' : 'Clear. You cannot see any sugar particles.';
    rB.textContent = settled
      ? (lit ? 'Now light passes through the water above the deposit — the insoluble mud has settled out.' : 'The insoluble mud has settled as a solid deposit at the bottom. The water above is clearer.')
      : (lit ? 'Light is blocked and scattered — the insoluble particles are big enough to get in its way.' : 'Cloudy. You can see the mud particles floating.');
  }
  shine.addEventListener('click',()=>{ lit=!lit; shine.textContent=lit?'Torch off':'Shine torch'; render(); });
  stand.addEventListener('click',()=>{ settled=true; render(); });
  reset.addEventListener('click',()=>{ settled=false; lit=false; shine.textContent='Shine torch'; render(); });
  render();
})();
})();
