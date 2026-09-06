/* Chapter 8 · Model of Matter — Atoms and Molecules.
   Each IIFE guards on its root id so this file is safe on any lesson page. */
(function(){
'use strict';
function el(t,c,h){const n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n;}
function set(n,a){for(const k in a)n.setAttribute(k,a[k]);}
const SVGNS='http://www.w3.org/2000/svg';

/* proton number -> [symbol, name, relative atomic mass, common neutron count] */
const EL={
  1:['H','hydrogen',1,0], 2:['He','helium',4,2], 3:['Li','lithium',7,4], 4:['Be','beryllium',9,5],
  5:['B','boron',11,6], 6:['C','carbon',12,6], 7:['N','nitrogen',14,7], 8:['O','oxygen',16,8],
  9:['F','fluorine',19,10], 10:['Ne','neon',20,10], 11:['Na','sodium',23,12], 12:['Mg','magnesium',24,12],
  13:['Al','aluminium',27,14], 14:['Si','silicon',28,14], 15:['P','phosphorus',31,16], 16:['S','sulfur',32,16],
  17:['Cl','chlorine',35.5,18], 18:['Ar','argon',40,22], 19:['K','potassium',39,20], 20:['Ca','calcium',40,20],
  26:['Fe','iron',56,30], 29:['Cu','copper',64,35], 30:['Zn','zinc',65,35], 36:['Kr','krypton',84,48],
  47:['Ag','silver',108,61], 79:['Au','gold',197,118], 80:['Hg','mercury',201,121],
  83:['Bi','bismuth',209,126], 92:['U','uranium',238,146], 101:['Md','mendelevium',258,157],
  113:['Nh','nihonium',286,173]
};

/* ==============================================================
   scaleLab — how small is an atom
   ============================================================== */
(function scaleLab(){
  const root=document.getElementById('scaleLab'); if(!root) return;
  const STEPS=[
    {t:'A fingernail', d:'about 1 cm across', n:'A row of over <strong>100 million hydrogen atoms</strong> would stretch across it.', z:1},
    {t:'A grain of rice', d:'about 0.5 cm long', n:'A row of <strong>50 million hydrogen atoms</strong> would fit along its length.', z:2},
    {t:'A strand of human hair', d:'between 0.001 cm and 0.006 cm thick', n:'A row of <strong>1 million carbon atoms</strong> would span its diameter.', z:3},
    {t:'A caesium atom', d:'about 0.000 000 007 cm across', n:'And this is one of the <strong>largest</strong> atoms we know of.', z:4}
  ];
  const btns=root.querySelectorAll('.sc-pick button');
  const title=root.querySelector('.sc-title'), dim=root.querySelector('.sc-dim'), note=root.querySelector('.sc-note');
  const bar=root.querySelector('.sc-bar');
  function show(i){
    const s=STEPS[i];
    btns.forEach((b,k)=>b.setAttribute('aria-pressed',k===i?'true':'false'));
    title.textContent=s.t; dim.textContent=s.d; note.innerHTML=s.n;
    bar.style.width=(100/Math.pow(6,i)).toFixed(4)+'%';
  }
  btns.forEach((b,i)=>b.addEventListener('click',()=>show(i)));
  show(0);
})();

/* ==============================================================
   atomBuilder — build a neutral atom and read off its identity
   ============================================================== */
(function atomBuilder(){
  const root=document.getElementById('atomBuilder'); if(!root) return;
  const pIn=root.querySelector('.ab-p'), nIn=root.querySelector('.ab-n');
  const nuc=root.querySelector('.ab-nucleus'), shells=root.querySelector('.ab-shells');
  const out={sym:root.querySelector('.ab-sym'),name:root.querySelector('.ab-name'),
             pn:root.querySelector('.ab-pn'),nn:root.querySelector('.ab-nn'),
             ne:root.querySelector('.ab-ne'),chg:root.querySelector('.ab-chg')};
  const note=root.querySelector('.ab-note'), pv=root.querySelector('.ab-pv'), nv=root.querySelector('.ab-nv');
  function render(){
    const p=+pIn.value, n=+nIn.value, e=p;         /* electrons always equal protons */
    pv.textContent=p; nv.textContent=n;
    const info=EL[p];
    out.sym.textContent = info?info[0]:'?';
    out.name.textContent = info?info[1]:'not in our table';
    out.pn.textContent=p; out.nn.textContent=p+n; out.ne.textContent=e;
    out.chg.textContent='0';
    /* nucleus: draw up to 24 particles, then summarise */
    while(nuc.firstChild) nuc.removeChild(nuc.firstChild);
    const total=p+n, showN=Math.min(total,24);
    const cx=110, cy=100;
    for(let i=0;i<showN;i++){
      const a=(i/showN)*Math.PI*2, r=(i%3)*9+ (showN>8?14:0);
      const isP = i < Math.round(showN*p/Math.max(1,total));
      const c=document.createElementNS(SVGNS,'circle');
      set(c,{cx:cx+r*Math.cos(a),cy:cy+r*Math.sin(a),r:7,
             fill:isP?'#D93F2B':'#8E9AA6',stroke:'#0F2436','stroke-width':1.2});
      nuc.appendChild(c);
      const t=document.createElementNS(SVGNS,'text');
      set(t,{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)+3.5,'text-anchor':'middle','font-size':8,
             'font-family':'Space Mono, monospace',fill:'#F7FAFC','font-weight':700});
      t.textContent=isP?'+':'0'; nuc.appendChild(t);
    }
    if(total>24){
      const t=document.createElementNS(SVGNS,'text');
      set(t,{x:cx,y:cy+52,'text-anchor':'middle','font-size':10,'font-family':'Space Mono, monospace',fill:'#4A6076'});
      t.textContent='(' + total + ' particles in all)'; nuc.appendChild(t);
    }
    /* electron shells: 2, 8, 8, then remainder */
    while(shells.firstChild) shells.removeChild(shells.firstChild);
    const cap=[2,8,8,18], radii=[52,74,96,118];
    let left=e;
    for(let s=0;s<4 && left>0;s++){
      const inShell=Math.min(left,cap[s]); left-=inShell;
      const ring=document.createElementNS(SVGNS,'circle');
      set(ring,{cx:cx,cy:cy,r:radii[s],fill:'none',stroke:'#9FB2C4','stroke-width':1.2,'stroke-dasharray':'3 3'});
      shells.appendChild(ring);
      for(let i=0;i<inShell;i++){
        const a=(i/inShell)*Math.PI*2 - Math.PI/2;
        const c=document.createElementNS(SVGNS,'circle');
        set(c,{cx:cx+radii[s]*Math.cos(a),cy:cy+radii[s]*Math.sin(a),r:5,
               fill:'#2E7A8C',stroke:'#0F2436','stroke-width':1.1});
        shells.appendChild(c);
      }
    }
    if(left>0){
      const t=document.createElementNS(SVGNS,'text');
      set(t,{x:cx,y:cy+150,'text-anchor':'middle','font-size':10,'font-family':'Space Mono, monospace',fill:'#4A6076'});
      t.textContent='+ '+left+' more electrons further out'; shells.appendChild(t);
    }
    const common = info ? info[3] : null;
    note.innerHTML = !info
      ? 'No element has ' + p + ' protons in our table — but the rule still holds: the <strong>proton number alone</strong> decides which element it is.'
      : 'The <strong>proton number ' + p + '</strong> is what makes this ' + info[1] + '. Change it and you get a different element entirely.'
        + ' The atom is <strong>electrically neutral</strong> because it has ' + p + ' protons (+' + p + ') and ' + e + ' electrons (−' + e + '), which cancel. Neutrons have no charge, so they never affect it.'
        + (common!==null && n!==common
            ? ' <span style="color:var(--charge)">With ' + n + ' neutrons instead of the usual ' + common + ', this is an <strong>isotope</strong> of ' + info[1] + ' — still ' + info[1] + ', because the protons have not changed.</span>'
            : '');
  }
  [pIn,nIn].forEach(c=>c.addEventListener('input',render));
  root.querySelectorAll('.ab-preset').forEach(b=>b.addEventListener('click',()=>{
    pIn.value=b.dataset.p; nIn.value=b.dataset.n; render();
  }));
  render();
})();

/* ==============================================================
   modelHistory — Dalton, Thomson, planetary
   ============================================================== */
(function modelHistory(){
  const root=document.getElementById('modelHistory'); if(!root) return;
  const M={
    dalton:{t:'Dalton’s billiard ball model', who:'John Dalton, 1800s',
      got:'Atoms exist, and they can join together. Dalton joined wooden balls with hooks to show how atoms could be combined.',
      missed:'It shows the atom as a solid, featureless sphere — no sub-atomic particles at all, and no way to explain charge.'},
    thomson:{t:'Thomson’s plum pudding model', who:'J. J. Thomson, early 1900s',
      got:'The atom contains smaller charged pieces — electrons (the plums) sitting in a mass of positive charge (the pudding).',
      missed:'There is no nucleus. The positive charge is spread through the whole atom, which cannot explain what later experiments found.'},
    planetary:{t:'The planetary model', who:'The model your textbook uses',
      got:'Protons and neutrons sit in a tiny central <strong>nucleus</strong>; electrons move around it at high speed, like planets round the sun. Most of the atom is <strong>empty space</strong>.',
      missed:'Still a simplification. No one knows exactly what an atom looks like — electrons do not really travel on neat orbits, and atoms have no colour.'}
  };
  const panel=root.querySelector('.mh-panel');
  function show(k){
    const m=M[k];
    panel.innerHTML='<h5>'+m.t+'</h5><p class="mh-who">'+m.who+'</p>'
      +'<h6 class="mh-good">What it got right</h6><p>'+m.got+'</p>'
      +'<h6 class="mh-bad">Where it falls short</h6><p>'+m.missed+'</p>';
    root.querySelectorAll('.mh-btn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k?'true':'false'));
    root.querySelectorAll('.mh-fig').forEach(f=>f.style.display=f.dataset.k===k?'block':'none');
  }
  root.querySelectorAll('.mh-btn').forEach(b=>b.addEventListener('click',()=>show(b.dataset.k)));
  show('dalton');
})();

/* ==============================================================
   isotopeLab — same protons, different neutrons
   ============================================================== */
(function isotopeLab(){
  const root=document.getElementById('isotopeLab'); if(!root) return;
  const SETS={
    carbon:{name:'carbon', p:6, list:[{n:6,nn:12},{n:7,nn:13},{n:8,nn:14}]},
    hydrogen:{name:'hydrogen', p:1, list:[{n:0,nn:1},{n:1,nn:2},{n:2,nn:3}]},
    chlorine:{name:'chlorine', p:17, list:[{n:18,nn:35},{n:20,nn:37}]},
    nitrogen:{name:'nitrogen', p:7, list:[{n:7,nn:14},{n:8,nn:15}]},
    uranium:{name:'uranium', p:92, list:[{n:143,nn:235},{n:146,nn:238}]}
  };
  const rows=root.querySelector('.is-rows'), note=root.querySelector('.is-note');
  function show(k){
    const s=SETS[k];
    root.querySelectorAll('.is-pick button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k?'true':'false'));
    rows.innerHTML='<table class="isot"><tr><td class="h">Isotope</td><td class="h">Protons</td><td class="h">Electrons</td><td class="h">Neutrons</td><td class="h">Nucleon number</td></tr>'
      + s.list.map(x=>'<tr><td><strong>'+s.name+'-'+x.nn+'</strong></td><td class="same">'+s.p+'</td><td class="same">'+s.p+'</td><td class="diff">'+x.n+'</td><td>'+x.nn+'</td></tr>').join('')
      + '</table>';
    note.innerHTML='Every one of these is <strong>'+s.name+'</strong>, because every one has <strong>'+s.p+' protons</strong>. '
      +'The protons and electrons columns never change — only the <span class="diff">neutrons</span> do. '
      +'Nucleon number = protons + neutrons, so it changes with them.';
  }
  root.querySelectorAll('.is-pick button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.k)));
  show('carbon');
})();

/* ==============================================================
   ramLab — relative atomic mass from isotope abundance
   ============================================================== */
(function ramLab(){
  const root=document.getElementById('ramLab'); if(!root) return;
  const sl=root.querySelector('.ram-pct');
  const a=root.querySelector('.ram-a'), b=root.querySelector('.ram-b');
  const pa=root.querySelector('.ram-pa'), pb=root.querySelector('.ram-pb');
  const work=root.querySelector('.ram-work'), ans=root.querySelector('.ram-ans'), note=root.querySelector('.ram-note');
  const PRESET={
    chlorine:{n:'chlorine', m1:35, m2:37, p1:75, book:35.5},
    boron:{n:'boron', m1:10, m2:11, p1:20, book:10.8},
    copper:{n:'copper', m1:63, m2:65, p1:69, book:63.6}
  };
  let cur='chlorine';
  function render(){
    const P=PRESET[cur], p1=+sl.value, p2=100-p1;
    a.textContent=P.n+'-'+P.m1; b.textContent=P.n+'-'+P.m2;
    pa.textContent=p1+'%'; pb.textContent=p2+'%';
    const ram=(p1/100)*P.m1+(p2/100)*P.m2;
    work.innerHTML='( <sup>'+p1+'</sup>&frasl;<sub>100</sub> × '+P.m1+' ) + ( <sup>'+p2+'</sup>&frasl;<sub>100</sub> × '+P.m2+' )'
      +' &nbsp;=&nbsp; '+((p1/100)*P.m1).toFixed(2)+' + '+((p2/100)*P.m2).toFixed(2);
    ans.textContent=ram.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1');
    const atBook=Math.abs(ram-P.book)<0.06;
    note.innerHTML = atBook
      ? '<strong>That is the value on the periodic table.</strong> '+P.n+'’s relative atomic mass is '+P.book+' — not a whole number, because it is a <strong>weighted average</strong> of isotopes that each have whole-number nucleon numbers.'
      : 'Slide the abundance and watch the answer move between '+P.m1+' and '+P.m2+'. It can never go outside that range — an average always lies between the two values being averaged. The real abundance gives <strong>'+P.book+'</strong>.';
    root.querySelectorAll('.ram-pick button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.k===cur?'true':'false'));
  }
  sl.addEventListener('input',render);
  root.querySelectorAll('.ram-pick button').forEach(x=>x.addEventListener('click',()=>{
    cur=x.dataset.k; sl.value=PRESET[cur].p1; render();
  }));
  render();
})();

/* ==============================================================
   moleculeLab — build a molecule from labelled circles
   ============================================================== */
(function moleculeLab(){
  const root=document.getElementById('moleculeLab'); if(!root) return;
  const ATOM={H:{c:'#F7FAFC',t:'#0F2436',r:15},O:{c:'#D93F2B',t:'#F7FAFC',r:20},
              N:{c:'#8E9AC8',t:'#0F2436',r:20},C:{c:'#5A6B7A',t:'#F7FAFC',r:20},
              Cl:{c:'#5FB36B',t:'#0F2436',r:21},F:{c:'#9FD0E8',t:'#0F2436',r:18},
              S:{c:'#E8C33B',t:'#0F2436',r:21}};
  const ORDER=['C','H','N','O','F','S','Cl'];      /* display order in the formula */
  const svg=root.querySelector('.ml-stage');
  const out={f:root.querySelector('.ml-formula'),k:root.querySelector('.ml-kind'),
             tot:root.querySelector('.ml-total'),note:root.querySelector('.ml-note')};
  let atoms=[];
  function formula(){
    const cnt={}; atoms.forEach(a=>cnt[a]=(cnt[a]||0)+1);
    /* School convention writes hydrogen AFTER nitrogen when there is no carbon
       (NH3, not H3N) — but before it when carbon leads (CH4, C6H12O6). */
    let order=ORDER;
    if(cnt.N && cnt.H && !cnt.C) order=['N','H'].concat(ORDER.filter(s=>s!=='N'&&s!=='H'));
    return order.filter(s=>cnt[s]).map(s=>s+(cnt[s]>1?'<sub>'+cnt[s]+'</sub>':'')).join('');
  }
  function render(){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const n=atoms.length, W=420, cy=90;
    if(n){
      const gap=Math.min(58, (W-80)/Math.max(1,n));
      const x0=W/2-(n-1)*gap/2;
      for(let i=0;i<n-1;i++){
        const l=document.createElementNS(SVGNS,'line');
        set(l,{x1:x0+i*gap,y1:cy,x2:x0+(i+1)*gap,y2:cy,stroke:'#0F2436','stroke-width':3.5});
        svg.appendChild(l);
      }
      atoms.forEach((s,i)=>{
        const A=ATOM[s], x=x0+i*gap;
        const c=document.createElementNS(SVGNS,'circle');
        set(c,{cx:x,cy:cy,r:A.r,fill:A.c,stroke:'#0F2436','stroke-width':1.8});
        svg.appendChild(c);
        const t=document.createElementNS(SVGNS,'text');
        set(t,{x:x,y:cy+5,'text-anchor':'middle','font-size':14,'font-family':'Space Mono, monospace','font-weight':700,fill:A.t});
        t.textContent=s; svg.appendChild(t);
      });
    }
    const kinds=[...new Set(atoms)];
    out.f.innerHTML = n ? formula() : '—';
    out.tot.textContent = n;
    out.k.textContent = n===0 ? '—' : n===1 ? 'A single atom — not a molecule'
      : kinds.length===1 ? 'Molecule of an ELEMENT' : 'Molecule of a COMPOUND';
    out.k.style.color = n<2 ? 'var(--ink-soft)' : kinds.length===1 ? '#2E7A8C' : '#D93F2B';
    out.note.innerHTML = n===0 ? 'Click atoms below to build a molecule.'
      : n===1 ? 'A <strong>molecule</strong> is made up of <strong>two or more</strong> atoms chemically combined. One atom on its own is just an atom.'
      : kinds.length===1
        ? 'Every atom here is the <strong>same type</strong> (' + kinds[0] + '), so this is a molecule of an <strong>element</strong>. Joining identical atoms does not make a new substance — O<sub>2</sub> is still oxygen.'
        : 'There are <strong>' + kinds.length + ' different types</strong> of atom chemically combined, so this is a molecule of a <strong>compound</strong>.';
  }
  root.querySelectorAll('.ml-add').forEach(b=>b.addEventListener('click',()=>{
    if(atoms.length<12){ atoms.push(b.dataset.a); render(); }
  }));
  root.querySelector('.ml-undo').addEventListener('click',()=>{ atoms.pop(); render(); });
  root.querySelector('.ml-clear').addEventListener('click',()=>{ atoms=[]; render(); });
  root.querySelectorAll('.ml-preset').forEach(b=>b.addEventListener('click',()=>{
    atoms=b.dataset.m.split(','); render();
  }));
  render();
})();

/* ==============================================================
   formulaLab — read a chemical formula
   ============================================================== */
(function formulaLab(){
  const root=document.getElementById('formulaLab'); if(!root) return;
  const NAMES={H:'hydrogen',O:'oxygen',N:'nitrogen',C:'carbon',Cl:'chlorine',
               S:'sulfur',I:'iodine',Na:'sodium',Ca:'calcium',F:'fluorine'};
  const F={
    'H2':[['H',2]], 'O2':[['O',2]], 'N2':[['N',2]], 'Cl2':[['Cl',2]], 'I2':[['I',2]], 'S8':[['S',8]],
    'H2O':[['H',2],['O',1]], 'NH3':[['N',1],['H',3]], 'CO':[['C',1],['O',1]], 'CO2':[['C',1],['O',2]],
    'HCl':[['H',1],['Cl',1]], 'NO2':[['N',1],['O',2]], 'CH4':[['C',1],['H',4]],
    'C6H12O6':[['C',6],['H',12],['O',6]]
  };
  const disp=root.querySelector('.fl-formula'), tbl=root.querySelector('.fl-table');
  const kind=root.querySelector('.fl-kind'), tot=root.querySelector('.fl-total'), note=root.querySelector('.fl-note');
  function pretty(f){ return f.replace(/(\d+)/g,'<sub>$1</sub>'); }
  function show(f){
    const parts=F[f];
    root.querySelectorAll('.fl-pick button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.f===f?'true':'false'));
    disp.innerHTML=pretty(f);
    tbl.innerHTML='<table class="isot"><tr><td class="h">Type of atom</td><td class="h">Number of atoms</td></tr>'
      + parts.map(p=>'<tr><td>'+NAMES[p[0]]+' ('+p[0]+')</td><td class="diff">'+p[1]+'</td></tr>').join('')+'</table>';
    const n=parts.reduce((s,p)=>s+p[1],0);
    tot.textContent=n;
    const isEl=parts.length===1;
    kind.textContent=isEl?'ELEMENT':'COMPOUND';
    kind.style.color=isEl?'#2E7A8C':'#D93F2B';
    note.innerHTML = isEl
      ? 'Only <strong>one</strong> chemical symbol appears, so every atom is the same type — this is an <strong>element</strong>. The subscript tells you how many of those atoms are joined in one molecule.'
      : '<strong>'+parts.length+'</strong> different chemical symbols appear, so atoms of '+parts.length+' different elements are chemically combined — this is a <strong>compound</strong>.'
        + ' A symbol with no subscript means <strong>one</strong> atom.';
  }
  root.querySelectorAll('.fl-pick button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.f)));
  show('H2O');
})();

/* ==============================================================
   atomicTechLab — applications and the issues they raise
   ============================================================== */
(function atomicTechLab(){
  const root=document.getElementById('atomicTechLab'); if(!root) return;
  const T={
    materials:{t:'New materials', use:[
      'Scientists keep learning more about atoms so they can <strong>create new materials</strong> from them.',
      '<strong>Gold-plated orchids</strong> exist in Singapore because a local biochemist managed to coat living plant material with <strong>gold atoms</strong>.',
      '<strong>Nanotechnology</strong> works with objects smaller than one billionth of a metre — <strong>nanorobots</strong> can deliver drugs into the bloodstream and repair damaged cells.'],
      issue:['Nanoscale objects are too small to see with an ordinary microscope, so special instruments such as the <strong>atomic force microscope</strong> and the scanning tunnelling microscope are needed.']},
    health:{t:'Healthcare', use:[
      '<strong>Radiation therapy</strong> uses the properties of atoms to cure diseases.',
      '<strong>Medical imaging</strong> — magnetic resonance imaging (<strong>MRI</strong>) and <strong>X-rays</strong> — lets doctors see inside the body to diagnose illness or injury.',
      'A <strong>radiographer</strong> operates the equipment. X-ray radiation penetrates skin and bone, and is given off by atoms that have <strong>large amounts of energy</strong>.'],
      issue:['Radiation that can pass through the body can also damage it, so exposure has to be carefully controlled.']},
    food:{t:'Food', use:[
      '<strong>Molecular gastronomy</strong> studies the molecules involved in the physical and chemical processes that happen to food during cooking.',
      'Chefs apply scientific principles to create dishes with <strong>new tastes, textures or appearances</strong> — food preparation as both a science and an art.'],
      issue:['No health risk here — this one is included to show that atomic knowledge reaches into everyday life, not only laboratories and hospitals.']},
    nuclear:{t:'Nuclear energy', use:[
      'Nuclear energy comes from the <strong>controlled release of heat from radioactive elements</strong> such as <strong>uranium and plutonium</strong>.',
      'That heat changes water to <strong>steam</strong>, which moves <strong>turbines</strong> to generate electricity.',
      'It is an alternative to using oil, <strong>especially in places with no access to oil</strong>. Scientists are now trying to build smaller and more efficient plants.'],
      issue:['Requires <strong>careful use</strong> of nuclear energy and <strong>proper disposal of nuclear waste</strong>.',
        '<strong>Accidents</strong> at nuclear power plants can cause loss of lives and environmental pollution.',
        'The same energy is used in <strong>atomic bombs</strong>, which bring about destructive effects.',
        'There are benefits — but there are <strong>costs and risks</strong> too.']}
  };
  const panel=root.querySelector('.at-panel');
  function show(k){
    const o=T[k];
    panel.innerHTML='<h5>'+o.t+'</h5>'
      +'<h6 class="at-good">How atomic knowledge is used</h6><ul>'+o.use.map(x=>'<li>'+x+'</li>').join('')+'</ul>'
      +'<h6 class="at-bad">Issues it raises</h6><ul>'+o.issue.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
    root.querySelectorAll('.at-btn').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k?'true':'false'));
  }
  root.querySelectorAll('.at-btn').forEach(b=>b.addEventListener('click',()=>show(b.dataset.k)));
  show('materials');
})();
})();
